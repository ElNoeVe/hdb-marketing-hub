// ===================================
// galeria.js — Gallery with Carousel, Fullscreen & Maps
// ===================================

// Support for subfolder deployments (e.g. /lite/). Set window.BASE_PATH = '../' before loading this script.
const BASE_PATH = (typeof window.BASE_PATH !== 'undefined') ? window.BASE_PATH : '';

const ORIGIN_PLACE = 'Paseo+del+Bosque,+Fraccionamiento+haciendas+del+bosque,+Tecámac,+Estado+de+México';

document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadGalleryData();
  if (!data) return;

  renderModels(data.modelos);
  renderAmenities(data.amenidades);
  renderNearbyCategories(data.cercania);

  // Setup filter tabs
  setupTabs('.tabs', (filter) => {
    renderModels(data.modelos, filter);
  });

  // Create fullscreen overlay (once)
  createFullscreenOverlay();
});

async function loadGalleryData() {
  try {
    const res = await fetch(BASE_PATH + 'data/modelos.json');
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (e) {
    console.warn('⚠️ Fetch failed (likely CORS), trying fallback data...');
    if (window.StartData && window.StartData.modelos) {
      // Prefix all image paths in fallback data with BASE_PATH
      const data = window.StartData.modelos;
      if (BASE_PATH && data.modelos) {
        data.modelos = data.modelos.map(m => ({
          ...m,
          imagenes: (m.imagenes || []).map(img => BASE_PATH + img)
        }));
      }
      if (BASE_PATH && data.amenidades) {
        data.amenidades = data.amenidades.map(a => ({
          ...a,
          imagen: a.imagen ? BASE_PATH + a.imagen : a.imagen
        }));
      }
      return data;
    }
    console.error('Error loading gallery data:', e);
    return null;
  }
}

// =====================
// FULLSCREEN IMAGE VIEWER
// =====================
function createFullscreenOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'fullscreenOverlay';
  overlay.innerHTML = `
    <div class="fs-backdrop" onclick="closeFullscreen()"></div>
    <button class="fs-close" onclick="closeFullscreen()">✕</button>
    <button class="fs-prev" onclick="fsNavigate(-1)">‹</button>
    <button class="fs-next" onclick="fsNavigate(1)">›</button>
    <img class="fs-image" id="fsImage" src="" alt="Imagen en pantalla completa">
    <div class="fs-counter" id="fsCounter"></div>
  `;
  document.body.appendChild(overlay);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('fs-active')) return;
    if (e.key === 'Escape') closeFullscreen();
    if (e.key === 'ArrowLeft') fsNavigate(-1);
    if (e.key === 'ArrowRight') fsNavigate(1);
  });

  // Swipe support for fullscreen
  let fsTouchStartX = 0;
  overlay.addEventListener('touchstart', (e) => { fsTouchStartX = e.touches[0].clientX; });
  overlay.addEventListener('touchend', (e) => {
    const diff = fsTouchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) fsNavigate(diff > 0 ? 1 : -1);
  });
}

let fsImages = [];
let fsCurrentIndex = 0;

function openFullscreen(images, startIndex) {
  fsImages = images;
  fsCurrentIndex = startIndex || 0;
  const overlay = document.getElementById('fullscreenOverlay');
  overlay.classList.add('fs-active');
  document.body.style.overflow = 'hidden';
  updateFullscreenImage();
}

function closeFullscreen() {
  document.getElementById('fullscreenOverlay').classList.remove('fs-active');
  document.body.style.overflow = '';
}

function fsNavigate(direction) {
  fsCurrentIndex = (fsCurrentIndex + direction + fsImages.length) % fsImages.length;
  updateFullscreenImage();
}

function updateFullscreenImage() {
  const img = document.getElementById('fsImage');
  const counter = document.getElementById('fsCounter');
  const src = fsImages[fsCurrentIndex];
  const encodedSrc = src.split('/').map(s => encodeURIComponent(s)).join('/');
  img.src = encodedSrc;
  counter.textContent = `${fsCurrentIndex + 1} / ${fsImages.length}`;
}

// =====================
// MODEL CARDS
// =====================
function renderModels(modelos, filter = 'all') {
  const grid = document.getElementById('modelGrid');
  const filtered = filter === 'all'
    ? modelos
    : modelos.filter(m => m.tipo.toLowerCase() === filter.toLowerCase());

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🏠</div><p class="empty-state-text">No hay modelos de este tipo.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map((model, i) => {
    const features = model.caracteristicas.map(c => `<span>✅ ${c}</span>`).join('');
    const availBadge = model.disponible
      ? '<span class="badge badge-green">✅ Disponible</span>'
      : '<span class="badge badge-red">❌ No disponible</span>';

    const hasImages = model.imagenes && model.imagenes.length > 0;

    let imageSection;
    if (hasImages) {
      const imagesHTML = model.imagenes.map((src, idx) => {
        const encodedSrc = src.split('/').map(segment => encodeURIComponent(segment)).join('/');
        return `<img src="${encodedSrc}" alt="${model.nombre} - Foto ${idx + 1}" class="carousel-img" 
          style="${idx > 0 ? 'display:none;' : ''}width:100%;height:220px;object-fit:cover;cursor:pointer;" 
          onclick="openFullscreen(${JSON.stringify(model.imagenes).replace(/"/g, '&quot;')}, ${idx})"
          onerror="this.style.display='none'">`;
      }).join('');

      imageSection = `
        <div class="carousel-wrapper" style="position:relative;overflow:hidden;border-radius:var(--radius-lg) var(--radius-lg) 0 0;">
          ${imagesHTML}
          ${model.imagenes.length > 1 ? `
            <button class="carousel-prev" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">‹</button>
            <button class="carousel-next" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">›</button>
            <span class="carousel-counter" style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.7);color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">1 / ${model.imagenes.length}</span>
            <span class="carousel-fullscreen" onclick="openFullscreen(${JSON.stringify(model.imagenes).replace(/"/g, '&quot;')}, 0)" style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.7);color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;cursor:pointer;">🔍 Ver completa</span>
          ` : ''}
        </div>`;
    } else {
      const gradients = ['linear-gradient(135deg, #1B5FAA 0%, #3A7FCC 100%)', 'linear-gradient(135deg, #0E3D6E 0%, #1B5FAA 100%)', 'linear-gradient(135deg, #E31837 0%, #FF3B5C 100%)'];
      imageSection = `<div style="width:100%;height:220px;background:${gradients[i % 3]};display:flex;align-items:center;justify-content:center;color:white;border-radius:var(--radius-lg) var(--radius-lg) 0 0;">
        <div style="text-align:center;"><div style="font-size:3rem;">${model.tipo === 'Departamento' ? '🏢' : '🏡'}</div><div style="font-size:0.8rem;margin-top:8px;opacity:0.8;">${model.superficie_m2} m²</div></div></div>`;
    }

    const banosText = model.banos;

    return `
      <div class="gallery-card fade-in delay-${(i % 4) + 1}" data-type="${model.tipo}" data-model-id="${model.id}" style="${!model.disponible ? 'opacity:0.75;' : ''}">
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
               target="_blank" class="btn btn-primary" style="flex:1;font-size:0.8rem; display:flex; align-items:center; justify-content:center; gap:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.029.566 1.936.84 2.806.84 3.181 0 5.767-2.586 5.767-5.766.001-3.18-2.585-5.766-5.767-5.766zm9.93 5.766c0-5.476-4.455-9.931-9.931-9.931-5.476 0-9.931 4.455-9.931 9.931 0 1.968.578 3.633 1.549 5.06l-1.616 5.895 6.046-1.584c1.375.831 2.977 1.306 4.352 1.306 5.476 0 9.931-4.455 9.931-9.931z"/></svg>
              WhatsApp
            </a>
            <a href="calculadora.html" class="btn btn-outline" style="flex:1;font-size:0.8rem;"
               onclick="localStorage.setItem('calcPrice', ${model.precio})">
              📈 Plusvalía
            </a>
          </div>
        </div>
      </div>`;
  }).join('');

  // Initialize carousels
  document.querySelectorAll('.gallery-card').forEach(card => {
    if (card.querySelector('.carousel-wrapper')) {
      initCarousel(card);
    }
  });
}

// =====================
// CAROUSEL
// =====================
function initCarousel(card) {
  const images = card.querySelectorAll('.carousel-img');
  const prevBtn = card.querySelector('.carousel-prev');
  const nextBtn = card.querySelector('.carousel-next');
  const counter = card.querySelector('.carousel-counter');
  if (images.length <= 1) return;

  let currentIndex = 0;

  function showImage(idx) {
    images.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
    if (counter) counter.textContent = `${idx + 1} / ${images.length}`;
    currentIndex = idx;
  }

  if (prevBtn) prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage((currentIndex - 1 + images.length) % images.length);
  });
  if (nextBtn) nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage((currentIndex + 1) % images.length);
  });

  // Swipe support
  let touchStartX = 0;
  const wrapper = card.querySelector('.carousel-wrapper');
  wrapper.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  wrapper.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      showImage(diff > 0
        ? (currentIndex + 1) % images.length
        : (currentIndex - 1 + images.length) % images.length);
    }
  });
}

// =====================
// AMENITIES
// =====================
function renderAmenities(amenidades) {
  const grid = document.getElementById('amenitiesGrid');
  grid.innerHTML = amenidades.map(a => {
    const encodedImg = a.imagen ? a.imagen.split('/').map(s => encodeURIComponent(s)).join('/') : '';
    return `
    <div class="amenity-item" style="${a.imagen ? 'flex-direction:column;' : ''}">
      ${a.imagen ? `<img src="${encodedImg}" alt="${a.nombre}" style="width:100%;height:120px;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:8px;cursor:pointer;" 
        onclick="openFullscreen(['${a.imagen}'], 0)" onerror="this.style.display='none'">` : ''}
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="amenity-icon">${a.icon}</span>
        <span style="font-size:0.85rem;">${a.nombre}</span>
      </div>
    </div>`;
  }).join('');
}

// =====================
// NEARBY PLACES (Google Maps Directions)
// =====================
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
      container.innerHTML = items.map(item => {
        // Google Maps directions from development entrance to destination
        const destName = encodeURIComponent(item.nombre + (item.direccion ? ', ' + item.direccion : ', Tecámac, Estado de México'));
        const mapsUrl = `https://www.google.com/maps/dir/${ORIGIN_PLACE}/${destName}`;
        return `
        <div class="amenity-item" style="flex-direction:column;align-items:flex-start;gap:4px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="amenity-icon">${item.icon}</span>
            <a href="${mapsUrl}" target="_blank" style="font-size:0.85rem;font-weight:700;color:var(--text-primary);text-decoration:none;" onmouseover="this.style.color='var(--blue-light)'" onmouseout="this.style.color='var(--text-primary)'">
              ${item.nombre} 🔗
            </a>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);padding-left:28px;">
            🚗 ~${item.distancia} en auto${item.direccion ? ' • 📍 ' + item.direccion : ''}${item.descripcion ? ' • ' + item.descripcion : ''}
          </div>
        </div>`;
      }).join('');
    }
  });
}
