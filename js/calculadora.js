// ===================================
// calculadora.js — Plusvalía Calculator
// ===================================

let preciosData = null;
let projectionChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    preciosData = await loadJSON('data/precios-historicos.json');
    if (preciosData) {
        renderHistoricalTables();

        // Check if a price was set from gallery page
        const savedPrice = localStorage.getItem('calcPrice');
        if (savedPrice) {
            document.getElementById('currentPrice').value = savedPrice;
            // Select matching dropdown option
            const select = document.getElementById('propertyType');
            for (let opt of select.options) {
                if (opt.value === savedPrice) {
                    opt.selected = true;
                    break;
                }
            }
            localStorage.removeItem('calcPrice');
        }

        calculate(); // Auto calculate on load
    }

    document.getElementById('calcBtn').addEventListener('click', calculate);
    document.getElementById('currentPrice').addEventListener('input', calculate);
    document.getElementById('scenario').addEventListener('change', calculate);
});

async function loadJSON(url) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error('Error loading data:', e);
        return null;
    }
}

function selectModelFromDropdown() {
    const select = document.getElementById('propertyType');
    const price = select.value;
    document.getElementById('currentPrice').value = price;
    calculate();
}

function selectModel(price) {
    document.getElementById('currentPrice').value = price;
    // Update dropdown to match
    const select = document.getElementById('propertyType');
    for (let opt of select.options) {
        if (opt.value === String(price)) {
            opt.selected = true;
            break;
        }
    }
    calculate();
}

function calculate() {
    const price = parseFloat(document.getElementById('currentPrice').value) || 0;
    const scenario = document.getElementById('scenario').value;

    if (price <= 0 || !preciosData) return;

    const escenarios = preciosData.escenarios_proyeccion;
    const tasaConservador = escenarios.conservador.tasa_anual / 100;
    const tasaModerado = escenarios.moderado.tasa_anual / 100;
    const tasaOptimista = escenarios.optimista.tasa_anual / 100;

    const tasaSeleccionada = escenarios[scenario].tasa_anual / 100;

    // Calculate projections
    const years = [1, 2, 3, 4, 5];
    const projections = years.map(y => ({
        year: y,
        conservador: Math.round(price * Math.pow(1 + tasaConservador, y)),
        moderado: Math.round(price * Math.pow(1 + tasaModerado, y)),
        optimista: Math.round(price * Math.pow(1 + tasaOptimista, y)),
    }));

    // Update result card
    const selectedValue = Math.round(price * Math.pow(1 + tasaSeleccionada, 5));
    const gain = selectedValue - price;

    document.getElementById('resultValue').textContent = formatCurrency(selectedValue);
    document.getElementById('resultGain').textContent = '+' + formatCurrency(gain);
    document.getElementById('resultYears').textContent = '5';

    // Motivational text
    const gainPercent = ((gain / price) * 100).toFixed(1);
    const monthlyGain = formatCurrency(Math.round(gain / 60));
    document.getElementById('motivationalText').innerHTML = `
    <strong style="color:var(--blue-light);">💡 ¿Por qué invertir ahora?</strong><br><br>
    Si compras hoy a <strong>${formatCurrency(price)}</strong>, en 5 años tu propiedad podría valer 
    <strong style="color:var(--green);">${formatCurrency(selectedValue)}</strong>.<br><br>
    Eso es una ganancia de <strong style="color:var(--green);">+${formatCurrency(gain)}</strong> (${gainPercent}%), 
    equivalente a <strong>${monthlyGain} por mes</strong> de plusvalía acumulada.<br><br>
    📈 <em>Mientras pagas tu hipoteca, tu patrimonio crece cada día. 
    Cada mes que esperas, el precio podría estar más alto.</em>
  `;

    // Update table
    renderProjectionTable(projections, price);

    // Update chart
    renderChart(projections, price);
}

function renderProjectionTable(projections, basePrice) {
    const tbody = document.getElementById('projectionBody');
    tbody.innerHTML = projections.map(p => `
    <tr>
      <td><strong>Año ${p.year}</strong></td>
      <td>${formatCurrency(p.conservador)}</td>
      <td><strong>${formatCurrency(p.moderado)}</strong></td>
      <td>${formatCurrency(p.optimista)}</td>
      <td class="positive"><strong>+${formatCurrency(p.moderado - basePrice)}</strong></td>
    </tr>
  `).join('');
}

function renderChart(projections, basePrice) {
    const ctx = document.getElementById('projectionChart').getContext('2d');

    if (projectionChart) {
        projectionChart.destroy();
    }

    const labels = ['Hoy', ...projections.map(p => `Año ${p.year}`)];

    projectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Conservador (3.5%)',
                    data: [basePrice, ...projections.map(p => p.conservador)],
                    borderColor: '#8BA4C4',
                    backgroundColor: 'rgba(139, 164, 196, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Moderado SHF (5.2%)',
                    data: [basePrice, ...projections.map(p => p.moderado)],
                    borderColor: '#3A7FCC',
                    backgroundColor: 'rgba(58, 127, 204, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#3A7FCC',
                },
                {
                    label: 'Optimista Tecámac (6.5%)',
                    data: [basePrice, ...projections.map(p => p.optimista)],
                    borderColor: '#22C55E',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#8BA4C4',
                        font: { family: 'Inter', size: 12 },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 36, 64, 0.95)',
                    titleColor: '#E8F0FE',
                    bodyColor: '#8BA4C4',
                    borderColor: 'rgba(27, 95, 170, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(27, 95, 170, 0.1)' },
                    ticks: { color: '#8BA4C4', font: { family: 'Inter' } }
                },
                y: {
                    grid: { color: 'rgba(27, 95, 170, 0.1)' },
                    ticks: {
                        color: '#8BA4C4',
                        font: { family: 'Inter' },
                        callback: function (value) {
                            if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

function renderHistoricalTables() {
    // SHF Table
    const shfBody = document.getElementById('shfTable');
    const shfData = preciosData.shf_tecamac.crecimiento_anual_porcentaje;
    shfBody.innerHTML = Object.entries(shfData).map(([year, rate]) => `
    <tr>
      <td>${year}</td>
      <td class="positive"><strong>+${rate}%</strong></td>
    </tr>
  `).join('');

    // Inflacion Table
    const infBody = document.getElementById('inflacionTable');
    const infData = preciosData.banxico_inflacion.tasa_anual_porcentaje;
    infBody.innerHTML = Object.entries(infData).map(([year, rate]) => `
    <tr>
      <td>${year}</td>
      <td>${rate}%</td>
    </tr>
  `).join('');
}
