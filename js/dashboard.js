// ===================================
// dashboard.js — Campaign Dashboard
// Shows campaigns AND ads within each
// ===================================

let reportData = null;

document.addEventListener('DOMContentLoaded', async () => {
  reportData = await loadLatestReport();
  if (reportData) {
    renderSummary(reportData.resumen);
    renderCampaigns(reportData.campanas);
    renderReportHistory();
    populateMonthFilter();
  }
});

let currentHealthFilter = 'all';

function setHealthFilter(val) {
  currentHealthFilter = val;
  // Update UI tabs
  document.querySelectorAll('#reportTabs .tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-filter') === val);
  });
  applyFilters();
}

function applyFilters() {
  if (!reportData) return;

  const status = document.getElementById('filterStatus').value;
  const month = document.getElementById('filterMonth').value;

  const filtered = reportData.campanas.filter(c => {
    // 1. Health Filter
    const matchHealth = currentHealthFilter === 'all' || c.semaforo === currentHealthFilter;

    // 2. Status Filter
    const matchStatus = status === 'all' || c.estado === status;

    // 3. Month Filter (Now using campaign start date)
    let matchMonth = true;
    if (month !== 'all' && c.fecha_inicio) {
      const [selYear, selMonth] = month.split('-');
      const camDate = new Date(c.fecha_inicio);
      matchMonth = (camDate.getFullYear() == selYear && (camDate.getMonth() + 1) == selMonth);
    }

    return matchHealth && matchStatus && matchMonth;
  });

  renderCampaigns(filtered, 'bypass');
}

function populateMonthFilter() {
  const select = document.getElementById('filterMonth');
  if (!select) return;

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let html = '<option value="all">Cualquier fecha</option>';

  for (let year = 2025; year <= currentYear; year++) {
    let startMonth = 0;
    let endMonth = (year === currentYear) ? currentMonth : 11;

    for (let m = startMonth; m <= endMonth; m++) {
      const val = `${year}-${m + 1}`;
      const label = `${months[m]} ${year}`;
      html += `<option value="${val}">${label}</option>`;
    }
  }

  select.innerHTML = html;
}

async function loadLatestReport() {
  try {
    // Generate list of recent dates to try (today + last 7 days)
    const dates = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Try each date's report file
    for (const date of dates) {
      try {
        const res = await fetch(`data/reportes/reporte-${date}.json`);
        if (res.ok) {
          console.log('✅ Reporte cargado:', date);
          return await res.json();
        }
      } catch (e) {
        // continue to next date
      }
    }

    // Fallback: Use real data from data.js (contains actual campaign data)
    if (window.StartData && window.StartData.reportes) {
      console.log('📂 Usando datos reales de data.js (offline fallback)');
      return window.StartData.reportes;
    }

    // Last resort: example data
    console.warn('⚠️ No se encontró reporte, usando datos de ejemplo');
    return getSampleData();
  } catch (e) {
    console.error('Error loading report:', e);
    if (window.StartData && window.StartData.reportes) return window.StartData.reportes;
    return getSampleData();
  }
}

function getSampleData() {
  return {
    fecha_generacion: new Date().toISOString(),
    periodo: 'Datos de ejemplo',
    total_campanas: 2,
    total_anuncios: 5,
    resumen: {
      gasto_total: 3250.00,
      impresiones_totales: 45200,
      clics_totales: 1850,
      leads_totales: 42,
      mensajes_totales: 28
    },
    campanas: [
      {
        id: '1',
        nombre: 'Haciendas del Bosque — Mensajes WhatsApp',
        estado: 'ACTIVE',
        objetivo: 'MESSAGES',
        semaforo: 'verde',
        metricas: {
          impresiones: 28500,
          clics: 1200,
          gasto: 2100.00,
          cpc: 1.75,
          cpm: 73.68,
          ctr: 4.21,
          alcance: 18500,
          frecuencia: 1.54,
          leads: 0,
          mensajes: 28,
          link_clicks: 980,
          costo_por_resultado: 75.00
        },
        anuncios: [
          {
            id: 'ad1',
            nombre: 'Video Recorrido Casa Esmeralda',
            estado: 'ACTIVE',
            metricas: { impresiones: 15200, clics: 720, gasto: 1180.00, cpc: 1.64, ctr: 4.74, alcance: 10200, leads: 0, mensajes: 18, costo_por_resultado: 65.56 }
          },
          {
            id: 'ad2',
            nombre: 'Carrusel Modelos Disponibles',
            estado: 'ACTIVE',
            metricas: { impresiones: 8300, clics: 320, gasto: 580.00, cpc: 1.81, ctr: 3.86, alcance: 5600, leads: 0, mensajes: 7, costo_por_resultado: 82.86 }
          },
          {
            id: 'ad3',
            nombre: 'Imagen Promo Apartado $10K',
            estado: 'PAUSED',
            metricas: { impresiones: 5000, clics: 160, gasto: 340.00, cpc: 2.13, ctr: 3.20, alcance: 2700, leads: 0, mensajes: 3, costo_por_resultado: 113.33 }
          }
        ]
      },
      {
        id: '2',
        nombre: 'HDB — Leads Formulario',
        estado: 'ACTIVE',
        objetivo: 'LEAD_GENERATION',
        semaforo: 'amarillo',
        metricas: {
          impresiones: 16700,
          clics: 650,
          gasto: 1150.00,
          cpc: 1.77,
          cpm: 68.86,
          ctr: 3.89,
          alcance: 12300,
          frecuencia: 1.36,
          leads: 42,
          mensajes: 0,
          link_clicks: 520,
          costo_por_resultado: 27.38
        },
        anuncios: [
          {
            id: 'ad4',
            nombre: 'Lead Form — Desde $1M',
            estado: 'ACTIVE',
            metricas: { impresiones: 10200, clics: 420, gasto: 720.00, cpc: 1.71, ctr: 4.12, alcance: 7800, leads: 30, mensajes: 0, costo_por_resultado: 24.00 }
          },
          {
            id: 'ad5',
            nombre: 'Lead Form — Casa Propia Tecámac',
            estado: 'ACTIVE',
            metricas: { impresiones: 6500, clics: 230, gasto: 430.00, cpc: 1.87, ctr: 3.54, alcance: 4500, leads: 12, mensajes: 0, costo_por_resultado: 35.83 }
          }
        ]
      }
    ],
    analisis_ia: `**Resumen Ejecutivo:** Las campañas de Haciendas del Bosque muestran buen rendimiento general. La campaña de WhatsApp tiene CTR superior a 4%, mientras que la de leads genera formularios a $27 MXN promedio.\n\n**Recomendaciones:**\n1. 🟢 Escalar el anuncio "Video Recorrido Casa Esmeralda" — tiene el mejor CPR ($65.56)\n2. 🟡 Pausar "Imagen Promo Apartado $10K" — CPR alto ($113) vs los otros anuncios\n3. 🔵 Crear variante del "Lead Form — Desde $1M" que tiene el mejor costo por lead ($24)\n\n*Estos son datos de ejemplo. Configura tu Access Token para ver datos reales.*`
  };
}

function renderSummary(resumen) {
  // Use correct element IDs from index.html
  const elImpressions = document.getElementById('totalImpressions');
  const elClicks = document.getElementById('totalClicks');
  const elSpend = document.getElementById('totalSpend');
  const elResults = document.getElementById('avgCPR');

  if (elImpressions) elImpressions.textContent = formatNumber(resumen.impresiones_totales);
  if (elClicks) elClicks.textContent = formatNumber(resumen.clics_totales);
  if (elSpend) elSpend.textContent = '$' + formatNumber(Math.round(resumen.gasto_total));
  if (elResults) elResults.textContent = formatNumber((resumen.leads_totales || 0) + (resumen.mensajes_totales || 0));

  // Update last-update label
  const lastUpdateEl = document.getElementById('lastUpdate');
  if (lastUpdateEl && reportData) {
    const fecha = new Date(reportData.fecha_generacion).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    lastUpdateEl.textContent = `${fecha} — ${reportData.periodo}`;
  }
}

function renderCampaigns(campanas, filter = 'all') {
  const grid = document.getElementById('campaignGrid');

  const filtered = (filter === 'all')
    ? campanas
    : (filter === 'bypass' ? campanas : campanas.filter(c => c.semaforo === filter));

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="card p-2 text-center" style="grid-column: 1 / -1;"><div style="font-size:3rem;margin-bottom:1rem;">📊</div><p>No hay campañas que coincidan con estos filtros.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(campaign => {
    const m = campaign.metricas;
    const semaforoColors = { verde: '#22C55E', amarillo: '#EAB308', rojo: '#EF4444' };
    const semaforoLabels = { verde: '🟢 Bien', amarillo: '🟡 Revisar', rojo: '🔴 Atención' };
    const statusBadge = campaign.estado === 'ACTIVE'
      ? '<span class="badge badge-green">Activa</span>'
      : '<span class="badge badge-red">Pausada</span>';

    // Render ads within campaign
    const adsHTML = (campaign.anuncios || []).map(ad => {
      const am = ad.metricas;
      const adStatus = ad.estado === 'ACTIVE' ? '🟢' : '⏸️';
      const resultados = am.leads > 0 ? `${am.leads} leads` : `${am.mensajes} msgs`;

      return `
        <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:12px;margin-top:8px;border-left:3px solid ${am.ctr > 4 ? '#22C55E' : am.ctr > 2 ? '#EAB308' : '#EF4444'};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:0.8rem;font-weight:600;">${adStatus} ${ad.nombre}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:0.7rem;color:var(--text-secondary);">
            <div>👁️ ${formatNumber(am.impresiones)}<br><span style="color:var(--text-muted);">Impresiones</span></div>
            <div>👆 ${formatNumber(am.clics)}<br><span style="color:var(--text-muted);">Clics</span></div>
            <div>📊 ${am.ctr.toFixed(2)}%<br><span style="color:var(--text-muted);">CTR</span></div>
            <div>💰 $${am.costo_por_resultado.toFixed(0)}<br><span style="color:var(--text-muted);">CPR</span></div>
          </div>
          <div style="font-size:0.7rem;margin-top:6px;color:var(--text-muted);">
            💵 Gasto: $${am.gasto.toFixed(0)} | 🎯 ${resultados}
          </div>
        </div>`;
    }).join('');

    const resultados = m.leads > 0 ? `${m.leads} leads` : `${m.mensajes} mensajes`;

    return `
      <div class="card" style="border-left:4px solid ${semaforoColors[campaign.semaforo]};">
        <div class="card-header">
          <div>
            <h4 class="card-title">${campaign.nombre}</h4>
            <span style="font-size:0.75rem;color:var(--text-muted);">Objetivo: ${campaign.objetivo || 'N/A'}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="font-size:0.8rem;color:${semaforoColors[campaign.semaforo]};font-weight:600;">${semaforoLabels[campaign.semaforo]}</span>
            ${statusBadge}
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;margin-bottom:12px;">
          <div>
            <div style="font-size:1.3rem;font-weight:800;color:var(--blue-light);">${formatNumber(m.impresiones)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Impresiones</div>
          </div>
          <div>
            <div style="font-size:1.3rem;font-weight:800;color:var(--blue-light);">${formatNumber(m.clics)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Clics</div>
          </div>
          <div>
            <div style="font-size:1.3rem;font-weight:800;color:var(--blue-light);">${m.ctr.toFixed(2)}%</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">CTR</div>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px;">
          <div>💵 Gasto: <strong>$${m.gasto.toFixed(0)}</strong></div>
          <div>🎯 ${resultados}</div>
          <div>💰 CPC: <strong>$${m.cpc.toFixed(2)}</strong></div>
          <div>📈 CPR: <strong>$${m.costo_por_resultado.toFixed(0)}</strong></div>
        </div>
        
        ${(campaign.anuncios || []).length > 0 ? `
          <details>
            <summary style="cursor:pointer;font-size:0.85rem;color:var(--blue-light);font-weight:600;">
              📋 ${campaign.anuncios.length} anuncio${campaign.anuncios.length > 1 ? 's' : ''} — ver desglose
            </summary>
            ${adsHTML}
          </details>
        ` : ''}
      </div>`;
  }).join('');
}



function renderReportHistory() {
  const container = document.getElementById('reportHistory');
  if (!container) return;

  container.innerHTML = `
    <div style="font-size:0.85rem;color:var(--text-secondary);">
      <p>📅 Último reporte: ${reportData ? new Date(reportData.fecha_generacion).toLocaleDateString('es-MX') : 'N/A'}</p>
      <p style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
        Los reportes se generan automáticamente Lunes, Miércoles y Viernes a las 7 AM vía GitHub Actions.<br>
        Configura tus credenciales como GitHub Secrets para activar la automatización.
      </p>
    </div>`;
}

function formatNumber(n) {
  return new Intl.NumberFormat('es-MX').format(n);
}
