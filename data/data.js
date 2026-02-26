// ===================================
// data.js — Fallback for local viewing
// ===================================
// This file contains a copy of the JSON data to allow the site to work
// when opened directly from the file system (file://) where fetch() is blocked.

window.StartData = {
    // 1. Modelos (from modelos.json)
    modelos: {
        "desarrollo": {
            "nombre": "Haciendas del Bosque",
            "desarrollador": "Hogares Unión",
            "ubicacion": "Ojo de Agua, Tecámac, Estado de México",
            "descripcion": "Fraccionamiento residencial ubicado estratégicamente sobre la carretera México-Pachuca, cerca del Aeropuerto Internacional Felipe Ángeles (AIFA).",
            "contacto": {
                "telefono": "5537494034",
                "email": "n.gutierrez.hernandez@hogaresunion.mx",
                "whatsapp": "5537494034"
            },
            "coordenadas": {
                "lat": 19.6284,
                "lng": -98.9686,
                "nombre_maps": "Haciendas del Bosque, Ojo de Agua, Tecámac"
            }
        },
        "modelos": [
            {
                "id": "depa-pino-plus",
                "nombre": "Depa Pino Plus",
                "tipo": "Departamento",
                "precio": 1000000,
                "gastos_adicionales": "Escrituración",
                "superficie_m2": 59,
                "recamaras": 2,
                "banos": 1,
                "estacionamiento": 1,
                "niveles": 1,
                "disponible": false,
                "apartado": 10000,
                "plan_pagos": "No Aplica",
                "descripcion": "Departamento de 2 recámaras con excelente distribución, acabados de calidad y todos los beneficios del fraccionamiento. Actualmente NO disponible.",
                "imagenes": [
                    "assets/modelos/Depa Pino Premium 2R/Casas y departamentos en venta Tecámac - Estado de México - Hacienda del Bosque un desarrollo de Hogares Unión.webp",
                    "assets/modelos/Depa Pino Premium 2R/Plano del modelo Pino - Departamento en Tecámac Estado de México.webp"
                ],
                "caracteristicas": [
                    "Cajón de Estacionamiento",
                    "Cuarto de Servicio con Boiler y Lavadero",
                    "Cocina Integral (según promoción)",
                    "Closet incluído (según promoción)",
                    "Baño Equipado (según promoción)"
                ]
            },
            {
                "id": "depa-pino-premium-2r",
                "nombre": "Depa Pino Premium 2R",
                "tipo": "Departamento",
                "precio": 1150000,
                "gastos_adicionales": "Escrituración",
                "superficie_m2": 59,
                "recamaras": 2,
                "banos": 1,
                "estacionamiento": 1,
                "niveles": 1,
                "disponible": true,
                "apartado": 10000,
                "plan_pagos": "No Aplica",
                "descripcion": "Departamento premium de 2 recámaras con acabados superiores y distribución inteligente. ¡Disponible!",
                "imagenes": [
                    "assets/modelos/Depa Pino Premium 2R/Casas y departamentos en venta Tecámac - Estado de México - Hacienda del Bosque un desarrollo de Hogares Unión.webp",
                    "assets/modelos/Depa Pino Premium 2R/561454336_24422811420748263_6519657956428641840_n.jpg",
                    "assets/modelos/Depa Pino Premium 2R/WhatsApp Image 2026-02-18 at 20.01.03.jpeg",
                    "assets/modelos/Depa Pino Premium 2R/WhatsApp Image 2026-02-18 at 20.01.14.jpeg",
                    "assets/modelos/Depa Pino Premium 2R/WhatsApp Image 2026-02-18 at 20.01.15.jpeg",
                    "assets/modelos/Depa Pino Premium 2R/WhatsApp Image 2026-02-18 at 20.01.151.jpeg",
                    "assets/modelos/Depa Pino Premium 2R/WhatsApp Image 2026-02-18 at 20.01.153.jpeg",
                    "assets/modelos/Depa Pino Premium 2R/WhatsApp Image 2026-02-18 at 20.03.181.jpeg",
                    "assets/modelos/Depa Pino Premium 2R/Cuato de lavado de departamento en venta Tecámac Estado de México - Haciendas del Bosque Modelo Marfil.webp",
                    "assets/modelos/Depa Pino Premium 2R/Plano del modelo Pino - Departamento en Tecámac Estado de México.webp"
                ],
                "caracteristicas": [
                    "Cajón de Estacionamiento",
                    "Cuarto de Servicio con Boiler y Lavadero",
                    "Cocina Integral (según promoción)",
                    "Closet incluído (según promoción)",
                    "Baño Equipado (según promoción)"
                ]
            },
            {
                "id": "depa-pino-premium-3r",
                "nombre": "Depa Pino Premium 3R",
                "tipo": "Departamento",
                "precio": 1200000,
                "gastos_adicionales": "Escrituración",
                "superficie_m2": 64,
                "recamaras": 3,
                "banos": 2,
                "estacionamiento": 1,
                "niveles": 1,
                "disponible": true,
                "apartado": 10000,
                "plan_pagos": 5000,
                "descripcion": "Departamento premium de 3 recámaras y 2 baños, ideal para familias que necesitan más espacio. ¡Disponible!",
                "imagenes": [
                    "assets/modelos/Depa Pino Premium 3R/Casas y departamentos en venta Tecámac - Estado de México - Hacienda del Bosque un desarrollo de Hogares Unión.webp",
                    "assets/modelos/Depa Pino Premium 3R/561454336_24422811420748263_6519657956428641840_n.jpg",
                    "assets/modelos/Depa Pino Premium 3R/WhatsApp Image 2026-02-18 at 20.01.03.jpeg",
                    "assets/modelos/Depa Pino Premium 3R/WhatsApp Image 2026-02-18 at 20.01.14.jpeg",
                    "assets/modelos/Depa Pino Premium 3R/WhatsApp Image 2026-02-18 at 20.01.15.jpeg",
                    "assets/modelos/Depa Pino Premium 3R/WhatsApp Image 2026-02-18 at 20.01.151.jpeg",
                    "assets/modelos/Depa Pino Premium 3R/WhatsApp Image 2026-02-18 at 20.01.153.jpeg",
                    "assets/modelos/Depa Pino Premium 3R/WhatsApp Image 2026-02-18 at 20.03.181.jpeg",
                    "assets/modelos/Depa Pino Premium 3R/Cuato de lavado de departamento en venta Tecámac Estado de México - Haciendas del Bosque Modelo Marfil.webp",
                    "assets/modelos/Depa Pino Premium 3R/Plano del modelo Pino - Departamento en Tecámac Estado de México.webp"
                ],
                "caracteristicas": [
                    "Cajón de Estacionamiento",
                    "Cuarto de Servicio con Boiler y Lavadero",
                    "Cocina Integral (según promoción)",
                    "Closet incluído (según promoción)",
                    "Baño Equipado (según promoción)"
                ]
            },
            {
                "id": "casa-esmeralda",
                "nombre": "Casa Esmeralda",
                "tipo": "Casa",
                "precio": 1336000,
                "gastos_adicionales": "Escrituración + Agua",
                "superficie_m2": 74,
                "recamaras": 3,
                "banos": 2.5,
                "estacionamiento": 1,
                "niveles": 2,
                "disponible": true,
                "apartado": 10000,
                "plan_pagos": 5000,
                "descripcion": "Casa de 2 niveles con 3 recámaras y 2.5 baños, perfecta para familias que buscan espacio y comodidad. ¡Disponible!",
                "imagenes": [
                    "assets/modelos/CASA ESMERALDA/Casas a la venta Tecámac Estado de México - Modelo Esmeralda - Privadas del Bosque-1.webp",
                    "assets/modelos/CASA ESMERALDA/559468175_24422809477415124_1860468000645237551_n.jpg",
                    "assets/modelos/CASA ESMERALDA/561706721_24422803840749021_1041807589132480898_n.jpg",
                    "assets/modelos/CASA ESMERALDA/Sala de casa en venta Tecámac Estado de México - Esmeralda.webp",
                    "assets/modelos/CASA ESMERALDA/Cocina y comedor de casa en venta Tecámac Estado de México - Esmeralda.webp",
                    "assets/modelos/CASA ESMERALDA/Recámara principal de casa en venta Tecámac Estado de México - Esmeralda.webp",
                    "assets/modelos/CASA ESMERALDA/Recámara secundaria de casa en venta Tecámac Estado de México - Esmeralda.webp",
                    "assets/modelos/CASA ESMERALDA/Patio de casa en venta Tecámac Estado de México - Esmeralda.webp",
                    "assets/modelos/CASA ESMERALDA/Planta Baja de modelo Esmeralda - Privadas del Bosque.webp",
                    "assets/modelos/CASA ESMERALDA/Nivel 1 de modelo Esmeralda - Privadas del Bosque.webp",
                    "assets/modelos/CASA ESMERALDA/WhatsApp Image 2026-02-18 at 20.01.162.jpeg",
                    "assets/modelos/CASA ESMERALDA/WhatsApp Image 2026-02-18 at 20.01.17.jpeg",
                    "assets/modelos/CASA ESMERALDA/WhatsApp Image 2026-02-18 at 20.01.22.jpeg"
                ],
                "caracteristicas": [
                    "Cajón de Estacionamiento",
                    "Cuarto de Servicio con Boiler y Lavadero",
                    "Cocina Integral (según promoción)",
                    "Closet incluído (según promoción)",
                    "Baño Equipado (según promoción)"
                ]
            },
            {
                "id": "casa-citrino",
                "nombre": "Casa Citrino",
                "tipo": "Casa",
                "precio": 1850000,
                "gastos_adicionales": "Escrituración",
                "superficie_m2": 122,
                "recamaras": 3,
                "banos": 2.5,
                "estacionamiento": 1,
                "niveles": 2,
                "disponible": false,
                "apartado": 10000,
                "plan_pagos": 5000,
                "descripcion": "La casa más amplia del desarrollo con 122 m², 3 recámaras y 2.5 baños. Espacio premium para familias grandes. Actualmente NO disponible.",
                "imagenes": [
                    "assets/modelos/CASA CITRINO/Casas a la venta Tecámac Estado de México - Modelo Citrino - Privadas del Bosque-1.webp",
                    "assets/modelos/CASA CITRINO/558877359_24422797917416280_4423801559140570034_n.jpg",
                    "assets/modelos/CASA CITRINO/558972649_24422796147416457_7493770988054539986_n.jpg",
                    "assets/modelos/CASA CITRINO/558973979_24422800547416017_2408910737243467597_n.jpg",
                    "assets/modelos/CASA CITRINO/Sala de casa en venta Tecámac Estado de México - Citrino.webp",
                    "assets/modelos/CASA CITRINO/Cocina de casa en venta Tecámac Estado de México - Citrino.webp",
                    "assets/modelos/CASA CITRINO/Family room de casa en venta Tecámac Estado de México - Citrino.webp",
                    "assets/modelos/CASA CITRINO/Recámara secundaria de casa en venta Tecámac Estado de México - Citrino.webp",
                    "assets/modelos/CASA CITRINO/Segunda recámara de casa en venta Tecámac Estado de México - Citrino.webp",
                    "assets/modelos/CASA CITRINO/Terraza de casa en venta Tecámac Estado de México - Citrino.webp",
                    "assets/modelos/CASA CITRINO/baño de casa en venta Tecámac Estado de México - Citrino.webp",
                    "assets/modelos/CASA CITRINO/Citrino-Planta Baja-1.webp",
                    "assets/modelos/CASA CITRINO/Citrino-Nivel 1.webp",
                    "assets/modelos/CASA CITRINO/Citrino-Nivel 2.webp"
                ],
                "caracteristicas": [
                    "Cajón de Estacionamiento",
                    "Cuarto de Servicio con Boiler y Lavadero",
                    "Cocina Integral (según promoción)",
                    "Closet incluído (según promoción)",
                    "Baño Equipado (según promoción)"
                ]
            }
        ],
        "amenidades": [
            {
                "icon": "🛝",
                "nombre": "Area recreativa infantil",
                "imagen": "assets/modelos/AMENIDADES/Area recreativa infantil.webp"
            },
            {
                "icon": "🚿",
                "nombre": "Baño equipado (según promoción)",
                "imagen": "assets/modelos/AMENIDADES/Baño equipado (según promoción).webp"
            },
            {
                "icon": "🏀",
                "nombre": "Canchas deportivas",
                "imagen": "assets/modelos/AMENIDADES/Canchas deportivas.webp"
            },
            {
                "icon": "🪟",
                "nombre": "Closet (según promoción)",
                "imagen": "assets/modelos/AMENIDADES/Closet (según promoción).jpeg"
            },
            {
                "icon": "🍳",
                "nombre": "Cocina Integral (según promoción)",
                "imagen": "assets/modelos/AMENIDADES/Cocina Integral (según promoción).jpeg"
            },
            {
                "icon": "🧺",
                "nombre": "Cuarto de servicio con boiler y lavadero",
                "imagen": "assets/modelos/AMENIDADES/Cuarto de servicio con boiler y lavadero.webp"
            },
            {
                "icon": "🏫",
                "nombre": "Escuelas al interior",
                "imagen": "assets/modelos/AMENIDADES/Escuelas al interior.PNG"
            },
            {
                "icon": "🍖",
                "nombre": "Espacios recreativos con asador",
                "imagen": "assets/modelos/AMENIDADES/Espacios recreativos con asador.jpeg"
            },
            {
                "icon": "🚗",
                "nombre": "Lugar de Estacionamiento",
                "imagen": "assets/modelos/AMENIDADES/Lugar de Estacionamiento.jpeg"
            },
            {
                "icon": "🗺️",
                "nombre": "Plano del Desarrollo",
                "imagen": "assets/modelos/AMENIDADES/Plano del Desarrollo.webp"
            },
            {
                "icon": "🍽️",
                "nombre": "Sala Comedor",
                "imagen": "assets/modelos/AMENIDADES/Sala  Comedor.jpg"
            }
        ],
        "cercania": {
            "hospitales": [
                {
                    "icon": "🏥",
                    "nombre": "Hospital General Regional No. 200 IMSS",
                    "distancia": "10 min",
                    "direccion": "Carretera Federal México-Pachuca KM 42",
                    "coords": "19.6505,-98.9497"
                },
                {
                    "icon": "🏥",
                    "nombre": "Hospital Polanco Tecámac",
                    "distancia": "12 min",
                    "direccion": "Ojo de Agua, Tecámac",
                    "coords": "19.6358,-98.9558"
                },
                {
                    "icon": "🏥",
                    "nombre": "Hospitales Antara — Unidad Tecámac",
                    "distancia": "18 min",
                    "direccion": "Tecámac",
                    "coords": "19.7143,-98.9688"
                },
                {
                    "icon": "🏥",
                    "nombre": "Clínica ISSSTE Héroes Tecámac",
                    "distancia": "20 min",
                    "direccion": "Los Héroes Tecámac",
                    "coords": "19.6254,-99.0178"
                },
                {
                    "icon": "🏥",
                    "nombre": "Clínica ISSSTE Juana Belén Gutiérrez Chávez",
                    "distancia": "25 min",
                    "direccion": "Santo Tomás Chiconautla",
                    "coords": "19.6078,-99.0204"
                },
                {
                    "icon": "🏥",
                    "nombre": "Centro Médico Nuevo Mundo",
                    "distancia": "14 min",
                    "direccion": "Tecámac",
                    "coords": "19.7118,-98.9756"
                },
                {
                    "icon": "🏥",
                    "nombre": "Médica de Especialidades Tecámac (MET)",
                    "distancia": "16 min",
                    "direccion": "Tecámac",
                    "coords": "19.7042,-98.9701"
                }
            ],
            "plazas_comerciales": [
                {
                    "icon": "🛒",
                    "nombre": "Multiplaza Ojo de Agua",
                    "distancia": "12 min",
                    "direccion": "Ave. Santa Cruz Ojo de Agua No. 88",
                    "coords": "19.6330,-98.9612"
                },
                {
                    "icon": "🛒",
                    "nombre": "Tecámac Power Center",
                    "distancia": "14 min",
                    "direccion": "Tecámac",
                    "coords": "19.7134,-98.9680"
                },
                {
                    "icon": "🛒",
                    "nombre": "Pabellón Tecámac",
                    "distancia": "16 min",
                    "direccion": "Tecámac",
                    "coords": "19.7096,-98.9647"
                },
                {
                    "icon": "🛒",
                    "nombre": "Sam's Club Tecámac",
                    "distancia": "14 min",
                    "direccion": "Tecámac",
                    "coords": "19.7120,-98.9693"
                },
                {
                    "icon": "🛒",
                    "nombre": "Chedraui Tecámac",
                    "distancia": "13 min",
                    "direccion": "Tecámac",
                    "coords": "19.7089,-98.9694"
                },
                {
                    "icon": "🛒",
                    "nombre": "Plaza Patio Tecámac",
                    "distancia": "18 min",
                    "direccion": "Tecámac",
                    "coords": "19.7152,-98.9715"
                },
                {
                    "icon": "🛒",
                    "nombre": "Macroplaza Los Héroes",
                    "distancia": "22 min",
                    "direccion": "Los Héroes Tecámac",
                    "coords": "19.6268,-99.0142"
                }
            ],
            "escuelas": [
                {
                    "icon": "🎓",
                    "nombre": "CECyTEM Tecámac",
                    "distancia": "12 min",
                    "direccion": "Tecámac",
                    "coords": "19.7050,-98.9720"
                },
                {
                    "icon": "🎓",
                    "nombre": "Innova Schools Ojo de Agua",
                    "distancia": "8 min",
                    "direccion": "Ojo de Agua, Tecámac",
                    "coords": "19.6340,-98.9590"
                },
                {
                    "icon": "🎓",
                    "nombre": "Secundaria General Hacienda del Bosque",
                    "distancia": "2 min",
                    "direccion": "Dentro del fraccionamiento",
                    "coords": "19.6280,-98.9680"
                },
                {
                    "icon": "🎓",
                    "nombre": "Colegio Vallarta",
                    "distancia": "10 min",
                    "direccion": "Ojo de Agua (preescolar a preparatoria)",
                    "coords": "19.6316,-98.9600"
                },
                {
                    "icon": "🎓",
                    "nombre": "Liceo México Americano",
                    "distancia": "12 min",
                    "direccion": "Ojo de Agua",
                    "coords": "19.6350,-98.9550"
                }
            ],
            "universidades": [
                {
                    "icon": "🎓",
                    "nombre": "Universidad Politécnica de Tecámac (UPT)",
                    "distancia": "10 min",
                    "direccion": "Tecámac",
                    "coords": "19.6987,-98.9738"
                },
                {
                    "icon": "🎓",
                    "nombre": "Universidad Von Newman",
                    "distancia": "13 min",
                    "direccion": "Ojo de Agua, Tecámac",
                    "coords": "19.6412,-98.9545"
                },
                {
                    "icon": "🎓",
                    "nombre": "Universidad Mexiquense del Bicentenario (UMB) — Campus Tecámac",
                    "distancia": "22 min",
                    "direccion": "Los Héroes Tecámac",
                    "coords": "19.6253,-99.0175"
                },
                {
                    "icon": "🎓",
                    "nombre": "Centro de Estudios Superiores Felipe Villanueva — Plantel Ojo de Agua",
                    "distancia": "9 min",
                    "direccion": "Ojo de Agua",
                    "coords": "19.6330,-98.9610"
                }
            ],
            "accesos_viales": [
                {
                    "icon": "🛣️",
                    "nombre": "Carretera Libre México-Pachuca",
                    "distancia": "2 min",
                    "descripcion": "Acceso directo desde el desarrollo",
                    "coords": "19.6290,-98.9670"
                },
                {
                    "icon": "🛣️",
                    "nombre": "Autopista México-Pachuca (cuota)",
                    "distancia": "7 min",
                    "descripcion": "Caseta Ojo de Agua",
                    "coords": "19.6380,-98.9530"
                },
                {
                    "icon": "🛣️",
                    "nombre": "Circuito Exterior Mexiquense",
                    "distancia": "12 min",
                    "descripcion": "Conexión AIFA, Querétaro, Puebla",
                    "coords": "19.6540,-98.9390"
                },
                {
                    "icon": "🛣️",
                    "nombre": "Libramiento Tultepec-AIFA-Pirámides",
                    "distancia": "15 min",
                    "descripcion": "Conecta Tecámac, AIFA, Autopista México-Querétaro y Av. Morelos San Cristóbal",
                    "coords": "19.6600,-98.9250"
                },
                {
                    "icon": "✈️",
                    "nombre": "Aeropuerto Internacional Felipe Ángeles (AIFA)",
                    "distancia": "25 min",
                    "descripcion": "Acceso vía libramiento o carretera libre",
                    "coords": "19.7381,-99.0721"
                },
                {
                    "icon": "🚌",
                    "nombre": "Estación Mexibús Línea 1 — Ojo de Agua",
                    "distancia": "7 min",
                    "descripcion": "Ruta Ciudad Azteca ↔ Ojo de Agua ↔ AIFA",
                    "coords": "19.6335,-98.9580"
                }
            ]
        }
    },

    // 2. Precios Históricos (from precios-historicos.json)
    precios: {
        "shf_tecamac": {
            "descripcion": "Índice SHF de Precios de Vivienda - Tecámac / Estado de México",
            "fuente": "Sociedad Hipotecaria Federal (SHF)",
            "crecimiento_anual_porcentaje": {
                "2015": 6.77,
                "2016": 6.50,
                "2017": 7.10,
                "2018": 6.80,
                "2019": 5.90,
                "2020": 5.10,
                "2021": 5.50,
                "2022": 6.20,
                "2023": 5.40,
                "2024": 5.20,
                "2025": 5.20
            },
            "promedio_10_anios": 5.97
        },
        "banxico_inflacion": {
            "descripcion": "Inflación anual México - Banco de México",
            "fuente": "Banxico / INEGI",
            "tasa_anual_porcentaje": {
                "2015": 2.13,
                "2016": 3.36,
                "2017": 6.77,
                "2018": 4.83,
                "2019": 2.83,
                "2020": 3.15,
                "2021": 7.36,
                "2022": 7.82,
                "2023": 4.66,
                "2024": 4.40,
                "2025": 3.10
            },
            "promedio_10_anios": 4.58
        },
        "propiedades_tecamac": {
            "descripcion": "Precio medio casas en Tecámac - propiedades.com",
            "fuente": "propiedades.com",
            "precio_medio_mxn": {
                "2020": 580000,
                "2021": 620000,
                "2022": 680000,
                "2023": 730000,
                "2024": 783000,
                "2025": 850000
            }
        },
        "escenarios_proyeccion": {
            "conservador": {
                "nombre": "Conservador (Inflación Banxico)",
                "tasa_anual": 3.5,
                "descripcion": "Basado en la meta de inflación de Banxico"
            },
            "moderado": {
                "nombre": "Moderado (Promedio SHF Zona)",
                "tasa_anual": 5.2,
                "descripcion": "Basado en el índice SHF para la Zona Metropolitana del Valle de México"
            },
            "optimista": {
                "nombre": "Optimista (Plusvalía Tecámac)",
                "tasa_anual": 6.5,
                "descripcion": "Basado en la plusvalía histórica específica de Tecámac (SHF)"
            }
        }
    },
    // 3. Fallback Data for Reports (from latest report)
    reportes: {
        "fecha_generacion": "2026-02-19T07:00:00.000Z",
        "periodo": "Últimos 30 días (20 ene - 18 feb 2026)",
        "total_campanas": 1,
        "total_anuncios": 3,
        "resumen": {
            "gasto_total": 328.93,
            "impresiones_totales": 11933,
            "clics_totales": 0,
            "leads_totales": 0,
            "mensajes_totales": 10
        },
        "campanas": [
            {
                "id": "campaign_1",
                "nombre": "Campaña Haciendas del Bosque",
                "estado": "ACTIVE",
                "objetivo": "MESSAGES",
                "presupuesto_diario": 50.00,
                "semaforo": "amarillo",
                "metricas": {
                    "impresiones": 11933,
                    "clics": 0,
                    "gasto": 328.93,
                    "cpc": 0,
                    "cpm": 27.57,
                    "ctr": 0,
                    "alcance": 8233,
                    "frecuencia": 1.45,
                    "leads": 0,
                    "mensajes": 10,
                    "link_clicks": 0,
                    "costo_por_resultado": 32.89
                },
                "anuncios": [
                    {
                        "id": "ad_fachada03",
                        "nombre": "Fachada03",
                        "estado": "ACTIVE",
                        "metricas": {
                            "impresiones": 11933,
                            "clics": 0,
                            "gasto": 328.93,
                            "cpc": 0,
                            "ctr": 0,
                            "alcance": 8233,
                            "leads": 0,
                            "mensajes": 10,
                            "costo_por_resultado": 32.89
                        }
                    }
                ]
            }
        ],
        "analisis_ia": "**Resumen Ejecutivo:** La campaña de Haciendas del Bosque tiene 1 campaña activa con objetivo de mensajes. Fachada03 es el único anuncio con resultados.\n\n**Recomendaciones:**\n1. 🟢 Considerar aumentar presupuesto para Fachada03."
    },
    // 4. Fallback Data for Creatives (Sample)
    creativos: {
        "semana": "2026-02-19",
        "anuncio_tecnico": {
            "copy": "🏡 ¡Tu nuevo hogar te espera en Tecámac! 🌳\n\nConoce Casa Esmeralda:\n✅ 3 Recámaras\n✅ 2.5 Baños\n✅ 2 Niveles\n✅ Seguridad 24/7\n\nDesde $1,336,000 MXN. Aceptamos Infonavit y Fovissste.\n\n📍 Ubicación privilegiada cerca del AIFA y centros comerciales.\n\n¡Agenda tu visita hoy mismo! 👇\n[Botón: Más informes]",
            "hashtags": ["#HaciendasDelBosque", "#CasaPropia", "#Infonavit", "#Tecamac", "#Edomex"],
            "prompt_imagen": "Fachada moderna de casa de 2 niveles con acabados blancos y detalles en gris, jardín frontal con pasto verde bien cuidado, iluminación cálida de atardecer, cielo naranja y dorado de fondo, estilo arquitectónico contemporáneo mexicano, fotografía de bienes raíces de alta calidad, lente gran angular, aspecto premium y aspiracional, proporción 4:5 para redes sociales."
        },
        "anuncio_sentimental": {
            "copy": "✨ Construye momentos inolvidables con tu familia. ✨\n\nImagina ver crecer a tus hijos en un entorno seguro, rodeado de naturaleza y con amenidades pensadas para ti.\n\nEn Haciendas del Bosque, no solo compras una casa, compras calidad de vida.\n\n❤️ Jardines y áreas de juegos\n❤️ Escuelas dentro del desarrollo\n❤️ Comunidad organizada\n\nDa el paso hoy. Tu familia lo merece. 👨‍👩‍👧‍👦",
            "hashtags": ["#FamiliaFeliz", "#HogarDulceHogar", "#CalidadDeVida", "#Seguridad", "#AmorDeFamilia"],
            "prompt_imagen": "Familia mexicana feliz de 4 integrantes jugando juntos en el jardín de un fraccionamiento residencial moderno al atardecer, árboles y pasto verde alrededor, ambiente cálido y emotivo, luz dorada de hora mágica, sonrisas auténticas, vibes de hogar seguro y feliz, estilo fotografía lifestyle editorial, fondo con casas del fraccionamiento difuminadas, proporción 4:5."
        },
        "anuncio_educativo": {
            "copy": "🤔 ¿Sabías que comprar casa es la inversión más segura? 📈\n\nDescubre por qué Tecámac es la zona con mayor plusvalía del Estado de México.\n\nDesliza para conocer los datos 👇",
            "hashtags": ["#TipsInmobiliarios", "#InversionInteligente", "#Plusvalia", "#BienesRaices"],
            "slides": [
                { "titulo": "1. Plusvalía Creciente", "texto": "El valor de las propiedades en Tecámac ha crecido un 5.2% anual en promedio." },
                { "titulo": "2. Conectividad", "texto": "El nuevo AIFA y la ampliación de autopistas han detonado el desarrollo de la zona." },
                { "titulo": "3. Infraestructura", "texto": "Hospitales, escuelas y centros comerciales a menos de 15 minutos." }
            ]
        },
        "anuncio_video": {
            "copy": "🎥 Recorrido Virtual: Casa Esmeralda\n\nEnamórate de cada rincón de tu próxima casa. Espacios amplios, iluminados y acabados de primera.\n\n¡Míralo completo! 👀\n\n#TourVirtual #CasaEsmeralda #HaciendasDelBosque",
            "guion_tecnico": "00:00 - Vista aérea del fraccionamiento Haciendas del Bosque al amanecer desde dron\n00:05 - Acercamiento lento a la fachada de Casa Esmeralda, énfasis en acabados modernos\n00:10 - Paneo de sala y comedor con familia sentada, luz natural entrando por ventanas\n00:18 - Recorrido rápido por cocina integral con acabados blancos\n00:24 - Recámara principal con vista amplia y clóset incluido\n00:30 - Jardín trasero con familia conviviendo, niños jugando\n00:38 - Amenidades del fraccionamiento: canchas, área infantil, seguridad\n00:45 - Texto final: Tu familia merece lo mejor - Desde $1,336,000 MXN con logo HDB\n00:50 - CTA: WhatsApp 55 3749 4034 + música de fondo motivacional",
            "prompt_video_ia": "Cinematic drone shot flying over a modern Mexican residential complex at golden hour, smooth camera movement gliding toward a two-story contemporary house with white facades and grey accents, lush green gardens, warm sunset lighting, 4K quality, real estate promotional video style, 30fps, wide angle lens, color grading: warm tones with slight desaturation, aspect ratio 9:16 for Reels/TikTok."
        }
    }
};
