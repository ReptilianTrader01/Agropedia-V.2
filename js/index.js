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

    const recommendedByMonth = {
        1: ['Lechuga', 'Zanahoria', 'Rábano', 'Espinaca', 'Cilantro'],
        2: ['Jitomate', 'Lechuga', 'Zanahoria', 'Rábano', 'Cilantro'],
        3: ['Jitomate', 'Pepino', 'Calabacita', 'Albahaca', 'Frijol'],
        4: ['Jitomate', 'Pepino', 'Calabacita', 'Chile', 'Albahaca'],
        5: ['Pepino', 'Calabacita', 'Chile', 'Frijol', 'Albahaca'],
        6: ['Pepino', 'Calabacita', 'Frijol', 'Maíz', 'Chile'],
        7: ['Jitomate', 'Pepino', 'Frijol', 'Chile', 'Albahaca'],
        8: ['Jitomate', 'Lechuga', 'Rábano', 'Cilantro', 'Zanahoria'],
        9: ['Lechuga', 'Espinaca', 'Rábano', 'Zanahoria', 'Cilantro'],
        10: ['Lechuga', 'Espinaca', 'Zanahoria', 'Rábano', 'Ajo'],
        11: ['Espinaca', 'Lechuga', 'Zanahoria', 'Rábano', 'Ajo'],
        12: ['Lechuga', 'Espinaca', 'Cilantro', 'Rábano', 'Zanahoria']
    };

    const plantEmoji = ['🌱', '🥬', '🥕', '🌿', '🍅'];

    let carouselIndex = 0;

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

        // current-month es opcional: algunas versiones del diseño no lo usan.
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
    // CARRUSEL DE PLANTAS RECOMENDADAS
    // =========================================================

    function renderCarousel() {
        const month = new Date().getMonth() + 1;
        const plants = recommendedByMonth[month] || [];
        const track = document.getElementById('plant-track');
        const dots = document.getElementById('carousel-dots');

        if (!track || !dots) {
            return;
        }

        track.innerHTML = plants
            .map((plant, index) => `
                <article class="plant-card">
                    <div class="plant-card__image">
                        ${plantEmoji[index % plantEmoji.length]}
                    </div>

                    <div class="plant-card__body">
                        <h3>${plant}</h3>
                        <p>Recomendada para ${monthNames[month - 1]}.</p>
                    </div>
                </article>
            `)
            .join('');

        dots.innerHTML = plants
            .map((_, index) => `
                <button
                    class="carousel-dot ${index === 0 ? 'is-active' : ''}"
                    type="button"
                    aria-label="Mostrar planta ${index + 1}"
                    data-slide="${index}">
                </button>
            `)
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
            previous.addEventListener('click', () => {
                carouselIndex = (carouselIndex + plants.length - 1) % plants.length;
                moveCarousel();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                carouselIndex = (carouselIndex + 1) % plants.length;
                moveCarousel();
            });
        }

        window.addEventListener('resize', moveCarousel);
        moveCarousel();
    }

    function moveCarousel() {
        const track = document.getElementById('plant-track');
        const card = track?.querySelector('.plant-card');

        if (!track || !card) {
            return;
        }

        const gap = 18;
        const cardWidth = card.getBoundingClientRect().width + gap;

        const visibleCards =
            window.innerWidth <= 650
                ? 1
                : window.innerWidth <= 900
                    ? 3
                    : 5;

        const maxIndex = Math.max(0, track.children.length - visibleCards);
        carouselIndex = Math.min(carouselIndex, maxIndex);

        track.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;

        document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('is-active', index === carouselIndex);
        });
    }

    // =========================================================
    // TABLA DE 10 PLANTAS POPULARES
    // =========================================================

    function renderPopular() {
        const tableBody = document.getElementById('popular-plants');

        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = Array.from(
            { length: 10 },
            (_, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>Por definir</td>
                    <td>—</td>
                    <td>—</td>
                </tr>
            `
        ).join('');
    }

    // =========================================================
    // INICIALIZACIÓN
    // =========================================================

    function init() {
        renderCalendarInfo();
        timeAdvice();
        renderCarousel();
        renderPopular();

        setInterval(() => {
            timeAdvice();
            renderCalendarInfo();
        }, 1000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
