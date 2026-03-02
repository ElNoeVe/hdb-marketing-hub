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
    const campaignsUrl = `${BASE_URL}/act_${FB_AD_ACCOUNT_ID}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&filtering=[{field:"effective_status",operator:"IN",value:["ACTIVE","PAUSED"]}]&limit=100&access_token=${FB_ACCESS_TOKEN}`;
    const campaignsRes = await fetch(campaignsUrl);
    const campaignsData = await campaignsRes.json();

    if (campaignsData.error) {
        console.error('❌ Error de Facebook API:', campaignsData.error.message);
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

async function analyzeWithGemini(campaigns) {
    if (!GEMINI_API_KEY) {
        console.log('⚠️ No GEMINI_API_KEY, skipping AI analysis');
        return 'Análisis de IA no disponible — configura GEMINI_API_KEY';
    }

    console.log('🤖 Analizando con Gemini...');

    const prompt = `Eres un experto en marketing digital inmobiliario en México. Analiza estos datos de Facebook Ads del fraccionamiento Haciendas del Bosque (Hogares Unión) en Tecámac.

Datos de campañas y anuncios:
${JSON.stringify(campaigns, null, 2)}

Genera un análisis en español con:
1. Resumen ejecutivo (2-3 líneas)
2. Por cada campaña: qué funciona y qué no
3. Comparación de rendimiento entre anuncios de la misma campaña
4. Top 3 recomendaciones de optimización concretas
5. Sugerencias de presupuesto

Sé conciso y orientado a la acción.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
        })
    });

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar análisis';
}

async function main() {
    if (!FB_ACCESS_TOKEN || !FB_AD_ACCOUNT_ID) {
        console.error('❌ Falta FB_ACCESS_TOKEN o FB_AD_ACCOUNT_ID');
        process.exit(1);
    }

    const campaigns = await fetchFacebookData();
    const analysis = await analyzeWithGemini(campaigns);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const report = {
        fecha_generacion: now.toISOString(),
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
        analisis_ia: analysis
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
