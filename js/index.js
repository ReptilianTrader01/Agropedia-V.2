(() => {
    'use strict';

    // =========================================================
    // DATOS GENERALES
    // =========================================================

    const monthNames = [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre'
    ];

    const plantEmoji = ['🌱', '🥬', '🥕', '🌿', '🍅'];

    let carouselIndex = 0;
    let recentPlants = [];
    let recommendationData = null;

    // =========================================================
    // SEGURIDAD DE CONTENIDO
    // =========================================================

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    // =========================================================
    // ESTACIÓN
    // =========================================================

    function season(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();

        if (
            (month === 3 && day >= 20) ||
            (month > 3 && month < 6) ||
            (month === 6 && day < 21)
        ) {
            return [
                'Primavera',
                'Buen momento para renovar el suelo y comenzar nuevos cultivos.'
            ];
        }

        if (
            (month === 6 && day >= 21) ||
            (month > 6 && month < 9) ||
            (month === 9 && day < 23)
        ) {
            return [
                'Verano',
                'Prioriza el riego, el acolchado y la protección frente al calor.'
            ];
        }

        if (
            (month === 9 && day >= 23) ||
            (month > 9 && month < 12) ||
            (month === 12 && day < 21)
        ) {
            return [
                'Otoño',
                'Ideal para preparar el suelo y establecer cultivos de temporada fresca.'
            ];
        }

        return [
            'Invierno',
            'Protege los cultivos sensibles al frío y aprovecha para planear la próxima temporada.'
        ];
    }

    // =========================================================
    // FASE LUNAR
    // =========================================================

    function moonPhase(date) {
        const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
        const lunarCycle = 29.530588853;
        const days = (date.getTime() - knownNewMoon.getTime()) / 86400000;
        const age = ((days % lunarCycle) + lunarCycle) % lunarCycle;

        const names = [
            'Luna nueva',
            'Luna creciente',
            'Cuarto creciente',
            'Luna gibosa creciente',
            'Luna llena',
            'Luna gibosa menguante',
            'Cuarto menguante',
            'Luna menguante'
        ];

        const icons = [
            '●',
            '◔',
            '◑',
            '◕',
            '○',
            '◕',
            '◑',
            '◔'
        ];

        const phaseIndex = Math.floor((age / lunarCycle) * 8 + 0.5) % 8;

        return {
            name: names[phaseIndex],
            icon: icons[phaseIndex],
            age
        };
    }

    // =========================================================
    // INFORMACIÓN DE CALENDARIO
    // =========================================================

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function renderCalendarInfo() {
        const now = new Date();
        const [currentSeason, seasonDescription] = season(now);
        const moon = moonPhase(now);

        setText('current-month', monthNames[now.getMonth()]);
        setText('popular-month', monthNames[now.getMonth()]);

        setText('season-name', currentSeason);
        setText('season-description', seasonDescription);
        setText('moon-name', moon.name);
        setText('moon-icon', moon.icon);
        setText(
            'moon-description',
            'Ciclo lunar aproximado · día ' + Math.round(moon.age) + ' de 29.5'
        );
    }

    // =========================================================
    // HORA Y CONSEJO
    // =========================================================

    function timeAdvice() {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const timeElement = document.getElementById('current-time');

        if (!timeElement) {
            return;
        }

        timeElement.textContent = [hour, minutes, seconds]
            .map(value => String(value).padStart(2, '0'))
            .join(':');

        timeElement.dateTime = now.toISOString();

        let period;
        let advice;

        if (hour >= 5 && hour < 8) {
            period = 'Mañana';
            advice = 'El sol aún es suave. Revisa la humedad del suelo y riega temprano para reducir la evaporación.';
        } else if (hour >= 8 && hour < 12) {
            period = 'Mañana';
            advice = 'Con luz creciente, revisa hojas y tallos. Retira hojas dañadas y observa señales tempranas de plagas.';
        } else if (hour >= 12 && hour < 17) {
            period = 'Mediodía';
            advice = 'Evita trabajar intensamente el suelo bajo el calor. Mantén el acolchado y revisa que las plantas no sufran estrés hídrico.';
        } else if (hour >= 17 && hour < 20) {
            period = 'Tarde';
            advice = 'Es un buen momento para revisar el huerto y, si hace falta, realizar un riego moderado cuando el calor haya disminuido.';
        } else {
            period = 'Noche';
            advice = 'Deja descansar el huerto. Observa la humedad y planifica las tareas de mañana en lugar de regar de más.';
        }

        const [currentSeason] = season(now);
        const moon = moonPhase(now);

        if (currentSeason === 'Verano' && hour >= 8 && hour < 17) {
            advice += ' En verano, prioriza conservar la humedad del suelo.';
        }

        if (currentSeason === 'Invierno' && hour < 8) {
            advice += ' En invierno, evita regar cuando pueda producirse una helada.';
        }

        if (moon.name === 'Luna nueva' || moon.name === 'Luna menguante') {
            advice += ' Esta fase puede ser un buen momento para labores de mantenimiento y preparación.';
        }

        if (moon.name === 'Luna llena') {
            advice += ' Observa especialmente el estado de las plantas y la humedad del suelo.';
        }

        setText('time-period', period);
        setText('garden-advice', advice);
    }

    // =========================================================
    // CARGA REAL DE PLANTAS
    // =========================================================

    async function loadPlants() {
        const { data, error } = await agropediaSupabase
            .from('plantas')
            .select('id,nombre_comun,nombre_cientifico,descripcion,imagen_url,tipo_cultivo,created_at')
            .order('created_at', { ascending: false })
            .limit(15);

        if (error) {
            console.error('Error al cargar plantas del inicio:', error);
            recentPlants = [];
            renderCarousel();
            renderPopular();
            return;
        }

        recentPlants = data || [];
        renderPopular();
        await loadRecommendations();
    }

    // =========================================================
    // RECOMENDACIONES
    // =========================================================

    async function loadRecommendations() {
        try {
            recommendationData = await window.agropediaRecommendations.getRecommendations();
            renderRecommendations();
        } catch (error) {
            console.error('Error al cargar recomendaciones:', error);
            recommendationData = null;
            renderRecommendationError();
        }
    }

    function renderRecommendations() {
        const track = document.getElementById('plant-track');
        const dots = document.getElementById('carousel-dots');
        const context = document.getElementById('recommendation-context');
        const eyebrow = document.getElementById('recommendation-eyebrow');

        if (!track || !dots) return;

        if (eyebrow) {
            eyebrow.textContent = recommendationData.mode === 'cold-start'
                ? 'Para empezar'
                : 'Personalizadas';
        }

        if (context) {
            const messages = [];

            if (recommendationData.description) {
                messages.push(recommendationData.description);
            }

            if (recommendationData.invitation) {
                messages.push(recommendationData.invitation);
            }

            context.innerHTML = messages
                .map(message => '<p>' + escapeHtml(message) + '</p>')
                .join('');
        }

        const plants = recommendationData.plants || [];

        if (!plants.length) {
            track.innerHTML = '<p class="loading-plants">No encontramos plantas para mostrar en este momento.</p>';
            dots.innerHTML = '';
            return;
        }

        track.innerHTML = plants
            .map((plant, index) => {
                const name = escapeHtml(plant.nombre_comun || 'Planta sin nombre');
                const scientific = escapeHtml(plant.nombre_cientifico || '');
                const reason = escapeHtml(
                    plant.recommendationReason || 'Forma parte del catálogo disponible para explorar.'
                );
                const image = escapeHtml(plant.imagen_url || 'assets/images/logo.png');

                return '<article class="plant-card">' +
                    '<a href="planta.html?id=' + encodeURIComponent(plant.id) + '" class="plant-card__link">' +
                        '<div class="plant-card__image">' +
                            '<img src="' + image + '" alt="' + name + '" loading="lazy">' +
                        '</div>' +
                        '<div class="plant-card__body">' +
                            '<h3>' + name + '</h3>' +
                            '<p>' + (scientific || 'Información botánica') + '</p>' +
                            '<p class="plant-card__reason">' + reason + '</p>' +
                        '</div>' +
                    '</a>' +
                '</article>';
            })
            .join('');

        track.querySelectorAll('img').forEach(image => {
            image.addEventListener('error', event => {
                event.target.src = 'assets/images/logo.png';
            });
        });

        carouselIndex = 0;

        dots.innerHTML = plants
            .map((_, index) =>
                '<button class="carousel-dot ' + (index === 0 ? 'is-active' : '') +
                '" type="button" aria-label="Mostrar recomendación ' + (index + 1) +
                '" data-slide="' + index + '"></button>'
            )
            .join('');

        dots.querySelectorAll('.carousel-dot').forEach(button => {
            button.addEventListener('click', () => {
                carouselIndex = Number(button.dataset.slide);
                moveCarousel();
            });
        });

        const previous = document.getElementById('carousel-prev');
        const next = document.getElementById('carousel-next');

        if (previous) {
            previous.onclick = () => {
                carouselIndex = (carouselIndex + plants.length - 1) % plants.length;
                moveCarousel();
            };
        }

        if (next) {
            next.onclick = () => {
                carouselIndex = (carouselIndex + 1) % plants.length;
                moveCarousel();
            };
        }

        moveCarousel();
    }

    function renderRecommendationError() {
        const track = document.getElementById('plant-track');
        const dots = document.getElementById('carousel-dots');
        const context = document.getElementById('recommendation-context');

        if (track) {
            track.innerHTML = '<p class="loading-plants">No pudimos cargar las recomendaciones. Inténtalo nuevamente más tarde.</p>';
        }

        if (dots) {
            dots.innerHTML = '';
        }

        if (context) {
            context.innerHTML = '<p>Las recomendaciones dependen de la información disponible en Agropedia.</p>';
        }
    }

    // =========================================================
    // =========================================================
    // TABLA DE 10 PLANTAS POPULARES
    // =========================================================

    function renderPopular() {
        const tableBody = document.getElementById('popular-plants');

        if (!tableBody) {
            return;
        }

        // Se utiliza un segundo bloque distinto del mismo resultado ordenado
        // por created_at. No se calcula ni se simula una métrica de popularidad.
        const plants = recentPlants.slice(5, 15);

        if (!plants.length) {
            tableBody.innerHTML = '<tr><td colspan="4">No hay suficientes plantas registradas todavía.</td></tr>';
            return;
        }

        tableBody.innerHTML = plants
            .map((plant, index) => {
                const name = escapeHtml(plant.nombre_comun || 'Planta sin nombre');
                const type = escapeHtml(plant.tipo_cultivo || '—');

                return '<tr>' +
                    '<td>' + (index + 1) + '</td>' +
                    '<td>' + name + '</td>' +
                    '<td>' + type + '</td>' +
                    '<td>—</td>' +
                    '</tr>';
            })
            .join('');
    }

    // =========================================================
    // INICIALIZACIÓN
    // =========================================================

    function init() {
        renderCalendarInfo();
        timeAdvice();
        loadPlants();

        window.addEventListener('resize', moveCarousel);

        setInterval(() => {
            timeAdvice();
            renderCalendarInfo();
        }, 1000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();