/* ==================================================
   CATALOGO.HTML - JAVASCRIPT
   Catálogo dinámico por tipo de aprendizaje.
   V2 sin base de datos.
================================================== */

'use strict';

/* ==================================================
   CONFIGURACIÓN DEL CATÁLOGO
================================================== */

const catalogTypes = {
    cursos: {
        title: 'Cursos',
        heading: 'Todos los cursos',
        icon: '🎓',
        phrase: 'Avanza a tu ritmo y convierte cada aprendizaje en experiencia.'
    },
    videos: {
        title: 'Videos',
        heading: 'Todos los videos',
        icon: '🎥',
        phrase: 'Aprende viendo, observando y llevando cada idea a la práctica.'
    },
    documentos: {
        title: 'Documentos',
        heading: 'Todos los documentos',
        icon: '📚',
        phrase: 'Consulta material de estudio para profundizar cuando lo necesites.'
    }
};

const topics = [
    { slug: 'cultivo', name: 'Cultivo' },
    { slug: 'suelo', name: 'Suelo' },
    { slug: 'riego', name: 'Riego' },
    { slug: 'plagas', name: 'Plagas' },
    { slug: 'hongos', name: 'Hongos' },
    { slug: 'enfermedades', name: 'Enfermedades' },
    { slug: 'cosecha', name: 'Cosecha' },
    { slug: 'temporadas', name: 'Temporadas' },
    { slug: 'luna', name: 'Luna' },
    { slug: 'compostaje', name: 'Compostaje' },
    { slug: 'semillas', name: 'Semillas' },
    { slug: 'poda', name: 'Poda' },
    { slug: 'huerto-ecologico', name: 'Huerto ecológico' }
];

/* ==================================================
   CONTENIDO DE DEMOSTRACIÓN
================================================== */

const catalogContent = [
    {
        type: 'cursos',
        title: 'Inicia tu primer huerto',
        description: 'Planifica el espacio, prepara el terreno y conoce los primeros pasos para comenzar.',
        icon: '🌱',
        topics: ['cultivo', 'huerto-ecologico'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'media',
        durationLabel: '2 h',
        meta: '6 lecciones · 2 h'
    },
    {
        type: 'cursos',
        title: 'Fundamentos del suelo',
        description: 'Comprende textura, estructura, materia orgánica y nutrientes esenciales.',
        icon: '🌍',
        topics: ['suelo', 'compostaje'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'larga',
        durationLabel: '3 h',
        meta: '8 lecciones · 3 h'
    },
    {
        type: 'cursos',
        title: 'Cultiva tus hortalizas',
        description: 'Conoce las bases para producir hortalizas de forma ordenada y saludable.',
        icon: '🥕',
        topics: ['cultivo', 'semillas', 'cosecha'],
        difficulty: 'intermedio',
        difficultyLabel: 'Intermedio',
        duration: 'larga',
        durationLabel: '4 h',
        meta: '10 lecciones · 4 h'
    },
    {
        type: 'cursos',
        title: 'Riego para principiantes',
        description: 'Aprende a organizar el riego y reconocer cuándo tus plantas necesitan agua.',
        icon: '💧',
        topics: ['riego'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'corta',
        durationLabel: '1.5 h',
        meta: '5 lecciones · 1.5 h'
    },
    {
        type: 'cursos',
        title: 'Huerto ecológico',
        description: 'Construye un sistema de cultivo más sostenible y responsable.',
        icon: '♻️',
        topics: ['huerto-ecologico', 'compostaje', 'suelo'],
        difficulty: 'intermedio',
        difficultyLabel: 'Intermedio',
        duration: 'larga',
        durationLabel: '3 h',
        meta: '7 lecciones · 3 h'
    },
    {
        type: 'cursos',
        title: 'Prevención de plagas y enfermedades',
        description: 'Aprende a detectar problemas y establecer medidas preventivas.',
        icon: '🐛',
        topics: ['plagas', 'enfermedades', 'hongos'],
        difficulty: 'avanzado',
        difficultyLabel: 'Avanzado',
        duration: 'larga',
        durationLabel: '4.5 h',
        meta: '12 lecciones · 4.5 h'
    },
    {
        type: 'videos',
        title: 'Cómo preparar un bancal',
        description: 'Pasos básicos para preparar correctamente un espacio de cultivo.',
        icon: '🪴',
        topics: ['cultivo', 'suelo'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'corta',
        durationLabel: '8 min',
        meta: 'Video · 8 min'
    },
    {
        type: 'videos',
        title: 'Cómo hacer compost',
        description: 'Convierte residuos orgánicos en materia útil para mejorar el suelo.',
        icon: '♻️',
        topics: ['compostaje', 'suelo'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'corta',
        durationLabel: '12 min',
        meta: 'Video · 12 min'
    },
    {
        type: 'videos',
        title: 'Reconoce las plagas comunes',
        description: 'Aprende a identificar señales de insectos y otros organismos dañinos.',
        icon: '🐛',
        topics: ['plagas'],
        difficulty: 'intermedio',
        difficultyLabel: 'Intermedio',
        duration: 'corta',
        durationLabel: '10 min',
        meta: 'Video · 10 min'
    },
    {
        type: 'videos',
        title: 'Errores frecuentes al regar',
        description: 'Conoce los errores más comunes y cómo evitarlos en tu huerto.',
        icon: '💧',
        topics: ['riego'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'corta',
        durationLabel: '9 min',
        meta: 'Video · 9 min'
    },
    {
        type: 'videos',
        title: 'Cosecha en el momento correcto',
        description: 'Identifica las señales que indican que tus cultivos están listos.',
        icon: '🧺',
        topics: ['cosecha'],
        difficulty: 'intermedio',
        difficultyLabel: 'Intermedio',
        duration: 'corta',
        durationLabel: '9 min',
        meta: 'Video · 9 min'
    },
    {
        type: 'videos',
        title: 'Introducción a la poda',
        description: 'Conoce las herramientas y cortes básicos para cuidar tus plantas.',
        icon: '✂️',
        topics: ['poda'],
        difficulty: 'intermedio',
        difficultyLabel: 'Intermedio',
        duration: 'corta',
        durationLabel: '11 min',
        meta: 'Video · 11 min'
    },
    {
        type: 'documentos',
        title: 'Guía básica del suelo',
        description: 'Conceptos esenciales sobre nutrientes, textura, estructura y materia orgánica.',
        icon: '📄',
        topics: ['suelo'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'media',
        durationLabel: '18 páginas',
        meta: 'PDF · 18 páginas'
    },
    {
        type: 'documentos',
        title: 'Calendario de siembra',
        description: 'Referencia general para organizar cultivos durante las diferentes temporadas.',
        icon: '📅',
        topics: ['temporadas', 'semillas', 'cultivo'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'media',
        durationLabel: '12 páginas',
        meta: 'PDF · 12 páginas'
    },
    {
        type: 'documentos',
        title: 'Manual de compostaje doméstico',
        description: 'Material de consulta para iniciar y mantener tu propio compost.',
        icon: '📚',
        topics: ['compostaje'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'media',
        durationLabel: '22 páginas',
        meta: 'PDF · 22 páginas'
    },
    {
        type: 'documentos',
        title: 'Identificación de enfermedades',
        description: 'Guía visual para reconocer síntomas frecuentes y saber cuándo actuar.',
        icon: '🔎',
        topics: ['enfermedades', 'hongos', 'plagas'],
        difficulty: 'intermedio',
        difficultyLabel: 'Intermedio',
        duration: 'larga',
        durationLabel: '26 páginas',
        meta: 'PDF · 26 páginas'
    },
    {
        type: 'documentos',
        title: 'Luna y prácticas de jardinería',
        description: 'Documento introductorio sobre fases lunares y prácticas tradicionales de cultivo.',
        icon: '🌙',
        topics: ['luna', 'temporadas'],
        difficulty: 'intermedio',
        difficultyLabel: 'Intermedio',
        duration: 'media',
        durationLabel: '14 páginas',
        meta: 'PDF · 14 páginas'
    },
    {
        type: 'documentos',
        title: 'Cuaderno del jardinero',
        description: 'Plantillas para registrar siembras, riegos, cuidados y cosechas.',
        icon: '📓',
        topics: ['cultivo', 'riego', 'cosecha'],
        difficulty: 'principiante',
        difficultyLabel: 'Principiante',
        duration: 'media',
        durationLabel: '15 páginas',
        meta: 'PDF · 15 páginas'
    }
];

/* ==================================================
   ELEMENTOS
================================================== */

const catalogTitle = document.getElementById('catalogTitle');
const catalogPhrase = document.getElementById('catalogPhrase');
const catalogIcon = document.getElementById('catalogIcon');
const catalogHeading = document.getElementById('catalogHeading');

const catalogSearch = document.getElementById('catalogSearch');
const clearCatalogSearch = document.getElementById('clearCatalogSearch');
const topicFilter = document.getElementById('topicFilter');
const difficultyFilter = document.getElementById('difficultyFilter');
const durationFilter = document.getElementById('durationFilter');
const resetCatalogFilters = document.getElementById('resetCatalogFilters');
const catalogResultsMessage = document.getElementById('catalogResultsMessage');

const catalogGrid = document.getElementById('catalogGrid');
const catalogEmpty = document.getElementById('catalogEmpty');
const emptyResetButton = document.getElementById('emptyResetButton');

/* ==================================================
   TIPO SELECCIONADO
================================================== */

function getSelectedType() {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get('tipo');

    if (requestedType && catalogTypes[requestedType]) {
        return requestedType;
    }

    return 'cursos';
}

const selectedType = getSelectedType();
const currentCatalog = catalogTypes[selectedType];

/* ==================================================
   HERO
================================================== */

function renderHero() {
    catalogTitle.textContent = currentCatalog.title;
    catalogPhrase.textContent = currentCatalog.phrase;
    catalogIcon.textContent = currentCatalog.icon;
    catalogHeading.textContent = currentCatalog.heading;
    document.title = `${currentCatalog.title} | Agropedia`;
}

/* ==================================================
   FILTRO DE TEMAS
================================================== */

function populateTopicFilter() {
    topics.forEach(topic => {
        const option = document.createElement('option');

        option.value = topic.slug;
        option.textContent = topic.name;

        topicFilter.appendChild(option);
    });
}

/* ==================================================
   TARJETAS
================================================== */

function renderCatalog() {
    catalogGrid.innerHTML = '';

    const items = catalogContent.filter(item => item.type === selectedType);

    items.forEach(item => {
        const card = document.createElement('article');

        card.className = 'catalog-card';
        card.dataset.search = normalizeText(
            `${item.title} ${item.description} ${item.topics.join(' ')}`
        );
        card.dataset.topics = item.topics.join(',');
        card.dataset.difficulty = item.difficulty;
        card.dataset.duration = item.duration;

        card.innerHTML = `
            <div class="catalog-card__visual" aria-hidden="true">
                ${item.icon}
            </div>

            <div class="catalog-card__body">
                <div class="catalog-card__tags">
                    <span class="catalog-card__tag">
                        ${item.type === 'cursos' ? 'Curso' : item.type === 'videos' ? 'Video' : 'Documento'}
                    </span>

                    <span class="catalog-card__tag catalog-card__tag--difficulty">
                        ${item.difficultyLabel}
                    </span>
                </div>

                <h3>${item.title}</h3>

                <p>${item.description}</p>

                <div class="catalog-card__meta">
                    <span>${item.meta}</span>
                    <span>Explorar →</span>
                </div>
            </div>
        `;

        catalogGrid.appendChild(card);
    });
}

/* ==================================================
   BÚSQUEDA Y FILTROS
================================================== */

function normalizeText(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function filterCatalog() {
    const query = normalizeText(catalogSearch.value.trim());
    const selectedTopic = topicFilter.value;
    const selectedDifficulty = difficultyFilter.value;
    const selectedDuration = durationFilter.value;

    const cards = catalogGrid.querySelectorAll('.catalog-card');
    let matches = 0;

    cards.forEach(card => {
        const searchMatch = !query || card.dataset.search.includes(query);
        const topicMatch = selectedTopic === 'all' ||
            card.dataset.topics.split(',').includes(selectedTopic);
        const difficultyMatch = selectedDifficulty === 'all' ||
            card.dataset.difficulty === selectedDifficulty;
        const durationMatch = selectedDuration === 'all' ||
            card.dataset.duration === selectedDuration;

        const visible =
            searchMatch &&
            topicMatch &&
            difficultyMatch &&
            durationMatch;

        card.classList.toggle('hidden', !visible);

        if (visible) {
            matches++;
        }
    });

    catalogEmpty.classList.toggle('hidden', matches > 0);

    updateResultsMessage(matches, query, selectedTopic, selectedDifficulty, selectedDuration);
}

function updateResultsMessage(matches, query, selectedTopic, selectedDifficulty, selectedDuration) {
    const activeFilters = [
        selectedTopic !== 'all',
        selectedDifficulty !== 'all',
        selectedDuration !== 'all'
    ].filter(Boolean).length;

    if (!query && activeFilters === 0) {
        catalogResultsMessage.textContent = `Mostrando ${matches} elemento(s) disponibles.`;
        return;
    }

    catalogResultsMessage.textContent =
        `${matches} resultado(s) encontrados` +
        (query ? ` para “${catalogSearch.value.trim()}”` : '') +
        (activeFilters ? ` · ${activeFilters} filtro(s) activo(s)` : '') +
        '.';
}

function resetCatalog() {
    catalogSearch.value = '';
    topicFilter.value = 'all';
    difficultyFilter.value = 'all';
    durationFilter.value = 'all';

    filterCatalog();
}

/* ==================================================
   EVENTOS
================================================== */

catalogSearch.addEventListener('input', filterCatalog);
topicFilter.addEventListener('change', filterCatalog);
difficultyFilter.addEventListener('change', filterCatalog);
durationFilter.addEventListener('change', filterCatalog);

clearCatalogSearch.addEventListener('click', () => {
    catalogSearch.value = '';
    filterCatalog();
    catalogSearch.focus();
});

resetCatalogFilters.addEventListener('click', resetCatalog);
emptyResetButton.addEventListener('click', resetCatalog);

/* ==================================================
   INICIALIZACIÓN
================================================== */

renderHero();
populateTopicFilter();
renderCatalog();
filterCatalog();
