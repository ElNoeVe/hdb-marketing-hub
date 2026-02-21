// ===================================
// admin.js — Panel de Administración Privado
// ===================================

const AdminPanel = {
    PASS_KEY: 'hdb_admin_auth',
    sb: null,

    init() {
        const cfg = window.ANALYTICS_CONFIG;
        if (!cfg?.supabaseUrl) return;
        this.sb = { url: cfg.supabaseUrl, key: cfg.supabaseKey };

        this.checkAuth();
    },

    checkAuth() {
        const panel = document.getElementById('admin-panel');
        const loginBox = document.getElementById('admin-login');
        if (!panel || !loginBox) return;

        const isAuth = sessionStorage.getItem(this.PASS_KEY) === 'ok';
        if (isAuth) {
            loginBox.style.display = 'none';
            panel.style.display = 'block';
            this.loadPanel();
        } else {
            loginBox.style.display = 'block';
            panel.style.display = 'none';
        }
    },

    login() {
        const input = document.getElementById('admin-pass-input');
        const adminPassword = window.ADMIN_PASSWORD || 'hdb2025admin';
        if (input.value === adminPassword) {
            sessionStorage.setItem(this.PASS_KEY, 'ok');
            this.checkAuth();
        } else {
            document.getElementById('admin-pass-error').style.display = 'block';
            input.value = '';
            setTimeout(() => {
                document.getElementById('admin-pass-error').style.display = 'none';
            }, 3000);
        }
    },

    logout() {
        sessionStorage.removeItem(this.PASS_KEY);
        this.checkAuth();
    },

    async loadPanel() {
        try {
            const res = await fetch(`${this.sb.url}/rest/v1/disponibilidad?select=*&order=nombre_modelo.asc`, {
                headers: { apikey: this.sb.key, Authorization: `Bearer ${this.sb.key}` }
            });
            const data = await res.json();
            this.renderDisponibilidadEditor(data);
        } catch (e) {
            console.error('Admin: Error cargando disponibilidad:', e);
            document.getElementById('admin-content').innerHTML = '<p style="color:var(--red-primary);">Error al conectar con Supabase. Verifica tu configuración.</p>';
        }
    },

    renderDisponibilidadEditor(items) {
        const container = document.getElementById('admin-content');
        if (!container) return;

        if (!items.length) {
            container.innerHTML = `
        <p style="color:var(--text-secondary);margin-bottom:1rem;">No hay modelos registrados. Aggrega los datos iniciales en Supabase con el SQL del manual.</p>
        <button class="btn btn-primary" onclick="AdminPanel.insertDefaults()">⚡ Insertar modelos por defecto</button>`;
            return;
        }

        const rows = items.map(item => `
      <div class="admin-model-row" data-id="${item.id}">
        <div style="flex:1;">
          <strong>${item.nombre_modelo}</strong>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${item.modelo_id}</div>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <label style="font-size:0.8rem;color:var(--text-secondary);">Unidades:</label>
          <input
            type="number"
            id="disp-${item.id}"
            value="${item.unidades_disponibles}"
            min="0"
            max="999"
            style="width:70px;padding:0.4rem 0.5rem;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);text-align:center;font-size:1rem;"
          >
          <button class="btn btn-primary" style="padding: 0.4rem 1rem;font-size:0.85rem;" onclick="AdminPanel.saveItem('${item.id}', '${item.modelo_id}', '${item.nombre_modelo}')">
            💾 Guardar
          </button>
        </div>
        <div id="saved-${item.id}" style="color:var(--green);font-size:0.8rem;display:none;min-width:60px;">✅ Guardado</div>
      </div>`).join('');

        container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.75rem;">${rows}</div>
      <div style="margin-top:1.5rem;padding:0.75rem;background:rgba(59,130,246,0.1);border-radius:8px;font-size:0.8rem;color:var(--text-secondary);">
        💡 Los cambios se reflejan en tiempo real en la App Lite (sin necesidad de publicar a GitHub).
      </div>`;
    },

    async saveItem(id, modeloId, nombreModelo) {
        const input = document.getElementById(`disp-${id}`);
        const unidades = parseInt(input.value);
        const savedEl = document.getElementById(`saved-${id}`);

        if (isNaN(unidades) || unidades < 0) { input.style.borderColor = 'var(--red-primary)'; return; }
        input.style.borderColor = '';

        try {
            const res = await fetch(`${this.sb.url}/rest/v1/disponibilidad?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    apikey: this.sb.key,
                    Authorization: `Bearer ${this.sb.key}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify({ unidades_disponibles: unidades, updated_at: new Date().toISOString() })
            });

            if (res.ok || res.status === 204) {
                savedEl.style.display = 'inline';
                setTimeout(() => { savedEl.style.display = 'none'; }, 2500);
            }
        } catch (e) {
            console.error('Error guardando:', e);
        }
    },

    // Inserta los 5 modelos por defecto si la tabla está vacía
    async insertDefaults() {
        const defaults = [
            { modelo_id: 'depa-pino-plus', nombre_modelo: 'Depa Pino Plus', unidades_disponibles: 0 },
            { modelo_id: 'depa-pino-premium-2r', nombre_modelo: 'Depa Pino Premium 2R', unidades_disponibles: 5 },
            { modelo_id: 'depa-pino-premium-3r', nombre_modelo: 'Depa Pino Premium 3R', unidades_disponibles: 3 },
            { modelo_id: 'casa-esmeralda', nombre_modelo: 'Casa Esmeralda', unidades_disponibles: 8 },
            { modelo_id: 'casa-citrino', nombre_modelo: 'Casa Citrino', unidades_disponibles: 0 },
        ];

        try {
            await fetch(`${this.sb.url}/rest/v1/disponibilidad`, {
                method: 'POST',
                headers: {
                    apikey: this.sb.key,
                    Authorization: `Bearer ${this.sb.key}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify(defaults)
            });
            this.loadPanel();
        } catch (e) {
            console.error('Error insertando defaults:', e);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => AdminPanel.init());
