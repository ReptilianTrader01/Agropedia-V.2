/* ==================================================
   TEMA.HTML - JAVASCRIPT
   Página dinámica según el tema recibido por URL.
   V2 sin base de datos.
================================================== */

'use strict';

/* ==================================================
   TEMAS
================================================== */

const topicData = {
    cultivo: {
        name: 'Cultivo',
        icon: '🌱',
        phrase: 'Aprende a cultivar con conocimiento, paciencia y propósito.'
    },
    suelo: {
        name: 'Suelo',
        icon: '🌍',
        phrase: 'Una buena cosecha comienza con una tierra bien cuidada.'
    },
    riego: {
        name: 'Riego',
        icon: '💧',
        phrase: 'Aprende a darle a cada planta el agua que realmente necesita.'
    },
    plagas: {
        name: 'Plagas',
        icon: '🐛',
        phrase: 'Detectar un problema a tiempo puede salvar toda una cosecha.'
    },
    hongos: {
        name: 'Hongos',
        icon: '🍄',
        phrase: 'Con prevención y observación, tu huerto puede mantenerse saludable.'
    },
    enfermedades: {
        name: 'Enfermedades',
        icon: '🩺',
        phrase: 'Aprende a reconocer las señales que tus plantas te muestran.'
    },
    cosecha: {
        name: 'Cosecha',
        icon: '🧺',
        phrase: 'El momento correcto convierte meses de cuidados en una gran recompensa.'
    },
    temporadas: {
        name: 'Temporadas',
        icon: '🌤️',
        phrase: 'Cultivar también significa aprender a trabajar con los ritmos del año.'
    },
    luna: {
        name: 'Luna',
        icon: '🌙',
        phrase: 'Conoce las tradiciones y prácticas de jardinería relacionadas con la luna.'
    },
    compostaje: {
        name: 'Compostaje',
        icon: '♻️',
        phrase: 'Convierte los residuos orgánicos en vida para tu suelo.'
    },
    semillas: {
        name: 'Semillas',
        icon: '🌰',
        phrase: 'Toda planta comienza con una pequeña semilla y el cuidado adecuado.'
    },
    poda: {
        name: 'Poda',
        icon: '✂️',
        phrase: 'Aprende cuándo cortar, qué conservar y cómo ayudar a tus plantas a crecer.'
    },
    'huerto-ecologico': {
        name: 'Huerto ecológico',
        icon: '🌿',
        phrase: 'Cultiva de forma responsable, aprovechando los recursos de tu entorno.'
    }
};

/* ==================================================
   CONTENIDO DE DEMOSTRACIÓN
================================================== */

const topicContent = [
    {
        type: 'Curso',
        icon: '🌱',
        title: 'Inicia tu primer huerto',
        description: 'Planifica el espacio, prepara el terreno y conoce los primeros pasos para comenzar.',
        meta: '6 lecciones · 2 h',
        topics: ['cultivo', 'huerto-ecologico'],
        search: 'inicia primer huerto cultivo principiante'
    },
    {
        type: 'Curso',
        icon: '🌍',
        title: 'Fundamentos del suelo',
        description: 'Comprende textura, estructura, materia orgánica y nutrientes esenciales.',
        meta: '8 lecciones · 3 h',
        topics: ['suelo', 'compostaje'],
        search: 'suelo tierra fertilidad nutrientes materia organica'
    },
    {
        type: 'Curso',
        icon: '💧',
        title: 'Riego para principiantes',
        description: 'Aprende a organizar el riego y reconocer cuándo tus plantas necesitan agua.',
        meta: '5 lecciones · 1.5 h',
        topics: ['riego'],
        search: 'riego agua humedad frecuencia principiantes'
    },
    {
        type: 'Curso',
        icon: '🌿',
        title: 'Cultivo ecológico',
        description: 'Descubre técnicas para cultivar reduciendo residuos y aprovechando recursos naturales.',
        meta: '7 lecciones · 3 h',
        topics: ['huerto-ecologico', 'compostaje', 'cultivo'],
        search: 'ecologico sostenible cultivo compostaje'
    },
    {
        type: 'Curso',
        icon: '🌰',
        title: 'Semillas y germinación',
        description: 'Selecciona, conserva y germina semillas para obtener plantas fuertes.',
        meta: '6 lecciones · 2.5 h',
        topics: ['semillas', 'cultivo'],
        search: 'semillas germinacion siembra propagacion'
    },
    {
        type: 'Video',
        icon: '🪴',
        title: 'Cómo preparar un bancal',
        description: 'Pasos básicos para preparar correctamente un espacio de cultivo.',
        meta: 'Video · 8 min',
        topics: ['cultivo', 'suelo'],
        search: 'preparar bancal cultivo suelo'
    },
    {
        type: 'Video',
        icon: '♻️',
        title: 'Cómo hacer compost',
        description: 'Convierte residuos orgánicos en materia útil para mejorar el suelo.',
        meta: 'Video · 12 min',
        topics: ['compostaje', 'suelo'],
        search: 'compost compostaje residuos abono suelo'
    },
    {
        type: 'Video',
        icon: '🐛',
        title: 'Reconoce las plagas comunes',
        description: 'Aprende a identificar señales de insectos y otros organismos dañinos.',
        meta: 'Video · 10 min',
        topics: ['plagas'],
        search: 'plagas insectos identificar plantas'
    },
    {
        type: 'Video',
        icon: '💧',
        title: 'Errores frecuentes al regar',
        description: 'Conoce los errores más comunes y cómo evitarlos en tu huerto.',
        meta: 'Video · 9 min',
        topics: ['riego'],
        search: 'riego errores agua exceso falta humedad'
    },
    {
        type: 'Video',
        icon: '🧺',
        title: 'Cosecha en el momento correcto',
        description: 'Identifica las señales que indican que tus cultivos están listos.',
        meta: 'Video · 9 min',
        topics: ['cosecha'],
        search: 'cosecha madurez cultivos recoleccion'
    },
    {
        type: 'Video',
        icon: '✂️',
        title: 'Introducción a la poda',
        description: 'Conoce las herramientas y cortes básicos para cuidar tus plantas.',
        meta: 'Video · 11 min',
        topics: ['poda'],
        search: 'poda plantas cortar herramientas'
    },
    {
        type: 'Documento',
        icon: '📄',
        title: 'Guía básica del suelo',
        description: 'Conceptos esenciales sobre nutrientes, textura, estructura y materia orgánica.',
        meta: 'PDF · 18 páginas',
        topics: ['suelo'],
        search: 'guia suelo nutrientes textura estructura pdf'
    },
    {
        type: 'Documento',
        icon: '📅',
        title: 'Calendario de siembra',
        description: 'Referencia general para organizar cultivos durante las diferentes temporadas.',
        meta: 'PDF · 12 páginas',
        topics: ['temporadas', 'semillas', 'cultivo'],
        search: 'calendario siembra temporadas semillas pdf'
    },
    {
        type: 'Documento',
        icon: '📚',
        title: 'Manual de compostaje doméstico',
        description: 'Material de consulta para iniciar y mantener tu propio compost.',
        meta: 'PDF · 22 páginas',
        topics: ['compostaje'],
        search: 'manual compostaje domestico abono pdf'
    },
    {
        type: 'Documento',
        icon: '🔎',
        title: 'Identificación de enfermedades',
        description: 'Guía visual para reconocer síntomas frecuentes y saber cuándo actuar.',
        meta: 'PDF · 26 páginas',
        topics: ['enfermedades', 'hongos', 'plagas'],
        search: 'enfermedades hongos sintomas plantas pdf'
    },
    {
        type: 'Documento',
        icon: '🌙',
        title: 'Luna y prácticas de jardinería',
        description: 'Documento introductorio sobre fases lunares y prácticas tradicionales de cultivo.',
        meta: 'PDF · 14 páginas',
        topics: ['luna', 'temporadas'],
        search: 'luna fases jardineria siembra pdf'
    }
];

/* ==================================================
   ELEMENTOS
================================================== */

const topicTitle = document.getElementById('topicTitle');
const topicPhrase = document.getElementById('topicPhrase');
const topicIcon = document.getElementById('topicIcon');
const topicHeading = document.getElementById('topicHeading');
const topicSearch = document.getElementById('topicSearch');
const clearTopicSearch = document.getElementById('clearTopicSearch');
const topicSearchMessage = document.getElementById('topicSearchMessage');
const topicContentGrid = document.getElementById('topicContentGrid');
const topicEmpty = document.getElementById('topicEmpty');
const resetTopicSearch = document.getElementById('resetTopicSearch');

/* ==================================================
   TEMA ACTUAL
================================================== */

function getSelectedTopic() {
    const params = new URLSearchParams(window.location.search);
    const requestedTopic = params.get('tema');

    if (requestedTopic && topicData[requestedTopic]) {
        return requestedTopic;
    }

    return 'cultivo';
}

const selectedTopic = getSelectedTopic();
const currentTopic = topicData[selectedTopic];

/* ==================================================
   HERO
================================================== */

function renderHero() {
    topicTitle.textContent = currentTopic.name;
    topicPhrase.textContent = currentTopic.phrase;
    topicIcon.textContent = currentTopic.icon;
    topicHeading.textContent = currentTopic.name.toLowerCase();
    document.title = `${currentTopic.name} | Agropedia`;
}

/* ==================================================
   TARJETAS
================================================== */

function renderContent() {
    const filtered = topicContent.filter(item =>
        item.topics.includes(selectedTopic)
    );

    topicContentGrid.innerHTML = '';

    filtered.forEach(item => {
        const card = document.createElement('article');

        card.className = 'topic-content-card';
        card.dataset.search = item.search;

        card.innerHTML = `
            <div class="topic-content-card__visual" aria-hidden="true">
                ${item.icon}
            </div>

            <div class="topic-content-card__body">
                <span class="topic-content-card__tag">
                    ${item.type}
                </span>

                <h3>${item.title}</h3>

                <p>${item.description}</p>

                <div class="topic-content-card__meta">
                    <span>${item.meta}</span>
                    <span>Explorar →</span>
                </div>
            </div>
        `;

        topicContentGrid.appendChild(card);
    });

    filterContent();
}

/* ==================================================
   BUSCADOR
================================================== */

function normalizeText(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function filterContent() {
    const query = normalizeText(topicSearch.value);
    const cards = topicContentGrid.querySelectorAll('.topic-content-card');
    let matches = 0;

    cards.forEach(card => {
        const searchableText = normalizeText(
            `${card.textContent} ${card.dataset.search}`
        );

        const match = !query || searchableText.includes(query);

        card.classList.toggle('hidden', !match);

        if (match) {
            matches++;
        }
    });

    topicEmpty.classList.toggle('hidden', matches > 0);

    if (!query) {
        topicSearchMessage.textContent = `${matches} elemento(s) disponibles sobre ${currentTopic.name.toLowerCase()}.`;
        return;
    }

    topicSearchMessage.textContent = `${matches} resultado(s) para “${topicSearch.value.trim()}”.`;
}

function resetSearch() {
    topicSearch.value = '';
    filterContent();
    topicSearch.focus();
}

/* ==================================================
   EVENTOS
================================================== */

topicSearch.addEventListener('input', filterContent);
clearTopicSearch.addEventListener('click', resetSearch);
resetTopicSearch.addEventListener('click', resetSearch);

/* ==================================================
   INICIALIZACIÓN
================================================== */

renderHero();
renderContent();
