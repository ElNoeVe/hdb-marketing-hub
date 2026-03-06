// ===================================
// infonavit-calc.js — Calculadora de Crédito Real 2025
// Fuentes: Infonavit.org.mx, FOVISSSTE, Banxico
// ===================================

// Datos oficiales Marzo 2026
const CALC_DATA = {
    UMA_DIARIA: 117.31,           // UMA 2026 (INEGI)
    UMA_MENSUAL: 117.31 * 30.4,   // ~3,566 MXN/mes
    SMG_DIARIO: 315.04,           // Salario Mínimo General 2026 (CONASAMI)
    SMG_MENSUAL: 315.04 * 30.4,   // ~9,577 MXN/mes

    // Tabla Infonavit 2026: [VSM mínimo, VSM máximo, tasa anual %]
    INFONAVIT_TASAS: [
        [1.0, 1.6, 1.90],
        [1.6, 2.0, 2.06],
        [2.0, 2.5, 2.17],
        [2.5, 3.0, 2.31],
        [3.0, 3.5, 2.63],
        [3.5, 4.0, 2.94],
        [4.0, 4.5, 3.24],
        [4.5, 5.0, 3.55],
        [5.0, 5.5, 4.01],
        [5.5, 6.0, 4.51],
        [6.0, 7.0, 5.28],
        [7.0, 8.0, 5.97],
        [8.0, 9.0, 6.56],
        [9.0, 10.0, 7.01],
        [10.0, 11.0, 7.49],
        [11.0, 15.0, 9.00],
        [15.0, 999, 10.45],
    ],

    // Infonavit 2026: límite máximo absoluto del crédito
    INFONAVIT_MAX_CREDITO: 2950000,

    // FOVISSSTE: tasa fija 6% anual, plazo hasta 30 años
    FOVISSSTE_TASA: 6.0,
    FOVISSSTE_MAX: 1650000,

    // Bancario: promedio ponderado 2026
    BANCARIO_TASA: 10.5,
    BANCARIO_PLAZOS: [10, 15, 20, 30],

    // Enganche mínimo bancario: 10%
    ENGANCHE_MIN_PCT: 10,
};

// Calcula el VSM (Veces Salario Mínimo General mensual)
function calcVSM(salarioMensual) {
    return salarioMensual / CALC_DATA.SMG_MENSUAL;
}

// Obtiene tasa Infonavit según VSM
function getTasaInfonvait(vsm) {
    for (const [min, max, tasa] of CALC_DATA.INFONAVIT_TASAS) {
        if (vsm >= min && vsm < max) return tasa;
    }
    return vsm < 1 ? 1.90 : 10.45;
}

// Calcula mensualidad con amortización francesa
function calcMensualidad(capital, tasaAnual, añosPlazo) {
    const r = (tasaAnual / 100) / 12; // tasa mensual
    const n = añosPlazo * 12;          // pagos totales
    if (r === 0) return capital / n;
    return capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Estima crédito Infonavit basado en salario mensual
// Regla: el banco central de Infonavit presta hasta 30 años y la mensualidad
// no puede exceder el 30% del salario. El tope 2025 es $2,830,672.
function calcCreditoInfonvait(salarioMensual) {
    const vsm = calcVSM(salarioMensual);
    const tasa = getTasaInfonvait(vsm);

    // Mensualidad máxima que puede comprometer el trabajador (30% del salario)
    const maxMensualidad = salarioMensual * 0.30;
    const plazoMeses = 30 * 12;
    const r = (tasa / 100) / 12;
    // Despejamos el capital: C = M × [(1-(1+r)^-n)/r]
    const factorPV = r === 0 ? plazoMeses : (1 - Math.pow(1 + r, -plazoMeses)) / r;
    const creditoCalculado = maxMensualidad * factorPV;

    // Aplicar tope máximo 2025
    const credito = Math.min(creditoCalculado, CALC_DATA.INFONAVIT_MAX_CREDITO);
    return { credito, tasa, vsm, maxMensualidad };
}

// ──────────────────────────────────────────
// RENDER PRINCIPAL
// ──────────────────────────────────────────
function calcularCredito() {
    const tipo = document.getElementById('tipoCredito').value;
    const salario = parseFloat(document.getElementById('salarioMensual').value) || 0;
    const precioPropiedad = parseFloat(document.getElementById('precioPropiedad').value) || 0;
    const plazo = parseInt(document.getElementById('plazoAnios').value) || 20;

    const resultDiv = document.getElementById('calc-credito-result');
    if (!salario || !precioPropiedad) {
        resultDiv.innerHTML = `<div class="card" style="border:1px solid var(--red-primary);"><p style="color:var(--red-primary);">⚠️ Ingresa tu salario mensual y el precio del modelo que te interesa.</p></div>`;
        return;
    }

    const enganche = precioPropiedad * (CALC_DATA.ENGANCHE_MIN_PCT / 100);
    let html = '';

    if (tipo === 'infonavit') {
        const precalificacion = salario; // En este modo el input de "salario" es la precalculada
        const alcanzA_100 = precalificacion >= precioPropiedad;
        const creditoAplicado = Math.min(precalificacion, precioPropiedad);
        const complemento = Math.max(0, precioPropiedad - precalificacion);

        // Estimar mensualidad (En Infonavit suele ser el 30% del salario base, 
        // pero como ahora ingresan precalificación, calculamos una mensualidad 
        // estándar sobre el monto aplicado con la tasa máxima para ser conservadores)
        const mensualidad = calcMensualidad(creditoAplicado, 10.45, 30);

        html = renderResultCard({
            titulo: '🏛️ Crédito Infonavit',
            items: [
                { label: 'Monto de tu precalificación', value: formatCurrencyCalc(precalificacion), highlight: true },
                { label: 'Tasa de interés Infonavit', value: `Hasta 10.45% anual (según nivel)`, highlight: false },
                { label: 'Crédito aplicado a la propiedad', value: formatCurrencyCalc(creditoAplicado), highlight: true },
                { label: 'Complemento necesario', value: formatCurrencyCalc(complemento), highlight: complemento > 0 },
                { label: 'Mensualidad estimada', value: formatCurrencyCalc(mensualidad) + '/mes (30 años)', highlight: true },
            ],
            advertencia: alcanzA_100
                ? '✅ ¡Felicidades! Tu crédito Infonavit cubre el 100% del valor de esta propiedad. ¡Agenda una cita para iniciar el trámite!'
                : `ℹ️ Tu precalificación cubre $${formatCurrencyCalc(creditoAplicado)}. Los $${formatCurrencyCalc(complemento)} restantes pueden cubrirse con ahorros o cofinanciamiento bancario. ¡Es una opción muy común y viable!`,
            positivo: alcanzA_100
        });

    } else if (tipo === 'fovissste') {
        const precalificacion = salario;
        const alcanzA_100 = precalificacion >= precioPropiedad;
        const creditoAplicado = Math.min(precalificacion, precioPropiedad);
        const complemento = Math.max(0, precioPropiedad - precalificacion);
        const mensualidad = calcMensualidad(creditoAplicado, CALC_DATA.FOVISSSTE_TASA, plazo);

        html = renderResultCard({
            titulo: '🏛️ Crédito FOVISSSTE',
            items: [
                { label: 'Monto de tu precalificación', value: formatCurrencyCalc(precalificacion), highlight: true },
                { label: 'Tasa de interés fija', value: CALC_DATA.FOVISSSTE_TASA + '% anual', highlight: false },
                { label: 'Plazo seleccionado', value: `${plazo} años`, highlight: false },
                { label: 'Crédito aplicado a la propiedad', value: formatCurrencyCalc(creditoAplicado), highlight: true },
                { label: 'Complemento necesario', value: formatCurrencyCalc(complemento), highlight: complemento > 0 },
                { label: 'Mensualidad estimada', value: formatCurrencyCalc(mensualidad) + '/mes', highlight: true },
            ],
            advertencia: alcanzA_100
                ? '✅ Tu crédito FOVISSSTE cubre el 100% de esta propiedad. ¡Excelente oportunidad!'
                : `ℹ️ Tu crédito cubre $${formatCurrencyCalc(creditoAplicado)}. Los $${formatCurrencyCalc(complemento)} restantes se pueden cubrir con el esquema "Alia2" (FOVISSSTE + banco).`,
            positivo: alcanzA_100
        });

    } else { // bancario
        const prestamo = precioPropiedad - enganche;
        // Tasa promedio real 2025 (fuente: Banxico / FITCH Ratings)
        const tasaBancaria = CALC_DATA.BANCARIO_TASA;
        const mensualidades = CALC_DATA.BANCARIO_PLAZOS.map(p => ({
            plazo: p,
            mensualidad: calcMensualidad(prestamo, tasaBancaria, p)
        }));

        const rows = mensualidades.map(m =>
            `<tr><td>${m.plazo} años</td><td style="color:var(--green);font-weight:700;">${formatCurrencyCalc(m.mensualidad)}/mes</td><td>${formatCurrencyCalc(m.mensualidad * m.plazo * 12)}</td></tr>`
        ).join('');

        // El total a pagar es correcto — es la matemática real de una hipoteca
        html = `
    <div class="card" style="border:1px solid var(--blue-light);">
      <h4 style="color:var(--blue-light);margin-bottom:1rem;">🏦 Crédito Bancario — Tasa ~${tasaBancaria}% anual</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div class="calc-result" style="padding:1rem;">
          <p class="calc-result-label">Precio de la propiedad</p>
          <div class="calc-result-value" style="font-size:1.4rem;">${formatCurrencyCalc(precioPropiedad)}</div>
        </div>
        <div class="calc-result" style="padding:1rem;">
          <p class="calc-result-label">Monto del crédito (90%)</p>
          <div class="calc-result-value" style="font-size:1.4rem;">${formatCurrencyCalc(prestamo)}</div>
        </div>
      </div>
      <div class="table-wrapper">
        <table><thead><tr><th>Plazo</th><th>Mensualidad</th><th>Total a pagar</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <div style="margin-top:1rem;padding:0.75rem;background:rgba(59,130,246,0.1);border-radius:8px;font-size:0.82rem;color:var(--text-secondary);">
        💡 <strong>¿Por qué el total es mayor al precio?</strong> En una hipoteca pagas el capital MÁS los intereses acumulados durante años. A tasa del ${tasaBancaria}% a 20 años, el costo financiero representa ~${Math.round((calcMensualidad(prestamo, tasaBancaria, 20) * 240 / prestamo - 1) * 100)}% extra del capital. Es la realidad de cualquier crédito hipotecario en México. A menor plazo, menos intereses totales.<br><br>
        Las tasas varían por banco y perfil (BBVA ~9.85%, Banorte ~10.5%, HSBC ~10.75%). Consulta con tu banco para una cotización personalizada.
      </div>
    </div>`;
    }

    resultDiv.innerHTML = html;
}

function renderResultCard({ titulo, items, advertencia, positivo }) {
    const itemsHtml = items.map(({ label, value, highlight }) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <span style="font-size:0.85rem;color:var(--text-secondary);">${label}</span>
      <span style="font-weight:${highlight ? '700' : '400'};color:${highlight ? 'var(--green)' : 'var(--text-primary)'};">${value}</span>
    </div>`).join('');

    const advertenciaColor = positivo ? 'rgba(37,211,102,0.12)' : 'rgba(59,130,246,0.12)';
    const advertenciaTextColor = positivo ? 'var(--green)' : 'var(--blue-light)';

    return `
  <div class="card" style="border:1px solid var(--blue-light);">
    <h4 style="color:var(--blue-light);margin-bottom:1rem;">${titulo}</h4>
    ${itemsHtml}
    <div style="margin-top:1rem;padding:0.75rem;background:${advertenciaColor};border-radius:8px;font-size:0.85rem;color:${advertenciaTextColor};">
      ${advertencia}
    </div>
  </div>`;
}

function formatCurrencyCalc(n) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

// Auto-fill de precio por modelo
function selectModeloCredito(precio, nombre) {
    const input = document.getElementById('precioPropiedad');
    if (input) {
        input.value = precio;
        document.querySelectorAll('.modelo-btn').forEach(b => b.classList.remove('active'));
        event?.target?.classList?.add('active');
        const salario = document.getElementById('salarioMensual')?.value;
        if (salario) calcularCredito();
    }
}

// Cambio de tipo de crédito — mostrar/ocultar plazo
function onTipoCreditoChange() {
    const tipo = document.getElementById('tipoCredito').value;
    const plazoGroup = document.getElementById('plazo-group');
    if (plazoGroup) {
        plazoGroup.style.display = (tipo === 'bancario' || tipo === 'fovissste') ? 'block' : 'none';
    }
}
