(function () {
    'use strict';

    var supabase = window.agropediaSupabase;
    var state = {
        user: null,
        topics: [],
        courses: [],
        modules: [],
        lessons: [],
        documents: []
    };

    function $(id) { return document.getElementById(id); }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function toast(message, error) {
        var item = document.createElement('div');
        item.className = 'dashboard-toast' + (error ? ' dashboard-toast--error' : '');
        item.textContent = message;
        document.body.appendChild(item);
        requestAnimationFrame(function () { item.classList.add('is-visible'); });
        setTimeout(function () {
            item.classList.remove('is-visible');
            setTimeout(function () { item.remove(); }, 250);
        }, 3000);
    }

    function relationInfo(type) {
        if (type === 'courses') return { table: 'curso_temas', id: 'curso_id' };
        if (type === 'videos') return { table: 'video_temas', id: 'video_id' };
        return { table: 'documento_temas', id: 'documento_id' };
    }

    function resourceLabel(type) {
        return type === 'courses' ? 'curso' : type === 'videos' ? 'video' : 'documento';
    }

    function resourcePlural(type) {
        return type === 'courses' ? 'Cursos' : type === 'videos' ? 'Videos' : 'Documentos';
    }

    function openPanel(name) {
        var tab = document.querySelector('.cms-edu-tab[data-cms-tab="' + name + '"]');
        var panels = document.querySelectorAll('.cms-edu-panel');
        document.querySelectorAll('.cms-edu-tab').forEach(function (button) {
            button.classList.toggle('is-active', button === tab);
        });
        panels.forEach(function (panel) {
            panel.hidden = panel.dataset.cmsPanel !== name;
        });
    }

    function buildUI() {
        var workspace = document.querySelector('#plantsManagement .admin-workspace');
        if (!workspace || document.getElementById('educationalCms')) return;

        var wrapper = document.createElement('div');
        wrapper.id = 'educationalCms';
        wrapper.className = 'cms-edu-wrapper';
        wrapper.innerHTML =
            '<div class="cms-edu-heading">' +
                '<div><span class="dashboard-label">CMS educativo</span><h3>Contenido de Aprende</h3>' +
                '<p>Administra recursos, temas y la estructura interna de los cursos.</p></div>' +
            '</div>' +
            '<div class="cms-edu-tabs">' +
                '<button type="button" class="cms-edu-tab is-active" data-cms-tab="courses">🎓 Cursos</button>' +
                '<button type="button" class="cms-edu-tab" data-cms-tab="videos">🎥 Videos</button>' +
                '<button type="button" class="cms-edu-tab" data-cms-tab="documents">📄 Documentos</button>' +
                '<button type="button" class="cms-edu-tab" data-cms-tab="topics">🏷️ Temas</button>' +
            '</div>' +
            '<section class="cms-edu-panel" data-cms-panel="courses">' + resourcePanel('courses') + '</section>' +
            '<section class="cms-edu-panel" data-cms-panel="videos" hidden>' + resourcePanel('videos') + '</section>' +
            '<section class="cms-edu-panel" data-cms-panel="documents" hidden>' + resourcePanel('documents') + '</section>' +
            '<section class="cms-edu-panel" data-cms-panel="topics" hidden>' + topicPanel() + '</section>';

        workspace.appendChild(wrapper);

        document.querySelectorAll('.cms-edu-tab').forEach(function (button) {
            button.addEventListener('click', function () { openPanel(button.dataset.cmsTab); });
        });

        bindResourceType('courses');
        bindResourceType('videos');
        bindResourceType('documents');
        bindTopics();
    }

    function resourcePanel(type) {
        var prefix = type === 'courses' ? 'Curso' : type === 'videos' ? 'Video' : 'Documento';
        var extra = '';
        if (type === 'courses') {
            extra = '<label>Imagen URL<input id="cms-course-image" type="url"></label>';
        } else if (type === 'videos') {
            extra = '<label>Video URL<input id="cms-video-url" type="url" required></label>' +
                    '<label>Miniatura URL<input id="cms-video-thumb" type="url"></label>';
        } else {
            extra = '<label>Ruta del archivo<input id="cms-document-path" required placeholder="documentos/guia.pdf"></label>' +
                    '<label>URL del archivo<input id="cms-document-url" type="url"></label>';
        }

        return '<div class="cms-edu-panel-heading"><div><h4>' + prefix + 's</h4>' +
            '<span class="cms-edu-count" id="cms-' + type + '-count">0 registros</span></div>' +
            '<button type="button" class="secondary-button" id="cms-new-' + type + '">+ Nuevo</button></div>' +
            '<form class="admin-form cms-edu-form" id="cms-' + type + '-form" hidden>' +
                '<input type="hidden" id="cms-' + type + '-id">' +
                '<div class="form-grid">' +
                    '<label>Título<input id="cms-' + type + '-title" required></label>' +
                    '<label>Slug<input id="cms-' + type + '-slug" required></label>' +
                    extra +
                    '<label>Dificultad<select id="cms-' + type + '-difficulty">' +
                        '<option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option>' +
                    '</select></label>' +
                    '<label>Duración (min)<input id="cms-' + type + '-duration" type="number" min="0"></label>' +
                    '<label>Estado<select id="cms-' + type + '-status">' +
                        '<option value="borrador">Borrador</option><option value="publicado">Publicado</option><option value="archivado">Archivado</option>' +
                    '</select></label>' +
                '</div>' +
                '<label>Descripción<textarea id="cms-' + type + '-description" rows="4"></textarea></label>' +
                '<fieldset class="topic-picker"><legend>Temas</legend><div class="topic-options" id="cms-' + type + '-topics"></div></fieldset>' +
                '<div class="form-actions"><button class="primary-button" type="submit">Guardar</button>' +
                    '<button class="secondary-button" type="button" id="cms-cancel-' + type + '">Cancelar</button></div>' +
            '</form>' +
            '<div class="admin-list" id="cms-' + type + '-list"></div>' +
            (type === 'courses' ? '<div id="cms-course-structure" class="cms-course-structure" hidden>' + courseStructurePanel() + '</div>' : '');
    }

    function courseStructurePanel() {
        return '<div class="cms-structure-heading"><div><span class="dashboard-label">Estructura</span><h4 id="cms-structure-title">Curso</h4></div>' +
            '<button type="button" class="secondary-button" id="cms-close-structure">Cerrar</button></div>' +
            '<div class="cms-structure-grid">' +
                '<form class="admin-form" id="cms-module-form"><h5>Módulo</h5><input type="hidden" id="cms-module-id">' +
                    '<label>Título<input id="cms-module-title" required></label><label>Descripción<textarea id="cms-module-description" rows="3"></textarea></label>' +
                    '<label>Orden<input id="cms-module-order" type="number" min="1" value="1" required></label>' +
                    '<div class="form-actions"><button class="primary-button" type="submit">Guardar módulo</button><button class="secondary-button" type="button" id="cms-module-cancel">Cancelar</button></div>' +
                '</form>' +
                '<form class="admin-form" id="cms-lesson-form"><h5>Lección</h5><input type="hidden" id="cms-lesson-id">' +
                    '<label>Módulo<select id="cms-lesson-module" required></select></label>' +
                    '<label>Título<input id="cms-lesson-title" required></label>' +
                    '<div class="form-grid"><label>Orden<input id="cms-lesson-order" type="number" min="1" value="1" required></label>' +
                    '<label>Tipo<select id="cms-lesson-type"><option value="texto">Texto</option><option value="video">Video</option><option value="documento">Documento</option><option value="mixto">Mixto</option></select></label>' +
                    '<label>Duración (min)<input id="cms-lesson-duration" type="number" min="0"></label>' +
                    '<label>Documento<select id="cms-lesson-document"><option value="">Sin documento</option></select></label></div>' +
                    '<label>Video URL<input id="cms-lesson-video" type="url"></label>' +
                    '<label>Descripción<textarea id="cms-lesson-description" rows="3"></textarea></label>' +
                    '<label>Contenido<textarea id="cms-lesson-content" rows="5"></textarea></label>' +
                    '<label class="checkbox-label"><input id="cms-lesson-required" type="checkbox" checked> Lección obligatoria</label>' +
                    '<div class="form-actions"><button class="primary-button" type="submit">Guardar lección</button><button class="secondary-button" type="button" id="cms-lesson-cancel">Cancelar</button></div>' +
                '</form>' +
            '</div>' +
            '<div class="cms-structure-lists"><div><h5>Módulos</h5><div class="admin-list" id="cms-modules-list"></div></div>' +
            '<div><h5>Lecciones</h5><div class="admin-list" id="cms-lessons-list"></div></div></div>';
    }

    function topicPanel() {
        return '<div class="cms-edu-panel-heading"><div><h4>Temas educativos</h4><span class="cms-edu-count" id="cms-topics-count">0 registros</span></div>' +
            '<button type="button" class="secondary-button" id="cms-new-topic">+ Nuevo tema</button></div>' +
            '<form class="admin-form cms-edu-form" id="cms-topic-form" hidden><input type="hidden" id="cms-topic-id">' +
                '<div class="form-grid"><label>Nombre<input id="cms-topic-name" required></label><label>Slug<input id="cms-topic-slug" required></label>' +
                '<label>Imagen URL<input id="cms-topic-image" type="url"></label><label>Frase<input id="cms-topic-phrase"></label></div>' +
                '<label>Descripción<textarea id="cms-topic-description" rows="4"></textarea></label>' +
                '<div class="form-actions"><button class="primary-button" type="submit">Guardar tema</button><button class="secondary-button" type="button" id="cms-cancel-topic">Cancelar</button></div>' +
            '</form><div class="admin-list" id="cms-topics-list"></div>';
    }

    async function loadTopics() {
        var result = await supabase.from('temas').select('*').order('nombre');
        if (result.error) return toast(result.error.message, true);
        state.topics = result.data || [];
        renderTopicOptions();
        renderTopics();
    }

    function renderTopicOptions() {
        ['courses', 'videos', 'documents'].forEach(function (type) {
            var box = $('cms-' + type + '-topics');
            if (!box) return;
            box.innerHTML = state.topics.map(function (topic) {
                return '<label class="topic-option"><input type="checkbox" value="' + topic.id + '"><span>' + escapeHtml(topic.nombre) + '</span></label>';
            }).join('') || '<span class="empty-state">No hay temas creados.</span>';
        });
    }

    function renderTopics() {
        $('cms-topics-count').textContent = state.topics.length + ' registros';
        $('cms-topics-list').innerHTML = state.topics.map(function (topic) {
            return '<div class="admin-list-item"><div><strong>' + escapeHtml(topic.nombre) + '</strong><small>' +
                escapeHtml(topic.slug) + (topic.descripcion ? ' · ' + escapeHtml(topic.descripcion) : '') +
                '</small></div><div class="admin-list-actions">' +
                '<button class="text-button" data-cms-edit-topic="' + topic.id + '">Editar</button>' +
                '<button class="text-button danger" data-cms-delete-topic="' + topic.id + '">Eliminar</button></div></div>';
        }).join('') || '<p class="empty-state">No hay temas todavía.</p>';

        document.querySelectorAll('[data-cms-edit-topic]').forEach(function (button) {
            button.onclick = function () { editTopic(Number(button.dataset.cmsEditTopic)); };
        });
        document.querySelectorAll('[data-cms-delete-topic]').forEach(function (button) {
            button.onclick = function () { deleteTopic(Number(button.dataset.cmsDeleteTopic)); };
        });
    }

    function selectedTopics(type) {
        return Array.from(document.querySelectorAll('#cms-' + type + '-topics input:checked')).map(function (input) {
            return Number(input.value);
        });
    }

    function setTopics(type, ids) {
        var set = new Set((ids || []).map(Number));
        document.querySelectorAll('#cms-' + type + '-topics input').forEach(function (input) {
            input.checked = set.has(Number(input.value));
        });
    }

    async function getTopicsFor(type, id) {
        var info = relationInfo(type);
        var result = await supabase.from(info.table).select('tema_id').eq(info.id, id);
        return result.data || [];
    }

    async function syncTopics(type, id) {
        var info = relationInfo(type);
        var old = await supabase.from(info.table).delete().eq(info.id, id);
        if (old.error) throw old.error;
        var ids = selectedTopics(type);
        if (!ids.length) return;
        var rows = ids.map(function (topicId) {
            var row = {};
            row[info.id] = id;
            row.tema_id = topicId;
            return row;
        });
        var result = await supabase.from(info.table).insert(rows);
        if (result.error) throw result.error;
    }

    async function loadResources(type) {
        var result = await supabase.from(type).select('*').order('created_at', { ascending: false });
        if (result.error) return toast(result.error.message, true);
        state[type] = result.data || [];
        $('cms-' + type + '-count').textContent = state[type].length + ' registros';

        $('cms-' + type + '-list').innerHTML = state[type].map(function (item) {
            return '<div class="admin-list-item"><div><strong>' + escapeHtml(item.titulo) + '</strong><small>' +
                escapeHtml(item.estado) + ' · ' + escapeHtml(item.dificultad) + '</small></div>' +
                '<div class="admin-list-actions">' +
                (type === 'courses' ? '<button class="text-button" data-cms-structure="' + item.id + '">Estructura</button>' : '') +
                '<button class="text-button" data-cms-edit="' + item.id + '">Editar</button>' +
                '<button class="text-button danger" data-cms-delete="' + item.id + '">Eliminar</button></div></div>';
        }).join('') || '<p class="empty-state">No hay registros todavía.</p>';

        $('cms-' + type + '-list').querySelectorAll('[data-cms-edit]').forEach(function (button) {
            button.onclick = function () { editResource(type, Number(button.dataset.cmsEdit)); };
        });
        $('cms-' + type + '-list').querySelectorAll('[data-cms-delete]').forEach(function (button) {
            button.onclick = function () { deleteResource(type, Number(button.dataset.cmsDelete)); };
        });
        if (type === 'courses') {
            $('cms-courses-list').querySelectorAll('[data-cms-structure]').forEach(function (button) {
                button.onclick = function () { openStructure(Number(button.dataset.cmsStructure)); };
            });
        }
    }

    function resetResourceForm(type) {
        var form = $('cms-' + type + '-form');
        form.reset();
        $('cms-' + type + '-id').value = '';
        form.hidden = true;
        setTopics(type, []);
        if (type === 'courses') $('cms-course-image').value = '';
        if (type === 'videos') { $('cms-video-url').value = ''; $('cms-video-thumb').value = ''; }
        if (type === 'documents') { $('cms-document-path').value = ''; $('cms-document-url').value = ''; }
    }

    async function editResource(type, id) {
        var item = state[type].find(function (row) { return row.id === id; });
        if (!item) return;
        var form = $('cms-' + type + '-form');
        form.hidden = false;
        $('cms-' + type + '-id').value = item.id;
        $('cms-' + type + '-title').value = item.titulo || '';
        $('cms-' + type + '-slug').value = item.slug || '';
        $('cms-' + type + '-difficulty').value = item.dificultad || 'principiante';
        $('cms-' + type + '-duration').value = item.duracion_minutos == null ? '' : item.duracion_minutos;
        $('cms-' + type + '-status').value = item.estado || 'borrador';
        $('cms-' + type + '-description').value = item.descripcion || '';

        if (type === 'courses') $('cms-course-image').value = item.imagen_url || '';
        if (type === 'videos') { $('cms-video-url').value = item.video_url || ''; $('cms-video-thumb').value = item.miniatura_url || ''; }
        if (type === 'documents') { $('cms-document-path').value = item.archivo_path || ''; $('cms-document-url').value = item.archivo_url || ''; }

        var rows = await getTopicsFor(type, id);
        setTopics(type, rows.map(function (row) { return row.tema_id; }));
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async function saveResource(type) {
        var id = $('cms-' + type + '-id').value;
        var payload = {
            titulo: $('cms-' + type + '-title').value.trim(),
            slug: $('cms-' + type + '-slug').value.trim(),
            descripcion: $('cms-' + type + '-description').value.trim() || null,
            dificultad: $('cms-' + type + '-difficulty').value,
            duracion_minutos: $('cms-' + type + '-duration').value ? Number($('cms-' + type + '-duration').value) : null,
            estado: $('cms-' + type + '-status').value,
            autor_id: state.user.id,
            publicado_at: $('cms-' + type + '-status').value === 'publicado' ? new Date().toISOString() : null
        };

        if (type === 'courses') payload.imagen_url = $('cms-course-image').value.trim() || null;
        if (type === 'videos') { payload.video_url = $('cms-video-url').value.trim(); payload.miniatura_url = $('cms-video-thumb').value.trim() || null; }
        if (type === 'documents') { payload.archivo_path = $('cms-document-path').value.trim(); payload.archivo_url = $('cms-document-url').value.trim() || null; }

        var result;
        if (id) {
            result = await supabase.from(type).update(payload).eq('id', Number(id)).select('id').single();
        } else {
            result = await supabase.from(type).insert(payload).select('id').single();
        }
        if (result.error) throw result.error;

        await syncTopics(type, result.data.id);
        toast(id ? 'Contenido actualizado.' : 'Contenido creado.');
        resetResourceForm(type);
        await loadResources(type);
    }

    async function deleteResource(type, id) {
        var item = state[type].find(function (row) { return row.id === id; });
        if (!item || !confirm('¿Eliminar "' + item.titulo + '"?')) return;
        var result = await supabase.from(type).delete().eq('id', id);
        if (result.error) return toast(result.error.message, true);
        toast('Contenido eliminado.');
        await loadResources(type);
    }

    function editTopic(id) {
        var topic = state.topics.find(function (row) { return row.id === id; });
        if (!topic) return;
        $('cms-topic-form').hidden = false;
        $('cms-topic-id').value = topic.id;
        $('cms-topic-name').value = topic.nombre || '';
        $('cms-topic-slug').value = topic.slug || '';
        $('cms-topic-image').value = topic.imagen_url || '';
        $('cms-topic-phrase').value = topic.frase || '';
        $('cms-topic-description').value = topic.descripcion || '';
    }

    async function deleteTopic(id) {
        var topic = state.topics.find(function (row) { return row.id === id; });
        if (!topic || !confirm('¿Eliminar el tema "' + topic.nombre + '"?')) return;
        var result = await supabase.from('temas').delete().eq('id', id);
        if (result.error) return toast(result.error.message, true);
        toast('Tema eliminado.');
        await loadTopics();
    }

    function resetTopicForm() {
        $('cms-topic-form').reset();
        $('cms-topic-id').value = '';
        $('cms-topic-form').hidden = true;
    }

    function bindResourceType(type) {
        $('cms-new-' + type).onclick = function () {
            resetResourceForm(type);
            $('cms-' + type + '-form').hidden = false;
        };
        $('cms-cancel-' + type).onclick = function () { resetResourceForm(type); };
        $('cms-' + type + '-form').onsubmit = async function (event) {
            event.preventDefault();
            try { await saveResource(type); }
            catch (error) { toast(error.message, true); }
        };
    }

    function bindTopics() {
        $('cms-new-topic').onclick = function () {
            resetTopicForm();
            $('cms-topic-form').hidden = false;
        };
        $('cms-cancel-topic').onclick = resetTopicForm;
        $('cms-topic-form').onsubmit = async function (event) {
            event.preventDefault();
            var id = $('cms-topic-id').value;
            var payload = {
                nombre: $('cms-topic-name').value.trim(),
                slug: $('cms-topic-slug').value.trim(),
                descripcion: $('cms-topic-description').value.trim() || null,
                imagen_url: $('cms-topic-image').value.trim() || null,
                frase: $('cms-topic-phrase').value.trim() || null
            };
            var result = id
                ? await supabase.from('temas').update(payload).eq('id', Number(id))
                : await supabase.from('temas').insert(payload);
            if (result.error) return toast(result.error.message, true);
            toast('Tema guardado.');
            resetTopicForm();
            await loadTopics();
        };
    }

    async function loadDocumentsForLessons() {
        var result = await supabase.from('documentos').select('id,titulo').order('titulo');
        state.documents = result.data || [];
        $('cms-lesson-document').innerHTML = '<option value="">Sin documento</option>' +
            state.documents.map(function (doc) { return '<option value="' + doc.id + '">' + escapeHtml(doc.titulo) + '</option>'; }).join('');
    }

    function resetModuleForm() {
        $('cms-module-form').reset();
        $('cms-module-id').value = '';
        $('cms-module-order').value = '1';
    }

    function resetLessonForm() {
        $('cms-lesson-form').reset();
        $('cms-lesson-id').value = '';
        $('cms-lesson-order').value = '1';
        $('cms-lesson-required').checked = true;
    }

    async function openStructure(courseId) {
        openPanel('courses');
        var course = state.courses.find(function (row) { return row.id === courseId; });
        $('cms-course-structure').hidden = false;
        $('cms-structure-title').textContent = course ? course.titulo : 'Curso';
        state.currentCourseId = courseId;
        await loadDocumentsForLessons();
        await loadStructure();
        $('cms-course-structure').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function loadStructure() {
        var courseId = state.currentCourseId;
        var modulesResult = await supabase.from('modulos_curso').select('*').eq('curso_id', courseId).order('orden');
        if (modulesResult.error) return toast(modulesResult.error.message, true);
        state.modules = modulesResult.data || [];

        $('cms-lesson-module').innerHTML = state.modules.map(function (module) {
            return '<option value="' + module.id + '">' + escapeHtml(module.titulo) + '</option>';
        }).join('');

        var moduleIds = state.modules.map(function (module) { return module.id; });
        var lessons = [];
        if (moduleIds.length) {
            var lessonsResult = await supabase.from('lecciones_curso').select('*').in('modulo_id', moduleIds).order('orden');
            if (lessonsResult.error) return toast(lessonsResult.error.message, true);
            lessons = lessonsResult.data || [];
        }
        state.lessons = lessons;

        $('cms-modules-list').innerHTML = state.modules.map(function (module) {
            return '<div class="admin-list-item"><div><strong>' + escapeHtml(module.titulo) + '</strong><small>Orden ' + module.orden + '</small></div>' +
                '<div class="admin-list-actions"><button class="text-button" data-cms-edit-module="' + module.id + '">Editar</button>' +
                '<button class="text-button danger" data-cms-delete-module="' + module.id + '">Eliminar</button></div></div>';
        }).join('') || '<p class="empty-state">No hay módulos.</p>';

        $('cms-lessons-list').innerHTML = state.lessons.map(function (lesson) {
            var module = state.modules.find(function (item) { return item.id === lesson.modulo_id; });
            return '<div class="admin-list-item"><div><strong>' + escapeHtml(lesson.titulo) + '</strong><small>' +
                escapeHtml(module ? module.titulo : 'Sin módulo') + ' · ' + escapeHtml(lesson.tipo_contenido) + ' · Orden ' + lesson.orden +
                '</small></div><div class="admin-list-actions"><button class="text-button" data-cms-edit-lesson="' + lesson.id + '">Editar</button>' +
                '<button class="text-button danger" data-cms-delete-lesson="' + lesson.id + '">Eliminar</button></div></div>';
        }).join('') || '<p class="empty-state">No hay lecciones.</p>';

        bindStructureListButtons();
    }

    function bindStructureListButtons() {
        document.querySelectorAll('[data-cms-edit-module]').forEach(function (button) {
            button.onclick = function () {
                var module = state.modules.find(function (row) { return row.id === Number(button.dataset.cmsEditModule); });
                if (!module) return;
                $('cms-module-id').value = module.id;
                $('cms-module-title').value = module.titulo || '';
                $('cms-module-description').value = module.descripcion || '';
                $('cms-module-order').value = module.orden || 1;
            };
        });
        document.querySelectorAll('[data-cms-delete-module]').forEach(function (button) {
            button.onclick = async function () {
                if (!confirm('¿Eliminar este módulo? Las lecciones relacionadas también dependen de él.')) return;
                var result = await supabase.from('modulos_curso').delete().eq('id', Number(button.dataset.cmsDeleteModule));
                if (result.error) toast(result.error.message, true);
                else { toast('Módulo eliminado.'); await loadStructure(); }
            };
        });
        document.querySelectorAll('[data-cms-edit-lesson]').forEach(function (button) {
            button.onclick = function () {
                var lesson = state.lessons.find(function (row) { return row.id === Number(button.dataset.cmsEditLesson); });
                if (!lesson) return;
                $('cms-lesson-id').value = lesson.id;
                $('cms-lesson-module').value = lesson.modulo_id;
                $('cms-lesson-title').value = lesson.titulo || '';
                $('cms-lesson-description').value = lesson.descripcion || '';
                $('cms-lesson-content').value = lesson.contenido || '';
                $('cms-lesson-type').value = lesson.tipo_contenido || 'texto';
                $('cms-lesson-video').value = lesson.video_url || '';
                $('cms-lesson-document').value = lesson.documento_id || '';
                $('cms-lesson-duration').value = lesson.duracion_minutos == null ? '' : lesson.duracion_minutos;
                $('cms-lesson-order').value = lesson.orden || 1;
                $('cms-lesson-required').checked = lesson.obligatoria !== false;
            };
        });
        document.querySelectorAll('[data-cms-delete-lesson]').forEach(function (button) {
            button.onclick = async function () {
                if (!confirm('¿Eliminar esta lección?')) return;
                var result = await supabase.from('lecciones_curso').delete().eq('id', Number(button.dataset.cmsDeleteLesson));
                if (result.error) toast(result.error.message, true);
                else { toast('Lección eliminada.'); await loadStructure(); }
            };
        });
    }

    function bindStructure() {
        $('cms-close-structure').onclick = function () {
            $('cms-course-structure').hidden = true;
            state.currentCourseId = null;
            resetModuleForm();
            resetLessonForm();
        };
        $('cms-module-cancel').onclick = resetModuleForm;
        $('cms-lesson-cancel').onclick = resetLessonForm;

        $('cms-module-form').onsubmit = async function (event) {
            event.preventDefault();
            if (!state.currentCourseId) return toast('Selecciona un curso.', true);
            var id = $('cms-module-id').value;
            var payload = {
                curso_id: state.currentCourseId,
                titulo: $('cms-module-title').value.trim(),
                descripcion: $('cms-module-description').value.trim() || null,
                orden: Number($('cms-module-order').value)
            };
            var result = id
                ? await supabase.from('modulos_curso').update(payload).eq('id', Number(id))
                : await supabase.from('modulos_curso').insert(payload);
            if (result.error) toast(result.error.message, true);
            else { toast('Módulo guardado.'); resetModuleForm(); await loadStructure(); }
        };

        $('cms-lesson-form').onsubmit = async function (event) {
            event.preventDefault();
            if (!state.currentCourseId || !$('cms-lesson-module').value) return toast('Selecciona un módulo.', true);
            var id = $('cms-lesson-id').value;
            var payload = {
                modulo_id: Number($('cms-lesson-module').value),
                titulo: $('cms-lesson-title').value.trim(),
                descripcion: $('cms-lesson-description').value.trim() || null,
                contenido: $('cms-lesson-content').value.trim() || null,
                tipo_contenido: $('cms-lesson-type').value,
                video_url: $('cms-lesson-video').value.trim() || null,
                documento_id: $('cms-lesson-document').value ? Number($('cms-lesson-document').value) : null,
                duracion_minutos: $('cms-lesson-duration').value ? Number($('cms-lesson-duration').value) : null,
                orden: Number($('cms-lesson-order').value),
                obligatoria: $('cms-lesson-required').checked
            };
            var result = id
                ? await supabase.from('lecciones_curso').update(payload).eq('id', Number(id))
                : await supabase.from('lecciones_curso').insert(payload);
            if (result.error) toast(result.error.message, true);
            else { toast('Lección guardada.'); resetLessonForm(); await loadStructure(); }
        };
    }

    async function init() {
        supabase = window.agropediaSupabase;
        if (!supabase) return;
        var userResult = await supabase.auth.getUser();
        if (userResult.error || !userResult.data.user) return;
        var roleResult = await supabase.rpc('has_role', { required_role: 'administrador' });
        if (roleResult.error || roleResult.data !== true) return;

        state.user = userResult.data.user;
        buildUI();
        await loadTopics();
        await loadDocumentsForLessons();
        await Promise.all([loadResources('courses'), loadResources('videos'), loadResources('documents')]);
        bindStructure();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var attempts = 0;
        var timer = setInterval(function () {
            attempts += 1;
            if (window.agropediaSupabase && document.querySelector('#plantsManagement .admin-workspace')) {
                clearInterval(timer);
                init();
            } else if (attempts >= 50) {
                clearInterval(timer);
            }
        }, 200);
    });
})();