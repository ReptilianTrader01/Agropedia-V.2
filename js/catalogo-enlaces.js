/* ==================================================
   CONEXIONES DEL CATÁLOGO
   Une las tarjetas de catalogo.html con las páginas
   de contenido y con tema.html.
================================================== */

'use strict';

function getCatalogDetailUrl(item) {
    const params = new URLSearchParams();
    params.set('titulo', item.title);

    if (item.type === 'cursos') {
        return `curso.html?${params.toString()}`;
    }

    if (item.type === 'videos') {
        return `video.html?${params.toString()}`;
    }

    return `documento.html?${params.toString()}`;
}

function connectCatalogCards() {
    const cards = document.querySelectorAll('#catalogGrid .catalog-card');
    const items = catalogContent.filter(item => item.type === selectedType);

    cards.forEach((card, index) => {
        const item = items[index];

        if (!item) {
            return;
        }

        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Abrir ${item.title}`);

        const openContent = () => {
            window.location.href = getCatalogDetailUrl(item);
        };

        card.addEventListener('click', event => {
            if (event.target.closest('a, button, select, input')) {
                return;
            }

            openContent();
        });

        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openContent();
            }
        });
    });
}

function connectCatalogToTopics() {
    const cards = document.querySelectorAll('#catalogGrid .catalog-card');
    const items = catalogContent.filter(item => item.type === selectedType);

    cards.forEach((card, index) => {
        const item = items[index];

        if (!item || !item.topics.length || card.querySelector('.catalog-card__topics')) {
            return;
        }

        const topicsContainer = document.createElement('div');
        topicsContainer.className = 'catalog-card__topics';

        item.topics.forEach(topic => {
            const link = document.createElement('a');
            link.href = `tema.html?tema=${encodeURIComponent(topic)}`;
            link.className = 'catalog-card__topic';
            link.textContent = topic.replace('-', ' ');
            topicsContainer.appendChild(link);
        });

        card.appendChild(topicsContainer);
    });
}

/* catalogo.js genera las tarjetas después de cargar el script.
   Observamos el contenedor para conectar también las tarjetas
   creadas por los filtros o por una futura base de datos. */

const catalogObserver = new MutationObserver(() => {
    connectCatalogCards();
    connectCatalogToTopics();
});

const catalogGridElement = document.getElementById('catalogGrid');

if (catalogGridElement) {
    catalogObserver.observe(catalogGridElement, { childList: true });
    connectCatalogCards();
    connectCatalogToTopics();
}
