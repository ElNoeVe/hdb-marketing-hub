// ===================================
// fetch-facebook.js — Facebook Ads Data Fetcher
// Fetches campaign AND ad-level data
// ===================================

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const BASE_URL = 'https://graph.facebook.com/v21.0';

async function fetchFacebookData() {
    console.log('📊 Obteniendo datos de Facebook Ads...');

    // 1. Fetch campaigns (filter for ACTIVE to ensure all relevant are grabbed)
    const campaignsUrl = `${BASE_URL}/act_${FB_AD_ACCOUNT_ID}/campaigns?fields=id,name,status,objective,start_time,created_time,daily_budget,lifetime_budget&filtering=[{field:"effective_status",operator:"IN",value:["ACTIVE","PAUSED"]}]&limit=100&access_token=${FB_ACCESS_TOKEN}`;
    const campaignsRes = await fetch(campaignsUrl);
    const campaignsData = await campaignsRes.json();

    if (!campaignsRes.ok || campaignsData.error) {
        console.error('❌ HTTP Status Facebook:', campaignsRes.status);
        console.error('❌ Error de Facebook API detallado:', JSON.stringify(campaignsData, null, 2));
        process.exit(1);
    }

    const campaigns = campaignsData.data || [];
    console.log(`✅ ${campaigns.length} campañas encontradas`);

    // 2. Fetch insights for each campaign + its ads
    const reportData = [];

    for (const campaign of campaigns) {
        console.log(`  📈 Procesando: ${campaign.name}`);

        // Campaign-level insights
        const insightsUrl = `${BASE_URL}/${campaign.id}/insights?fields=impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,cost_per_action_type&date_preset=last_30d&access_token=${FB_ACCESS_TOKEN}`;
        const insightsRes = await fetch(insightsUrl);
        const insightsData = await insightsRes.json();
        const insights = insightsData.data?.[0] || {};

        // Get leads/results from actions
        const actions = insights.actions || [];
        const leads = actions.find(a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped')?.value || 0;
        const messages = actions.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value || 0;
        const linkClicks = actions.find(a => a.action_type === 'link_click')?.value || insights.clicks || 0;

        // Cost per result
        const costPerAction = insights.cost_per_action_type || [];
        const cpr = costPerAction.find(a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped')?.value
            || costPerAction.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value
            || 0;

        // 3. Fetch ads within this campaign
        const adsUrl = `${BASE_URL}/${campaign.id}/ads?fields=id,name,status,creative{title,body,image_url,thumbnail_url}&access_token=${FB_ACCESS_TOKEN}`;
        const adsRes = await fetch(adsUrl);
        const adsData = await adsRes.json();
        const ads = adsData.data || [];

        console.log(`    📋 ${ads.length} anuncios en esta campaña`);

        // Fetch insights for each ad
        const adDetails = [];
        for (const ad of ads) {
            const adInsightsUrl = `${BASE_URL}/${ad.id}/insights?fields=impressions,clicks,spend,cpc,cpm,ctr,reach,actions,cost_per_action_type&date_preset=last_30d&access_token=${FB_ACCESS_TOKEN}`;
            const adInsightsRes = await fetch(adInsightsUrl);
            const adInsightsData = await adInsightsRes.json();
            const adInsights = adInsightsData.data?.[0] || {};

            const adActions = adInsights.actions || [];
            const adLeads = adActions.find(a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped')?.value || 0;
            const adMessages = adActions.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value || 0;

            const adCostPerAction = adInsights.cost_per_action_type || [];
            const adCpr = adCostPerAction.find(a => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped')?.value
                || adCostPerAction.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value
                || 0;

            adDetails.push({
                id: ad.id,
                nombre: ad.name,
                estado: ad.status,
                creative: ad.creative || {},
                metricas: {
                    impresiones: parseInt(adInsights.impressions || 0),
                    clics: parseInt(adInsights.clicks || 0),
                    gasto: parseFloat(adInsights.spend || 0),
                    cpc: parseFloat(adInsights.cpc || 0),
                    cpm: parseFloat(adInsights.cpm || 0),
                    ctr: parseFloat(adInsights.ctr || 0),
                    alcance: parseInt(adInsights.reach || 0),
                    leads: parseInt(adLeads),
                    mensajes: parseInt(adMessages),
                    costo_por_resultado: parseFloat(adCpr)
                }
            });
        }

        // Classify campaign health
        const spend = parseFloat(insights.spend || 0);
        const ctrVal = parseFloat(insights.ctr || 0);
        let semaforo = 'verde';
        if (spend > 0 && ctrVal < 1) semaforo = 'rojo';
        else if (spend > 0 && ctrVal < 2) semaforo = 'amarillo';

        reportData.push({
            id: campaign.id,
            nombre: campaign.name,
            estado: campaign.status,
            objetivo: campaign.objective,
            fecha_inicio: campaign.start_time || campaign.created_time,
            presupuesto_diario: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : null,
            presupuesto_total: campaign.lifetime_budget ? parseFloat(campaign.lifetime_budget) / 100 : null,
            semaforo,
            metricas: {
                impresiones: parseInt(insights.impressions || 0),
                clics: parseInt(insights.clicks || 0),
                gasto: spend,
                cpc: parseFloat(insights.cpc || 0),
                cpm: parseFloat(insights.cpm || 0),
                ctr: ctrVal,
                alcance: parseInt(insights.reach || 0),
                frecuencia: parseFloat(insights.frequency || 0),
                leads: parseInt(leads),
                mensajes: parseInt(messages),
                link_clicks: parseInt(linkClicks),
                costo_por_resultado: parseFloat(cpr)
            },
            anuncios: adDetails
        });
    }

    return reportData;
}

async function analyzeWithGemini(campaigns, isTuesday = false) {
    if (!GEMINI_API_KEY) {
        console.log('⚠️ No GEMINI_API_KEY, skipping AI analysis');
        return { diario: 'No disponible', taller: null };
    }

    console.log('🤖 Analizando con Gemini...');

    // Only analyze ACTIVE campaigns for strategic advice
    const activeCampaigns = campaigns.filter(c => c.estado === 'ACTIVE');

    // 1. Daily Optimizer Prompt
    const dailyPrompt = `Eres un experto en marketing digital inmobiliario en México. Analiza estos datos de campañas ACTIVAS de Facebook Ads del fraccionamiento Haciendas del Bosque en Tecámac.
    
    Datos actuales:
    ${JSON.stringify(activeCampaigns, null, 2)}
    
    Genera un "Optimizador Diario" conciso (máx 150 palabras) en español con:
    - Qué 3 acciones exactas debe tomar el usuario HOY para mejorar el rendimiento.
    - Qué campaña potenciar y cuál vigilar.
    - Sé directo y orientado a resultados inmediatos.`;

    const fetchGemini = async (prompt) => {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
            })
        });
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error al generar';
    };

    const diario = await fetchGemini(dailyPrompt);
    let taller = null;

    // 2. Tuesday Creative Workshop (Only if it's Tuesday)
    if (isTuesday) {
        console.log('🎨 Generando Taller Creativo de los Martes...');
        const tuesdayPrompt = `Eres un director creativo senior de marketing inmobiliario. 
        Analiza el rendimiento histórico de los últimos 30 días de TODAS las campañas (especialmente las mejores) para planear el contenido de la próxima semana.
        
        Datos históricos:
        ${JSON.stringify(campaigns, null, 2)}
        
        Genera el "Taller Creativo Semanal" en español con:
        1. REPASO: Por qué las mejores campañas funcionaron (basado en datos).
        2. ESTRATEGIA: 3 nuevas propuestas de anuncios (Copy con hashtags, Título gancho).
        3. SEGMENTACIÓN: Sugerencias de audiencia detalladas para estas nuevas ideas.
        4. VISUALES: Consejos específicos de qué imágenes generar en una IA externa para estos anuncios.
        
        Usa un tono inspirador pero basado en datos.`;
        taller = await fetchGemini(tuesdayPrompt);
    }

    return { diario, taller };
}

async function main() {
    if (!FB_ACCESS_TOKEN || !FB_AD_ACCOUNT_ID) {
        console.error('❌ Falta FB_ACCESS_TOKEN o FB_AD_ACCOUNT_ID');
        process.exit(1);
    }

    const campaigns = await fetchFacebookData();

    // Check if today is Tuesday (2 in JS Date.getDay())
    const now = new Date();
    const isTuesday = now.getDay() === 2;

    const analysis = await analyzeWithGemini(campaigns, isTuesday);

    const dateStr = now.toISOString().split('T')[0];

    const report = {
        fecha_generacion: now.toISOString(),
        es_martes: isTuesday,
        periodo: 'Últimos 30 días',
        total_campanas: campaigns.length,
        total_anuncios: campaigns.reduce((sum, c) => sum + c.anuncios.length, 0),
        resumen: {
            gasto_total: campaigns.reduce((sum, c) => sum + c.metricas.gasto, 0),
            impresiones_totales: campaigns.reduce((sum, c) => sum + c.metricas.impresiones, 0),
            clics_totales: campaigns.reduce((sum, c) => sum + c.metricas.clics, 0),
            leads_totales: campaigns.reduce((sum, c) => sum + c.metricas.leads, 0),
            mensajes_totales: campaigns.reduce((sum, c) => sum + c.metricas.mensajes, 0)
        },
        campanas: campaigns,
        analisis_ia: analysis.diario,
        taller_creativo: analysis.taller
    };

    // Save report
    const fs = await import('fs');
    const path = await import('path');
    const reportDir = path.join(process.cwd(), 'data', 'reportes');

    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, `reporte-${dateStr}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Reporte guardado: ${reportPath}`);
    console.log(`   📊 ${report.total_campanas} campañas, ${report.total_anuncios} anuncios`);
    console.log(`   💰 Gasto total: $${report.resumen.gasto_total.toFixed(2)}`);
}

main().catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
});
