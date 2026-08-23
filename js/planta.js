(() => {
    'use strict';

    // =========================================================
    // DATOS LOCALES DE LA PLANTA
    // =========================================================

    const cuidados = {
        Siembra: [
            {
                actividad: 'Preparar el suelo',
                frecuencia: 'Antes de sembrar',
                momento: 'Mañana',
                luna: 'Creciente',
                observaciones: 'Utilizar suelo fértil, aireado y bien drenado.'
            }
        ],

        Germinación: [
            {
                actividad: 'Riego',
                frecuencia: 'Regular',
                momento: 'Mañana',
                luna: 'Creciente',
                observaciones: 'Mantener humedad constante sin encharcar.'
            }
        ],

        Crecimiento: [
            {
                actividad: 'Fertilización',
                frecuencia: 'Cada 2 - 3 semanas',
                momento: 'Mañana',
                luna: 'Creciente',
                observaciones: 'Aportar nutrientes según las necesidades de la planta.'
            },
            {
                actividad: 'Poda',
                frecuencia: 'Según necesidad',
                momento: 'Mañana',
                luna: 'Menguante',
                observaciones: 'Retirar hojas dañadas y brotes innecesarios.'
            }
        ],

        Floración: [
            {
                actividad: 'Revisión de flores',
                frecuencia: 'Semanal',
                momento: 'Mañana',
                luna: 'Creciente',
                observaciones: 'Observar la formación de flores y posibles plagas.'
            }
        ],

        Fructificación: [
            {
                actividad: 'Riego',
                frecuencia: 'Regular',
                momento: 'Mañana o tarde',
                luna: 'Creciente',
                observaciones: 'Mantener estable la humedad del suelo.'
            }
        ],

        Cosecha: [
            {
                actividad: 'Recolección',
                frecuencia: 'Según maduración',
                momento: 'Mañana',
                luna: 'Menguante',
                observaciones: 'Recolectar los frutos cuando alcancen su madurez adecuada.'
            }
        ]
    };

    // =========================================================
    // CONFIGURACIÓN VISUAL
    // =========================================================

    const stageIcons = {
        Siembra: '🌱',
        Germinación: '🌿',
        Crecimiento: '🌿',
        Floración: '🌸',
        Fructificación: '🍅',
        Cosecha: '🧺'
    };

    const activityIcons = {
        'Preparar el suelo': '🌱',
        'Riego': '💧',
        'Fertilización': '🧪',
        'Poda': '✂️',
        'Revisión de flores': '🌸',
        'Recolección': '🧺'
    };

    // =========================================================
    // MOSTRAR LOS CUIDADOS DE UNA ETAPA
    // =========================================================

    function renderCareCards(stage) {
        const cardsContainer = document.getElementById('care-cards');
        const stageTitle = document.getElementById('care-stage-title');
        const stageIcon = document.getElementById('care-stage-icon');
        const stageCare = cuidados[stage] || [];

        if (!cardsContainer) {
            return;
        }

        if (stageTitle) {
            stageTitle.textContent = stage;
        }

        if (stageIcon) {
            stageIcon.textContent = stageIcons[stage] || '🌱';
        }

        cardsContainer.innerHTML = '';

        if (stageCare.length === 0) {
            cardsContainer.innerHTML = `
                <div class="care-empty">
                    No hay cuidados registrados para esta etapa.
                </div>
            `;
            return;
        }

        stageCare.forEach(care => {
            const card = document.createElement('article');
            const icon = activityIcons[care.actividad] || '🌱';

            card.className = 'care-card';

            card.innerHTML = `
                <div class="care-card-title">
                    <div class="care-card-icon">${icon}</div>
                    <h4>${care.actividad}</h4>
                </div>

                <div class="care-meta">
                    <div class="care-meta-item">
                        <span>Frecuencia</span>
                        <strong>${care.frecuencia}</strong>
                    </div>

                    <div class="care-meta-item">
                        <span>Momento</span>
                        <strong>☀️ ${care.momento}</strong>
                    </div>

                    <div class="care-meta-item">
                        <span>Luna</span>
                        <strong>🌙 ${care.luna}</strong>
                    </div>
                </div>

                <p class="care-observation">
                    <strong>💡 Recomendación:</strong>
                    ${care.observaciones}
                </p>
            `;

            cardsContainer.appendChild(card);
        });
    }

    // =========================================================
    // CAMBIAR ENTRE ETAPAS DE CRECIMIENTO
    // =========================================================

    function initGrowthStages() {
        const stages = document.querySelectorAll('.growth-stage');

        stages.forEach(stage => {
            stage.addEventListener('click', () => {
                stages.forEach(item => {
                    item.classList.remove('active');
                });

                stage.classList.add('active');
                renderCareCards(stage.dataset.stage);
            });
        });

        if (stages.length > 0) {
            renderCareCards(stages[0].dataset.stage);
        }
    }

    // =========================================================
    // INICIALIZACIÓN
    // =========================================================

    function init() {
        initGrowthStages();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
