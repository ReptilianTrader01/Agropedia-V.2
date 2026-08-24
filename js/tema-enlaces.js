/* ==================================================
   CONEXIONES DE TEMA
   Une las tarjetas de tema.html con las páginas
   de cursos, videos y documentos.
================================================== */

'use strict';

function getTopicDetailUrl(item) {
    const params = new URLSearchParams();
    params.set('titulo', item.title);

    if (item.type === 'Curso') {
        return `curso.html?${params.toString()}`;
    }

    if (item.type === 'Video') {
        return `video.html?${params.toString()}`;
    }

    return `documento.html?${params.toString()}`;
}

function connectTopicCards() {
    const cards = document.querySelectorAll('#topicContentGrid .topic-content-card');
    const items = topicContent.filter(item => item.topics.includes(selectedTopic));

    cards.forEach((card, index) => {
        const item = items[index];

        if (!item || card.dataset.connected === 'true') {
            return;
        }

        card.dataset.connected = 'true';
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Abrir ${item.title}`);

        const openContent = () => {
            window.location.href = getTopicDetailUrl(item);
        };

        card.addEventListener('click', event => {
            if (event.target.closest('a, button')) {
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

const topicObserver = new MutationObserver(connectTopicCards);
const topicGridElement = document.getElementById('topicContentGrid');

if (topicGridElement) {
    topicObserver.observe(topicGridElement, { childList: true });
    connectTopicCards();
}
