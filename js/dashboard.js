// ===================================
// dashboard.js — Campaign Dashboard
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    setupTabs('#reportTabs', filterCampaigns);
});

// Sample report data - will be replaced by GitHub Actions generated JSON
const sampleReport = {
    fecha: new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    resumen: {
        impresiones: 1547,
        clics: 4,
        gasto: 42.39,
        cpr: 10.60
    },
    consejo_general: "Tus campañas actuales tienen un CTR bajo (0.26%). Recomiendo pausar los anuncios con menor rendimiento y redirigir el presupuesto a los que generan más clics. Considera renovar las creatividades con imágenes más llamativas del desarrollo y copys enfocados en la urgencia de compra y la plusvalía.",
    campanas: [
        {
            nombre: "Campaña Imágenes — Hogar Familiar",
            id: "camp_001",
            dias_activa: 7,
            presupuesto_diario: 50,
            metricas: {
                impresiones: 823,
                clics: 3,
                gasto: 22.50,
                ctr: 0.36,
                cpr: 7.50
            },
            recomendacion: "impulsar",
            consejo: "Buen CTR relativo. Recomiendo aumentar presupuesto a $75/día para maximizar resultados."
        },
        {
            nombre: "Campaña Videos — Inversión",
            id: "camp_002",
            dias_activa: 5,
            presupuesto_diario: 50,
            metricas: {
                impresiones: 724,
                clics: 1,
                gasto: 19.89,
                ctr: 0.14,
                cpr: 19.89
            },
            recomendacion: "mantener",
            consejo: "CTR bajo pero todavía está optimizando. Espera hasta que tenga 7 días antes de decidir. Reducir presupuesto a $35/día temporalmente."
        }
    ]
};

function loadDashboard() {
    // Try to load from data/reportes/ or use sample
    loadReport(sampleReport);
}

function loadReport(report) {
    // Update header
    document.getElementById('lastUpdate').textContent = report.fecha;

    // Update stats
    document.getElementById('totalImpressions').textContent = formatNumber(report.resumen.impresiones);
    document.getElementById('totalClicks').textContent = formatNumber(report.resumen.clics);
    document.getElementById('totalSpend').textContent = formatCurrency(report.resumen.gasto);
    document.getElementById('avgCPR').textContent = formatCurrency(report.resumen.cpr);

    // Render campaign cards
    renderCampaigns(report.campanas);

    // Show AI advice
    const adviceCard = document.getElementById('adviceCard');
    adviceCard.style.display = 'block';
    document.getElementById('adviceContent').innerHTML = `<p>${report.consejo_general}</p>`;
}

function renderCampaigns(campaigns, filter = 'all') {
    const grid = document.getElementById('campaignGrid');

    const filtered = filter === 'all'
        ? campaigns
        : campaigns.filter(c => c.recomendacion === filter);

    if (filtered.length === 0) {
        grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">📭</div>
        <p class="empty-state-text">No hay campañas con esta clasificación.</p>
      </div>`;
        return;
    }

    grid.innerHTML = filtered.map((camp, i) => {
        const badgeClass = camp.recomendacion === 'impulsar' ? 'badge-green' :
            camp.recomendacion === 'mantener' ? 'badge-yellow' : 'badge-red';
        const badgeText = camp.recomendacion === 'impulsar' ? '🟢 IMPULSAR' :
            camp.recomendacion === 'mantener' ? '🟡 MANTENER' : '🔴 PAUSAR';

        return `
      <div class="card fade-in delay-${i + 1}" data-rec="${camp.recomendacion}">
        <div class="card-header">
          <h4 class="card-title">${camp.nombre}</h4>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
        
        <div class="grid grid-3" style="gap:var(--space-sm);margin-bottom:var(--space-md);">
          <div style="text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--text-primary);">${formatNumber(camp.metricas.impresiones)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Impresiones</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--text-primary);">${camp.metricas.clics}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Clics</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--text-primary);">${formatCurrency(camp.metricas.gasto)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Gasto</div>
          </div>
        </div>
        
        <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-sm);font-size:0.85rem;">
          <span style="color:var(--text-secondary);">CTR: <strong style="color:var(--text-primary);">${camp.metricas.ctr}%</strong></span>
          <span style="color:var(--text-secondary);">CPR: <strong style="color:var(--text-primary);">${formatCurrency(camp.metricas.cpr)}</strong></span>
          <span style="color:var(--text-secondary);">Días: <strong style="color:var(--text-primary);">${camp.dias_activa}</strong></span>
        </div>
        
        <div style="background:var(--bg-glass);border-radius:var(--radius-sm);padding:var(--space-sm) var(--space-md);margin-top:var(--space-sm);">
          <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
            💡 ${camp.consejo}
          </p>
        </div>
      </div>`;
    }).join('');
}

function filterCampaigns(filter) {
    renderCampaigns(sampleReport.campanas, filter);
}
