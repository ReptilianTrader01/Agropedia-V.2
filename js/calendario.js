/* =========================================================
   CALENDARIO AGRÍCOLA
   Agropedia V2 - Fase 3.2

   EventoAgricola es solamente un objeto en memoria.
   No existe una tabla eventos_calendario.
========================================================= */

'use strict';

const db = window.agropediaSupabase;

const gardenSelector = document.getElementById('gardenSelector');
const previousMonthButton = document.getElementById('previousMonth');
const todayButton = document.getElementById('todayButton');
const nextMonthButton = document.getElementById('nextMonth');
const calendarMonth = document.getElementById('calendarMonth');
const calendarGrid = document.getElementById('calendarGrid');
const dayDetails = document.getElementById('dayDetails');
const filterButtons = document.querySelectorAll('.filter-button');

let user = null;
let gardens = [];
let activeGarden = null;
let tasks = [];
let crops = [];
let events = [];
let currentDate = new Date();
let selectedDateKey = null;
let activeFilter = 'todos';

const EVENT_TYPES = {
    TAREA: 'tarea',
    SIEMBRA: 'siembra',
    COSECHA: 'cosecha'
};

const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

function getLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function parseDateKey(value) {
    if (!value) return null;

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const date = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
    );

    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateLong(date) {
    return new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

function formatMonth(date) {
    const text = new Intl.DateTimeFormat('es-MX', {
        month: 'long',
        year: 'numeric'
    }).format(date);

    return text.charAt(0).toUpperCase() + text.slice(1);
}

function getGardenId() {
    return activeGarden?.id || null;
}

function getPlantName(crop) {
    return crop?.plantas?.nombre_comun || 'Planta';
}

/* Una fila real de tareas_huerto -> EventoAgricola en memoria. */
function taskToEvent(task) {
    return {
        id: 'tarea-' + task.id,
        tipo: EVENT_TYPES.TAREA,
        titulo: task.titulo || 'Tarea del huerto',
        descripcion: task.descripcion || '',
        fecha: task.fecha,
        estado: task.completada ? 'completado' : 'pendiente',
        huerto_id: task.huerto_id,
        planta_bancal_id: task.planta_bancal_id ?? null,
        planta_id: null,
        tarea_huerto_id: task.id,
        origen: 'tarea_huerto'
    };
}

/* Un cultivo con fechas -> eventos derivados, sin escribirlos en Supabase. */
function cropToEvents(crop) {
    const result = [];
    const plantName = getPlantName(crop);

    if (crop.fecha_siembra) {
        result.push({
            id: 'siembra-' + crop.id,
            tipo: EVENT_TYPES.SIEMBRA,
            titulo: 'Siembra de ' + plantName,
            descripcion: 'Fecha de siembra registrada para este cultivo.',
            fecha: crop.fecha_siembra,
            estado: 'completado',
            huerto_id: activeGarden.id,
            planta_bancal_id: crop.id,
            planta_id: crop.planta_id ?? crop.plantas?.id ?? null,
            tarea_huerto_id: null,
            origen: 'cultivo'
        });
    }

    if (crop.fecha_cosecha_estimada) {
        result.push({
            id: 'cosecha-' + crop.id,
            tipo: EVENT_TYPES.COSECHA,
            titulo: 'Cosecha estimada de ' + plantName,
            descripcion: 'Fecha estimada de cosecha del cultivo.',
            fecha: crop.fecha_cosecha_estimada,
            estado: 'pendiente',
            huerto_id: activeGarden.id,
            planta_bancal_id: crop.id,
            planta_id: crop.planta_id ?? crop.plantas?.id ?? null,
            tarea_huerto_id: null,
            origen: 'cultivo'
        });
    }

    return result;
}

function buildEvents() {
    const taskEvents = tasks.filter(task => task.fecha).map(taskToEvent);
    const cultivationEvents = crops.flatMap(cropToEvents);

    events = [...taskEvents, ...cultivationEvents]
        .filter(event => event.huerto_id === getGardenId())
        .sort((a, b) => {
            const dateCompare = String(a.fecha).localeCompare(String(b.fecha));
            if (dateCompare !== 0) return dateCompare;
            return a.titulo.localeCompare(b.titulo, 'es');
        });
}

function getVisibleEvents() {
    if (activeFilter === 'todos') return events;
    return events.filter(event => event.tipo === activeFilter);
}

async function requireUser() {
    const { data, error } = await db.auth.getUser();

    if (error || !data.user) {
        alert('Inicia sesión para utilizar el calendario agrícola.');
        window.location.href = 'registro.html';
        return false;
    }

    user = data.user;
    return true;
}

async function loadGardens() {
    const { data, error } = await db
        .from('huertos')
        .select('id,nombre,created_at')
        .eq('usuario_id', user.id)
        .order('created_at');

    if (error) throw error;

    gardens = data || [];

    if (!gardens.length) {
        const created = await db
            .from('huertos')
            .insert({
                usuario_id: user.id,
                nombre: 'Mi huerto',
                descripcion: 'Mi espacio de cultivo en Agropedia',
                ancho: 6,
                alto: 4
            })
            .select('id,nombre,created_at')
            .single();

        if (created.error) throw created.error;
        gardens = [created.data];
    }

    const storedId = Number(localStorage.getItem('agropedia_active_garden'));
    activeGarden = gardens.find(item => item.id === storedId) || gardens[0];

    localStorage.setItem('agropedia_active_garden', String(activeGarden.id));
    renderGardenSelector();
}

function renderGardenSelector() {
    gardenSelector.innerHTML = gardens.map(garden => (
        '<option value="' + garden.id + '"' +
        (garden.id === activeGarden.id ? ' selected' : '') +
        '>' + escapeHtml(garden.nombre) + '</option>'
    )).join('');
}

async function loadGardenData() {
    if (!activeGarden) return;

    const taskResult = await db
        .from('tareas_huerto')
        .select('id,huerto_id,planta_bancal_id,tarea_cultivo_id,titulo,descripcion,fecha,completada,created_at,completed_at')
        .eq('huerto_id', activeGarden.id)
        .order('fecha')
        .order('id');

    if (taskResult.error) throw taskResult.error;
    tasks = taskResult.data || [];

    const bedResult = await db
        .from('bancales')
        .select('id')
        .eq('huerto_id', activeGarden.id);

    if (bedResult.error) throw bedResult.error;

    const bedIds = (bedResult.data || []).map(bed => bed.id);

    if (!bedIds.length) {
        crops = [];
        buildEvents();
        selectedDateKey = getLocalDateKey(new Date());
        return;
    }

    const cropResult = await db
        .from('plantas_bancal')
        .select('id,bancal_id,planta_id,fecha_siembra,fecha_cosecha_estimada,estado,plantas(id,nombre_comun)')
        .in('bancal_id', bedIds)
        .eq('estado', 'activa');

    if (cropResult.error) throw cropResult.error;
    crops = cropResult.data || [];

    buildEvents();

    const todayKey = getLocalDateKey(new Date());

    if (!selectedDateKey || !events.some(event => event.fecha === selectedDateKey)) {
        selectedDateKey = todayKey;
    }
}

async function changeGarden(id) {
    const selected = gardens.find(item => item.id === Number(id));

    if (!selected || selected.id === activeGarden.id) return;

    activeGarden = selected;
    localStorage.setItem('agropedia_active_garden', String(activeGarden.id));
    selectedDateKey = getLocalDateKey(new Date());

    await loadGardenData();
    renderCalendar();
}

async function toggleTask(taskId) {
    const task = tasks.find(item => item.id === taskId);

    if (!task) return;

    const completed = !task.completada;

    const payload = {
        completada: completed,
        completed_at: completed ? new Date().toISOString() : null
    };

    const { error } = await db
        .from('tareas_huerto')
        .update(payload)
        .eq('id', task.id)
        .eq('huerto_id', activeGarden.id);

    if (error) {
        alert('No se pudo actualizar la tarea: ' + error.message);
        return;
    }

    task.completada = completed;
    task.completed_at = payload.completed_at;

    buildEvents();
    renderCalendar();
}

function getCalendarCells(date) {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        1 - firstWeekday
    );

    return Array.from({ length: 42 }, (_, index) => new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + index
    ));
}

function getEventLabel(event) {
    if (event.tipo === EVENT_TYPES.TAREA) return 'Tarea';
    if (event.tipo === EVENT_TYPES.SIEMBRA) return 'Siembra';
    if (event.tipo === EVENT_TYPES.COSECHA) return 'Cosecha';
    return 'Evento';
}

function renderCalendar() {
    calendarMonth.textContent = formatMonth(currentDate);

    const visibleEvents = getVisibleEvents();
    const cells = getCalendarCells(currentDate);
    const todayKey = getLocalDateKey(new Date());

    calendarGrid.innerHTML = '';

    cells.forEach(date => {
        const dateKey = getLocalDateKey(date);
        const cell = document.createElement('button');

        cell.type = 'button';
        cell.className = 'calendar-day';
        cell.setAttribute('aria-label', formatDateLong(date));

        if (date.getMonth() !== currentDate.getMonth()) cell.classList.add('is-outside');
        if (dateKey === todayKey) cell.classList.add('is-today');
        if (dateKey === selectedDateKey) cell.classList.add('is-selected');

        const dayEvents = visibleEvents.filter(event => event.fecha === dateKey);

        const eventPreview = dayEvents.slice(0, 3).map(event =>
            '<div class="calendar-event event-' + event.tipo +
            (event.estado === 'completado' ? ' is-completed' : '') +
            '" title="' + escapeHtml(event.titulo) + '">' +
            escapeHtml(event.titulo) +
            '</div>'
        ).join('');

        const remaining = dayEvents.length - 3;
        const more = remaining > 0
            ? '<span class="calendar-more">+' + remaining + ' más</span>'
            : '';

        cell.innerHTML =
            '<span class="calendar-day-number">' + date.getDate() + '</span>' +
            '<div class="calendar-events">' + eventPreview + more + '</div>';

        cell.addEventListener('click', () => {
            selectedDateKey = dateKey;
            renderCalendar();
        });

        calendarGrid.appendChild(cell);
    });

    renderDayDetails();
}

function renderDayDetails() {
    if (!selectedDateKey) return;

    const date = parseDateKey(selectedDateKey);
    const visibleEvents = getVisibleEvents().filter(
        event => event.fecha === selectedDateKey
    );

    if (!date) return;

    if (!visibleEvents.length) {
        dayDetails.innerHTML =
            '<div class="day-details-empty">' +
                '<span>🌱</span>' +
                '<h3>' + escapeHtml(formatDateLong(date)) + '</h3>' +
                '<p>No hay eventos de los filtros seleccionados para este día.</p>' +
            '</div>';
        return;
    }

    const cards = visibleEvents.map(event => {
        const taskAction = event.tipo === EVENT_TYPES.TAREA
            ? '<div class="day-event-actions">' +
                '<button type="button" class="complete-task-button' +
                (event.estado === 'completado' ? ' is-completed' : '') +
                '" data-task-id="' + event.tarea_huerto_id + '">' +
                (event.estado === 'completado' ? '✓ Completada' : 'Marcar como completada') +
                '</button>' +
              '</div>'
            : '';

        return (
            '<article class="day-event">' +
                '<div class="day-event-top">' +
                    '<span class="event-type">' + escapeHtml(getEventLabel(event)) + '</span>' +
                    (event.estado === 'completado' ? '<span aria-label="Completado">✓</span>' : '') +
                '</div>' +
                '<strong>' + escapeHtml(event.titulo) + '</strong>' +
                '<p>' + escapeHtml(event.descripcion || 'Sin descripción.') + '</p>' +
                taskAction +
            '</article>'
        );
    }).join('');

    dayDetails.innerHTML =
        '<div class="day-details-header">' +
            '<div><span class="section-label">Detalle del día</span>' +
            '<h3>' + escapeHtml(formatDateLong(date)) + '</h3></div>' +
            '<span>' + visibleEvents.length + ' evento' +
            (visibleEvents.length === 1 ? '' : 's') + '</span>' +
        '</div>' +
        '<div class="day-event-list">' + cards + '</div>';

    dayDetails.querySelectorAll('[data-task-id]').forEach(button => {
        button.addEventListener('click', () => {
            toggleTask(Number(button.dataset.taskId));
        });
    });
}

function moveMonth(offset) {
    currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + offset,
        1
    );
    renderCalendar();
}

function setToday() {
    currentDate = new Date();
    selectedDateKey = getLocalDateKey(currentDate);
    renderCalendar();
}

function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach(button => {
        button.classList.toggle('is-active', button.dataset.filter === activeFilter);
    });
    renderCalendar();
}

function setupEvents() {
    gardenSelector.addEventListener('change', event => {
        changeGarden(event.target.value).catch(handleError);
    });

    previousMonthButton.addEventListener('click', () => moveMonth(-1));
    todayButton.addEventListener('click', setToday);
    nextMonthButton.addEventListener('click', () => moveMonth(1));

    filterButtons.forEach(button => {
        button.addEventListener('click', () => setFilter(button.dataset.filter));
    });
}

function handleError(error) {
    console.error('Calendario agrícola:', error);
    calendarGrid.innerHTML =
        '<div class="calendar-error">No pudimos cargar el calendario. Revisa tu sesión e inténtalo nuevamente.</div>';
}

async function initCalendar() {
    try {
        if (!await requireUser()) return;

        setupEvents();
        await loadGardens();
        await loadGardenData();
        renderCalendar();
    } catch (error) {
        handleError(error);
    }
}

initCalendar();
