// Agropedia V2 - ficha de planta conectada a Supabase
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    const fallback = 'assets/images/logo.png';

    if (!id) {
        mostrarError('No se indicó una planta válida.');
        return;
    }

    // Cargamos la planta principal sin relaciones anidadas.
    // Esto evita depender de los nombres de relaciones que PostgREST genere
    // automáticamente a partir de las claves foráneas.
    const { data: plant, error } = await agropediaSupabase
        .from('plantas')
        .select(`
            id,
            nombre_comun,
            nombre_cientifico,
            familia_id,
            descripcion,
            imagen_url,
            video_url,
            clima_preferido,
            suelo_preferido,
            riego,
            poda,
            epoca_siembra,
            frecuencia_cosecha,
            cantidad_produccion,
            dificultad,
            luz,
            tipo_cultivo,
            ciclo
        `)
        .eq('id', id)
        .maybeSingle();

    if (error || !plant) {
        console.error('Error al cargar la planta:', error);
        mostrarError('No encontramos esta planta en Agropedia.');
        return;
    }

    // Las relaciones se consultan por separado para que la ficha sea
    // independiente de las relaciones embebidas de PostgREST.
    const [familyResult, conditionsResult, tagsResult] = await Promise.all([
        agropediaSupabase
            .from('familias')
            .select('nombre')
            .eq('id', plant.familia_id)
            .maybeSingle(),

        agropediaSupabase
            .from('condiciones_planta')
            .select('nombre,valor,orden')
            .eq('planta_id', plant.id)
            .order('orden'),

        agropediaSupabase
            .from('planta_etiquetas')
            .select('etiqueta_id,etiquetas_planta(nombre)')
            .eq('planta_id', plant.id)
    ]);

    if (familyResult.error) console.error('Error al cargar familia:', familyResult.error);
    if (conditionsResult.error) console.error('Error al cargar condiciones:', conditionsResult.error);
    if (tagsResult.error) console.error('Error al cargar etiquetas:', tagsResult.error);

    plant.familia = familyResult.data || null;
    plant.condiciones = conditionsResult.data || [];
    plant.etiquetas = (tagsResult.data || [])
        .map(item => item.etiquetas_planta?.nombre)
        .filter(Boolean);

    document.title = `${plant.nombre_comun} | Agropedia`;
    renderPlant(plant);
    await renderCare(plant.id);
    await renderRelated(plant.id);

    function setText(selector, value) {
        const element = document.querySelector(selector);
        if (element && value != null) element.textContent = value;
    }

    function renderPlant(p) {
        const tags = p.etiquetas || [];
        const images = document.querySelectorAll('.plant-information-image img');

        setText('.plant-hero-category', tags[0] || 'Planta');
        setText('.plant-hero-content h1', p.nombre_comun);
        setText('.plant-hero-content p', p.nombre_cientifico || '');

        const tagsContainer = document.querySelector('.plant-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = tags
                .map(tag => `<span>${escapeHtml(tag)}</span>`)
                .join('');
        }

        if (images[0]) {
            images[0].src = p.imagen_url || fallback;
            images[0].alt = p.nombre_comun;
        }

        if (images[1]) {
            images[1].src = p.imagen_url || fallback;
            images[1].alt = p.nombre_comun;
        }

        setText('.plant-description h2', p.nombre_comun);

        const paragraphs = document.querySelectorAll('.plant-description > p');
        if (paragraphs[0]) paragraphs[0].textContent = p.descripcion || '';
        if (paragraphs[1]) {
            paragraphs[1].textContent =
                `Prefiere ${p.suelo_preferido || 'un suelo adecuado'} y un riego ${p.riego || 'regular'}.`;
        }

        const basic = document.querySelectorAll('.plant-basic-data > div');

        if (basic[0]) {
            basic[0].querySelector('span').textContent = 'Familia';
            basic[0].querySelector('strong').textContent = p.familia?.nombre || 'No registrada';
        }

        if (basic[1]) {
            basic[1].querySelector('span').textContent = 'Ciclo';
            basic[1].querySelector('strong').textContent = p.ciclo || 'No registrado';
        }

        if (basic[2]) {
            basic[2].querySelector('span').textContent = 'Cultivo';
            basic[2].querySelector('strong').textContent = p.tipo_cultivo || 'No registrado';
        }

        if (basic[3]) {
            basic[3].querySelector('span').textContent = 'Dificultad';
            basic[3].querySelector('strong').textContent =
                ({ facil: 'Fácil', media: 'Media', dificil: 'Difícil' })[p.dificultad]
                || p.dificultad
                || 'No registrada';
        }

        const conditionMap = {};
        (p.condiciones || []).forEach(condition => {
            conditionMap[normalizar(condition.nombre)] = condition.valor;
        });

        const conditions = [
            ['Luz', p.luz || conditionMap.luz || 'Sol directo'],
            ['Riego', p.riego || conditionMap.riego || 'Regular'],
            ['Temperatura', conditionMap.temperatura || p.clima_preferido || 'Según clima'],
            ['Suelo', p.suelo_preferido || conditionMap.suelo || 'Adecuado para cultivo']
        ];

        document.querySelectorAll('.characteristic-card').forEach((card, index) => {
            const data = conditions[index];
            if (!data) return;

            const title = card.querySelector('h3');
            const description = card.querySelector('p');
            const strong = card.querySelector('strong');

            if (title) title.textContent = data[0];
            if (description) description.textContent = data[1];
            if (strong) strong.textContent = data[1];
        });

        const iframe = document.querySelector('.plant-video iframe');

        if (iframe && p.video_url) {
            iframe.src = normalizarVideo(p.video_url);
            iframe.style.display = '';
        } else if (iframe) {
            iframe.style.display = 'none';
        }
    }

    async function renderCare(plantId) {
        const { data, error } = await agropediaSupabase
            .from('tareas_cultivo')
            .select('id,etapa_id,titulo,descripcion,dias_desde_siembra,duracion_minutos,orden')
            .eq('planta_id', plantId)
            .order('orden');

        if (error) {
            console.error('Error al cargar cuidados:', error);
            return;
        }

        const tasks = data || [];
        const stageIds = [...new Set(tasks.map(task => task.etapa_id).filter(Boolean))];
        const groups = {};

        if (stageIds.length) {
            const { data: stages, error: stageError } = await agropediaSupabase
                .from('etapas_cultivo')
                .select('id,nombre')
                .in('id', stageIds);

            if (stageError) {
                console.error('Error al cargar etapas:', stageError);
            } else {
                const stageMap = Object.fromEntries((stages || []).map(stage => [stage.id, stage.nombre]));

                tasks.forEach(task => {
                    const stage = stageMap[task.etapa_id] || 'Cuidado';
                    (groups[stage] ||= []).push(task);
                });
            }
        }

        const stageButtons = document.querySelectorAll('.growth-stage');

        stageButtons.forEach(button => {
            const stage = button.dataset.stage;
            button.style.display = groups[stage]?.length ? '' : 'none';

            button.addEventListener('click', () => {
                stageButtons.forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                renderStage(stage, groups);
            });
        });

        const first = [...stageButtons].find(button => button.style.display !== 'none');

        if (first) {
            first.classList.add('active');
            renderStage(first.dataset.stage, groups);
        } else {
            const container = document.getElementById('care-cards');
            if (container) {
                container.innerHTML = '<div class="care-empty">Todavía no hay cuidados registrados para esta planta.</div>';
            }
        }
    }

    function renderStage(stage, groups) {
        const title = document.getElementById('care-stage-title');
        const icon = document.getElementById('care-stage-icon');
        const container = document.getElementById('care-cards');

        if (!container) return;

        if (title) title.textContent = stage;
        if (icon) {
            icon.textContent = {
                Siembra: '🌱',
                Germinación: '🌿',
                Crecimiento: '🌿',
                Floración: '🌸',
                Fructificación: '🍅',
                Cosecha: '🧺'
            }[stage] || '🌱';
        }

        container.innerHTML = '';

        (groups[stage] || []).forEach(task => {
            const card = document.createElement('article');
            card.className = 'care-card';

            const moment = task.dias_desde_siembra != null
                ? `Día ${task.dias_desde_siembra}`
                : 'Según etapa';

            const duration = task.duracion_minutos
                ? `${task.duracion_minutos} min`
                : 'Según necesidad';

            card.innerHTML = `
                <div class="care-card-title">
                    <div class="care-card-icon">🌱</div>
                    <h4>${escapeHtml(task.titulo)}</h4>
                </div>

                <div class="care-meta">
                    <div class="care-meta-item">
                        <span>Momento</span>
                        <strong>${escapeHtml(moment)}</strong>
                    </div>

                    <div class="care-meta-item">
                        <span>Duración</span>
                        <strong>${escapeHtml(duration)}</strong>
                    </div>
                </div>

                <p class="care-observation">
                    <strong>💡 Recomendación:</strong>
                    ${escapeHtml(task.descripcion || 'Consulta las condiciones de cultivo de esta planta.')}
                </p>
            `;

            container.appendChild(card);
        });

        if (!groups[stage]?.length) {
            container.innerHTML = '<div class="care-empty">No hay cuidados registrados para esta etapa.</div>';
        }
    }

    async function renderRelated(plantId) {
        const { data, error } = await agropediaSupabase
            .from('plantas_compatibles')
            .select('planta_relacionada_id')
            .eq('planta_id', plantId)
            .eq('compatible', true)
            .limit(4);

        if (error) {
            console.error('Error al cargar plantas relacionadas:', error);
            return;
        }

        const ids = (data || []).map(row => row.planta_relacionada_id).filter(Boolean);
        const grid = document.querySelector('.related-plants-grid');

        if (!grid || !ids.length) return;

        const { data: plants, error: plantsError } = await agropediaSupabase
            .from('plantas')
            .select('id,nombre_comun,imagen_url')
            .in('id', ids);

        if (plantsError) {
            console.error('Error al cargar plantas relacionadas:', plantsError);
            return;
        }

        grid.innerHTML = '';

        (plants || []).forEach(p => {
            grid.insertAdjacentHTML('beforeend', `
                <article class="related-plant-card">
                    <img src="${escapeHtml(p.imagen_url || fallback)}" alt="${escapeHtml(p.nombre_comun)}">
                    <div>
                        <span>Planta</span>
                        <h3>${escapeHtml(p.nombre_comun)}</h3>
                        <a href="planta.html?id=${p.id}">Ver planta →</a>
                    </div>
                </article>
            `);
        });
    }

    function normalizarVideo(url) {
        if (url.includes('youtube.com/embed/')) return url;

        const match = url.match(/(?:youtu\.be\/|v=)([^&?/]+)/);
        return match
            ? `https://www.youtube.com/embed/${match[1]}`
            : url;
    }

    function normalizar(value) {
        return (value || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function mostrarError(message) {
        const main = document.querySelector('main');

        if (main) {
            main.innerHTML = `
                <section class="section-container">
                    <div class="section-heading">
                        <h2>${escapeHtml(message)}</h2>
                        <p>
                            <a href="plantas.html">Volver al catálogo de plantas</a>
                        </p>
                    </div>
                </section>
            `;
        }
    }
});
