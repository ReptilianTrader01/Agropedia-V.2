/* ==================================================
   LÓGICA INICIAL DEL DASHBOARD

   Esta versión trabaja con datos de demostración.
   Posteriormente estos datos se sustituirán por consultas
   a Supabase y por las reglas de roles administrativas.
================================================== */

(function () {
    'use strict';

    const dashboardData = {
        stats: {
            users: 128,
            plants: 86,
            gardens: 47,
            learning: 32
        },

        trends: {
            users: '+14 este mes',
            plants: 'Contenido publicado',
            gardens: 'Actividad de usuarios',
            learning: 'Cursos, videos y documentos'
        },

        rankings: {
            month: [
                { name: 'Tomate', type: 'Planta más guardada', value: '248 favoritos' },
                { name: 'Cultivo básico', type: 'Curso', value: '184 inscripciones' },
                { name: 'Albahaca', type: 'Planta más consultada', value: '173 visitas' },
                { name: 'Preparar el suelo', type: 'Video', value: '149 reproducciones' },
                { name: 'Calendario de siembra', type: 'Documento', value: '96 accesos' }
            ],
            week: [
                { name: 'Tomate', type: 'Planta más guardada', value: '61 favoritos' },
                { name: 'Riego', type: 'Tema', value: '54 consultas' },
                { name: 'Cultivo básico', type: 'Curso', value: '48 inscripciones' },
                { name: 'Albahaca', type: 'Planta más consultada', value: '42 visitas' },
                { name: 'Suelo para huertos', type: 'Documento', value: '31 accesos' }
            ],
            year: [
                { name: 'Tomate', type: 'Planta más guardada', value: '1,284 favoritos' },
                { name: 'Cultivo básico', type: 'Curso', value: '962 inscripciones' },
                { name: 'Albahaca', type: 'Planta más consultada', value: '821 visitas' },
                { name: 'Suelo', type: 'Tema', value: '764 consultas' },
                { name: 'Guía del huerto', type: 'Documento', value: '532 accesos' }
            ]
        },

        activity: [
            { icon: '🌱', title: 'Nueva planta preparada', detail: 'La ficha de calabacita está lista para revisión.', time: 'Hace 18 min' },
            { icon: '👤', title: 'Nuevo usuario registrado', detail: 'Un nuevo usuario creó su cuenta en Agropedia.', time: 'Hace 42 min' },
            { icon: '🎓', title: 'Curso completado', detail: 'Un usuario completó Introducción al cultivo.', time: 'Hace 1 h' },
            { icon: '💬', title: 'Nuevo comentario', detail: 'Hay una reseña pendiente de moderación.', time: 'Hace 2 h' },
            { icon: '🪴', title: 'Nuevo huerto creado', detail: 'Se registró un nuevo huerto en Mi huerto.', time: 'Hace 3 h' }
        ]
    };

    function actualizarTexto(id, valor) {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor;
        }
    }

    function renderizarEstadisticas() {
        actualizarTexto('statUsers', dashboardData.stats.users.toLocaleString('es-MX'));
        actualizarTexto('statPlants', dashboardData.stats.plants.toLocaleString('es-MX'));
        actualizarTexto('statGardens', dashboardData.stats.gardens.toLocaleString('es-MX'));
        actualizarTexto('statLearning', dashboardData.stats.learning.toLocaleString('es-MX'));
        actualizarTexto('dashboardDate', new Intl.DateTimeFormat('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date()));
    }

    function renderizarRanking(periodo) {
        const contenedor = document.getElementById('rankingList');

        if (!contenedor) {
            return;
        }

        const datos = dashboardData.rankings[periodo] || dashboardData.rankings.month;

        contenedor.innerHTML = datos.map((item, indice) => `
            <div class="ranking-item">
                <span class="ranking-position">${indice + 1}</span>
                <div class="ranking-item__content">
                    <strong>${item.name}</strong>
                    <small>${item.type}</small>
                </div>
                <span class="ranking-value">${item.value}</span>
            </div>
        `).join('');
    }

    function renderizarActividad() {
        const contenedor = document.getElementById('activityList');

        if (!contenedor) {
            return;
        }

        contenedor.innerHTML = dashboardData.activity.map(item => `
            <div class="activity-item">
                <span class="activity-item__icon">${item.icon}</span>
                <div class="activity-item__content">
                    <strong>${item.title}</strong>
                    <small>${item.detail}</small>
                </div>
                <small>${item.time}</small>
            </div>
        `).join('');
    }

    function configurarAccionesRapidas() {
        document.querySelectorAll('.quick-action[data-target]').forEach(boton => {
            boton.addEventListener('click', () => {
                const objetivo = document.getElementById(boton.dataset.target);

                if (objetivo) {
                    objetivo.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    function configurarAccionesDemo() {
        document.querySelectorAll('[data-action="demo"]').forEach(boton => {
            boton.addEventListener('click', () => {
                const mensaje = document.createElement('div');
                mensaje.className = 'dashboard-toast';
                mensaje.textContent = 'Esta herramienta se conectará con Supabase en la siguiente fase.';

                document.body.appendChild(mensaje);

                requestAnimationFrame(() => {
                    mensaje.classList.add('is-visible');
                });

                window.setTimeout(() => {
                    mensaje.classList.remove('is-visible');
                    window.setTimeout(() => mensaje.remove(), 250);
                }, 2600);
            });
        });
    }

    function configurarFiltroPopularidad() {
        const selector = document.getElementById('popularityPeriod');

        if (!selector) {
            return;
        }

        selector.addEventListener('change', event => {
            renderizarRanking(event.target.value);
        });
    }

    function configurarActividad() {
        const boton = document.getElementById('showAllActivity');

        if (!boton) {
            return;
        }

        boton.addEventListener('click', () => {
            const actividad = document.getElementById('activityList');

            if (!actividad) {
                return;
            }

            actividad.classList.toggle('is-expanded');
            boton.textContent = actividad.classList.contains('is-expanded')
                ? 'Mostrar menos'
                : 'Ver todo';
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderizarEstadisticas();
        renderizarRanking('month');
        renderizarActividad();
        configurarAccionesRapidas();
        configurarAccionesDemo();
        configurarFiltroPopularidad();
        configurarActividad();
    });
})();
