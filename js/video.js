/* =========================================================
   VIDEO - DATOS DE PRUEBA
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const related = [
        {
            title: 'Cómo preparar el suelo',
            type: '🌱 Video',
            description: 'Conoce los primeros pasos para preparar tu terreno.'
        },
        {
            title: 'Riego básico para principiantes',
            type: '💧 Video',
            description: 'Aprende a organizar el riego de tus plantas.'
        },
        {
            title: 'Primeros pasos para un huerto',
            type: '🏡 Curso',
            description: 'Una introducción para comenzar a cultivar.'
        }
    ];

    const container = document.getElementById('relatedContent');

    related.forEach(item => {
        const card = document.createElement('article');
        card.className = 'related-card';
        card.innerHTML = `
            <strong>${item.type}</strong>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        `;
        container.appendChild(card);
    });
});
