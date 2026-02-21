// ===================================
// preregistro.js — Formulario de Pre-registro y Apartado
// ===================================

const Preregistro = {
    sb: null,

    init() {
        const cfg = window.ANALYTICS_CONFIG;
        if (cfg?.supabaseUrl) {
            this.sb = { url: cfg.supabaseUrl, key: cfg.supabaseKey };
        }
        this.setupForm();
        this.loadDisponibilidad();
    },

    setupForm() {
        const form = document.getElementById('preregistro-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitLead();
        });
    },

    async submitLead() {
        const btn = document.getElementById('preregistro-btn');
        const nombre = document.getElementById('reg-nombre').value.trim();
        const telefono = document.getElementById('reg-telefono').value.trim();
        const correo = document.getElementById('reg-correo').value.trim();
        const modelo = document.getElementById('reg-modelo').value;
        const monto = parseFloat(document.getElementById('reg-monto').value) || 0;

        // Validaciones
        if (!nombre || !telefono || !correo) {
            this.showMessage('Por favor completa nombre, teléfono y correo.', 'error');
            return;
        }
        if (!/^\d{10}$/.test(telefono.replace(/\s/g, ''))) {
            this.showMessage('El teléfono debe tener 10 dígitos.', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            this.showMessage('Ingresa un correo electrónico válido.', 'error');
            return;
        }
        if (monto > 0 && monto < 5000) {
            this.showMessage('El monto mínimo de apartado es $5,000 MXN.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = '⏳ Enviando...';

        const lead = {
            nombre,
            telefono,
            correo,
            modelo_interes: modelo,
            monto_apartado: monto || null,
            fuente: 'Lite',
            created_at: new Date().toISOString()
        };

        let guardado = false;

        // Guardar en Supabase (si está configurado)
        if (this.sb) {
            try {
                const res = await fetch(`${this.sb.url}/rest/v1/leads`, {
                    method: 'POST',
                    headers: {
                        apikey: this.sb.key,
                        Authorization: `Bearer ${this.sb.key}`,
                        'Content-Type': 'application/json',
                        Prefer: 'return=minimal'
                    },
                    body: JSON.stringify(lead)
                });
                if (res.ok || res.status === 201) guardado = true;
            } catch (err) {
                console.error('Error guardando lead:', err);
            }
        }

        // Rastrar en analytics
        if (window.Analytics) {
            window.Analytics.sendData('lead_preregistro', {
                modelo,
                monto_apartado: monto,
                tiene_supabase: !!this.sb
            });
        }

        // Mensaje de WhatsApp pre-armado
        const montoTxt = monto >= 5000 ? ` Quiero apartar con $${monto.toLocaleString('es-MX')} MXN.` : '';
        const modeloTxt = modelo ? ` Me interesa el modelo ${modelo}.` : '';
        const waMsg = encodeURIComponent(`Hola, me llamo ${nombre}. Me pre-registré desde la página de Haciendas del Bosque.${modeloTxt}${montoTxt} ¿Pueden contactarme? Mi correo es ${correo}.`);

        btn.disabled = false;
        btn.textContent = '📋 Apartar con monto';

        const successDiv = document.getElementById('preregistro-success');
        if (successDiv) {
            successDiv.innerHTML = `
        <div style="text-align:center;padding:2rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">🎉</div>
          <h3 style="color:var(--green);margin-bottom:0.5rem;">¡Pre-registro exitoso!</h3>
          <p style="color:var(--text-secondary);margin-bottom:1.5rem;">
            ${guardado ? 'Tus datos fueron guardados correctamente.' : 'Tu solicitud fue procesada.'}<br>
            Un asesor te contactará pronto al número <strong>${telefono}</strong>.
          </p>
          <a href="https://wa.me/525537494034?text=${waMsg}" target="_blank" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;font-size:1rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.029.566 1.936.84 2.806.84 3.181 0 5.767-2.586 5.767-5.766.001-3.18-2.585-5.766-5.767-5.766zm9.93 5.766c0-5.476-4.455-9.931-9.931-9.931-5.476 0-9.931 4.455-9.931 9.931 0 1.968.578 3.633 1.549 5.06l-1.616 5.895 6.046-1.584c1.375.831 2.977 1.306 4.352 1.306 5.476 0 9.931-4.455 9.931-9.931z"/></svg>
            Confirmar por WhatsApp →
          </a>
        </div>`;
            successDiv.style.display = 'block';
            document.getElementById('preregistro-form').style.display = 'none';
        }
    },

    // ──────────────────────────────────────────
    // DISPONIBILIDAD (lee de Supabase)
    // ──────────────────────────────────────────
    async loadDisponibilidad() {
        if (!this.sb) return;
        try {
            const res = await fetch(`${this.sb.url}/rest/v1/disponibilidad?select=*`, {
                headers: { apikey: this.sb.key, Authorization: `Bearer ${this.sb.key}` }
            });
            const data = await res.json();
            if (!Array.isArray(data)) return;

            data.forEach(item => {
                const badge = document.querySelector(`[data-disponibilidad="${item.modelo_id}"]`);
                if (badge) {
                    const n = item.unidades_disponibles;
                    badge.textContent = n === 0 ? '❌ Agotado' : `🔥 ${n} unidad${n !== 1 ? 'es' : ''} disponible${n !== 1 ? 's' : ''}`;
                    badge.style.background = n === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(37,211,102,0.15)';
                    badge.style.color = n === 0 ? 'var(--red-primary)' : 'var(--green)';
                    badge.style.display = 'inline-block';
                }
            });
        } catch (err) {
            console.error('Error cargando disponibilidad:', err);
        }
    },

    showMessage(msg, type) {
        const el = document.getElementById('preregistro-message');
        if (!el) return;
        el.textContent = msg;
        el.style.color = type === 'error' ? 'var(--red-primary)' : 'var(--green)';
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 4000);
    }
};

document.addEventListener('DOMContentLoaded', () => Preregistro.init());
