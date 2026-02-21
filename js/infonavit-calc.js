// ===================================
// infonavit-calc.js — Calculadora de Crédito Real 2025
// Fuentes: Infonavit, FOVISSSTE, Banxico
// ===================================

// Datos oficiales 2025
const CALC_DATA = {
    UMA_DIARIA: 108.57,           // UMA 2025 (INEGI)
    UMA_MENSUAL: 108.57 * 30.4,   // ~3,300 MXN/mes
    SMG_DIARIO: 278.80,           // Salario Mínimo General 2025
    SMG_MENSUAL: 278.80 * 30.4,

    // Tabla Infonavit: [VSM mínimo, VSM máximo, tasa anual %]
    // VSM = Veces Salario Mínimo General
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
        [15.0, 25.0, 10.45],  // máximo actual
    ],

    // Infonavit: monto máximo de crédito según VSM (tabla simplificada)
    // El monto real depende del saldo de subcuenta, edad y VSM
    INFONAVIT_MAX_CREDITO: 1116440, // Tope máximo 2024 (MXN)

    // FOVISSSTE: tasa fija 6% anual, plazo hasta 30 años
    FOVISSSTE_TASA: 6.0,
    FOVISSSTE_MAX: 1500000,

    // Bancario: promedio 2025
    BANCARIO_TASA: 10.5,
    BANCARIO_PLAZOS: [10, 15, 20, 30],

    // Enganche mínimo: 10% del valor de la propiedad
    ENGANCHE_MIN_PCT: 10,
};

// Calcula el VSM (Veces Salario Mínimo)
function calcVSM(salarioMensual) {
    return salarioMensual / CALC_DATA.SMG_MENSUAL;
}

// Obtiene tasa Infonavit según VSM
function getTasaInfonvait(vsm) {
    for (const [min, max, tasa] of CALC_DATA.INFONAVIT_TASAS) {
        if (vsm >= min && vsm < max) return tasa;
    }
    if (vsm >= 25) return 10.45;
    return 1.90; // mínimo
}

// Calcula mensualidad con amortización francesa
function calcMensualidad(capital, tasaAnual, añosPlazo) {
    const r = (tasaAnual / 100) / 12; // tasa mensual
    const n = añosPlazo * 12;          // pagos totales
    if (r === 0) return capital / n;
    return capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Estima crédito Infonavit basado en salario mensual y VSM
function calcCreditoInfonvait(salarioMensual) {
    const vsm = calcVSM(salarioMensual);
    const tasa = getTasaInfonvait(vsm);

    // Regla de Infonavit: mensualidad ≤ 30% del salario
    const maxMensualidad = salarioMensual * 0.30;
    const plazoMeses = 30 * 12; // máx 30 años
    const r = (tasa / 100) / 12;
    // Despejamos el capital: C = M * [(1-(1+r)^-n)/r]
    const factorPV = (1 - Math.pow(1 + r, -plazoMeses)) / r;
    const creditoEstimado = maxMensualidad * factorPV;

    const credito = Math.min(creditoEstimado, CALC_DATA.INFONAVIT_MAX_CREDITO);
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
        const { credito, tasa, vsm, maxMensualidad } = calcCreditoInfonvait(salario);
        const creditoEfectivo = Math.min(credito, precioPropiedad - enganche);
        const complemento = Math.max(0, (precioPropiedad - enganche) - creditoEfectivo);
        const mensualidad = calcMensualidad(creditoEfectivo, tasa, 30);

        html = renderResultCard({
            titulo: '🏦 Crédito Infonavit',
            items: [
                { label: 'Tu VSM', value: vsm.toFixed(2) + ' veces s. mínimo', highlight: false },
                { label: 'Tasa de interés', value: tasa.toFixed(2) + '% anual (oficial Infonavit)', highlight: false },
                { label: 'Crédito máximo estimado', value: formatCurrencyCalc(credito), highlight: true },
                { label: 'Crédito aplicable a esta propiedad', value: formatCurrencyCalc(creditoEfectivo), highlight: true },
                { label: 'Enganche mínimo (10%)', value: formatCurrencyCalc(enganche), highlight: false },
                { label: 'Complemento necesario', value: formatCurrencyCalc(complemento), highlight: complemento > 0 },
                { label: 'Mensualidad estimada', value: formatCurrencyCalc(mensualidad) + '/mes', highlight: true },
            ],
            advertencia: complemento > 0
                ? `⚠️ Infonavit no presta el 100% del valor. Necesitas aportar ${formatCurrencyCalc(complemento)} adicionales (ahorros, cofinanciamiento bancario o apoyo familiar).`
                : '✅ Tu crédito es suficiente para esta propiedad con el enganche del 10%.',
            positivo: complemento === 0
        });

    } else if (tipo === 'fovissste') {
        const prestamo = Math.min(precioPropiedad - enganche, CALC_DATA.FOVISSSTE_MAX);
        const complemento = Math.max(0, (precioPropiedad - enganche) - prestamo);
        const mensualidad = calcMensualidad(prestamo, CALC_DATA.FOVISSSTE_TASA, plazo);

        html = renderResultCard({
            titulo: '🏛️ Crédito FOVISSSTE',
            items: [
                { label: 'Tasa de interés fija', value: CALC_DATA.FOVISSSTE_TASA + '% anual', highlight: false },
                { label: 'Plazo seleccionado', value: `${plazo} años`, highlight: false },
                { label: 'Monto del crédito', value: formatCurrencyCalc(prestamo), highlight: true },
                { label: 'Enganche mínimo (10%)', value: formatCurrencyCalc(enganche), highlight: false },
                { label: 'Complemento necesario', value: formatCurrencyCalc(complemento), highlight: complemento > 0 },
                { label: 'Mensualidad estimada', value: formatCurrencyCalc(mensualidad) + '/mes', highlight: true },
            ],
            advertencia: 'El crédito FOVISSSTE es exclusivo para trabajadores del sector público (ISSSTE). Requiere cotización mínima de 18 bimestres.',
            positivo: true
        });

    } else { // bancario
        const prestamo = precioPropiedad - enganche;
        const mensualidades = CALC_DATA.BANCARIO_PLAZOS.map(p => ({
            plazo: p,
            mensualidad: calcMensualidad(prestamo, CALC_DATA.BANCARIO_TASA, p)
        }));

        const rows = mensualidades.map(m =>
            `<tr><td>${m.plazo} años</td><td style="color:var(--green);font-weight:700;">${formatCurrencyCalc(m.mensualidad)}/mes</td><td>${formatCurrencyCalc(m.mensualidad * m.plazo * 12)}</td></tr>`
        ).join('');

        html = `
    <div class="card" style="border:1px solid var(--blue-light);">
      <h4 style="color:var(--blue-light);margin-bottom:1rem;">🏦 Crédito Bancario — Tasa ~${CALC_DATA.BANCARIO_TASA}% anual</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div class="calc-result" style="padding:1rem;">
          <p class="calc-result-label">Precio de la propiedad</p>
          <div class="calc-result-value" style="font-size:1.4rem;">${formatCurrencyCalc(precioPropiedad)}</div>
        </div>
        <div class="calc-result" style="padding:1rem;">
          <p class="calc-result-label">Monto del crédito</p>
          <div class="calc-result-value" style="font-size:1.4rem;">${formatCurrencyCalc(prestamo)}</div>
        </div>
      </div>
      <div class="table-wrapper">
        <table><thead><tr><th>Plazo</th><th>Mensualidad</th><th>Total a pagar</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <div style="margin-top:1rem;padding:0.75rem;background:rgba(59,130,246,0.1);border-radius:8px;font-size:0.85rem;color:var(--text-secondary);">
        💡 Las tasas bancarias varían por institución y perfil crediticio. Este cálculo usa la tasa promedio de mercado 2025 (~10.5%). Consulta con tu banco para una cotización personalizada.
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

    const advertenciaColor = positivo ? 'rgba(37,211,102,0.15)' : 'rgba(239,68,68,0.15)';
    const advertenciaTextColor = positivo ? 'var(--green)' : 'var(--red-primary)';

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
        // Highlight the selected model button
        document.querySelectorAll('.modelo-btn').forEach(b => b.classList.remove('active'));
        event?.target?.classList?.add('active');
        // Auto-calculate if salary is already filled
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
