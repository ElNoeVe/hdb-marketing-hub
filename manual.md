# manual.md — Configuración Final

Todo el código está listo. Para dejar ambas apps publicadas y conectadas en GitHub solo necesitas hacer **dos cosas**:

---

## 1. Agregar los Secrets de Supabase en GitHub

El sistema de analítica ya inyecta las llaves automáticamente durante la publicación, así que **no tienes que escribirlas en el código**.

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** y agrega estos dos:

| Nombre del Secret | Dónde encontrarlo |
|---|---|
| `SUPABASE_URL` | En Supabase → Project Settings → API → "Project URL" |
| `SUPABASE_KEY` | En Supabase → Project Settings → API → "anon / public" |

---

## 2. Activar GitHub Pages (Solo se hace una vez)

1. Ve a tu repositorio → **Settings** → **Pages** (menú lateral).
2. En **Build and deployment**, selecciona **"GitHub Actions"** como fuente.
3. Guarda.

---

## 3. Publicar por primera vez

Una vez activado Pages, haz un `git push` a tu rama `main` (o ejecuta el workflow manualmente desde la pestaña **Actions**). En unos 2 minutos, tus apps estarán disponibles en:

- **App Principal:** `https://TU-USUARIO.github.io/haciendas-hub/`
- **App Lite:** `https://TU-USUARIO.github.io/haciendas-hub/lite/`

---

## Qué pasa automáticamente a partir de ahora

| Evento | Resultado |
|---|---|
| `git push` a `main` | Ambas apps se republicán |
| Cada 12 horas (L/Mi/V) | Dashboard de anuncios se actualiza con datos de Facebook |
| Un usuario hace clic en WhatsApp | Analytics lo registra en Supabase |
| Tú abres tu App Principal | El widget de estadísticas muestra el conteo actualizado |


¡Todo está listo! He creado la versión **Lite** en la carpeta `/lite` y he conectado ambas aplicaciones con el sistema de analítica. 

Para que los datos comiencen a fluir a tu Dashboard en tiempo real, solo necesitas completar estos **3 pasos**:

---

## 1. Crear tu Base de Datos (Gratis)
1. Ve a [Supabase.com](https://supabase.com/) y crea un proyecto gratuito.
2. En la sección **Table Editor**, crea una tabla llamada `events` con estas columnas:
   - `id`: int8 (Primary Key, Autoincrement)
   - `created_at`: timestamptz (Default: now())
   - `event`: text (Nombre del evento: whatsapp_click, etc.)
   - `app_version`: text (Para saber si viene de la Principal o Lite)
   - `metadata`: jsonb (Para info extra como sección y tiempo)
3. Crea otra tabla llamada `stats_summary` con:
   - `id`: int8 (PK)
   - `total_visits`: int8
   - `wa_clicks`: int8
   - `top_section`: text

## 2. Configurar tus llaves en la App
Busca el archivo `js/analytics.js` y, aunque ya está configurado para leer llaves, te recomiendo agregar este pequeño bloque al principio de tus archivos `index.html` (tanto el principal como el de `/lite`) dentro del `<head>`:

```html
<script>
  window.ANALYTICS_CONFIG = {
    supabaseUrl: 'TU_URL_DE_SUPABASE',
    supabaseKey: 'TU_API_KEY_ANON_DE_SUPABASE'
  };
</script>
```

## 3. Publicar en GitHub
Como la versión Lite está dentro de una subcarpeta, GitHub Pages la publicará automáticamente:
*   **App Principal:** `https://tu-usuario.github.io/haciendas-hub/`
*   **App Lite:** `https://tu-usuario.github.io/haciendas-hub/lite/`

---

### ¿Cómo probarlo?
1. Entra a la versión Lite.
2. Haz clic en el botón de WhatsApp.
3. Entra a tu App Principal al final de la página.
4. Verás que el contador de "WhatsApp Clicks" ha subido automáticamente.

**¡Tu ecosistema está conectado y midiendo todo en tiempo real!**
