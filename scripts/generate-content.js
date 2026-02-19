/**
 * generate-content.js
 * Script ejecutado por GitHub Actions cada Lunes a las 7AM CST
 * 
 * Genera con Gemini AI:
 * - 3 anuncios de imagen (copy, hashtags, prompt)
 * - 2 anuncios de video (copy, guión, prompt, hashtags)
 * - Segmentación recomendada
 */

import fs from 'fs';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function main() {
    console.log('✍️ Generando contenido creativo semanal...');

    if (!GEMINI_API_KEY) {
        console.error('❌ Falta GEMINI_API_KEY en GitHub Secrets.');
        process.exit(1);
    }

    try {
        const content = await generateWithGemini();
        await saveContent(content);
        console.log('✅ Creativos generados y guardados exitosamente');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function generateWithGemini() {
    const prompt = `Eres un copywriter experto en marketing inmobiliario digital en México. Genera contenido creativo semanal para "Haciendas del Bosque", un desarrollo de vivienda de interés social-medio de Hogares Unión ubicado en Tecámac, Estado de México.

DATOS DEL DESARROLLO:
- Departamentos desde $850,000 MXN
- Casas desde $980,000 MXN  
- Casas Plus desde $1,150,000 MXN
- Amenidades: alberca, áreas verdes, juegos infantiles, acceso controlado, área deportiva
- Cercanías: Hospital IMSS 200 (15 min), Hospital Polanco Tecámac (8 min), CECyTEM (10 min), Universidad Politécnica Tecámac (7 min), Tecámac Power Center (10 min), AIFA (20 min), Mexibús (5 min)
- Accesos: Carretera México-Pachuca, Circuito Exterior Mexiquense
- Contacto: 📲 5537494034 | ✉️ n.gutierrez.hernandez@hogaresunion.mx
- Créditos aceptados: INFONAVIT, FOVISSSTE, Bancario, Cofinanciamiento

PÚBLICO OBJETIVO:
- Edad: 25-55 años
- Familias de 2-6 integrantes, hijos 0-18 años
- Ingresos bajos a medios
- Municipios: Tecámac, Zumpango, Tizayuca, Pachuca, Tonanitla, Nextlalpan, Jaltenco
- Intereses: inversión inmobiliaria, primera vivienda, crédito INFONAVIT

DATO DE PLUSVALÍA: Las propiedades en Tecámac han mantenido un crecimiento de 5-7% anual según el Índice SHF.

GENERA EN FORMATO JSON (sin markdown):
{
  "semana": "Fecha de la semana",
  "campana_imagenes": [
    {
      "titulo": "Nombre del anuncio",
      "copy": "Texto del copy con emojis, máximo 300 caracteres en la primera línea visible",
      "hashtags": "10 hashtags relevantes separados por espacio",
      "prompt_imagen": "Prompt detallado para generar imagen fotorrealista con DALL-E/ChatGPT. Debe describir la escena, colores, ángulo, iluminación. NO incluir texto en la imagen."
    }
  ],
  "campana_videos": [
    {
      "titulo": "Nombre del video",
      "copy": "Copy para el anuncio de video",
      "guion": "Guión detallado por escenas con timestamps [0-5s], [5-10s] etc. Máximo 20 segundos.",
      "prompt_video": "Prompt para generar clip con IA (Grok/Sora). Describir cada escena visual sin texto.",
      "hashtags": "10 hashtags relevantes"
    }
  ]
}

REGLAS:
- Genera 3 anuncios de imagen con enfoques DIFERENTES (emocional, inversión, ubicación)
- Genera 2 videos con enfoques DIFERENTES (tour, testimonial/estilo de vida)
- Los copys deben ser persuasivos, usar emojis y incluir llamado a la acción
- Los prompts de imagen deben ser ultra-detallados y fotorrealistas
- Los guiones de video deben ser exactamente 20 segundos
- Varía el tono: urgencia, emoción, datos, aspiracional
- SIEMPRE incluir precio y contacto en los copys`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 4096
            }
        })
    });

    const data = await res.json();

    if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
        throw new Error('Gemini no devolvió JSON válido');
    }

    return JSON.parse(jsonMatch[0]);
}

async function saveContent(content) {
    const date = new Date().toISOString().split('T')[0];
    const dir = path.join('..', 'data', 'creativos');

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, `creativos-${date}.json`);
    fs.writeFileSync(filepath, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`📁 Guardado en: ${filepath}`);
}

main();
