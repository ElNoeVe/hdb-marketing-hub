# 📋 Manual de Configuración — Nuevas Funcionalidades HDB

> Completa estos pasos **antes** de pedirme que suba los cambios a GitHub.  
> No necesitas editar ningún archivo de código — solo sigue los pasos.

---

## Paso 1 — Crear tablas en Supabase

Ve a **[supabase.com](https://supabase.com)** → Tu proyecto → **SQL Editor** → Pega y ejecuta:

### Tabla `leads` (Pre-registros de la App Lite)

```sql
CREATE TABLE IF NOT EXISTS public.leads (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre         text NOT NULL,
  telefono       text NOT NULL,
  correo         text NOT NULL,
  modelo_interes text,
  monto_apartado numeric(12,2),
  fuente         text DEFAULT 'Lite',
  created_at     timestamptz DEFAULT now()
);

-- Política de acceso: cualquiera puede insertar (formulario público)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_leads" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "select_leads" ON public.leads
  FOR SELECT USING (true);
```

### Tabla `disponibilidad` (Contador de unidades, editable desde el Admin)

```sql
CREATE TABLE IF NOT EXISTS public.disponibilidad (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  modelo_id            text UNIQUE NOT NULL,
  nombre_modelo        text NOT NULL,
  unidades_disponibles integer DEFAULT 0,
  updated_at           timestamptz DEFAULT now()
);

-- Política de acceso total (solo tú accedes desde el panel admin)
ALTER TABLE public.disponibilidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_disponibilidad" ON public.disponibilidad
  FOR ALL USING (true) WITH CHECK (true);

-- Datos iniciales (puedes cambiar los números como quieras)
INSERT INTO public.disponibilidad (modelo_id, nombre_modelo, unidades_disponibles) VALUES
  ('depa-pino-plus',        'Depa Pino Plus',       0),
  ('depa-pino-premium-2r',  'Depa Pino Premium 2R', 5),
  ('depa-pino-premium-3r',  'Depa Pino Premium 3R', 3),
  ('casa-esmeralda',        'Casa Esmeralda',        8),
  ('casa-citrino',          'Casa Citrino',           0)
ON CONFLICT (modelo_id) DO NOTHING;
```

✅ **Listo cuando**: ambas tablas aparezcan en **Table Editor** de Supabase.

---

## Paso 2 — Obtener tu Meta Pixel ID

> Si aún no tienes un Pixel, créalo en Administrador de Anuncios de Facebook.

1. Ve a [business.facebook.com](https://business.facebook.com) → **Administrador de Anuncios**
2. Menú superior → **Todas las herramientas** → **Eventos** (o busca "Meta Pixel")
3. Selecciona tu Pixel → copia el número de **ID de Pixel** (son solo dígitos, ej: `1234567890123`)
4. Dímelo a mí (Antigravity) o edita tú mismo los 3 archivos siguientes y reemplaza `TU_PIXEL_ID_AQUI` con tu ID real:
   - `index.html`
   - `lite/calculadora.html`
   - `lite/galeria.html`

> Busca `TU_PIXEL_ID_AQUI` en cada archivo (aparece 2 veces por archivo).

✅ **Listo cuando**: el ID de Pixel sea un número real en los 3 archivos.

---

## Paso 3 — Definir tu contraseña del Panel de Admin

Solo edita una línea en `index.html`:

```javascript
// Línea ~7 de index.html — cambia el valor:
window.ADMIN_PASSWORD = 'TU_CONTRASEÑA_AQUI';
```

Cambia `TU_CONTRASEÑA_AQUI` por cualquier contraseña que recuerdes.  
**Ejemplo:** `window.ADMIN_PASSWORD = 'HDB2025Admin!';`

✅ **Listo cuando**: hayas cambiado el texto y guardado el archivo.

---

## Paso 4 — Verificar que Supabase ya está configurado

Tu proyecto ya tiene el `supabaseUrl` y `supabaseKey` correctos en `index.html`. No necesitas cambiar nada más para Supabase, solo crear las tablas del Paso 1.

---

## Paso 5 — Dime que está listo

Una vez que hayas completado los 3 pasos anteriores, dime:

> **"Ya completé la configuración, puedes subir los cambios a GitHub"**

Yo haré el `git push` y los cambios estarán en GitHub Pages en ~3 minutos.

---

## Resumen de lo que se agrega

### App Principal (`index.html`)
| Función | Cómo acceder |
|---|---|
| Panel de Leads | Scroll abajo en el Dashboard |
| Comparador semanal de clics | Sección "📈 Comparador Semanal" |
| Panel de Admin | Clic en "🔐 Admin" en el menú → ingresa contraseña |
| Meta Pixel | Automático — solo necesitas el ID del Paso 2 |

### App Lite
| Función | Dónde |
|---|---|
| Simulador de crédito (Infonavit/FOVISSSTE/Bancario) | `lite/calculadora.html` — sección inferior |
| ¿Por qué comprar aquí? | `lite/galeria.html` — tras la sección de Lugares Cercanos |
| Formulario de Pre-registro | `lite/galeria.html` — antes del footer |
| Contador de unidades disponibles | En cada tarjeta de modelo (requiere Supabase) |
| Meta Pixel | Automático |

### Cómo usar el Panel de Admin
1. Abre la App Principal en GitHub Pages
2. Clic en **🔐 Admin** (menú superior, extremo derecho)
3. Ingresa tu contraseña
4. Edita el número de unidades de cada modelo → clic **💾 Guardar**
5. Los cambios se reflejan en tiempo real en la App Lite **sin necesidad de publicar a GitHub**
