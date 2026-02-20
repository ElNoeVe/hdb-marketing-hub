
import process from 'process';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testImagen() {
    console.log('🧪 Probando capacidad de generación de imágenes...');

    if (!GEMINI_API_KEY) {
        console.error('❌ No se encontró GEMINI_API_KEY en las variables de entorno.');
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`;

    // Simple prompt for a red ball
    const payload = {
        instances: [
            { prompt: "A photorealistic red ball on a white background" }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
        }
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error?.message || res.statusText);
        }

        const data = await res.json();
        if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
            console.log('✅ ¡Éxito! Tu API Key soporta generación de imágenes (Imagen 3).');
        } else {
            console.log('⚠️ La respuesta fue exitosa pero no trajo imagen (formato inesperado).');
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ Resultado: Tu API Key NO parece soportar generación directa de imágenes o el modelo no está habilitado.');
        console.error('Detalle del error:', error.message);
        console.log('\n💡 Nota: Si es una API Key gratuita, a veces la generación de imágenes está restringida o requiere un proyecto con billing habilitado en Google Cloud.');
    }
}

testImagen();
