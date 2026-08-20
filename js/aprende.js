/* ==================================================
   APRENDE - JAVASCRIPT
   V2 sin base de datos.
   Contenido de demostración preparado para conectar
   posteriormente con el catálogo y Supabase.
================================================== */

'use strict';

/* ==================================================
   DATOS DE DEMOSTRACIÓN
================================================== */

const topics = [
    {
        name: 'Cultivo',
        icon: '🌱',
        description: 'Siembra, propagación y cuidados.',
        slug: 'cultivo'
    },
    {
        name: 'Suelo',
        icon: '🌍',
        description: 'Nutrientes, estructura y fertilidad.',
        slug: 'suelo'
    },
    {
        name: 'Riego',
        icon: '💧',
        description: 'Humedad, frecuencia y técnicas.',
        slug: 'riego'
    },
    {
        name: 'Plagas',
        icon: '🐛',
        description: 'Identificación y prevención.',
        slug: 'plagas'
    },
    {
        name: 'Hongos',
        icon: '🍄',
        description: 'Prevención y manejo de hongos.',
        slug: 'hongos'
    },
    {
        name: 'Cosecha',
        icon: '🧺',
        description: 'Cuándo y cómo cosechar.',
        slug: 'cosecha'
    },
    {
        name: 'Temporadas',
        icon: '🌤️',
        description: 'Cultivos según la época del año.',
        slug: 'temporadas'
    },
    {
        name: 'Luna',
        icon: '🌙',
        description: 'Ciclos lunares y jardinería.',
        slug: 'luna'
    },
    {
        name: 'Compostaje',
        icon: '♻️',
        description: 'Transforma residuos en abono.',
        slug: 'compostaje'
    },
    {
        name: 'Semillas',
        icon: '🌰',
        description: 'Selección, conservación y germinación.',
        slug: 'semillas'
    },
    {
        name: 'Poda',
        icon: '✂️',
        description: 'Formación y mantenimiento de plantas.',
        slug: 'poda'
    },
    {
        name: 'Huerto ecológico',
        icon: '🌿',
        description: 'Cultivo sostenible y responsable.',
        slug: 'huerto-ecologico'
    }
];

const content = {
    courses: [
        {
            title: 'Inicia tu primer huerto',
            description: 'Aprende desde cero a planificar y comenzar un huerto.',
            icon: '🌱',
            tag: 'Principiante',
            meta: '6 lecciones · 2 h',
            search: 'inicia primer huerto cultivo principiante'
        },
        {
            title: 'Fundamentos del suelo',
            description: 'Comprende la tierra y aprende a mejorar su fertilidad.',
            icon: '🌍',
            tag: 'Suelo',
            meta: '8 lecciones · 3 h',
            search: 'fundamentos suelo tierra fertilidad'
        },
        {
            title: 'Cultiva tus hortalizas',
            description: 'Conoce las bases para producir hortalizas en casa.',
            icon: '🥕',
            tag: 'Cultivo',
            meta: '10 lecciones · 4 h',
            search: 'cultiva hortalizas verduras cultivo'
        },
        {
            title: 'Riego para principiantes',
            description: 'Aprende a calcular y organizar el riego de tus plantas.',
            icon: '💧',
            tag: 'Riego',
            meta: '5 lecciones · 1.5 h',
            search: 'riego agua humedad principiantes'
        },
        {
            title: 'Huerto ecológico',
            description: 'Construye un sistema de cultivo más sostenible.',
            icon: '♻️',
            tag: 'Sostenibilidad',
            meta: '7 lecciones · 3 h',
            search: 'huerto ecologico sostenible compostaje'
        }
    ],

    videos: [
        {
            title: 'Cómo preparar un bancal',
            description: 'Pasos básicos para preparar el espacio de cultivo.',
            icon: '🪴',
            tag: 'Cultivo',
            meta: 'Video · 8 min',
            search: 'preparar bancal cultivo'
        },
        {
            title: 'Cómo hacer compost',
            description: 'Convierte residuos orgánicos en materia útil para el suelo.',
            icon: '♻️',
            tag: 'Compostaje',
            meta: 'Video · 12 min',
            search: 'compost compostaje residuos abono'
        },
        {
            title: 'Reconoce las plagas comunes',
            description: 'Aprende a identificar señales de plagas en tus plantas.',
            icon: '🐛',
            tag: 'Plagas',
            meta: 'Video · 10 min',
            search: 'plagas insectos identificar plantas'
        },
        {
            title: 'Guía para trasplantar',
            description: 'Evita errores al pasar una planta a su nuevo espacio.',
            icon: '🌿',
            tag: 'Cultivo',
            meta: 'Video · 7 min',
            search: 'trasplantar plantas cultivo'
        },
        {
            title: 'Cosecha en el momento correcto',
            description: 'Identifica las señales de que tus cultivos están listos.',
            icon: '🧺',
            tag: 'Cosecha',
            meta: 'Video · 9 min',
            search: 'cosecha madurez cultivos'
        }
    ],

    documents: [
        {
            title: 'Guía básica del suelo',
            description: 'Conceptos esenciales sobre nutrientes, textura y estructura.',
            icon: '📄',
            tag: 'Suelo',
            meta: 'PDF · 18 páginas',
            search: 'guia suelo nutrientes textura estructura pdf'
        },
        {
            title: 'Calendario de siembra',
            description: 'Referencia general para organizar cultivos durante el año.',
            icon: '📅',
            tag: 'Temporadas',
            meta: 'PDF · 12 páginas',
            search: 'calendario siembra temporadas pdf'
        },
        {
            title: 'Manual de compostaje doméstico',
            description: 'Material de consulta para iniciar tu propio compost.',
            icon: '📚',
            tag: 'Compostaje',
            meta: 'PDF · 22 páginas',
            search: 'manual compostaje domestico abono pdf'
        },
        {
            title: 'Identificación de enfermedades',
            description: 'Guía visual para reconocer síntomas frecuentes.',
            icon: '🔎',
            tag: 'Enfermedades',
            meta: 'PDF · 26 páginas',
            search: 'enfermedades hongos sintomas plantas pdf'
        },
        {
            title: 'Cuaderno del jardinero',
            description: 'Plantillas para registrar siembras, riegos y cosechas.',
            icon: '📓',
            tag: 'Organización',
            meta: 'PDF · 15 páginas',
            search: 'cuaderno jardinero registro riego cosecha pdf'
        }
    ]
};

/* ==================================================
   ELEMENTOS
================================================== */

const topicsGrid = document.getElementById('topicsGrid');
const coursesGrid = document.getElementById('coursesGrid');
const videosGrid = document.getElementById('videosGrid');
const documentsGrid = document.getElementById('documentsGrid');

const learnSearch = document.getElementById('learnSearch');
const clearSearch = document.getElementById('clearSearch');
const searchMessage = document.getElementById('searchMessage');
const noResults = document.getElementById('noResults');
const resetSearch = document.getElementById('resetSearch');

const sections = {
    courses: document.getElementById('coursesSection'),
    videos: document.getElementById('videosSection'),
    documents: document.getElementById('documentsSection')
};

/* ==================================================
   TEMAS
================================================== */

function renderTopics() {
    topicsGrid.innerHTML = '';

    topics.forEach(topic => {
        const card = document.createElement('a');

        card.className = 'topic-card';
        card.href = `tema.html?tema=${encodeURIComponent(topic.slug)}`;

        card.innerHTML = `
            <div class="topic-card__icon">${topic.icon}</div>

            <div>
                <h3>${topic.name}</h3>
                <p>${topic.description}</p>
            </div>
        `;

        topicsGrid.appendChild(card);
    });
}

/* ==================================================
   TARJETAS DE CONTENIDO
================================================== */

function createContentCard(item) {
    const card = document.createElement('article');

    card.className = 'learning-card';
    card.dataset.search = item.search;

    card.innerHTML = `
        <div class="learning-card__visual" aria-hidden="true">
            ${item.icon}
        </div>

        <div class="learning-card__body">
            <span class="learning-card__tag">
                ${item.tag}
            </span>

            <h3>${item.title}</h3>

            <p>${item.description}</p>

            <div class="learning-card__meta">
                <span>${item.meta}</span>
                <span>→</span>
            </div>
        </div>
    `;

    return card;
}

function renderContent() {
    renderContentGroup(content.courses, coursesGrid);
    renderContentGroup(content.videos, videosGrid);
    renderContentGroup(content.documents, documentsGrid);
}

function renderContentGroup(items, container) {
    container.innerHTML = '';

    items.forEach(item => {
        container.appendChild(createContentCard(item));
    });
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
    const query = normalizeText(learnSearch.value);

    let matches = 0;

    Object.values(sections).forEach(section => {
        const cards = section.querySelectorAll('.learning-card');
        let sectionMatches = 0;

        cards.forEach(card => {
            const searchableText = normalizeText(
                `${card.textContent} ${card.dataset.search}`
            );

            const match = !query || searchableText.includes(query);

            card.classList.toggle('hidden', !match);

            if (match) {
                sectionMatches++;
                matches++;
            }
        });

        section.classList.toggle('hidden', query && sectionMatches === 0);
    });

    const topicMatches = filterTopics(query);

    if (!query) {
        searchMessage.textContent = 'Explora todo el contenido disponible en Agropedia.';
        noResults.classList.add('hidden');
        return;
    }

    searchMessage.textContent = `${matches + topicMatches} resultado(s) para “${learnSearch.value.trim()}”.`;

    noResults.classList.toggle(
        'hidden',
        matches + topicMatches > 0
    );
}

function filterTopics(query) {
    const cards = topicsGrid.querySelectorAll('.topic-card');
    let matches = 0;

    cards.forEach(card => {
        const match = !query || normalizeText(card.textContent).includes(query);

        card.classList.toggle('hidden', !match);

        if (match) {
            matches++;
        }
    });

    return matches;
}

function resetSearchInput() {
    learnSearch.value = '';
    filterContent();
    learnSearch.focus();
}

/* ==================================================
   EVENTOS
================================================== */

learnSearch.addEventListener('input', filterContent);

clearSearch.addEventListener('click', resetSearchInput);
resetSearch.addEventListener('click', resetSearchInput);

/* ==================================================
   INICIALIZACIÓN
================================================== */

function initLearnPage() {
    renderTopics();
    renderContent();
    filterContent();
}

initLearnPage();
