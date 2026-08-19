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

    // Plantas que aparecerán como recomendadas según el mes.
    // Más adelante estos datos podrán venir desde Supabase.
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
    // CALCULAR LA ESTACIÓN DEL AÑO
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
    // CALCULAR LA FASE LUNAR
    // =========================================================

    function moonPhase(date) {
        const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
        const lunarCycle = 29.530588853;

        const days = (date.getTime() - knownNewMoon.getTime()) / 86400000;

        // Edad aproximada de la luna dentro del ciclo actual.
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
            age: age
        };
    }


    // =========================================================
    // MOSTRAR ESTACIÓN Y FASE LUNAR
    // =========================================================

    function renderCalendarInfo() {
        const now = new Date();

        const [currentSeason, seasonDescription] = season(now);
        const moon = moonPhase(now);

        document.getElementById('current-month').textContent =
            monthNames[now.getMonth()];

        document.getElementById('popular-month').textContent =
            monthNames[now.getMonth()];

        document.getElementById('season-name').textContent = currentSeason;
        document.getElementById('season-description').textContent = seasonDescription;

        document.getElementById('moon-name').textContent = moon.name;
        document.getElementById('moon-icon').textContent = moon.icon;

        document.getElementById('moon-description').textContent =
            'Ciclo lunar aproximado · día ' +
            Math.round(moon.age) +
            ' de 29.5';
    }


    // =========================================================
    // HORA Y CONSEJO DE JARDINERÍA
    // =========================================================

    function timeAdvice() {
        const now = new Date();

        const hour = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const timeElement = document.getElementById('current-time');

        timeElement.textContent = [hour, minutes, seconds]
            .map(value => String(value).padStart(2, '0'))
            .join(':');

        timeElement.dateTime = now.toISOString();

        let period;
        let advice;

        // Mañana temprana.
        if (hour >= 5 && hour < 8) {
            period = 'Mañana';
            advice =
                'El sol aún es suave. Revisa la humedad del suelo y riega temprano para reducir la evaporación.';
        }

        // Mañana.
        else if (hour >= 8 && hour < 12) {
            period = 'Mañana';
            advice =
                'Con luz creciente, revisa hojas y tallos. Retira hojas dañadas y observa señales tempranas de plagas.';
        }

        // Mediodía.
        else if (hour >= 12 && hour < 17) {
            period = 'Mediodía';
            advice =
                'Evita trabajar intensamente el suelo bajo el calor. Mantén el acolchado y revisa que las plantas no sufran estrés hídrico.';
        }

        // Tarde.
        else if (hour >= 17 && hour < 20) {
            period = 'Tarde';
            advice =
                'Es un buen momento para revisar el huerto y, si hace falta, realizar un riego moderado cuando el calor haya disminuido.';
        }

        // Noche.
        else {
            period = 'Noche';
            advice =
                'Deja descansar el huerto. Observa la humedad y planifica las tareas de mañana en lugar de regar de más.';
        }

        // Obtener estación y fase lunar para personalizar el consejo.
        const [currentSeason] = season(now);
        const moon = moonPhase(now);

        if (currentSeason === 'Verano' && hour >= 8 && hour < 17) {
            advice +=
                ' En verano, prioriza conservar la humedad del suelo.';
        }

        if (currentSeason === 'Invierno' && hour < 8) {
            advice +=
                ' En invierno, evita regar cuando pueda producirse una helada.';
        }

        if (
            moon.name === 'Luna nueva' ||
            moon.name === 'Luna menguante'
        ) {
            advice +=
                ' Esta fase puede ser un buen momento para labores de mantenimiento y preparación.';
        }

        if (moon.name === 'Luna llena') {
            advice +=
                ' Observa especialmente el estado de las plantas y la humedad del suelo.';
        }

        document.getElementById('time-period').textContent = period;
        document.getElementById('garden-advice').textContent = advice;
    }


    // =========================================================
    // CARRUSEL DE PLANTAS
    // =========================================================

    function renderCarousel() {
        const month = new Date().getMonth() + 1;
        const plants = recommendedByMonth[month];
        const track = document.getElementById('plant-track');

        track.innerHTML = plants
            .map((plant, index) => `
                <article class="plant-card">
                    <div class="plant-card__image">
                        ${plantEmoji[index]}
                    </div>

                    <div class="plant-card__body">
                        <h3>${plant}</h3>
                        <p>
                            Recomendada para ${monthNames[month - 1]}.
                        </p>
                    </div>
                </article>
            `)
            .join('');

        const dots = document.getElementById('carousel-dots');

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

        // Botones de los indicadores.
        dots.querySelectorAll('.carousel-dot').forEach(button => {
            button.addEventListener('click', () => {
                carouselIndex = Number(button.dataset.slide);
                moveCarousel();
            });
        });

        // Botón anterior.
        document
            .getElementById('carousel-prev')
            .addEventListener('click', () => {
                carouselIndex =
                    (carouselIndex + plants.length - 1) % plants.length;

                moveCarousel();
            });

        // Botón siguiente.
        document
            .getElementById('carousel-next')
            .addEventListener('click', () => {
                carouselIndex =
                    (carouselIndex + 1) % plants.length;

                moveCarousel();
            });

        window.addEventListener('resize', moveCarousel);

        moveCarousel();
    }


    // Mover visualmente el carrusel.
    function moveCarousel() {
        const track = document.getElementById('plant-track');
        const card = track.querySelector('.plant-card');

        if (!card) {
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

        const maxIndex = Math.max(
            0,
            track.children.length - visibleCards
        );

        carouselIndex = Math.min(carouselIndex, maxIndex);

        track.style.transform =
            `translateX(-${carouselIndex * cardWidth}px)`;

        document
            .querySelectorAll('.carousel-dot')
            .forEach((dot, index) => {
                dot.classList.toggle(
                    'is-active',
                    index === carouselIndex
                );
            });
    }


    // =========================================================
    // TABLA DE PLANTAS POPULARES
    // =========================================================

    function renderPopular() {
        const tableBody = document.getElementById('popular-plants');

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

        // Actualizar la información dinámica cada segundo.
        setInterval(() => {
            timeAdvice();
            renderCalendarInfo();
        }, 1000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
