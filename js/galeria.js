// ===================================
// galeria.js — Property Gallery
// ===================================

let modelosData = null;

document.addEventListener('DOMContentLoaded', async () => {
  modelosData = await loadModelos();
  if (modelosData) {
    renderModels(modelosData.modelos);
    renderAmenities(modelosData.amenidades);
    renderNearbyCategories(modelosData.cercania);
  }

  // Setup filter tabs
  document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      renderModels(modelosData.modelos, filter);
    });
  });
});

async function loadModelos() {
  try {
    const res = await fetch('data/modelos.json');
    return await res.json();
  } catch (e) {
    console.error('Error loading models:', e);
    return null;
  }
}

function formatCurrency(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
}

function renderModels(models, filter = 'all') {
  const grid = document.getElementById('modelGrid');

  const filtered = filter === 'all'
    ? models
    : models.filter(m => m.tipo === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏠</div>
        <p class="empty-state-text">No hay modelos en esta categoría.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((model, i) => {
    const gradients = [
      'linear-gradient(135deg, #1B5FAA 0%, #3A7FCC 100%)',
      'linear-gradient(135deg, #0E3D6E 0%, #1B5FAA 100%)',
      'linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)',
      'linear-gradient(135deg, #E31837 0%, #FF3B5C 100%)',
      'linear-gradient(135deg, #8B0000 0%, #E31837 100%)'
    ];

    const features = model.caracteristicas.map(c => `<span>✅ ${c}</span>`).join('');

    // Availability badge
    const availBadge = model.disponible
      ? '<span class="badge badge-green">✅ Disponible</span>'
      : '<span class="badge badge-red">❌ No disponible</span>';

    // Image or gradient
    const hasImages = model.imagenes && model.imagenes.length > 0;
    const imageSection = hasImages
      ? `<img src="${model.imagenes[0]}" alt="${model.nombre}" style="width:100%;height:200px;object-fit:cover;">`
      : `<div style="width:100%;height:200px;background:${gradients[i % 5]};display:flex;align-items:center;justify-content:center;color:white;position:relative;">
          <div style="text-align:center;">
            <div style="font-size:3rem;">${model.tipo === 'Departamento' ? '🏢' : '🏡'}</div>
            <div style="font-size:1rem;margin-top:8px;font-weight:700;">${model.nombre}</div>
            <div style="font-size:0.8rem;margin-top:4px;opacity:0.8;">${model.superficie_m2} m²</div>
          </div>
        </div>`;

    // Baños display  
    const banosText = model.banos % 1 === 0 ? model.banos : model.banos;

    return `
      <div class="gallery-card fade-in delay-${(i % 4) + 1}" data-type="${model.tipo}" style="${!model.disponible ? 'opacity:0.7;' : ''}">
        ${imageSection}
        
        <div class="gallery-card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <h3 class="gallery-card-title" style="margin:0;">${model.nombre}</h3>
            ${availBadge}
          </div>
          
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:var(--space-sm) 0;">${model.descripcion}</p>
          
          <div class="gallery-card-meta">
            <span>🛏️ ${model.recamaras} rec.</span>
            <span>🚿 ${banosText} baño${model.banos > 1 ? 's' : ''}</span>
            <span>🚗 ${model.estacionamiento} est.</span>
            <span>📐 ${model.superficie_m2} m²</span>
            <span>🏗️ ${model.niveles} nivel${model.niveles > 1 ? 'es' : ''}</span>
          </div>
          
          <div class="gallery-card-price">${formatCurrency(model.precio)}</div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:var(--space-sm);font-size:0.8rem;color:var(--text-secondary);">
            <div>📝 Gastos: <strong>${model.gastos_adicionales}</strong></div>
            <div>💰 Apartado: <strong>${formatCurrency(model.apartado)}</strong></div>
            <div>📅 Plan de pagos: <strong>${formatCurrency(model.plan_pagos)}/mes</strong></div>
          </div>
          
          <details style="margin-top:var(--space-md);">
            <summary style="cursor:pointer;font-size:0.85rem;color:var(--blue-light);font-weight:600;">🏠 Características incluidas</summary>
            <div style="margin-top:var(--space-sm);display:flex;flex-direction:column;gap:4px;font-size:0.8rem;color:var(--text-secondary);">
              ${features}
            </div>
          </details>
          
          <div style="margin-top:var(--space-md);display:flex;gap:var(--space-sm);">
            <a href="https://wa.me/525537494034?text=Hola, me interesa el modelo ${encodeURIComponent(model.nombre)} de Haciendas del Bosque" 
               target="_blank" class="btn btn-primary" style="flex:1;font-size:0.8rem;">
              📱 WhatsApp
            </a>
            <a href="calculadora.html" class="btn btn-outline" style="flex:1;font-size:0.8rem;"
               onclick="localStorage.setItem('calcPrice', ${model.precio})">
              📈 Plusvalía
            </a>
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderAmenities(amenidades) {
  const grid = document.getElementById('amenitiesGrid');
  grid.innerHTML = amenidades.map(a => `
    <div class="amenity-item">
      <span class="amenity-icon">${a.icon}</span>
      <span>${a.nombre}</span>
    </div>
  `).join('');
}

function renderNearbyCategories(cercania) {
  const categories = [
    { key: 'hospitales', containerId: 'nearbyHospitales' },
    { key: 'plazas_comerciales', containerId: 'nearbyPlazas' },
    { key: 'escuelas', containerId: 'nearbyEscuelas' },
    { key: 'universidades', containerId: 'nearbyUniversidades' },
    { key: 'accesos_viales', containerId: 'nearbyAccesos' }
  ];

  categories.forEach(cat => {
    const container = document.getElementById(cat.containerId);
    const items = cercania[cat.key];

    if (container && items) {
      container.innerHTML = items.map(item => `
        <div class="amenity-item" style="flex-direction:column;align-items:flex-start;gap:4px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="amenity-icon">${item.icon}</span>
            <strong style="font-size:0.85rem;">${item.nombre}</strong>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);padding-left:28px;">
            ⏱️ ~${item.distancia}${item.direccion ? ' • 📍 ' + item.direccion : ''}${item.descripcion ? ' • ' + item.descripcion : ''}
          </div>
        </div>
      `).join('');
    }
  });
}
