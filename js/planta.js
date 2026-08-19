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
    // MOSTRAR LOS CUIDADOS DE UNA ETAPA
    // =========================================================

    function renderCareTable(stage) {
        const tableBody = document.getElementById('care-table-body');
        const stageCare = cuidados[stage] || [];

        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = '';

        stageCare.forEach(care => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${stage}</td>
                <td>${care.actividad}</td>
                <td>${care.frecuencia}</td>
                <td>${care.momento}</td>
                <td>🌙 ${care.luna}</td>
                <td>${care.observaciones}</td>
            `;

            tableBody.appendChild(row);
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
                renderCareTable(stage.dataset.stage);
            });
        });

        if (stages.length > 0) {
            renderCareTable(stages[0].dataset.stage);
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
