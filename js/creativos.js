// ===================================
// creativos.js — Creative Generator
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    setupTabs('#creativeTabs', switchSection);

    // Load data
    loadLatestCreative();

    // Week selector change
    document.getElementById('weekSelect').addEventListener('change', (e) => {
        if (e.target.value) loadCreativeData(e.target.value);
    });
});

function switchSection(type) {
    document.getElementById('section-imagenes').classList.toggle('hidden', type !== 'imagenes');
    document.getElementById('section-videos').classList.toggle('hidden', type !== 'videos');
    document.getElementById('section-segmentacion').classList.toggle('hidden', type !== 'segmentacion');
}

async function loadLatestCreative() {
    try {
        // In a real scenario we might list files, but for static hosting we'll try to guess 
        // or just load a known index. 
        // For now, let's try to fetch a specific date or 'latest' if we had an endpoint.
        // Since we are serverless, we'll try to load the file generated today or yesterday.

        // Strategy: List available files (simulated here by checking common dates or just the latest known)
        // For this local version, we'll try to find the file dynamically if possible, 
        // otherwise we might need an index.json in data/creativos.

        // For this implementation, I'll attempt to load the file from the current date.
        const today = new Date().toISOString().split('T')[0];
        const filename = `creativos-${today}.json`;

        // Update Selector (Mock)
        const select = document.getElementById('weekSelect');
        select.innerHTML = `<option value="${filename}" selected>${today} (Actual)</option>`;

        await loadCreativeData(filename);

    } catch (e) {
        console.error("Error loading creative:", e);
        document.getElementById('imageAdsContainer').innerHTML = `<div class="error-state">😕 No se encontraron creativos para hoy. Ejecuta el script primero.</div>`;
    }
}

async function loadCreativeData(filename) {
    try {
        const response = await fetch(`data/creativos/${filename}`);
        if (!response.ok) throw new Error('File not found');

        const data = await response.json();
        renderCampaign(data);
    } catch (error) {
        console.error(error);
        // Fallback or error message
        document.getElementById('imageAdsContainer').innerHTML = `<div class="error-state">❌ No se pudo cargar el archivo: ${filename}<br><small>Asegúrate de haber ejecutado: node scripts/generate-content.js</small></div>`;
    }
}

function renderCampaign(data) {
    const imagesContainer = document.getElementById('imageAdsContainer');
    const videosContainer = document.getElementById('videoAdsContainer');
    const date = data.semana || new Date().toISOString().split('T')[0];

    // --- IMAGENES ---
    let imagesHtml = '';

    // 1. Técnico
    if (data.anuncio_tecnico) {
        imagesHtml += createAdCard('Técnico', 'Anuncio 1 — Enfoque Técnico y Racional', data.anuncio_tecnico, date, 'tecnico.png');
    }
    // 2. Sentimental
    if (data.anuncio_sentimental) {
        imagesHtml += createAdCard('Sentimental', 'Anuncio 2 — Enfoque Emocional y Familiar', data.anuncio_sentimental, date, 'sentimental.png');
    }
    // 3. Educativo (Carrusel)
    if (data.anuncio_educativo) {
        imagesHtml += createCarouselCard('Educativo', 'Anuncio 3 — Carrusel Educativo / Atracción', data.anuncio_educativo, date);
    }

    imagesContainer.innerHTML = imagesHtml;

    // --- VIDEOS ---
    let videosHtml = '';
    if (data.anuncio_video) {
        videosHtml += createVideoCard('Video', 'Video Storytelling — Inversión y Estilo de Vida', data.anuncio_video);
    }
    videosContainer.innerHTML = videosHtml || '<div class="card"><p>No hay video generado para esta campaña.</p></div>';
}

function createAdCard(type, title, adData, date, imageName) {
    const imagePath = `assets/generated/${date}/${imageName}`;

    return `
    <div class="card mb-1 fade-in">
        <div class="card-header">
            <h3>${title}</h3>
            <span class="badge badge-green">Listo</span>
        </div>

        <div class="grid grid-2" style="grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
            <div>
                <h4 style="color:var(--blue-light);margin-bottom:8px;">🖼️ Imagen Generada (Imagen 3)</h4>
                <div class="generated-image-container">
                    <img src="${imagePath}" alt="${type}" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x400?text=Generando+Imagen...';">
                    <a href="${imagePath}" download="${imageName}" class="btn-download">⬇️ Descargar</a>
                </div>
            </div>
            
            <div>
                <h4 style="color:var(--blue-light);margin-bottom:8px;">📝 Copy</h4>
                <div class="copy-block">
                    <button class="copy-btn" onclick="copyText(this)">📋 Copiar</button>
                    <pre>${adData.copy}</pre>
                </div>

                <h4 style="color:var(--blue-light);margin-bottom:8px;">🏷️ Hashtags</h4>
                <div class="copy-block">
                    <button class="copy-btn" onclick="copyText(this)">📋 Copiar</button>
                    <pre>${(adData.hashtags || []).join(' ')}</pre>
                </div>

                 <h4 style="color:var(--blue-light);margin-bottom:8px;">🎨 Prompt Usado</h4>
                <div class="copy-block">
                     <pre style="white-space: pre-wrap; font-size: 0.8em;">${adData.prompt_imagen}</pre>
                </div>
            </div>
        </div>
    </div>`;
}

function createCarouselCard(type, title, adData, date) {
    let slidesHtml = '';

    if (adData.slides) {
        adData.slides.forEach((slide, index) => {
            const imagePath = `assets/generated/${date}/educativo_slide_${index + 1}.png`;
            slidesHtml += `
            <div class="carousel-slide mb-1" style="border:1px solid #333; padding:10px; border-radius:8px;">
                <h5 style="margin-top:0;">Slide ${index + 1}: ${slide.titulo}</h5>
                <div class="grid grid-2" style="gap:10px;">
                     <div class="generated-image-container">
                        <img src="${imagePath}" alt="Slide ${index + 1}" onerror="this.src='https://via.placeholder.com/400x400?text=Slide+${index + 1}'">
                        <a href="${imagePath}" download="slide_${index + 1}.png" class="btn-download sm">⬇️</a>
                    </div>
                    <div>
                         <p style="font-size:0.9em; color:#ccc;">${slide.texto}</p>
                    </div>
                </div>
            </div>`;
        });
    }

    return `
    <div class="card mb-1 fade-in">
        <div class="card-header">
            <h3>${title}</h3>
            <span class="badge badge-green">Listo</span>
        </div>

        <h4 style="color:var(--blue-light);margin-bottom:8px;">📝 Copy del Post (Intro)</h4>
        <div class="copy-block">
            <button class="copy-btn" onclick="copyText(this)">📋 Copiar</button>
            <pre>${adData.copy_post || adData.copy}</pre>
        </div>

        <h4 style="color:var(--blue-light);margin-bottom:8px;">🎠 Estructura del Carrusel</h4>
        <div class="slides-container">
            ${slidesHtml}
        </div>
        
         <h4 style="color:var(--blue-light);margin-bottom:8px;">🏷️ Hashtags</h4>
        <div class="copy-block">
            <button class="copy-btn" onclick="copyText(this)">📋 Copiar</button>
            <pre>${(adData.hashtags || []).join(' ')}</pre>
        </div>
    </div>`;
}

function createVideoCard(type, title, adData) {
    return `
    <div class="card mb-1 fade-in">
        <div class="card-header">
            <h3>${title}</h3>
            <span class="badge badge-green">Listo</span>
        </div>

        <h4 style="color:var(--blue-light);margin-bottom:8px;">📝 Copy del Post</h4>
        <div class="copy-block">
            <button class="copy-btn" onclick="copyText(this)">📋 Copiar</button>
            <pre>${adData.copy}</pre>
        </div>

        <h4 style="color:var(--blue-light);margin-bottom:8px;">🎬 Guión Técnico</h4>
        <div class="copy-block">
            <button class="copy-btn" onclick="copyText(this)">📋 Copiar</button>
            <pre>${adData.guion_tecnico || adData.guion}</pre>
        </div>

        <h4 style="color:var(--blue-light);margin-bottom:8px;">🤖 Prompt para Video IA (Sora/Runway)</h4>
        <div class="copy-block">
            <button class="copy-btn" onclick="copyText(this)">📋 Copiar</button>
            <pre>${adData.prompt_video_ia || adData.prompt_video}</pre>
        </div>
    </div>`;
}

// Helper to set up tabs
function setupTabs(selector, callback) {
    const container = document.querySelector(selector);
    if (!container) return;
    const buttons = container.querySelectorAll('.tab');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            callback(btn.dataset.type);
        });
    });
}
