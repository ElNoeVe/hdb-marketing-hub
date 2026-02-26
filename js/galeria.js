// ===================================
// galeria.js - Gallery with Carousel, Fullscreen & Maps
// ===================================

const BASE_PATH = (typeof window.BASE_PATH !== 'undefined') ? window.BASE_PATH : '';
const ORIGIN_PLACE = 'Paseo+del+Bosque,+Fraccionamiento+haciendas+del+bosque,+Tecamac,+Estado+de+Mexico';

document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadGalleryData();
  if (!data) return;
  renderModels(data.modelos);
  renderAmenities(data.amenidades);
  renderNearbyCategories(data.cercania);
  await loadDisponibilidad();
  setupTabs('.tabs', (filter) => {
    renderModels(data.modelos, filter);
    loadDisponibilidad();
  });
  createFullscreenOverlay();
});

function prefixPaths(data) {
  if (!BASE_PATH || !data) return data;
  if (data.modelos) {
    data.modelos = data.modelos.map(m => ({
      ...m,
      imagenes: (m.imagenes || []).map(img =>
        img.startsWith('http') || img.startsWith('/') ? img : BASE_PATH + img
      )
    }));
  }
  if (data.amenidades) {
    data.amenidades = data.amenidades.map(a => ({
      ...a,
      imagen: a.imagen && !a.imagen.startsWith('http') && !a.imagen.startsWith('/')
        ? BASE_PATH + a.imagen
        : a.imagen
    }));
  }
  return data;
}

async function loadGalleryData() {
  try {
    const res = await fetch(BASE_PATH + 'data/modelos.json');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return prefixPaths(data);
  } catch (e) {
    console.warn('Fetch failed, trying fallback data...');
    if (window.StartData && window.StartData.modelos) {
      const data = JSON.parse(JSON.stringify(window.StartData.modelos));
      return prefixPaths(data);
    }
    return null;
  }
}

async function loadDisponibilidad() {
  const cfg = window.ANALYTICS_CONFIG;
  if (!cfg || !cfg.supabaseUrl) {
    document.querySelectorAll('.disp-badge').forEach(el => { el.style.display = 'none'; });
    return;
  }
  try {
    const res = await fetch(
      cfg.supabaseUrl + '/rest/v1/disponibilidad?select=modelo_id,nombre_modelo,unidades_disponibles',
      { headers: { apikey: cfg.supabaseKey, Authorization: 'Bearer ' + cfg.supabaseKey } }
    );
    if (!res.ok) throw new Error('Supabase error ' + res.status);
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error('Unexpected response');
    applyDisponibilidadToCards(rows);
  } catch (e) {
    console.warn('No se pudo cargar disponibilidad:', e.message);
    document.querySelectorAll('.disp-badge').forEach(el => { el.style.display = 'none'; });
  }
}

function applyDisponibilidadToCards(rows) {
  const inventario = {};
  rows.forEach(r => { inventario[r.modelo_id] = r.unidades_disponibles; });
  document.querySelectorAll('[data-model-id]').forEach(card => {
    const modelId = card.getAttribute('data-model-id');
    if (!(modelId in inventario)) return;
    const unidades = inventario[modelId];
    const disponible = unidades > 0;
    const availBadgeEl = card.querySelector('.gallery-avail-badge');
    if (availBadgeEl) {
      availBadgeEl.className = disponible ? 'badge badge-green gallery-avail-badge' : 'badge badge-red gallery-avail-badge';
      availBadgeEl.textContent = disponible ? 'Disponible' : 'No disponible';
    }
    card.style.opacity = disponible ? '1' : '0.75';
    const dispBadge = card.querySelector('.disp-badge');
    if (dispBadge) {
      if (disponible) {
        dispBadge.textContent = '🏠 ' + unidades + ' unidades disponible';
        dispBadge.style.cssText = 'display:inline-block;background:rgba(34,197,94,0.15);color:#22C55E;border:1px solid rgba(34,197,94,0.3);border-radius:20px;padding:2px 10px;font-size:0.75rem;font-weight:600;';
      } else {
        dispBadge.textContent = '🚫 Sin unidades disponibles';
        dispBadge.style.cssText = 'display:inline-block;background:rgba(239,68,68,0.12);color:#EF4444;border:1px solid rgba(239,68,68,0.25);border-radius:20px;padding:2px 10px;font-size:0.75rem;font-weight:600;';
      }
    }
  });
}

function createFullscreenOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'fullscreenOverlay';
  overlay.innerHTML = '<div class="fs-backdrop" onclick="closeFullscreen()"></div><button class="fs-close" onclick="closeFullscreen()">X</button><button class="fs-prev" onclick="fsNavigate(-1)"><</button><button class="fs-next" onclick="fsNavigate(1)">></button><img class="fs-image" id="fsImage" src="" alt="Imagen en pantalla completa"><div class="fs-counter" id="fsCounter"></div>';
  document.body.appendChild(overlay);
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('fs-active')) return;
    if (e.key === 'Escape') closeFullscreen();
    if (e.key === 'ArrowLeft') fsNavigate(-1);
    if (e.key === 'ArrowRight') fsNavigate(1);
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
  img.src = src;
  counter.textContent = (fsCurrentIndex + 1) + ' / ' + fsImages.length;
}

function renderModels(modelos, filter = 'all') {
  const grid = document.getElementById('modelGrid');
  const filtered = filter === 'all'
    ? modelos
    : modelos.filter(m => m.tipo.toLowerCase() === filter.toLowerCase());

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">No hay modelos</div>';
    return;
  }

  grid.innerHTML = filtered.map((model, i) => {
    const features = model.caracteristicas.map(c => '<span>' + c + '</span>').join('');
    const availBadge = model.disponible
      ? '<span class="badge badge-green gallery-avail-badge">Disponible</span>'
      : '<span class="badge badge-red gallery-avail-badge">No disponible</span>';

    return '<div class="gallery-card" data-model-id="' + model.id + '">' +
      '<div class="gallery-card-body">' +
        '<h3>' + model.nombre + '</h3>' +
        availBadge +
        '<div><span class="disp-badge">Cargando...</span></div>' +
        '<div class="gallery-card-price">' + formatCurrency(model.precio) + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderAmenities(amenidades) {
  const grid = document.getElementById('amenitiesGrid');
  grid.innerHTML = amenidades.map(a => {
    return '<div class="amenity-item"><span>' + a.icon + '</span><span>' + a.nombre + '</span></div>';
  }).join('');
}

function renderNearbyCategories(cercania) {
  const categories = ['hospitales', 'plazas_comerciales', 'escuelas', 'universidades', 'accesos_viales'];
  categories.forEach(key => {
    const container = document.getElementById('nearby' + key.charAt(0).toUpperCase() + key.slice(1));
    const items = cercania[key];
    if (container && items) {
      container.innerHTML = items.map(item => {
        return '<div class="amenity-item"><span>' + item.icon + '</span><span>' + item.nombre + '</span></div>';
      }).join('');
    }
  });
}

function setupTabs(selector, callback) {
  const container = document.querySelector(selector);
  if (!container) return;
  const buttons = container.querySelectorAll('.tab');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      callback(btn.dataset.filter);
    });
  });
}

function formatCurrency(amount) {
  if (typeof amount !== 'number') return amount;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);
}
