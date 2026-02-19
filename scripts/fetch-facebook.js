/**
 * fetch-facebook.js
 * Script ejecutado por GitHub Actions L/Mi/V a las 7AM CST
 * 
 * 1. Consulta Facebook Marketing API → estadísticas de anuncios activos (+3 días)
 * 2. Envía datos a Gemini → genera análisis y recomendaciones
 * 3. Guarda reporte JSON en data/reportes/
 */

import fs from 'fs';
import path from 'path';

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_VERSION = 'v21.0';

async function main() {
    console.log('🚀 Iniciando análisis de campañas...');
    console.log(`📅 Fecha: ${new Date().toISOString()}`);

    // Validar tokens
    if (!FB_ACCESS_TOKEN || !FB_AD_ACCOUNT_ID || !GEMINI_API_KEY) {
        console.error('❌ Faltan variables de entorno. Configura FB_ACCESS_TOKEN, FB_AD_ACCOUNT_ID y GEMINI_API_KEY en GitHub Secrets.');
        process.exit(1);
    }

    try {
        // 1. Obtener campañas activas
        console.log('📊 Consultando Facebook Marketing API...');
        const campaigns = await fetchActiveCampaigns();
        console.log(`   ✅ ${campaigns.length} campañas activas encontradas`);

        // 2. Obtener insights de cada campaña
        console.log('📈 Obteniendo estadísticas...');
        const insights = await fetchCampaignInsights(campaigns);
        console.log(`   ✅ Insights obtenidos para ${insights.length} campañas`);

        // 3. Analizar con Gemini
        console.log('🤖 Analizando con Gemini AI...');
        const analysis = await analyzeWithGemini(insights);
        console.log('   ✅ Análisis completado');

        // 4. Guardar reporte
        const report = buildReport(insights, analysis);
        await saveReport(report);
        console.log('💾 Reporte guardado exitosamente');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function fetchActiveCampaigns() {
    const url = `https://graph.facebook.com/${API_VERSION}/act_${FB_AD_ACCOUNT_ID}/campaigns?fields=id,name,status,daily_budget,created_time&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]&access_token=${FB_ACCESS_TOKEN}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
    }

    // Filter: only campaigns with 3+ days active
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return (data.data || []).filter(camp => {
        const created = new Date(camp.created_time);
        return created <= threeDaysAgo;
    });
}

async function fetchCampaignInsights(campaigns) {
    const insights = [];

    for (const camp of campaigns) {
        const url = `https://graph.facebook.com/${API_VERSION}/${camp.id}/insights?fields=impressions,clicks,spend,ctr,cpc,reach,frequency,actions&date_preset=last_7d&access_token=${FB_ACCESS_TOKEN}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.data && data.data.length > 0) {
            const d = data.data[0];

            // Find results (leads, messages, etc.)
            const results = d.actions ? d.actions.find(a =>
                a.action_type === 'lead' ||
                a.action_type === 'onsite_conversion.messaging_conversation_started_7d'
            ) : null;

            insights.push({
                nombre: camp.name,
                id: camp.id,
                estado: camp.status,
                presupuesto_diario: camp.daily_budget ? parseInt(camp.daily_budget) / 100 : 50,
                dias_activa: Math.floor((Date.now() - new Date(camp.created_time).getTime()) / (1000 * 60 * 60 * 24)),
                metricas: {
                    impresiones: parseInt(d.impressions || 0),
                    clics: parseInt(d.clicks || 0),
                    gasto: parseFloat(d.spend || 0),
                    ctr: parseFloat(d.ctr || 0),
                    cpc: parseFloat(d.cpc || 0),
                    alcance: parseInt(d.reach || 0),
                    frecuencia: parseFloat(d.frequency || 0),
                    resultados: results ? parseInt(results.value) : 0,
                    cpr: results ? parseFloat(d.spend) / parseInt(results.value) : parseFloat(d.spend)
                }
            });
        }
    }

    return insights;
}

async function analyzeWithGemini(insights) {
    const prompt = `Eres un experto en marketing digital inmobiliario en México. Analiza las siguientes campañas de Facebook Ads para "Haciendas del Bosque" (desarrollo inmobiliario en Tecámac, Estado de México, de Hogares Unión).

CONTEXTO:
- Presupuesto diario por anuncio: $50 MXN
- Público objetivo: Familias 25-55 años, ingresos bajos-medios, municipios cercanos (Tecámac, Zumpango, Tizayuca, Pachuca)
- Objetivo principal: generar visitas al desarrollo y precalificación
- Precios: Departamentos desde $850K, Casas desde $980K

DATOS DE CAMPAÑAS:
${JSON.stringify(insights, null, 2)}

INSTRUCCIONES:
Para cada campaña, clasifícala como: "impulsar", "mantener" o "pausar".
- impulsar: CPR bajo, CTR aceptable, vale la pena invertir más
- mantener: resultados mixtos, esperar o ajustar
- pausar: CPR alto, CTR muy bajo, no está generando resultados

RESPONDE EN FORMATO JSON EXACTO (sin markdown):
{
  "consejo_general": "Texto con análisis general y 3-4 recomendaciones concretas",
  "campanas": [
    {
      "id": "campaign_id",
      "recomendacion": "impulsar|mantener|pausar",
      "consejo": "Recomendación específica para esta campaña"
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048
            }
        })
    });

    const data = await res.json();

    if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    const text = data.candidates[0].content.parts[0].text;

    // Parse JSON from response (handle possible markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Gemini did not return valid JSON');
    }

    return JSON.parse(jsonMatch[0]);
}

function buildReport(insights, analysis) {
    const now = new Date();

    // Merge insights with analysis
    const campanas = insights.map(ins => {
        const rec = analysis.campanas.find(a => a.id === ins.id) || { recomendacion: 'mantener', consejo: 'Sin análisis disponible.' };
        return {
            ...ins,
            recomendacion: rec.recomendacion,
            consejo: rec.consejo
        };
    });

    // Calculate totals
    const totales = insights.reduce((acc, i) => ({
        impresiones: acc.impresiones + i.metricas.impresiones,
        clics: acc.clics + i.metricas.clics,
        gasto: acc.gasto + i.metricas.gasto
    }), { impresiones: 0, clics: 0, gasto: 0 });

    return {
        fecha: now.toISOString(),
        fecha_legible: now.toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }),
        resumen: {
            impresiones: totales.impresiones,
            clics: totales.clics,
            gasto: Math.round(totales.gasto * 100) / 100,
            ctr: totales.impresiones > 0 ? Math.round((totales.clics / totales.impresiones) * 10000) / 100 : 0,
            cpr: totales.clics > 0 ? Math.round((totales.gasto / totales.clics) * 100) / 100 : 0
        },
        consejo_general: analysis.consejo_general,
        campanas: campanas
    };
}

async function saveReport(report) {
    const date = new Date().toISOString().split('T')[0];
    const dir = path.join('..', 'data', 'reportes');

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, `reporte-${date}.json`);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`📁 Guardado en: ${filepath}`);
}

main();
