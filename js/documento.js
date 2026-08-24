/* =========================================================
   DOCUMENTO - DATOS DE PRUEBA
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const related = [
        {
            title: 'Guía básica del suelo',
            type: '📄 Documento',
            description: 'Material introductorio para conocer mejor el suelo.'
        },
        {
            title: 'Calendario de cultivo',
            type: '📄 Documento',
            description: 'Consulta las principales temporadas de cultivo.'
        },
        {
            title: 'Introducción al riego',
            type: '🎥 Video',
            description: 'Aprende conceptos básicos sobre el riego.'
        }
    ];

    const container = document.getElementById('relatedDocuments');

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
