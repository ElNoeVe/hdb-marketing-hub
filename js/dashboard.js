// ===================================
// dashboard.js - Campaign Dashboard
// Shows campaigns AND ads within each
// ===================================

let reportData = null;

document.addEventListener('DOMContentLoaded', async () => {
  reportData = await loadLatestReport();
  if (reportData) {
    renderSummary(reportData.resumen);
    renderCampaigns(reportData.campanas);
    renderAIAdvice(reportData.analisis_ia);
    renderReportHistory();

    document.querySelectorAll('#reportTabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#reportTabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderCampaigns(reportData.campanas, tab.getAttribute('data-filter'));
      });
    });
  }
});

async function loadLatestReport() {
  try {
    const dates = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    for (const date of dates) {
      try {
        const res = await fetch("data/reportes/reporte-" + date + ".json");
        if (res.ok) {
          console.log('Reporte cargado:', date);
          return await res.json();
        }
      } catch (e) {}
    }
    if (window.StartData && window.StartData.reportes) {
      console.log('Usando datos reales de data.js');
      return window.StartData.reportes;
    }
    return getSampleData();
  } catch (e) {
    if (window.StartData && window.StartData.reportes) return window.StartData.reportes;
    return getSampleData();
  }
}

function getSampleData() {
  return {
    fecha_generacion: new Date().toISOString(),
    periodo: 'Datos de ejemplo',
    resumen: { gasto_total: 3250, impresiones_totales: 45200, clics_totales: 1850, leads_totales: 42, mensajes_totales: 28 },
    campanas: [
      { id:'1', nombre:'Haciendas del Bosque - Mensajes WhatsApp', estado:'ACTIVE', objetivo:'MESSAGES', semaforo:'verde',
        metricas:{ impresiones:28500, clics:1200, gasto:2100, cpc:1.75, cpm:73.68, ctr:4.21, alcance:18500, frecuencia:1.54, leads:0, mensajes:28, link_clicks:980, costo_por_resultado:75 },
        anuncios:[
          { id:'ad1', nombre:'Video Recorrido Casa Esmeralda', estado:'ACTIVE', metricas:{ impresiones:15200, clics:720, gasto:1180, cpc:1.64, ctr:4.74, alcance:10200, leads:0, mensajes:18, costo_por_resultado:65.56 }},
          { id:'ad2', nombre:'Carrusel Modelos Disponibles', estado:'ACTIVE', metricas:{ impresiones:8300, clics:320, gasto:580, cpc:1.81, ctr:3.86, alcance:5600, leads:0, mensajes:7, costo_por_resultado:82.86 }},
          { id:'ad3', nombre:'Imagen Promo Apartado $10K', estado:'PAUSED', metricas:{ impresiones:5000, clics:160, gasto:340, cpc:2.13, ctr:3.20, alcance:2700, leads:0, mensajes:3, costo_por_resultado:113.33 }}
        ]
      },
      { id:'2', nombre:'HDB - Leads Formulario', estado:'ACTIVE', objetivo:'LEAD_GENERATION', semaforo:'amarillo',
        metricas:{ impresiones:16700, clics:650, gasto:1150, cpc:1.77, cpm:68.86, ctr:3.89, alcance:12300, frecuencia:1.36, leads:42, mensajes:0, link_clicks:520, costo_por_resultado:27.38 },
        anuncios:[
          { id:'ad4', nombre:'Lead Form - Desde $1M', estado:'ACTIVE', metricas:{ impresiones:10200, clics:420, gasto:720, cpc:1.71, ctr:4.12, alcance:7800, leads:30, mensajes:0, costo_por_resultado:24 }},
          { id:'ad5', nombre:'Lead Form - Casa Propia Tecamac', estado:'ACTIVE', metricas:{ impresiones:6500, clics:230, gasto:430, cpc:1.87, ctr:3.54, alcance:4500, leads:12, mensajes:0, costo_por_resultado:35.83 }}
        ]
      }
    ],
    analisis_ia: "**Resumen Ejecutivo:** Las campañas muestran buen rendimiento general.\n\n**Recomendaciones:**\n1. Escalar Video Recorrido Casa Esmeralda\n2. Revisar Imagen Promo Apartado $10K\n\n*Estos son datos de ejemplo. Configura tu Access Token para ver datos reales.*"
  };
}

function renderSummary(resumen) {
  const elImpressions = document.getElementById('totalImpressions');
  const elClicks      = document.getElementById('totalClicks');
  const elSpend       = document.getElementById('totalSpend');
  const elResults     = document.getElementById('avgCPR');
  if (elImpressions) elImpressions.textContent = formatNumber(resumen.impresiones_totales);
  if (elClicks)      elClicks.textContent      = formatNumber(resumen.clics_totales);
  if (elSpend)       elSpend.textContent       = '$' + formatNumber(Math.round(resumen.gasto_total));
  if (elResults)     elResults.textContent     = formatNumber((resumen.leads_totales||0)+(resumen.mensajes_totales||0));
  const lastUpdateEl = document.getElementById('lastUpdate');
  if (lastUpdateEl && reportData) {
    const fecha = new Date(reportData.fecha_generacion).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
    lastUpdateEl.textContent = fecha + " - " + reportData.periodo;
  }
}

function renderCampaigns(campanas, filter='all') {
  const grid = document.getElementById('campaignGrid');
  const filtered = filter==='all' ? campanas : campanas.filter(c=>c.semaforo===filter);
  if (filtered.length===0) { grid.innerHTML = "<div class='empty-state'><div class='empty-state-icon'>📊</div><p class='empty-state-text'>No hay campañas con este filtro.</p></div>"; return; }
  const semaforoColors={verde:'#22C55E',amarillo:'#EAB308',rojo:'#EF4444'};
  const semaforoLabels={verde:'Bien',amarillo:'Revisar',rojo:'Atencion'};
  grid.innerHTML = filtered.map(campaign=>{
    const m=campaign.metricas;
    const statusBadge=campaign.estado==='ACTIVE'?'<span class="badge badge-green">Activa</span>':'<span class="badge badge-red">Pausada</span>';
    const adsHTML=(campaign.anuncios||[]).map(ad=>{
      const am=ad.metricas;
      const adStatus=ad.estado==='ACTIVE'?'Activo':'Pausado';
      const res=am.leads>0? am.leads + " leads": am.mensajes + " msgs";
      return "<div style='background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:12px;margin-top:8px;border-left:3px solid " + (am.ctr>4?'#22C55E':am.ctr>2?'#EAB308':'#EF4444') + ";'><span style='font-size:0.8rem;font-weight:600;'>" + adStatus + " " + ad.nombre + "</span><div style='display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:0.7rem;color:var(--text-secondary);margin-top:6px;'><div>" + formatNumber(am.impresiones) + "<br><span style='color:var(--text-muted);'>Imp</span></div><div>" + formatNumber(am.clics) + "<br><span style='color:var(--text-muted);'>Clics</span></div><div>" + am.ctr.toFixed(2) + "%<br><span style='color:var(--text-muted);'>CTR</span></div><div>$" + am.costo_por_resultado.toFixed(0) + "<br><span style='color:var(--text-muted);'>CPR</span></div></div><div style='font-size:0.7rem;margin-top:4px;color:var(--text-muted);'>$" + am.gasto.toFixed(0) + " | " + res + "</div></div>";
    }).join('');
    const resultados=m.leads>0? m.leads + " leads": m.mensajes + " mensajes";
    return "<div class='card' style='border-left:4px solid " + semaforoColors[campaign.semaforo] + ";'><div class='card-header'><div><h4 class='card-title'>" + campaign.nombre + "</h4><span style='font-size:0.75rem;color:var(--text-muted);'>Objetivo: " + (campaign.objetivo||'N/A') + "</span></div><div style='display:flex;gap:8px;align-items:center;'><span style='font-size:0.8rem;color:" + semaforoColors[campaign.semaforo] + ";font-weight:600;'>" + semaforoLabels[campaign.semaforo] + "</span>" + statusBadge + "</div></div><div style='display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;margin-bottom:12px;'><div><div style='font-size:1.3rem;font-weight:800;color:var(--blue-light);'>" + formatNumber(m.impresiones) + "</div><div style='font-size:0.7rem;color:var(--text-muted);'>Impresiones</div></div><div><div style='font-size:1.3rem;font-weight:800;color:var(--blue-light);'>" + formatNumber(m.clics) + "</div><div style='font-size:0.7rem;color:var(--text-muted);'>Clics</div></div><div><div style='font-size:1.3rem;font-weight:800;color:var(--blue-light);'>" + m.ctr.toFixed(2) + "%</div><div style='font-size:0.7rem;color:var(--text-muted);'>CTR</div></div></div><div style='display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px;'><div>$" + m.gasto.toFixed(0) + "</div><div>" + resultados + "</div><div>CPC: $" + m.cpc.toFixed(2) + "</div><div>CPR: $" + m.costo_por_resultado.toFixed(0) + "</div></div>" + (campaign.anuncios.length>0?"<details><summary style='cursor:pointer;font-size:0.85rem;color:var(--blue-light);font-weight:600;'>Anuncios - ver desglose</summary>" + adsHTML + "</details>":"") + "</div>";
  }).join('');
}

function renderAIAdvice(analysis) {
  const container=document.getElementById('aiAdvice');
  if(!container||!analysis) return;
  const html=analysis.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
  container.innerHTML="<div class='card'><h3 class='card-title mb-1'>Analisis Inteligente (Gemini AI)</h3><div style='font-size:0.9rem;line-height:1.7;color:var(--text-secondary);'>" + html + "</div></div>";
}

function renderReportHistory() {
  const container=document.getElementById('reportHistory');
  if(!container) return;
  container.innerHTML="<div style='font-size:0.85rem;color:var(--text-secondary);'><p>Ultimo reporte: " + (reportData?new Date(reportData.fecha_generacion).toLocaleDateString('es-MX'):'N/A') + "</p><p style='margin-top:8px;font-size:0.75rem;color:var(--text-muted);'>Los reportes se generan automaticamente Lunes, Miercoles y Viernes a las 7 AM via GitHub Actions.<br>Configura tus credenciales como GitHub Secrets para activar la automatizacion.</p></div>";
}

function formatNumber(n) {
  return new Intl.NumberFormat('es-MX').format(n);
}
