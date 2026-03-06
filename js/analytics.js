const Analytics = {
    startTime: Date.now(),
    lastSection: 'Inicio',

    // 🔥 CONFIGURACIÓN DEL USUARIO (Manual.md)
    getConfig() {
        return {
            supabaseUrl: window.ANALYTICS_CONFIG?.supabaseUrl || '',
            supabaseKey: window.ANALYTICS_CONFIG?.supabaseKey || '',
            isActive: !!(window.ANALYTICS_CONFIG?.supabaseUrl)
        };
    },

    init() {
        console.log("📊 HDB Analytics: Inicializando...");
        this.saveCurrentPath();
        this.trackPageTime();
        this.setupEventListeners();

        // 🔥 EVENTO CRÍTICO: Registrar visita de inmediato
        this.sendData('page_view', {
            path: window.location.pathname,
            section: this.lastSection
        });

        // Cargar Dashboard si existe el contenedor
        if (document.getElementById('stats-dashboard')) {
            this.updateRealtimeStats();
        }
    },

    trackPageTime() {
        // Enviar evento de salida (usamos 'pagehide' que es más fiable que 'beforeunload')
        window.addEventListener('pagehide', () => {
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
            this.sendData('session_end', { seconds: timeSpent });
        });
    },

    saveCurrentPath() {
        const path = window.location.pathname;
        if (path.includes('calculadora')) this.lastSection = 'Plusvalía';
        else if (path.includes('galeria')) this.lastSection = 'Galería';
        else if (path.includes('creativos')) this.lastSection = 'Optimización creativa';
        else this.lastSection = 'Dashboard';

        sessionStorage.setItem('last_active_section', this.lastSection);
    },

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a');
            if (!target) return;

            const href = target.href;
            const lastSection = sessionStorage.getItem('last_active_section') || 'Directo';

            if (href.includes('wa.me') || href.includes('whatsapp.com')) {
                this.sendData('whatsapp_click', {
                    from_section: lastSection,
                    url: window.location.href
                });
                // Meta Pixel: track Lead event
                if (window.fbq) fbq('track', 'Lead', { content_name: 'WhatsApp Click', content_category: lastSection });
            }

            if (href.includes('mailto:')) {
                this.sendData('email_click', { from_section: lastSection });
            }
        });
    },

    async updateRealtimeStats() {
        const config = this.getConfig();
        if (!config.isActive) return;

        try {
            // Ejemplo de fetch a Supabase (Simplificado para el manual)
            // En la vida real, se usaría la librería de Supabase o REST API
            const response = await fetch(`${config.supabaseUrl}/rest/v1/stats_summary?select=*`, {
                headers: { "apikey": config.supabaseKey, "Authorization": `Bearer ${config.supabaseKey}` }
            });
            const data = await response.json();

            if (data && data[0]) {
                document.getElementById('total-visits').innerText = data[0].total_visits || '0';
                document.getElementById('wa-clicks').innerText = data[0].wa_clicks || '0';
                document.getElementById('top-section').innerText = data[0].top_section || '-';
            }
        } catch (e) {
            console.error("Error cargando estadísticas:", e);
        }
    },

    sendData(event, metadata) {
        const config = this.getConfig();
        const payload = {
            event: event,
            timestamp: new Date().toISOString(),
            metadata: metadata
        };

        console.log("📡 Enviando evento:", payload);

        if (config.isActive) {
            const url = `${config.supabaseUrl}/rest/v1/events`;
            const headers = {
                "apikey": config.supabaseKey,
                "Authorization": `Bearer ${config.supabaseKey}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            };

            // Intentar sendBeacon para eventos de cierre, fetch normal para el resto
            if (event === 'session_end' && navigator.sendBeacon) {
                // sendBeacon no soporta headers personalizados fácilmente con JSON, 
                // pero Supabase acepta apikey en el query string
                const beaconUrl = `${url}?apikey=${config.supabaseKey}`;
                navigator.sendBeacon(beaconUrl, JSON.stringify(payload));
            } else {
                fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                });
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Analytics.init());
