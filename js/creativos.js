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
        console.warn('⚠️ Fetch failed (likely CORS), trying fallback data...');
        // Fallback: Check for global data from data.js
        if (window.StartData && window.StartData.creativos) {
            // Check if the loaded data matches the requested date or just use what we have
            const data = window.StartData.creativos;
            renderCampaign(data);

            // Update selector to show it's loaded from fallback
            const select = document.getElementById('weekSelect');
            if (select) select.innerHTML = `<option value="fallback" selected>${data.semana || 'Datos Locales'} (Offline)</option>`;
            return;
        }

        console.error(error);
        // Fallback or error message
        document.getElementById('imageAdsContainer').innerHTML = `<div class="error-state">❌ No se pudo cargar el archivo: ${filename}<br><small>Si estás viendo esto localmente (file://), necesitas ejecutar 'node scripts/generate-content.js' para actualizar el archivo de datos local.</small></div>`;
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
    const imgId = `img-${type}-${Date.now()}`;
    const dlId = `dl-${type}-${Date.now()}`;

    return `
    <div class="card mb-1 fade-in">
        <div class="card-header">
            <h3>${title}</h3>
            <span class="badge badge-green">📋 Listo</span>
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

             <h4 style="color:var(--blue-light);margin-bottom:8px;">🎨 Prompt Sugerido para IA</h4>
            <div class="copy-block">
                <button class="copy-btn" onclick="copyText(this)">📋 Copiar</button>
                 <pre style="white-space: pre-wrap; font-size: 0.8em;">${adData.prompt_imagen}</pre>
            </div>
        </div>
    </div>`;
}

function createCarouselCard(type, title, adData, date) {
    let slidesHtml = '';

    if (adData.slides) {
        adData.slides.forEach((slide, index) => {
            const imagePath = `assets/generated/${date}/educativo_slide_${index + 1}.png`;
            const imgId = `slide-img-${index}-${Date.now()}`;
            const dlId = `slide-dl-${index}-${Date.now()}`;
            slidesHtml += `
            <div class="carousel-slide mb-1" style="border:1px solid #333; padding:10px; border-radius:8px;">
                <h5 style="margin-top:0;">Slide ${index + 1}: ${slide.titulo}</h5>
                <div style="display:flex;gap:12px;align-items:flex-start;">
                    <div style="flex:1;">
                        <p style="font-size:0.9em;color:#ccc;margin:0;">${slide.texto}</p>
                        ${slide.prompt_imagen ? `<div class="copy-block mt-1" style="margin-top:8px;">
                            <button class="copy-btn sm" onclick="copyText(this)">📋 Copiar</button>
                            <pre style="white-space: pre-wrap; font-size: 0.75em; color:var(--text-muted); margin:0;">🎨 Prompt: ${slide.prompt_imagen}</pre>
                        </div>` : ''}
                    </div>
                </div>
            </div>`;
        });
    }

    return `
    <div class="card mb-1 fade-in">
        <div class="card-header">
            <h3>${title}</h3>
            <span class="badge badge-green">📋 Listo</span>
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

// =====================================================================
// AD IMAGE GENERATOR
// =====================================================================

const AD_DATA = {
    departamento: {
        logoLeft: 'assets/logo-hdb.png',
        logoLeftAlt: 'Haciendas del Bosque',
        modelos: [
            {
                nombre: 'Depa Pino Premium 2 Recámaras',
                precio: 'desde $850,000',
                folder: 'Depa Pino Premium 2R',
                images: [
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.03.jpeg', label: 'Fachada' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.14.jpeg', label: 'Sala' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.15.jpeg', label: 'Cocina' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.151.jpeg', label: 'Recámara' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.153.jpeg', label: 'Baño' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.03.181.jpeg', label: 'Área común' },
                    { file: '561454336_24422811420748263_6519657956428641840_n.jpg', label: 'Exterior' },
                    { file: 'Casas y departamentos en venta Tecámac - Estado de México - Hacienda del Bosque un desarrollo de Hogares Unión.webp', label: 'Desarrollo' },
                ]
            },
            {
                nombre: 'Depa Pino Premium 3 Recámaras',
                precio: 'desde $980,000',
                folder: 'Depa Pino Premium 3R',
                images: [
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.03.jpeg', label: 'Fachada' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.14.jpeg', label: 'Sala' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.15.jpeg', label: 'Cocina' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.151.jpeg', label: 'Recámara' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.01.153.jpeg', label: 'Baño' },
                    { file: 'WhatsApp Image 2026-02-18 at 20.03.181.jpeg', label: 'Área común' },
                    { file: '561454336_24422811420748263_6519657956428641840_n.jpg', label: 'Exterior' },
                ]
            }
        ]
    },
    casa: {
        logoLeft: 'assets/logo-privadas.png',  // Upload logo-privadas.png to assets/
        logoLeftAlt: 'Privadas del Bosque',
        modelos: [
            {
                nombre: 'Casa Citrino',
                precio: 'desde $980,000',
                folder: 'CASA CITRINO',
                images: [
                    { file: 'Casas a la venta Tecámac Estado de México - Modelo Citrino - Privadas del Bosque-1.webp', label: 'Fachada' },
                    { file: 'Sala de casa en venta Tecámac Estado de México - Citrino.webp', label: 'Sala' },
                    { file: 'Cocina de casa en venta Tecámac Estado de México - Citrino.webp', label: 'Cocina' },
                    { file: 'Family room de casa en venta Tecámac Estado de México - Citrino.webp', label: 'Family room' },
                    { file: 'Recámara secundaria de casa en venta Tecámac Estado de México - Citrino.webp', label: 'Recámara' },
                    { file: 'baño de casa en venta Tecámac Estado de México - Citrino.webp', label: 'Baño' },
                    { file: 'Terraza de casa en venta Tecámac Estado de México - Citrino.webp', label: 'Terraza' },
                    { file: '558877359_24422797917416280_4423801559140570034_n.jpg', label: 'Exterior' },
                    { file: '558972649_24422796147416457_7493770988054539986_n.jpg', label: 'Acceso' },
                    { file: '558973979_24422800547416017_2408910737243467597_n.jpg', label: 'Jardín' },
                ]
            },
            {
                nombre: 'Casa Esmeralda',
                precio: 'desde $1,150,000',
                folder: 'CASA ESMERALDA',
                images: [
                    { file: 'Casas a la venta Tecámac Estado de México - Modelo Esmeralda - Privadas del Bosque-1.webp', label: 'Fachada' },
                    { file: 'Sala de casa en venta Tecámac Estado de México - Esmeralda.webp', label: 'Sala' },
                    { file: 'Cocina y comedor de casa en venta Tecámac Estado de México - Esmeralda.webp', label: 'Cocina' },
                    { file: 'Recámara principal de casa en venta Tecámac Estado de México - Esmeralda.webp', label: 'Recámara' },
                    { file: 'Recámara secundaria de casa en venta Tecámac Estado de México - Esmeralda.webp', label: 'Rec. 2' },
                    { file: 'Patio de casa en venta Tecámac Estado de México - Esmeralda.webp', label: 'Patio' },
                    { file: '559468175_24422809477415124_1860468000645237551_n.jpg', label: 'Exterior' },
                    { file: '561706721_24422803840749021_1041807589132480898_n.jpg', label: 'Acceso' },
                ]
            }
        ]
    },
    amenidades: {
        logoLeft: 'assets/logo-hdb.png',
        logoLeftAlt: 'Haciendas del Bosque',
        modelos: [
            {
                nombre: 'Amenidades del Desarrollo',
                precio: '',
                folder: 'AMENIDADES',
                images: [
                    { file: 'Area recreativa infantil.webp', label: 'Área infantil' },
                    { file: 'Canchas deportivas.webp', label: 'Canchas' },
                    { file: 'Espacios recreativos con asador.jpeg', label: 'Asador' },
                    { file: 'Escuelas al interior.PNG', label: 'Escuelas' },
                    { file: 'Lugar de Estacionamiento.jpeg', label: 'Estacionamiento' },
                    { file: 'Sala  Comedor.jpg', label: 'Sala-comedor' },
                    { file: 'Baño equipado (según promoción).webp', label: 'Baño equipado' },
                    { file: 'Closet (según promoción).jpeg', label: 'Closet' },
                    { file: 'Cocina Integral (según promoción).jpeg', label: 'Cocina integral' },
                ]
            }
        ]
    }
};

const AD_CONFIG = {
    telefono: '55-3749-4034',
    disclaimer1: 'Imágenes de carácter ilustrativo',
    disclaimer2: 'Precios y promociones sujetas a cambios sin previo aviso',
    logoRight: 'assets/logo-hu.png',
    logoRightAlt: 'Hogares Unión'
};

// State
let genState = {
    propType: 'departamento',
    modelIdx: 0,
    selectedImg: null,  // { src, label }
    enhancement: 'calidad',
    format: 'square',   // 'square' | 'vertical'
    textAlign: 'bottom', // 'top' | 'center' | 'bottom'
    enhancedImageDataUrl: null // If AI ran, stores the result. Otherwise null.
};

// ── Init ──────────────────────────────────────────────────────────────
function initAdGenerator() {
    populateModelSelect();
    populateImagePicker();
    prefillCopy();
}

function populateModelSelect() {
    const sel = document.getElementById('modelSelect');
    if (!sel) return;
    const data = AD_DATA[genState.propType];
    if (!data) return;
    sel.innerHTML = data.modelos.map((m, i) =>
        `<option value="${i}">${m.nombre}</option>`
    ).join('');
    genState.modelIdx = 0;
}

function onModelChange() {
    const sel = document.getElementById('modelSelect');
    genState.modelIdx = parseInt(sel.value, 10);
    genState.selectedImg = null;
    populateImagePicker();
    prefillCopy();
    resetPreview();
}

function populateImagePicker() {
    const picker = document.getElementById('imagePicker');
    if (!picker) return;
    const model = getCurrentModel();
    if (!model) return;

    picker.innerHTML = model.images.map((img, i) => {
        const src = `assets/modelos/${encodeURIComponent(model.folder)}/${encodeURIComponent(img.file)}`;
        return `
        <div>
            <img class="img-thumb${i === 0 ? ' selected' : ''}"
                 src="${src}" alt="${img.label}"
                 onclick="selectImage(this, '${src}', '${img.label.replace(/'/g, "\\'")}')">
            <div class="img-thumb-label">${img.label}</div>
        </div>`;
    }).join('');

    // Auto-select first
    if (model.images.length > 0) {
        const first = model.images[0];
        genState.selectedImg = {
            src: `assets/modelos/${encodeURIComponent(model.folder)}/${encodeURIComponent(first.file)}`,
            label: first.label
        };
    }
}

function prefillCopy() {
    const model = getCurrentModel();
    if (!model) return;
    const titulo = document.getElementById('adTitulo');
    const precio = document.getElementById('adPrecio');
    if (titulo && !titulo.value) titulo.value = `Tu nuevo hogar en ${model.nombre}`;
    if (precio) precio.value = model.precio;
}

function getCurrentModel() {
    const data = AD_DATA[genState.propType];
    return data ? data.modelos[genState.modelIdx] : null;
}

// ── Button selectors ──────────────────────────────────────────────────
function selectPropType(btn) {
    document.querySelectorAll('#propTypeBtns .format-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    genState.propType = btn.dataset.prop;
    genState.modelIdx = 0;
    genState.selectedImg = null;
    populateModelSelect();
    populateImagePicker();
    prefillCopy();
    resetPreview();
}

function selectFormat(btn) {
    document.querySelectorAll('#formatBtns .format-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    genState.format = btn.dataset.fmt;
    updateLivePreview();
}

function selectAlign(btn) {
    document.querySelectorAll('#alignBtns .format-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    genState.textAlign = btn.dataset.val;
    updateLivePreview();
}

function updateOpacityLabel() {
    const val = document.getElementById('adOpacity').value;
    const label = document.getElementById('opacityVal');
    if (label) label.textContent = `${val}%`;
    updateLivePreview();
}

function updateLogoScaleLabel(side) {
    const val = document.getElementById(`logo${side}Scale`).value;
    const label = document.getElementById(`logo${side}SclVal`);
    if (label) label.textContent = `${val}%`;
    updateLivePreview();
}

function selectEnh(btn) {
    document.querySelectorAll('#enhBtns .enh-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    genState.enhancement = btn.dataset.enh;
}

function selectImage(el, src, label) {
    document.querySelectorAll('.img-thumb').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    genState.selectedImg = { src, label };

    // Reset AI enhancement when picking a new base image
    genState.enhancedImageDataUrl = null;
    updateLivePreview();
}

function resetPreview() {
    genState.enhancedImageDataUrl = null;
    updateLivePreview();
}

// ── Generate & Preview ────────────────────────────────────────────────

async function updateLivePreview() {
    if (!genState.selectedImg) return;

    const dlBtn = document.getElementById('btnDownload');
    if (dlBtn) dlBtn.classList.add('visible');

    // Use AI image if we have one for this base image, otherwise use the original base image
    const sourceUrl = genState.enhancedImageDataUrl || genState.selectedImg.src;

    // Draw instantly without waiting for AI
    await compositeAd(sourceUrl);
}

async function generateAdAI() {
    if (!genState.selectedImg) {
        alert('Selecciona una imagen del desarrollo primero.');
        return;
    }

    let apiKey = sessionStorage.getItem('hdb_gemini_key');
    if (!apiKey) {
        apiKey = prompt('Ingresa tu Gemini API Key para generar imágenes:');
        if (!apiKey) return;
        sessionStorage.setItem('hdb_gemini_key', apiKey.trim());
    }

    setSpinner(true, 'Mejorando imagen con IA (Gemini 2.0)...');
    const btn = document.getElementById('btnGenerateAI');
    if (btn) btn.disabled = true;

    try {
        const base64 = await imageUrlToBase64(genState.selectedImg.src);
        const mimeType = getMimeFromSrc(genState.selectedImg.src);

        setSpinner(true, 'Procesando la imagen, esto puede tardar unos segundos...');
        const enhancedBase64 = await enhanceWithGemini(base64, mimeType, genState.enhancement, apiKey);

        genState.enhancedImageDataUrl = `data:image/jpeg;base64,${enhancedBase64}`;

        await updateLivePreview();
    } catch (err) {
        console.error('❌ Generator error:', err);
        if (err.message.includes('API_KEY_INVALID')) {
            alert('⚠️ Token de Gemini inválido. Recarga la página y vuelve a ingresarlo a través del botón IA.');
            sessionStorage.removeItem('hdb_gemini_key');
        } else {
            alert(`⚠️ Error de IA: ${err.message}. El renderizado usando la foto original seguirá disponible.`);
        }
        await updateLivePreview();
    } finally {
        setSpinner(false);
        if (btn) btn.disabled = false;
    }
}

function setSpinner(on, msg = '') {
    const spinner = document.getElementById('genSpinner');
    const msgEl = document.getElementById('spinnerMsg');
    if (spinner) spinner.classList.toggle('active', on);
    if (msgEl && msg) msgEl.textContent = msg;
}

// ── Gemini Image Enhancement ──────────────────────────────────────────
async function enhanceWithGemini(base64, mimeType, enhancement, apiKey) {
    const enhMap = {
        calidad: 'Mejora la calidad fotográfica de esta imagen: corrige la iluminación y exposición, mejora el contraste, ajusta los colores para que sean más vibrantes pero realistas, mejora las sombras y la saturación. NO cambies la arquitectura, NO alteres la estructura del espacio, NO inventes elementos que no existen. El resultado debe verse como una edición profesional de Photoshop de la misma foto.',
        personas: 'Mejora la calidad fotográfica de esta imagen (iluminación, colores, contraste, saturación). Adicionalmente, agrega 1-2 personas en el espacio mostrando una familia mexicana de clase media usando el espacio de forma natural (sentados, cocinando, etc.). Las personas deben ser fotorrealistas. NO cambies la arquitectura ni la estructura del espacio.',
        mobiliario: 'Mejora la calidad fotográfica de esta imagen (iluminación, colores, contraste, saturación). Si el espacio tiene mobiliario escaso o ausente, agrega muebles modernos y acogedores apropiados para el espacio (sala, comedores, camas, etc.), manteniendo un estilo moderno y accesible. NO cambies la arquitectura ni la estructura.'
    };

    const prompt = enhMap[enhancement] || enhMap.calidad;

    const body = {
        contents: [{
            parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64 } }
            ]
        }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    };

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error?.message || `HTTP ${res.status}`);

    // Find image part
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inline_data?.mime_type?.startsWith('image/'));
    if (!imgPart) throw new Error('Gemini no devolvió imagen');

    return imgPart.inline_data.data;
}

// ── Canvas Compositing ────────────────────────────────────────────────
let fabricCanvas = null;

async function compositeAd(imageDataUrl) {
    const canvasEl = document.getElementById('adCanvas');
    const placeholder = document.getElementById('canvasPlaceholder');
    const isVertical = genState.format === 'vertical';
    const W = 1080;
    const H = isVertical ? 1920 : 1080;

    // Show canvas container early
    canvasEl.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';

    // 1. Initialize or Resize Fabric Canvas
    if (!fabricCanvas) {
        fabricCanvas = new fabric.Canvas('adCanvas', { width: W, height: H, preserveObjectStacking: true });
        fabricCanvas.hdbBgImageSrc = null;

        // Custom interactive handles style
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#22c55e';
        fabric.Object.prototype.cornerStyle = 'circle';
    }

    if (fabricCanvas.width !== W || fabricCanvas.height !== H) {
        fabricCanvas.setWidth(W);
        fabricCanvas.setHeight(H);
        fabricCanvas.clear(); // format change restarts template
        fabricCanvas.hdbBgImageSrc = null;
    }

    // Personalization controls
    const primaryColor = document.getElementById('adColor')?.value || '#22c55e';
    const opacityVal = parseInt(document.getElementById('adOpacity')?.value || 70);
    const darkAlpha = opacityVal / 100;
    const txtYPercent = 1; // Used as base anchor multiplier

    // 2. Background Image
    const imgSourceChanged = fabricCanvas.hdbBgImageSrc !== imageDataUrl;
    if (imgSourceChanged) {
        fabricCanvas.hdbBgImageSrc = imageDataUrl;
        let bgImg;
        if (imageDataUrl.startsWith('data:')) {
            bgImg = await loadFabricImageFallback(imageDataUrl);
        } else {
            bgImg = await tryLoadFabricImage(imageDataUrl);
        }

        if (bgImg) {
            const scale = Math.max(W / bgImg.width, H / bgImg.height);
            bgImg.set({
                originX: 'center', originY: 'center',
                left: W / 2, top: H / 2,
                scaleX: scale, scaleY: scale,
                selectable: false, evented: false
            });
            fabricCanvas.setBackgroundImage(bgImg, fabricCanvas.renderAll.bind(fabricCanvas));
        }
    }

    const getById = (id) => fabricCanvas.getObjects().find(o => o.id === id);

    // 3. Dark gradient overlay
    let shadowRect = getById('shadowOverlay');
    if (!shadowRect) {
        shadowRect = new fabric.Rect({
            id: 'shadowOverlay', left: 0, top: 0, width: W, height: H,
            evented: false, selectable: false
        });
        fabricCanvas.add(shadowRect);
        shadowRect.sendToBack(); // always behind texts
    }

    shadowRect.set({ width: W, height: H });
    const gradH = isVertical ? H * 0.5 : H * 0.45;
    const startY = (H - gradH) * txtYPercent;

    // Only apply gradient if alpha > 0
    if (darkAlpha > 0) {
        shadowRect.set('fill', new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: startY, x2: 0, y2: H },
            colorStops: [
                { offset: 0, color: 'rgba(0,0,0,0)' },
                { offset: 0.35, color: `rgba(0,0,0,${darkAlpha * 0.75})` },
                { offset: 1, color: `rgba(0,0,0,${darkAlpha})` }
            ]
        }));
    } else {
        shadowRect.set('fill', 'transparent');
    }

    // 4. Bar Top
    let topBar = getById('topBar');
    if (!topBar) {
        topBar = new fabric.Rect({
            id: 'topBar', left: 0, top: 0, width: W, height: 100, fill: 'rgba(0,0,0,0.4)',
            selectable: true, // You can delete or move it if you want!
        });
        fabricCanvas.add(topBar);
    } else {
        topBar.set({ width: W });
    }

    // 5. Logos
    let logoL = getById('logoLeft');
    let logoR = getById('logoRight');

    if (!logoL && !logoR) {
        const propData = AD_DATA[genState.propType];

        tryLoadFabricImage(propData.logoLeft).then(lImage => {
            if (lImage) {
                lImage.set({ id: 'logoLeft', left: 28, top: 18 });
                lImage.scaleToHeight(60);
                fabricCanvas.add(lImage);
                fabricCanvas.renderAll();
            }
        });

        tryLoadFabricImage(AD_CONFIG.logoRight).then(rImage => {
            if (rImage) {
                rImage.set({ id: 'logoRight', left: W - 220, top: 18 }); // Placeholder
                rImage.scaleToHeight(60);
                rImage.set({ left: W - rImage.getScaledWidth() - 28 }); // Real adjust
                fabricCanvas.add(rImage);
                fabricCanvas.renderAll();
            }
        });
    }

    // 6. Text Elements
    const titulo = document.getElementById('adTitulo')?.value.trim() || '';
    const subtitle = document.getElementById('adSubtitle')?.value.trim() || '';
    const precio = document.getElementById('adPrecio')?.value.trim() || getCurrentModel()?.precio || '';
    const cta = document.getElementById('adCta')?.value.trim() || '¡Aparta hoy!';

    const textStartY = H - (isVertical ? 440 : 360);
    const textX = 52;
    const fontFam = 'Inter, Arial, sans-serif';

    function updateTextItem(id, text, options) {
        if (!text) {
            let existing = getById(id);
            if (existing) fabricCanvas.remove(existing);
            return null;
        }

        let obj = getById(id);
        if (obj) {
            obj.set({ text: text });
            if (options.fill) obj.set({ fill: options.fill });
            if (options.backgroundColor) obj.set({ backgroundColor: options.backgroundColor });
        } else {
            obj = new fabric.Textbox(text, {
                id: id,
                fontFamily: fontFam,
                left: options.left !== undefined ? options.left : textX,
                top: options.top,
                fill: options.fill || '#fff',
                fontSize: options.fontSize || 32,
                fontWeight: options.fontWeight || 'normal',
                width: options.width || (W - textX * 2), // wrapping
                ...options.extras
            });
            fabricCanvas.add(obj);
        }
        return obj;
    }

    // Pricing
    let precioObj = updateTextItem('txtPrecio', precio, {
        top: textStartY - 36,
        fontSize: isVertical ? 32 : 28,
        fontWeight: 'bold',
        fill: '#fff',
        backgroundColor: primaryColor,
        width: 350,
        extras: { padding: 12, textAlign: 'center' }
    });
    if (precioObj && precioObj.backgroundColor) precioObj.set('backgroundColor', primaryColor);

    // Titular
    updateTextItem('txtTitulo', titulo, {
        top: textStartY + 40,
        fontSize: isVertical ? 68 : 58,
        fontWeight: 'bold',
        fill: '#ffffff'
    });

    // Subtitle
    updateTextItem('txtSubtitle', subtitle, {
        top: textStartY + 140,
        fontSize: isVertical ? 38 : 32,
        fill: 'rgba(255,255,255,0.85)'
    });

    // Phone
    updateTextItem('txtPhone', `📞 ${AD_CONFIG.telefono}`, {
        top: textStartY + 210,
        fontSize: isVertical ? 32 : 27,
        fill: 'rgba(255,255,255,0.7)',
        width: 300
    });

    // CTA Button
    let ctaObj = updateTextItem('txtCta', cta, {
        top: textStartY + 280,
        fontSize: isVertical ? 36 : 30,
        fontWeight: 'bold',
        fill: '#fff',
        backgroundColor: primaryColor,
        width: 250,
        extras: { padding: 12, textAlign: 'center' }
    });
    if (ctaObj && ctaObj.backgroundColor) ctaObj.set('backgroundColor', primaryColor);

    // Legal Disclaimers
    let legalTxt = `${AD_CONFIG.disclaimer1}\n${AD_CONFIG.disclaimer2}`;
    updateTextItem('txtLegal', legalTxt, {
        top: H - (isVertical ? 80 : 70),
        fontSize: isVertical ? 24 : 20,
        fill: 'rgba(255,255,255,0.55)',
        width: W - 100
    });

    fabricCanvas.renderAll();
}

// ── Download ──────────────────────────────────────────────────────────
function downloadAd() {
    if (!fabricCanvas) return;
    const model = getCurrentModel();
    const fmt = genState.format === 'vertical' ? '9x16' : '1x1';
    const name = `anuncio-${(model?.nombre || 'hdb').replace(/\s+/g, '-').toLowerCase()}-${fmt}-${new Date().toISOString().split('T')[0]}.png`;

    // Clear selection so handles aren't visible in the output image
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();

    const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
    });

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = name;
    a.click();
}

// ── Fabric Image Helpers ──────────────────────────────────────────────
function tryLoadFabricImage(url) {
    return new Promise((resolve) => {
        fabric.Image.fromURL(url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now(), function (img) {
            resolve(img || null);
        }, { crossOrigin: 'anonymous' });
    });
}
function loadFabricImageFallback(base64Str) {
    return new Promise((resolve) => {
        fabric.Image.fromURL(base64Str, function (img) {
            resolve(img || null);
        });
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function tryLoadImage(src) {
    return loadImage(src).catch(() => null);
}

function imageUrlToBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            const dataUrl = c.toDataURL('image/jpeg', 0.92);
            resolve(dataUrl.split(',')[1]);
        };
        img.onerror = reject;
        img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    });
}

function getMimeFromSrc(src) {
    const ext = src.split('.').pop().toLowerCase().split('?')[0];
    return { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext] || 'image/jpeg';
}

// ── Hook into existing switchSection ─────────────────────────────────
const _originalSwitch = switchSection;
switchSection = function (type) {
    _originalSwitch(type);
    document.getElementById('section-generador')?.classList.toggle('hidden', type !== 'generador');
    if (type === 'generador') initAdGenerator();
    // Hide week selector when on generator tab
    const weekWrap = document.getElementById('weekSelect')?.parentElement;
    if (weekWrap) weekWrap.style.visibility = type === 'generador' ? 'hidden' : 'visible';
};
