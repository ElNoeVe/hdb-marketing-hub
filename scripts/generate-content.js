/**
 * generate-content.js
 * Script ejecutado por GitHub Actions cada Lunes a las 7AM CST
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
    console.log('✍️  Generando contenido creativo semanal...');

    if (!GEMINI_API_KEY) {
        console.error('❌ Falta GEMINI_API_KEY en las variables de entorno.');
        process.exit(1);
    }

    try {
        const referenceImages = getReferenceImages();
        const content = await generateCampaignContent(referenceImages);

        console.log('🎨 Generando imágenes con IA...');
        await generateImagesForCampaign(content);

        await saveContent(content);
        console.log('✅ Creativos y assets generados exitosamente');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

function getReferenceImages() {
    // Correct path relative to project root
    const dir = path.join(PROJECT_ROOT, 'assets', 'modelos', 'REFERENCIAS');
    console.log(`📂 Buscando referencias en: ${dir}`);

    if (!fs.existsSync(dir)) {
        console.warn(`⚠️ No se encontró la carpeta de referencias: ${dir}`);
        return [];
    }

    const files = fs.readdirSync(dir).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    const images = [];

    for (const file of files) {
        const filePath = path.join(dir, file);
        const data = fs.readFileSync(filePath);
        images.push({
            inlineData: {
                data: data.toString('base64'),
                mimeType: getMimeType(file)
            }
        });
    }
    console.log(`📸 Se cargaron ${images.length} imágenes de referencia.`);
    return images;
}

function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    return 'image/jpeg';
}

async function generateCampaignContent(referenceImages) {
    const promptText = `
Eres un estratega experto en marketing inmobiliario digital en México.
Tu objetivo es generar una campaña semanal para "Haciendas del Bosque" (Tecámac, Edo. Méx) basada en 3 enfoques específicos.

CONTEXTO DEL PROYECTO:
- Departamentos desde $850,000 | Casas desde $980,000 | Casas Plus desde $1,150,000
- Estilo visual esperado: Moderno, familiar, cálido, pero accesible.
- Usa las imágenes adjuntas como REFERENCIA ESTRICTA para el estilo visual de las nuevas imágenes que vamos a generar.

ESTRUCTURA DE LA CAMPAÑA (Salida JSON):

1.  **ANUNCIO TÉCNICO (Segmento: Solteros/Parejas 25-40 años):**
    -   Enfoque: Características, amenidades, precio.
    -   Tono: Racional, directo, "Smart Choice".
    -   Imagen: Render fotorrealista de un espacio optimizado (ej. sala-comedor).

2.  **ANUNCIO SENTIMENTAL (Segmento: Familias 25-55 años):**
    -   Enfoque: Puntos de dolor (espacio, privacidad, seguridad para hijos).
    -   Tono: Emotivo, protector, aspiracional.
    -   Imagen: Escena familiar cálida en el desarrollo (ej. jugando en áreas verdes o cenando).

3.  **ANUNCIO EDUCATIVO/VIRAL (Atracción Masiva - Carrusel):**
    -   Objetivo: 50+ leads/semana. Confianza en procesos (Infonavit, escrituración rápida).
    -   Tono: Servicial, experto, "te llevamos de la mano".
    -   Formato: 3 imágenes secuenciales para carrusel.

4.  **VIDEO STORYTELLING (15-20s):**
    -   Narrativa: Historia de éxito "Dejar de rentar e Invertir".
    -   No generes el video, solo el GUION y el PROMPT para generarlo.

FORMATO JSON ESPERADO:
{
  "semana": "YYYY-MM-DD",
  "anuncio_tecnico": {
    "titulo": "...",
    "copy": "...",
    "hashtags": ["..."],
    "prompt_imagen": "Prompt detallado para Imagen 3..."
  },
  "anuncio_sentimental": {
    "titulo": "...",
    "copy": "...",
    "hashtags": ["..."],
    "prompt_imagen": "..."
  },
  "anuncio_educativo": {
    "titulo": "...",
    "copy_post": "...",
    "slides": [
      { "titulo": "Slide 1", "texto": "...", "prompt_imagen": "..." },
      { "titulo": "Slide 2", "texto": "...", "prompt_imagen": "..." },
      { "titulo": "Slide 3", "texto": "...", "prompt_imagen": "..." }
    ],
    "hashtags": ["..."]
  },
  "anuncio_video": {
    "titulo": "...",
    "copy": "...",
    "guion_tecnico": "...",
    "prompt_video_ia": "..."
  }
}
`;

    // Combine text prompt with images
    const parts = [{ text: promptText }, ...referenceImages];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
                temperature: 0.7,
                response_mime_type: "application/json"
            }
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const jsonString = data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonString);
}

async function generateImagesForCampaign(content) {
    const today = new Date().toISOString().split('T')[0];
    // Define output directory relative to project root
    const outputDir = path.join(PROJECT_ROOT, 'assets', 'generated', today);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process prompts
    const tasks = [];

    // Técnico
    if (content.anuncio_tecnico?.prompt_imagen) {
        tasks.push(generateImage(content.anuncio_tecnico.prompt_imagen, path.join(outputDir, 'tecnico.png')));
    }
    // Sentimental
    if (content.anuncio_sentimental?.prompt_imagen) {
        tasks.push(generateImage(content.anuncio_sentimental.prompt_imagen, path.join(outputDir, 'sentimental.png')));
    }
    // Educativo (Slides)
    if (content.anuncio_educativo?.slides) {
        content.anuncio_educativo.slides.forEach((slide, i) => {
            if (slide.prompt_imagen) {
                tasks.push(generateImage(slide.prompt_imagen, path.join(outputDir, `educativo_slide_${i + 1}.png`)));
            }
        });
    }

    await Promise.all(tasks);
}

async function generateImage(prompt, outputPath) {
    console.log(`🎨 Generando: ${path.basename(outputPath)}...`);

    // Using Imagen 3 endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`;

    const payload = {
        instances: [{ prompt }],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1" // Cuadrado para feed
        }
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            console.error(`⚠️ Error generando imagen (${path.basename(outputPath)}): ${err.error?.message || res.statusText}`);
            return;
        }

        const data = await res.json();
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

        if (base64Image) {
            fs.writeFileSync(outputPath, base64Image, 'base64');
            console.log(`✅ Imagen guardada: ${outputPath}`);
        } else {
            console.warn(`⚠️ No se recibió imagen para: ${path.basename(outputPath)}`);
        }

    } catch (e) {
        console.error(`❌ Excepción al generar imagen: ${e.message}`);
    }
}

async function saveContent(content) {
    const date = new Date().toISOString().split('T')[0];
    const dir = path.join(PROJECT_ROOT, 'data', 'creativos');

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, `creativos-${date}.json`);
    fs.writeFileSync(filepath, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`📁 JSON guardado en: ${filepath}`);

    // Update data/data.js for local viewing (fallback)
    try {
        const dataJsPath = path.join(PROJECT_ROOT, 'data', 'data.js');
        if (fs.existsSync(dataJsPath)) {
            const appendContent = `\n\n// Auto-generated update ${new Date().toISOString()}\nif(window.StartData) window.StartData.creativos = ${JSON.stringify(content, null, 4)};\n`;
            fs.appendFileSync(dataJsPath, appendContent);
            console.log(`✅ data/data.js actualizado para visualización local.`);
        }
    } catch (e) {
        console.warn('Could not update data.js', e);
    }
}

main();
