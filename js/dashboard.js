/* ==================================================
   DASHBOARD ADMINISTRATIVO - AGROPEDIA V.2
   Conexión real con Supabase.

   El navegador usa únicamente la Publishable Key.
   La autorización real la hacen Auth + RLS + has_role().
================================================== */

(function () {
    'use strict';

    const state = {
        user: null,
        isAdmin: false,
        plants: [],
        families: [],
        stages: []
    };

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function loadSupabaseClient() {
        if (!window.supabase) {
            await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
        }

        if (!window.agropediaSupabase) {
            await loadScript('js/supabase-config.js');
        }

        return window.agropediaSupabase;
    }

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function toast(message, error = false) {
        const item = document.createElement('div');
        item.className = `dashboard-toast${error ? ' dashboard-toast--error' : ''}`;
        item.textContent = message;
        document.body.appendChild(item);
        requestAnimationFrame(() => item.classList.add('is-visible'));
        setTimeout(() => {
            item.classList.remove('is-visible');
            setTimeout(() => item.remove(), 250);
        }, 3000);
    }

    function setDate() {
        $('dashboardDate').textContent = new Intl.DateTimeFormat('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date());
    }

    async function verifyAdmin(supabase) {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            $('dashboardRole').textContent = 'Sesión requerida';
            $('workspaceMessage').textContent = 'Inicia sesión con una cuenta administradora para utilizar este panel.';
            return false;
        }

        state.user = data.user;

        const result = await supabase.rpc('has_role', {
            required_role: 'administrador'
        });

        if (result.error || result.data !== true) {
            $('dashboardRole').textContent = 'Acceso restringido';
            $('workspaceMessage').textContent = 'Tu cuenta está autenticada, pero no tiene el rol administrador.';
            $('securityNote').textContent = 'El panel está protegido por RLS. Necesitas el rol administrador para modificar contenido.';
            return false;
        }

        state.isAdmin = true;
        $('dashboardRole').textContent = 'Administrador';
        $('workspaceMessage').textContent = 'Los cambios realizados aquí se guardan directamente en Supabase.';
        return true;
    }

    async function countTable(supabase, table) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
        return error ? 0 : (count || 0);
    }

    async function loadStats(supabase) {
        const [users, plants, gardens, courses, videos, documents] = await Promise.all([
            countTable(supabase, 'perfiles'),
            countTable(supabase, 'plantas'),
            countTable(supabase, 'huertos'),
            countTable(supabase, 'cursos'),
            countTable(supabase, 'videos'),
            countTable(supabase, 'documentos')
        ]);

        $('statUsers').textContent = users.toLocaleString('es-MX');
        $('statPlants').textContent = plants.toLocaleString('es-MX');
        $('statGardens').textContent = gardens.toLocaleString('es-MX');
        $('statLearning').textContent = (courses + videos + documents).toLocaleString('es-MX');
    }

    function switchTab(tab) {
        document.querySelectorAll('.admin-tab').forEach(button => {
            button.classList.toggle('is-active', button.dataset.tab === tab);
        });

        document.querySelectorAll('.admin-panel').forEach(panel => {
            panel.classList.toggle('is-active', panel.dataset.panel === tab);
        });

        document.querySelector('.admin-workspace-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    function buildWorkspace() {
        const section = document.getElementById('plantsManagement');
        if (!section) return;

        section.innerHTML = `
            <div class="dashboard-container admin-workspace">
                <div class="dashboard-section-heading">
                    <div>
                        <span class="dashboard-label">🧰 Herramientas</span>
                        <h2>Gestor de Agropedia</h2>
                        <p id="workspaceMessage">Cargando...</p>
                    </div>
                </div>

                <nav class="admin-tabs" aria-label="Herramientas administrativas">
                    <button type="button" class="admin-tab is-active" data-tab="plants">🌱 Plantas</button>
                    <button type="button" class="admin-tab" data-tab="courses">🎓 Cursos</button>
                    <button type="button" class="admin-tab" data-tab="videos">🎥 Videos</button>
                    <button type="button" class="admin-tab" data-tab="documents">📄 Documentos</button>
                    <button type="button" class="admin-tab" data-tab="crop">🌾 Cultivo</button>
                    <button type="button" class="admin-tab" data-tab="comments">💬 Comunidad</button>
                </nav>

                <div class="admin-panel is-active" data-panel="plants">
                    <div class="admin-panel-heading">
                        <div><span class="dashboard-label">Base de conocimiento</span><h3>Plantas</h3></div>
                        <button class="secondary-button" id="newPlantButton" type="button">+ Nueva planta</button>
                    </div>
                    <form class="admin-form" id="plantForm" hidden>
                        <input type="hidden" id="plantId">
                        <div class="form-grid">
                            <label>Nombre común<input id="plantNombre" required></label>
                            <label>Nombre científico<input id="plantCientifico"></label>
                            <label>Familia<select id="plantFamilia"><option value="">Sin familia</option></select></label>
                            <label>Dificultad<select id="plantDificultad"><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></label>
                            <label>Luz<input id="plantLuz"></label>
                            <label>Tipo de cultivo<input id="plantTipoCultivo"></label>
                            <label>Ciclo<input id="plantCiclo"></label>
                            <label>Clima preferido<input id="plantClima"></label>
                            <label>Suelo preferido<input id="plantSuelo"></label>
                            <label>Riego<input id="plantRiego"></label>
                            <label>Poda<input id="plantPoda"></label>
                            <label>Época de siembra<input id="plantSiembra"></label>
                            <label>Frecuencia de cosecha<input id="plantCosecha"></label>
                            <label>Cantidad de producción<input id="plantProduccion"></label>
                            <label>Imagen URL<input id="plantImagen" type="url"></label>
                            <label>Video URL<input id="plantVideo" type="url"></label>
                        </div>
                        <label>Descripción<textarea id="plantDescripcion" rows="5"></textarea></label>
                        <div class="form-actions"><button class="primary-button" type="submit">Guardar planta</button><button class="secondary-button" type="button" id="cancelPlant">Cancelar</button></div>
                    </form>
                    <div class="admin-list" id="plantsList"></div>
                </div>

                ${learningPanel('courses', '🎓', 'Cursos', 'course', 'Nuevo curso')}
                ${learningPanel('videos', '🎥', 'Videos', 'video', 'Nuevo video')}
                ${learningPanel('documents', '📄', 'Documentos', 'document', 'Nuevo documento')}

                <div class="admin-panel" data-panel="crop">
                    <div class="admin-panel-heading"><div><span class="dashboard-label">Reglas de cultivo</span><h3>Etapas y tareas</h3></div></div>
                    <div class="crop-management-grid">
                        <form class="admin-form" id="stageForm">
                            <h4>Nueva etapa</h4>
                            <label>Nombre<input id="stageNombre" required></label>
                            <label>Descripción<textarea id="stageDescripcion" rows="3"></textarea></label>
                            <label>Orden<input id="stageOrden" type="number" min="1" value="1" required></label>
                            <button class="primary-button" type="submit">Guardar etapa</button>
                        </form>
                        <form class="admin-form" id="taskForm">
                            <h4>Nueva tarea</h4>
                            <label>Planta<select id="taskPlant" required></select></label>
                            <label>Etapa<select id="taskStage"></select></label>
                            <label>Título<input id="taskTitulo" required></label>
                            <label>Descripción<textarea id="taskDescripcion" rows="3"></textarea></label>
                            <div class="form-grid form-grid--small">
                                <label>Días desde siembra<input id="taskDias" type="number" min="0"></label>
                                <label>Duración (min)<input id="taskDuracion" type="number" min="0"></label>
                            </div>
                            <label class="checkbox-label"><input id="taskClima" type="checkbox"> Depende del clima</label>
                            <label class="checkbox-label"><input id="taskLuna" type="checkbox"> Depende de la luna</label>
                            <button class="primary-button" type="submit">Guardar tarea</button>
                        </form>
                    </div>
                    <div class="admin-list" id="stagesList"></div>
                </div>

                <div class="admin-panel" data-panel="comments">
                    <div class="admin-panel-heading"><div><span class="dashboard-label">Comunidad</span><h3>Moderación</h3></div><button class="secondary-button" id="refreshComments" type="button">Actualizar</button></div>
                    <div class="admin-list" id="commentsList"></div>
                    <div class="admin-list" id="reportsList"></div>
                </div>
            </div>
        `;

        document.querySelectorAll('.admin-tab').forEach(button => {
            button.addEventListener('click', () => switchTab(button.dataset.tab));
        });

        document.querySelectorAll('.quick-action[data-target]').forEach(button => {
            button.addEventListener('click', () => {
                const target = button.dataset.target;
                const map = { plantsManagement: 'plants', learningManagement: 'courses', cropManagement: 'crop', commentsManagement: 'comments' };
                switchTab(map[target] || 'plants');
            });
        });
    }

    function learningPanel(type, icon, title, prefix, buttonText) {
        return `
            <div class="admin-panel" data-panel="${type}">
                <div class="admin-panel-heading"><div><span class="dashboard-label">Aprendizaje</span><h3>${icon} ${title}</h3></div><button class="secondary-button" id="new${capitalize(prefix)}Button" type="button">+ ${buttonText}</button></div>
                <form class="admin-form" id="${prefix}Form" hidden>
                    <input type="hidden" id="${prefix}Id">
                    <div class="form-grid">
                        <label>Título<input id="${prefix}Titulo" required></label>
                        <label>Slug<input id="${prefix}Slug" required></label>
                        ${type === 'videos' ? '<label>Video URL<input id="videoUrl" type="url" required></label><label>Miniatura URL<input id="videoMiniatura" type="url"></label>' : ''}
                        ${type === 'documents' ? '<label>Ruta del archivo<input id="documentPath" required placeholder="documentos/guia.pdf"></label><label>URL del archivo<input id="documentUrl" type="url"></label>' : ''}
                        ${type === 'courses' ? '<label>Imagen URL<input id="courseImagen" type="url"></label>' : ''}
                        <label>Dificultad<select id="${prefix}Dificultad"><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></label>
                        <label>Duración (min)<input id="${prefix}Duracion" type="number" min="0"></label>
                        <label>Estado<select id="${prefix}Estado"><option value="borrador">Borrador</option><option value="publicado">Publicado</option><option value="archivado">Archivado</option></select></label>
                    </div>
                    <label>Descripción<textarea id="${prefix}Descripcion" rows="4"></textarea></label>
                    <div class="form-actions"><button class="primary-button" type="submit">Guardar ${title.toLowerCase()}</button><button class="secondary-button" type="button" id="cancel${capitalize(prefix)}">Cancelar</button></div>
                </form>
                <div class="admin-list" id="${prefix}sList"></div>
            </div>
        `;
    }

    function capitalize(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    async function loadFamilies(supabase) {
        const { data, error } = await supabase.from('familias').select('id,nombre').order('nombre');
        if (error) return;
        state.families = data || [];
        $('plantFamilia').innerHTML = '<option value="">Sin familia</option>' + state.families.map(item => `<option value="${item.id}">${escapeHtml(item.nombre)}</option>`).join('');
    }

    async function loadPlants(supabase) {
        const { data, error } = await supabase.from('plantas').select('*').order('nombre_comun');
        if (error) {
            toast(`No se pudieron cargar las plantas: ${error.message}`, true);
            return;
        }
        state.plants = data || [];
        $('plantsList').innerHTML = state.plants.map(plant => `
            <div class="admin-list-item">
                <div><strong>${escapeHtml(plant.nombre_comun)}</strong><small>${escapeHtml(plant.nombre_cientifico || 'Sin nombre científico')} · ${escapeHtml(plant.dificultad || 'Sin dificultad')}</small></div>
                <div class="admin-list-actions"><button class="text-button" data-edit-plant="${plant.id}">Editar</button><button class="text-button danger" data-delete-plant="${plant.id}">Eliminar</button></div>
            </div>
        `).join('') || '<p class="empty-state">Todavía no hay plantas.</p>';

        document.querySelectorAll('[data-edit-plant]').forEach(button => button.addEventListener('click', () => editPlant(Number(button.dataset.editPlant))));
        document.querySelectorAll('[data-delete-plant]').forEach(button => button.addEventListener('click', () => deletePlant(supabase, Number(button.dataset.deletePlant))));

        $('taskPlant').innerHTML = state.plants.map(plant => `<option value="${plant.id}">${escapeHtml(plant.nombre_comun)}</option>`).join('');
    }

    function editPlant(id) {
        const plant = state.plants.find(item => item.id === id);
        if (!plant) return;
        $('plantForm').hidden = false;
        $('plantId').value = plant.id;
        const fields = {
            plantNombre: plant.nombre_comun,
            plantCientifico: plant.nombre_cientifico,
            plantFamilia: plant.familia_id,
            plantDificultad: plant.dificultad,
            plantLuz: plant.luz,
            plantTipoCultivo: plant.tipo_cultivo,
            plantCiclo: plant.ciclo,
            plantClima: plant.clima_preferido,
            plantSuelo: plant.suelo_preferido,
            plantRiego: plant.riego,
            plantPoda: plant.poda,
            plantSiembra: plant.epoca_siembra,
            plantCosecha: plant.frecuencia_cosecha,
            plantProduccion: plant.cantidad_produccion,
            plantImagen: plant.imagen_url,
            plantVideo: plant.video_url,
            plantDescripcion: plant.descripcion
        };
        Object.entries(fields).forEach(([idField, value]) => { if ($(idField)) $(idField).value = value ?? ''; });
        $('plantForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearPlantForm() {
        $('plantForm').reset();
        $('plantId').value = '';
        $('plantForm').hidden = true;
    }

    async function savePlant(supabase, event) {
        event.preventDefault();
        const id = $('plantId').value;
        const payload = {
            nombre_comun: $('plantNombre').value.trim(),
            nombre_cientifico: $('plantCientifico').value.trim() || null,
            familia_id: $('plantFamilia').value ? Number($('plantFamilia').value) : null,
            dificultad: $('plantDificultad').value,
            luz: $('plantLuz').value.trim() || null,
            tipo_cultivo: $('plantTipoCultivo').value.trim() || null,
            ciclo: $('plantCiclo').value.trim() || null,
            clima_preferido: $('plantClima').value.trim() || null,
            suelo_preferido: $('plantSuelo').value.trim() || null,
            riego: $('plantRiego').value.trim() || null,
            poda: $('plantPoda').value.trim() || null,
            epoca_siembra: $('plantSiembra').value.trim() || null,
            frecuencia_cosecha: $('plantCosecha').value.trim() || null,
            cantidad_produccion: $('plantProduccion').value.trim() || null,
            imagen_url: $('plantImagen').value.trim() || null,
            video_url: $('plantVideo').value.trim() || null,
            descripcion: $('plantDescripcion').value.trim() || null
        };

        const query = id
            ? supabase.from('plantas').update(payload).eq('id', Number(id))
            : supabase.from('plantas').insert(payload);
        const { error } = await query;
        if (error) {
            toast(`No se pudo guardar la planta: ${error.message}`, true);
            return;
        }
        toast(id ? 'Planta actualizada correctamente.' : 'Planta creada correctamente.');
        clearPlantForm();
        await loadPlants(supabase);
        await loadStats(supabase);
    }

    async function deletePlant(supabase, id) {
        const plant = state.plants.find(item => item.id === id);
        if (!plant || !confirm(`¿Eliminar la planta "${plant.nombre_comun}"?`)) return;
        const { error } = await supabase.from('plantas').delete().eq('id', id);
        if (error) {
            toast(`No se pudo eliminar: ${error.message}`, true);
            return;
        }
        toast('Planta eliminada.');
        await loadPlants(supabase);
        await loadStats(supabase);
    }

    async function loadLearning(supabase, table, prefix) {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        const container = $(`${prefix}sList`);
        if (error) {
            container.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
            return;
        }
        container.innerHTML = (data || []).map(item => `
            <div class="admin-list-item">
                <div><strong>${escapeHtml(item.titulo)}</strong><small>${escapeHtml(item.estado)} · ${escapeHtml(item.dificultad)}</small></div>
                <div class="admin-list-actions"><button class="text-button" data-delete-resource="${item.id}" data-resource-table="${table}">Eliminar</button></div>
            </div>
        `).join('') || '<p class="empty-state">No hay registros todavía.</p>';

        container.querySelectorAll('[data-delete-resource]').forEach(button => {
            button.addEventListener('click', async () => {
                if (!confirm('¿Eliminar este contenido?')) return;
                const result = await supabase.from(button.dataset.resourceTable).delete().eq('id', Number(button.dataset.deleteResource));
                if (result.error) toast(result.error.message, true);
                else { toast('Contenido eliminado.'); await loadLearning(supabase, table, prefix); await loadStats(supabase); }
            });
        });
    }

    function bindLearningForm(supabase, table, prefix) {
        const form = $(`${prefix}Form`);
        $(`new${capitalize(prefix)}Button`).addEventListener('click', () => { form.hidden = false; form.reset(); });
        $(`cancel${capitalize(prefix)}`).addEventListener('click', () => { form.reset(); form.hidden = true; });

        form.addEventListener('submit', async event => {
            event.preventDefault();
            const payload = {
                titulo: $(`${prefix}Titulo`).value.trim(),
                slug: $(`${prefix}Slug`).value.trim(),
                descripcion: $(`${prefix}Descripcion`).value.trim() || null,
                dificultad: $(`${prefix}Dificultad`).value,
                duracion_minutos: $(`${prefix}Duracion`).value ? Number($(`${prefix}Duracion`).value) : null,
                estado: $(`${prefix}Estado`).value,
                autor_id: state.user.id
            };

            if (table === 'cursos') payload.imagen_url = $('courseImagen').value.trim() || null;
            if (table === 'videos') {
                payload.video_url = $('videoUrl').value.trim();
                payload.miniatura_url = $('videoMiniatura').value.trim() || null;
            }
            if (table === 'documentos') {
                payload.archivo_path = $('documentPath').value.trim();
                payload.archivo_url = $('documentUrl').value.trim() || null;
            }

            if (payload.estado === 'publicado') payload.publicado_at = new Date().toISOString();

            const { error } = await supabase.from(table).insert(payload);
            if (error) toast(`No se pudo guardar: ${error.message}`, true);
            else {
                toast('Contenido guardado correctamente.');
                form.reset();
                form.hidden = true;
                await loadLearning(supabase, table, prefix);
                await loadStats(supabase);
            }
        });
    }

    async function loadCrop(supabase) {
        const { data, error } = await supabase.from('etapas_cultivo').select('*').order('orden');
        if (error) return;
        state.stages = data || [];
        $('taskStage').innerHTML = '<option value="">Sin etapa</option>' + state.stages.map(stage => `<option value="${stage.id}">${escapeHtml(stage.nombre)}</option>`).join('');
        $('stagesList').innerHTML = state.stages.map(stage => `<div class="admin-list-item"><div><strong>${escapeHtml(stage.nombre)}</strong><small>Orden ${stage.orden}</small></div></div>`).join('') || '<p class="empty-state">No hay etapas.</p>';
    }

    async function bindCrop(supabase) {
        $('stageForm').addEventListener('submit', async event => {
            event.preventDefault();
            const { error } = await supabase.from('etapas_cultivo').insert({
                nombre: $('stageNombre').value.trim(),
                descripcion: $('stageDescripcion').value.trim() || null,
                orden: Number($('stageOrden').value)
            });
            if (error) toast(error.message, true);
            else { toast('Etapa guardada.'); event.target.reset(); await loadCrop(supabase); }
        });

        $('taskForm').addEventListener('submit', async event => {
            event.preventDefault();
            const { error } = await supabase.from('tareas_cultivo').insert({
                planta_id: Number($('taskPlant').value),
                etapa_id: $('taskStage').value ? Number($('taskStage').value) : null,
                titulo: $('taskTitulo').value.trim(),
                descripcion: $('taskDescripcion').value.trim() || null,
                dias_desde_siembra: $('taskDias').value ? Number($('taskDias').value) : null,
                duracion_minutos: $('taskDuracion').value ? Number($('taskDuracion').value) : null,
                depende_clima: $('taskClima').checked,
                depende_luna: $('taskLuna').checked,
                orden: 1
            });
            if (error) toast(error.message, true);
            else { toast('Tarea de cultivo guardada.'); event.target.reset(); }
        });
    }

    async function loadComments(supabase) {
        const { data, error } = await supabase.from('comentarios').select('id,contenido,calificacion,estado,created_at').order('created_at', { ascending: false }).limit(30);
        if (error) {
            $('commentsList').innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
            return;
        }
        $('commentsList').innerHTML = '<h4>Comentarios recientes</h4>' + ((data || []).map(comment => `
            <div class="admin-list-item">
                <div><strong>${escapeHtml(comment.estado)}</strong><small>${escapeHtml(comment.contenido)} · ${new Date(comment.created_at).toLocaleString('es-MX')}</small></div>
            </div>
        `).join('') || '<p class="empty-state">No hay comentarios.</p>');

        const reports = await supabase.from('reportes_comentario').select('id,comentario_id,motivo,resuelto,created_at').order('created_at', { ascending: false }).limit(30);
        $('reportsList').innerHTML = '<h4>Reportes</h4>' + ((reports.data || []).map(report => `
            <div class="admin-list-item"><div><strong>${report.resuelto ? 'Resuelto' : 'Pendiente'}</strong><small>Comentario #${report.comentario_id} · ${escapeHtml(report.motivo)}</small></div></div>
        `).join('') || '<p class="empty-state">No hay reportes.</p>');
    }

    function renderDemoAnalytics() {
        $('rankingList').innerHTML = '<div class="ranking-item"><span class="ranking-position">1</span><div class="ranking-item__content"><strong>Datos en preparación</strong><small>Las métricas de favoritos y visitas se conectarán a sus tablas de actividad.</small></div></div>';
        $('activityList').innerHTML = '<div class="activity-item"><span class="activity-item__icon">🌱</span><div class="activity-item__content"><strong>Dashboard conectado</strong><small>El contenido administrativo ya puede guardarse en Supabase.</small></div></div>';
    }

    async function initialize() {
        setDate();
        buildWorkspace();

        let supabase;
        try {
            supabase = await loadSupabaseClient();
        } catch (error) {
            toast('No se pudo cargar Supabase.', true);
            return;
        }

        const authorized = await verifyAdmin(supabase);
        if (!authorized) {
            document.querySelectorAll('#adminWorkspace button, #adminWorkspace input, #adminWorkspace textarea, #adminWorkspace select').forEach(element => element.disabled = true);
            renderDemoAnalytics();
            return;
        }

        await loadStats(supabase);
        await loadFamilies(supabase);
        await loadPlants(supabase);
        await loadCrop(supabase);
        await bindCrop(supabase);
        await loadComments(supabase);

        $('newPlantButton').addEventListener('click', () => {
            $('plantForm').hidden = false;
            $('plantForm').reset();
            $('plantId').value = '';
            $('plantForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        $('cancelPlant').addEventListener('click', clearPlantForm);
        $('plantForm').addEventListener('submit', event => savePlant(supabase, event));

        bindLearningForm(supabase, 'cursos', 'course');
        bindLearningForm(supabase, 'videos', 'video');
        bindLearningForm(supabase, 'documentos', 'document');

        await loadLearning(supabase, 'cursos', 'course');
        await loadLearning(supabase, 'videos', 'video');
        await loadLearning(supabase, 'documentos', 'document');

        $('refreshComments').addEventListener('click', () => loadComments(supabase));
        renderDemoAnalytics();
    }

    document.addEventListener('DOMContentLoaded', initialize);
})();
