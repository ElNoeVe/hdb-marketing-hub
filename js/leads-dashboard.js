// ===================================
// leads-dashboard.js — Panel de Leads + Comparador de Campañas
// ===================================

const LeadsDashboard = {
    sb: null,

    init() {
        const cfg = window.ANALYTICS_CONFIG;
        if (!cfg?.supabaseUrl) {
            console.warn('LeadsDashboard: Sin configuración de Supabase.');
            return;
        }
        this.sb = { url: cfg.supabaseUrl, key: cfg.supabaseKey };
        this.loadLeads();
        this.loadTrendChart();
    },

    async query(table, params = '') {
        const res = await fetch(`${this.sb.url}/rest/v1/${table}${params}`, {
            headers: {
                apikey: this.sb.key,
                Authorization: `Bearer ${this.sb.key}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
        return res.json();
    },

    // ──────────────────────────────────────────
    // PANEL DE LEADS
    // ──────────────────────────────────────────
    async loadLeads() {
        const container = document.getElementById('leads-panel');
        if (!container) return;

        try {
            const leads = await this.query('leads', '?order=created_at.desc&limit=50');

            // Summary counts
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const weekAgo = new Date(now - 7 * 86400000).toISOString();
            const today = leads.filter(l => l.created_at?.startsWith(todayStr));
            const week = leads.filter(l => l.created_at >= weekAgo);
            const withDeposit = leads.filter(l => l.monto_apartado > 0);

            document.getElementById('leads-today').textContent = today.length;
            document.getElementById('leads-week').textContent = week.length;
            document.getElementById('leads-total').textContent = leads.length;
            document.getElementById('leads-deposits').textContent = withDeposit.length;

            // Table
            const tbody = document.getElementById('leads-table-body');
            if (!tbody) return;

            if (leads.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;opacity:0.5;padding:2rem;">Sin leads registrados aún.</td></tr>`;
                return;
            }

            tbody.innerHTML = leads.map(l => {
                const fecha = l.created_at ? new Date(l.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
                const monto = l.monto_apartado ? `$${Number(l.monto_apartado).toLocaleString('es-MX')}` : '—';
                const fuente = l.fuente === 'Lite' ? '<span style="color:var(--blue-light);">Lite</span>' : '<span style="color:var(--green);">Principal</span>';
                const modelo = l.modelo_interes || '—';
                return `
        <tr>
          <td>${fecha}</td>
          <td><strong>${l.nombre || '—'}</strong></td>
          <td>${l.telefono ? `<a href="tel:${l.telefono}" style="color:var(--green);">${l.telefono}</a>` : '—'}</td>
          <td>${l.correo ? `<a href="mailto:${l.correo}" style="color:var(--blue-light);font-size:0.8rem;">${l.correo}</a>` : '—'}</td>
          <td style="font-size:0.8rem;">${modelo}</td>
          <td style="color:var(--green);font-weight:700;">${monto}</td>
          <td>${fuente}</td>
        </tr>`;
            }).join('');

        } catch (e) {
            console.error('Error cargando leads:', e);
            const tbody = document.getElementById('leads-table-body');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--red-primary);padding:2rem;">Error al cargar. Verifica tu configuración de Supabase.</td></tr>`;
        }
    },

    // ──────────────────────────────────────────
    // COMPARADOR DE CAMPAÑAS (WhatsApp clicks por semana)
    // ──────────────────────────────────────────
    async loadTrendChart() {
        const canvas = document.getElementById('trend-chart');
        if (!canvas) return;

        try {
            // Fetch last 14 days of whatsapp_click events
            const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
            const events = await this.query('events', `?event=eq.whatsapp_click&created_at=gte.${twoWeeksAgo}&order=created_at.asc`);

            // Group by day
            const countsByDay = {};
            events.forEach(ev => {
                const day = ev.timestamp ? ev.timestamp.split('T')[0] : (ev.created_at || '').split('T')[0];
                countsByDay[day] = (countsByDay[day] || 0) + 1;
            });

            // Build last 14 days labels
            const labels = [];
            const data = [];
            for (let i = 13; i >= 0; i--) {
                const d = new Date(Date.now() - i * 86400000);
                const key = d.toISOString().split('T')[0];
                const label = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
                labels.push(label);
                data.push(countsByDay[key] || 0);
            }

            // Split into this week vs last week for comparison
            const lastWeek = data.slice(0, 7);
            const thisWeek = data.slice(7, 14);
            const weekLabels = labels.slice(7, 14);

            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: weekLabels,
                    datasets: [
                        {
                            label: 'Semana anterior',
                            data: lastWeek,
                            backgroundColor: 'rgba(59,130,246,0.3)',
                            borderColor: 'rgba(59,130,246,0.8)',
                            borderWidth: 2,
                            borderRadius: 6
                        },
                        {
                            label: 'Esta semana',
                            data: thisWeek,
                            backgroundColor: 'rgba(37,211,102,0.4)',
                            borderColor: 'rgba(37,211,102,0.9)',
                            borderWidth: 2,
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#e5e7eb' } },
                        tooltip: {
                            callbacks: {
                                label: ctx => ` ${ctx.parsed.y} click${ctx.parsed.y !== 1 ? 's' : ''} a WhatsApp`
                            }
                        }
                    },
                    scales: {
                        x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: {
                            ticks: { color: '#9ca3af', stepSize: 1 },
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            beginAtZero: true
                        }
                    }
                }
            });

        } catch (e) {
            console.error('Error cargando tendencias:', e);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => LeadsDashboard.init());
