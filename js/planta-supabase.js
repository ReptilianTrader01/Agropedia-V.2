// Agropedia V2 - ficha de planta conectada a Supabase
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    const fallback = 'assets/images/logo.png';
    const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    if (!id) return mostrarError('No se indicó una planta válida.');

    const { data: plant, error } = await agropediaSupabase
        .from('plantas')
        .select(`id,nombre_comun,nombre_cientifico,descripcion,imagen_url,video_url,clima_preferido,suelo_preferido,riego,poda,epoca_siembra,frecuencia_cosecha,cantidad_produccion,dificultad,luz,tipo_cultivo,ciclo,familias(nombre),condiciones_planta(nombre,valor,orden),planta_etiquetas(etiquetas_planta(nombre))`)
        .eq('id', id)
        .single();

    if (error || !plant) {
        console.error(error);
        mostrarError('No encontramos esta planta en Agropedia.');
        return;
    }

    document.title = `${plant.nombre_comun} | Agropedia`;
    renderPlant(plant);
    await renderCare(plant.id);
    await renderRelated(plant.id);

    function setText(selector, value) {
        const element = document.querySelector(selector);
        if (element && value != null) element.textContent = value;
    }

    function renderPlant(p) {
        const tags = (p.planta_etiquetas || []).map(x => x.etiquetas_planta?.nombre).filter(Boolean);
        const images = document.querySelectorAll('.plant-information-image img');

        setText('.plant-hero-category', tags[0] || 'Planta');
        setText('.plant-hero-content h1', p.nombre_comun);
        setText('.plant-hero-content p', p.nombre_cientifico || '');
        document.querySelector('.plant-tags').innerHTML = tags.map(tag => `<span>${tag}</span>`).join('');

        if (images[0]) { images[0].src = p.imagen_url || fallback; images[0].alt = p.nombre_comun; }
        if (images[1]) { images[1].src = p.imagen_url || fallback; images[1].alt = p.nombre_comun; }

        setText('.plant-description h2', p.nombre_comun);
        const paragraphs = document.querySelectorAll('.plant-description > p');
        if (paragraphs[0]) paragraphs[0].textContent = p.descripcion || '';
        if (paragraphs[1]) paragraphs[1].textContent = `Prefiere ${p.suelo_preferido || 'un suelo adecuado'} y un riego ${p.riego || 'regular'}.`;

        const basic = document.querySelectorAll('.plant-basic-data > div');
        if (basic[0]) { basic[0].querySelector('span').textContent = 'Familia'; basic[0].querySelector('strong').textContent = p.familias?.nombre || 'No registrada'; }
        if (basic[1]) { basic[1].querySelector('span').textContent = 'Ciclo'; basic[1].querySelector('strong').textContent = p.ciclo || 'No registrado'; }
        if (basic[2]) { basic[2].querySelector('span').textContent = 'Cultivo'; basic[2].querySelector('strong').textContent = p.tipo_cultivo || 'Ambos'; }
        if (basic[3]) { basic[3].querySelector('span').textContent = 'Dificultad'; basic[3].querySelector('strong').textContent = ({facil:'Fácil',media:'Media',dificil:'Difícil'})[p.dificultad] || 'Media'; }

        const conditions = [
            ['Luz', p.luz || 'Sol directo'],
            ['Riego', p.riego || 'Regular'],
            ['Temperatura', p.clima_preferido || 'Según clima'],
            ['Suelo', p.suelo_preferido || 'Adecuado para cultivo']
        ];
        document.querySelectorAll('.characteristic-card').forEach((card, index) => {
            const data = conditions[index];
            if (!data) return;
            card.querySelector('h3').textContent = data[0];
            card.querySelector('p').textContent = data[1];
            card.querySelector('strong').textContent = index === 0 ? data[1] : 'Consultar cuidados';
        });

        const iframe = document.querySelector('.plant-video iframe');
        if (iframe && p.video_url) iframe.src = normalizarVideo(p.video_url);
        else if (iframe) iframe.style.display = 'none';
    }

    async function renderCare(plantId) {
        const { data, error } = await agropediaSupabase
            .from('tareas_cultivo')
            .select('id,titulo,descripcion,dias_desde_siembra,duracion_minutos,orden,etapas_cultivo(nombre)')
            .eq('planta_id', plantId)
            .order('orden');

        if (error) { console.error(error); return; }
        const groups = {};
        (data || []).forEach(task => {
            const stage = task.etapas_cultivo?.nombre || 'Cuidado';
            (groups[stage] ||= []).push(task);
        });

        const stageButtons = document.querySelectorAll('.growth-stage');
        stageButtons.forEach(button => {
            const stage = button.dataset.stage;
            if (!groups[stage]) button.style.display = 'none';
            button.addEventListener('click', () => renderStage(stage, groups));
        });
        const first = [...stageButtons].find(button => button.style.display !== 'none');
        if (first) renderStage(first.dataset.stage, groups);
    }

    function renderStage(stage, groups) {
        const title = document.getElementById('care-stage-title');
        const icon = document.getElementById('care-stage-icon');
        const container = document.getElementById('care-cards');
        if (!container) return;
        if (title) title.textContent = stage;
        if (icon) icon.textContent = ({Siembra:'🌱',Germinación:'🌿',Crecimiento:'🌿',Floración:'🌸',Fructificación:'🍅',Cosecha:'🧺'})[stage] || '🌱';
        container.innerHTML = '';
        (groups[stage] || []).forEach(task => {
            const card = document.createElement('article');
            card.className = 'care-card';
            card.innerHTML = `<div class="care-card-title"><div class="care-card-icon">🌱</div><h4>${task.titulo}</h4></div><div class="care-meta"><div class="care-meta-item"><span>Momento</span><strong>${task.dias_desde_siembra != null ? `Día ${task.dias_desde_siembra}` : 'Según etapa'}</strong></div><div class="care-meta-item"><span>Duración</span><strong>${task.duracion_minutos ? `${task.duracion_minutos} min` : 'Según necesidad'}</strong></div></div><p class="care-observation"><strong>💡 Recomendación:</strong> ${task.descripcion || 'Consulta las condiciones de cultivo de esta planta.'}</p>`;
            container.appendChild(card);
        });
        if (!groups[stage]?.length) container.innerHTML = '<div class="care-empty">No hay cuidados registrados para esta etapa.</div>';
    }

    async function renderRelated(plantId) {
        const { data } = await agropediaSupabase
            .from('plantas_compatibles')
            .select('planta_relacionada_id,plantas!plantas_compatibles_planta_relacionada_id_fkey(id,nombre_comun,imagen_url,planta_etiquetas(etiquetas_planta(nombre)))')
            .eq('planta_id', plantId)
            .eq('compatible', true)
            .limit(4);

        const grid = document.querySelector('.related-plants-grid');
        if (!grid || !data?.length) return;
        grid.innerHTML = '';
        data.forEach(row => {
            const p = row.plantas;
            const tag = p.planta_etiquetas?.[0]?.etiquetas_planta?.nombre || 'Planta';
            grid.insertAdjacentHTML('beforeend', `<article class="related-plant-card"><img src="${p.imagen_url || fallback}" alt="${p.nombre_comun}"><div><span>${tag}</span><h3>${p.nombre_comun}</h3><a href="planta.html?id=${p.id}">Ver planta →</a></div></article>`);
        });
    }

    function normalizarVideo(url) {
        if (url.includes('youtube.com/embed/')) return url;
        const match = url.match(/(?:youtu\.be\/|v=)([^&?/]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }

    function mostrarError(message) {
        const main = document.querySelector('main');
        if (main) main.innerHTML = `<section class="section-container"><div class="section-heading"><h2>${message}</h2><p><a href="plantas.html">Volver al catálogo de plantas</a></p></div></section>`;
    }
});
