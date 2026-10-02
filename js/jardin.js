/* ==================================================
   MI HUERTO - JAVASCRIPT
   Agropedia V2 - Supabase
================================================== */
'use strict';

const db = window.agropediaSupabase;
const gardenBoard = document.getElementById('gardenBoard');
const emptyStatus = document.getElementById('emptyStatus');
const statusContent = document.getElementById('statusContent');
const selectedCellLabel = document.getElementById('selectedCellLabel');
const boardSize = document.getElementById('boardSize');
const plantCount = document.getElementById('plantCount');
const healthyCount = document.getElementById('healthyCount');
const attentionCount = document.getElementById('attentionCount');
const harvestCount = document.getElementById('harvestCount');
const statusPlantIcon = document.getElementById('statusPlantIcon');
const statusPlantType = document.getElementById('statusPlantType');
const statusPlantName = document.getElementById('statusPlantName');
const statusLocation = document.getElementById('statusLocation');
const statusCondition = document.getElementById('statusCondition');
const wateredCheck = document.getElementById('wateredCheck');
const pestCheck = document.getElementById('pestCheck');
const fungusCheck = document.getElementById('fungusCheck');
const diseaseCheck = document.getElementById('diseaseCheck');
const harvestCheck = document.getElementById('harvestCheck');
const plantInfoButton = document.getElementById('plantInfoButton');
const resetGardenButton = document.getElementById('resetGarden');
const currentDate = document.getElementById('currentDate');
const currentSeason = document.getElementById('currentSeason');
const currentMoon = document.getElementById('currentMoon');
const currentTemperature = document.getElementById('currentTemperature');
const weatherIcon = document.getElementById('weatherIcon');
const progressPercentage = document.getElementById('progressPercentage');
const progressBar = document.getElementById('progressBar');
const progressMessage = document.getElementById('progressMessage');
const taskList = document.getElementById('taskList');
const favoritesGrid = document.getElementById('favoritesGrid');
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');
const commentText = document.getElementById('commentText');
const characterCount = document.getElementById('characterCount');
const commentType = document.getElementById('commentType');
const ratingGroup = document.getElementById('ratingGroup');
const ratingInput = document.getElementById('ratingInput');
const gardenSelector = document.getElementById('gardenSelector');
const createGardenButton = document.getElementById('createGardenButton');
const renameGardenButton = document.getElementById('renameGardenButton');
const deleteGardenButton = document.getElementById('deleteGardenButton');
const plantQuantity = document.getElementById('plantQuantity');
const plantSowingDate = document.getElementById('plantSowingDate');
const plantHarvestDate = document.getElementById('plantHarvestDate');
const plantStage = document.getElementById('plantStage');
const plantNotes = document.getElementById('plantNotes');
const savePlantDetails = document.getElementById('savePlantDetails');
const plantHistoryList = document.getElementById('plantHistoryList');
const refreshHistoryButton = document.getElementById('refreshHistoryButton');

let user = null;
let garden = null;
let beds = [];
let plants = [];
let selectedIndex = null;
let activeTool = 'select';
let selectedRating = 5;
let tasks = [];
let gardens = [];
let stages = [];

const escapeHtml = value => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

function getCellCoordinates(index) {
    const width = Math.max(1, Number(garden?.ancho) || 6);
    const row = Math.floor(index / width);
    const column = index % width;
    return { rowName: row + 1, columnName: String.fromCharCode(65 + column) };
}

function getPlantForBed(bed) {
    return bed?.plantas_bancal?.[0] || null;
}

function getStatus(pb) {
    if (!pb) return 'empty';
    const records = pb._records || [];
    if (records.some(r => r.tipo === 'cosecha')) return 'harvest';
    if (records.some(r => ['plaga','hongo','enfermedad'].includes(r.tipo))) return 'danger';
    if (!records.some(r => r.tipo === 'riego')) return 'warning';
    return 'healthy';
}

function getStatusText(pb) {
    return ({harvest:'🌾 Ciclo completado',danger:'🔴 Necesita atención',warning:'🟡 Necesita riego',healthy:'🟢 Saludable',empty:''})[getStatus(pb)];
}

function getStatusClass(pb) {
    const status = getStatus(pb);
    return ['danger','warning','harvest'].includes(status) ? status : '';
}

async function requireUser() {
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) {
        alert('Inicia sesión para utilizar Mi Huerto.');
        window.location.href = 'registro.html';
        return false;
    }
    user = data.user;
    return true;
}

async function loadStages() {
    const { data, error } = await db.from('etapas_cultivo').select('id,nombre,orden').order('orden').order('id');
    if (error) throw error;
    stages = data || [];
    if (plantStage) {
        plantStage.innerHTML = '<option value="">Sin etapa</option>' +
            stages.map(s => '<option value="' + s.id + '">' + escapeHtml(s.nombre) + '</option>').join('');
    }
}

async function loadPlants() {
    const { data, error } = await db
        .from('plantas')
        .select('id,nombre_comun,nombre_cientifico,descripcion,imagen_url,planta_etiquetas(etiquetas_planta(nombre))')
        .order('nombre_comun');
    if (error) throw error;
    plants = data || [];
}

async function loadGardens() {
    const { data, error } = await db.from('huertos').select('*').eq('usuario_id', user.id).order('created_at');
    if (error) throw error;

    gardens = data || [];
    if (!gardens.length) {
        const created = await db.from('huertos').insert({
            usuario_id: user.id,
            nombre: 'Mi huerto',
            descripcion: 'Mi espacio de cultivo en Agropedia',
            ancho: 6,
            alto: 4
        }).select().single();
        if (created.error) throw created.error;
        gardens = [created.data];
    }

    const stored = Number(localStorage.getItem('agropedia_active_garden'));
    garden = gardens.find(g => g.id === stored) || gardens[0];
    localStorage.setItem('agropedia_active_garden', String(garden.id));
    renderGardenSelector();
}

function renderGardenSelector() {
    if (!gardenSelector) return;
    gardenSelector.innerHTML = gardens.map(g => '<option value="' + g.id + '"' +
        (g.id === garden.id ? ' selected' : '') + '>' + escapeHtml(g.nombre) + '</option>').join('');
}

async function getOrCreateGarden() {
    await loadGardens();
}

async function ensureBeds() {
    const width = Math.max(1, Math.min(Number(garden.ancho) || 6, 12));
    const height = Math.max(1, Math.min(Number(garden.alto) || 4, 12));
    gardenBoard.style.gridTemplateColumns = 'repeat(' + width + ', 1fr)';
    gardenBoard.style.aspectRatio = width + ' / ' + height;
    if (boardSize) boardSize.textContent = width + ' × ' + height;

    const { data, error } = await db.from('bancales')
        .select('*,plantas_bancal(*,plantas(id,nombre_comun,nombre_cientifico,imagen_url))')
        .eq('huerto_id', garden.id)
        .order('fila').order('columna');
    if (error) throw error;

    beds = data || [];
    const totalCells = width * height;
    if (beds.length >= totalCells) return;

    const existing = new Set(beds.map(b => `${b.fila}-${b.columna}`));
    const missing = [];
    for (let row = 1; row <= height; row++) {
        for (let col = 1; col <= width; col++) {
            if (!existing.has(`${row}-${col}`)) {
                missing.push({
                    huerto_id: garden.id,
                    nombre: `Bancal ${String.fromCharCode(64 + col)}${row}`,
                    fila: row,
                    columna: col,
                    ancho: 1,
                    alto: 1
                });
            }
        }
    }
    if (missing.length) {
        const created = await db.from('bancales').insert(missing).select('*,plantas_bancal(*,plantas(id,nombre_comun,nombre_cientifico,imagen_url))');
        if (created.error) throw created.error;
    }
    const refreshed = await db.from('bancales')
        .select('*,plantas_bancal(*,plantas(id,nombre_comun,nombre_cientifico,imagen_url))')
        .eq('huerto_id', garden.id).order('fila').order('columna');
    if (refreshed.error) throw refreshed.error;
    beds = refreshed.data || [];
}

async function loadRecords() {
    const ids = beds.flatMap(b => b.plantas_bancal || []).map(pb => pb.id);
    if (!ids.length) return;
    const { data, error } = await db.from('registros_cultivo')
        .select('id,planta_bancal_id,tipo,valor,notas,realizado_at')
        .eq('usuario_id', user.id).in('planta_bancal_id', ids)
        .order('realizado_at', { ascending: false });
    if (error) throw error;
    const map = new Map();
    (data || []).forEach(r => { if (!map.has(r.planta_bancal_id)) map.set(r.planta_bancal_id, []); map.get(r.planta_bancal_id).push(r); });
    beds.forEach(b => { const pb = getPlantForBed(b); if (pb) pb._records = map.get(pb.id) || []; });
}

async function loadTasks() {
    const today = new Date().toISOString().slice(0,10);
    let { data, error } = await db.from('tareas_huerto').select('*').eq('huerto_id', garden.id).eq('fecha', today).order('id');
    if (error) throw error;

    if (!data?.length) {
        const season = getSeason(new Date()).toLowerCase();
        const moon = getMoonPhase(new Date()).toLowerCase();
        const needsWater = beds.some(b => getStatus(getPlantForBed(b)) === 'warning');
        const needsHealth = beds.some(b => getStatus(getPlantForBed(b)) === 'danger');
        const rows = [
            { huerto_id:garden.id,titulo:needsWater?'Revisar y regar las plantas que lo necesiten':'Revisar la humedad del suelo',descripcion:'Revisión diaria del riego.',fecha:today },
            { huerto_id:garden.id,titulo:needsHealth?'Revisar las plantas con posibles problemas':'Inspeccionar hojas y tallos en busca de plagas',descripcion:'Revisión preventiva.',fecha:today },
            { huerto_id:garden.id,titulo:`Realizar cuidados propios de ${season}`,descripcion:'Cuidados estacionales.',fecha:today },
            { huerto_id:garden.id,titulo:`Planificar labores considerando la fase ${moon}`,descripcion:'Planificación según la fase lunar.',fecha:today },
            { huerto_id:garden.id,titulo:'Revisar el estado general de los bancales',descripcion:'Revisión general del huerto.',fecha:today }
        ];
        const created = await db.from('tareas_huerto').insert(rows).select();
        if (created.error) throw created.error;
        data = created.data;
    }
    tasks = data || [];
}

function renderGarden() {
    gardenBoard.innerHTML = '';
    const width = Math.max(1, Number(garden?.ancho) || 6);
    const height = Math.max(1, Number(garden?.alto) || 4);
    const ordered = Array.from({length: width * height}, (_, i) => beds.find(b => b.fila === Math.floor(i/width)+1 && b.columna === (i%width)+1));
    ordered.forEach((bed,index) => {
        const cell = document.createElement('button');
        const coordinates = getCellCoordinates(index);
        const pb = getPlantForBed(bed);
        const plant = pb?.plantas;
        cell.type='button'; cell.className='garden-cell'; cell.dataset.index=index;
        cell.setAttribute('aria-label', plant ? `${plant.nombre_comun}, celda ${coordinates.columnName}${coordinates.rowName}` : `Celda vacía ${coordinates.columnName}${coordinates.rowName}`);
        if (!plant) cell.classList.add('empty');
        if (index === selectedIndex) cell.classList.add('selected');
        if (plant) {
            cell.innerHTML=`<span class="cell-plant">🌱</span><span class="cell-name">${escapeHtml(plant.nombre_comun)}</span><span class="cell-status ${getStatusClass(pb)}"></span>`;
        }
        cell.addEventListener('click',()=>handleCellAction(index));
        gardenBoard.appendChild(cell);
    });
    updateSummary();
}

function bedAt(index) {
    const width = Math.max(1, Number(garden?.ancho) || 6);
    return beds.find(b => b.fila === Math.floor(index/width)+1 && b.columna === (index%width)+1);
}

async function handleCellAction(index) {
    if (activeTool==='add') return addPlantToCell(index);
    if (activeTool==='edit') {
        if (!getPlantForBed(bedAt(index))) return alert('Primero selecciona una celda que tenga una planta.');
        selectCell(index); return editSelectedPlant();
    }
    if (activeTool==='delete') return deletePlantFromCell(index);
    if (activeTool==='clear') {
        const pb=getPlantForBed(bedAt(index)); if(pb) await deletePlantFromCell(index); return;
    }
    selectCell(index);
}

function selectCell(index) {
    selectedIndex=index;
    const bed=bedAt(index), pb=getPlantForBed(bed);
    const c=getCellCoordinates(index);
    selectedCellLabel.textContent=`Celda ${c.columnName}${c.rowName}`;
    renderGarden();
    if(pb) showStatusPanel(pb,c); else hideStatusPanel();
}

async function addPlantToCell(index) {
    const bed=bedAt(index);
    if (!bed) return;
    if (getPlantForBed(bed)) return alert('Esta celda ya tiene una planta. Selecciona una celda vacía.');
    if (!plants.length) return alert('No hay plantas disponibles en el catálogo.');
    const list=plants.map((p,i)=>`${i+1}. ${p.nombre_comun}`).join('\n');
    const input=prompt(`Escribe el número o nombre de la planta:\n\n${list}`);
    if (!input) return;
    const n=input.trim();
    const indexFound=Number.isInteger(Number(n)) && Number(n)>0 ? Number(n)-1 : plants.findIndex(p=>p.nombre_comun.toLowerCase()===n.toLowerCase());
    const plant=plants[indexFound];
    if (!plant) return alert('Planta no encontrada.');
    const {data:createdPlant,error}=await db.from('plantas_bancal').insert({bancal_id:bed.id,planta_id:plant.id,cantidad:1,estado:'activa'}).select().single();
    if(error) return alert(`No se pudo agregar la planta: ${error.message}`);
    if (createdPlant) await addHistory(createdPlant.id, 'Cultivo iniciado', 'Se agregó ' + plant.nombre_comun + ' al huerto.');
    await reloadGarden();
    selectCell(index);
}

async function editSelectedPlant() {
    const bed=bedAt(selectedIndex), pb=getPlantForBed(bed);
    if(!pb) return;
    const input=prompt('Escribe el número o nombre de la nueva planta:',pb.plantas?.nombre_comun||'');
    if(!input) return;
    const n=input.trim();
    const found=Number.isInteger(Number(n)) && Number(n)>0 ? plants[Number(n)-1] : plants.find(p=>p.nombre_comun.toLowerCase()===n.toLowerCase());
    if(!found) return alert('Planta no encontrada.');
    const {error}=await db.from('plantas_bancal').update({planta_id:found.id}).eq('id',pb.id);
    if(error) return alert(`No se pudo actualizar: ${error.message}`);
    await addHistory(pb.id, 'Planta modificada', 'Se cambió la planta a ' + found.nombre_comun + '.');
    await reloadGarden(); selectCell(selectedIndex);
}

async function deletePlantFromCell(index) {
    const bed=bedAt(index), pb=getPlantForBed(bed);
    if(!pb) return alert('Esta celda ya está vacía.');
    if(!confirm(`¿Quieres eliminar ${pb.plantas?.nombre_comun || 'esta planta'} de esta celda?`)) return;
    const {error}=await db.from('plantas_bancal').delete().eq('id',pb.id);
    if(error) return alert(`No se pudo eliminar: ${error.message}`);
    selectedIndex=null; hideStatusPanel(); await reloadGarden();
}

async function addHistory(pbId, event, description) {
    const { error } = await db.from('historial_cultivo').insert({
        planta_bancal_id: pbId, usuario_id: user.id, evento: event, descripcion: description
    });
    if (error) console.warn('No se pudo guardar la bitácora:', error.message);
}

async function loadPlantHistory(pbId) {
    if (!plantHistoryList) return;
    const { data, error } = await db.from('historial_cultivo')
        .select('evento,descripcion,created_at').eq('planta_bancal_id', pbId)
        .eq('usuario_id', user.id).order('created_at', { ascending: false }).limit(8);
    if (error) {
        plantHistoryList.innerHTML = '<p class="history-empty">No se pudo cargar la bitácora.</p>';
        return;
    }
    plantHistoryList.innerHTML = data?.length ? data.map(item =>
        '<div class="history-item"><strong>' + escapeHtml(item.evento) + '</strong><span>' +
        escapeHtml(item.descripcion || '') + '</span><small>' +
        new Date(item.created_at).toLocaleString('es-MX') + '</small></div>'
    ).join('') : '<p class="history-empty">Aún no hay eventos registrados.</p>';
}

async function saveSelectedPlantDetails() {
    const pb = getPlantForBed(bedAt(selectedIndex));
    if (!pb) return;
    const payload = {
        cantidad: Math.max(1, Number(plantQuantity.value) || 1),
        fecha_siembra: plantSowingDate.value || null,
        fecha_cosecha_estimada: plantHarvestDate.value || null,
        etapa_id: plantStage.value ? Number(plantStage.value) : null,
        notas: plantNotes.value.trim() || null
    };
    const { error } = await db.from('plantas_bancal').update(payload).eq('id', pb.id);
    if (error) return alert('No se pudieron guardar los datos: ' + error.message);
    await addHistory(pb.id, 'Datos del cultivo actualizados', 'Se actualizaron los datos del cultivo.');
    await reloadGarden();
    selectCell(selectedIndex);
}

async function setRecord(type, checked) {
    const pb=getPlantForBed(bedAt(selectedIndex));
    if(!pb) return;
    if(checked) {
        const {error}=await db.from('registros_cultivo').insert({planta_bancal_id:pb.id,usuario_id:user.id,tipo:type,notas:'Registrado desde Mi Huerto'});
        if(error) return alert('No se pudo guardar el registro: ' + error.message);
        await addHistory(pb.id, 'Registro: ' + type, 'Se registró esta actividad desde Mi Huerto.');
    } else {
        await db.from('registros_cultivo').delete().eq('planta_bancal_id',pb.id).eq('usuario_id',user.id).eq('tipo',type);
    }
    await reloadGarden(); selectCell(selectedIndex);
}

function showStatusPanel(pb,c) {
    const plant=pb.plantas;
    emptyStatus.classList.add('hidden'); statusContent.classList.remove('hidden');
    statusPlantIcon.textContent='🌱'; statusPlantType.textContent=(plant?.planta_etiquetas?.[0]?.etiquetas_planta?.nombre)||'Planta';
    statusPlantName.textContent=plant?.nombre_comun||'Planta';
    statusLocation.textContent='Bancal ' + c.columnName + c.rowName;
    plantQuantity.value = pb.cantidad ?? 1;
    plantSowingDate.value = pb.fecha_siembra || '';
    plantHarvestDate.value = pb.fecha_cosecha_estimada || '';
    plantStage.value = pb.etapa_id || '';
    plantNotes.value = pb.notas || '';
    loadPlantHistory(pb.id);
    statusCondition.textContent=getStatusText(pb);
    const records=pb._records||[];
    wateredCheck.checked=records.some(r=>r.tipo==='riego');
    pestCheck.checked=records.some(r=>r.tipo==='plaga');
    fungusCheck.checked=records.some(r=>r.tipo==='hongo');
    diseaseCheck.checked=records.some(r=>r.tipo==='enfermedad');
    harvestCheck.checked=records.some(r=>r.tipo==='cosecha');
}

function hideStatusPanel(){emptyStatus.classList.remove('hidden');statusContent.classList.add('hidden');selectedCellLabel.textContent='Selecciona un bancal';}

function updateSummary(){
    const active=beds.map(getPlantForBed).filter(Boolean);
    plantCount.textContent=active.length;
    healthyCount.textContent=active.filter(x=>getStatus(x)==='healthy').length;
    attentionCount.textContent=active.filter(x=>['warning','danger'].includes(getStatus(x))).length;
    harvestCount.textContent=active.filter(x=>getStatus(x)==='harvest').length;
}

function getSeason(date){
    const m=date.getMonth()+1,d=date.getDate();
    if((m===3&&d>=20)||m===4||m===5||(m===6&&d<21))return'Primavera';
    if((m===6&&d>=21)||m===7||m===8||(m===9&&d<22))return'Verano';
    if((m===9&&d>=22)||m===10||m===11||(m===12&&d<21))return'Otoño';
    return'Invierno';
}

function getMoonPhase(date){
    const reference=new Date(Date.UTC(2000,0,6,18,14)),current=Date.UTC(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes());
    const days=(current-reference.getTime())/86400000,cycle=29.53058867,age=((days%cycle)+cycle)%cycle;
    if(age<1.845)return'Luna nueva'; if(age<7.382)return'Creciente'; if(age<9.227)return'Cuarto creciente'; if(age<14.765)return'Gibosa creciente'; if(age<16.610)return'Luna llena'; if(age<22.148)return'Gibosa menguante'; if(age<23.993)return'Cuarto menguante'; return'Menguante';
}

function updateDailyStatus(){
    const now=new Date();
    currentDate.textContent=now.toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    currentSeason.textContent=getSeason(now); currentMoon.textContent=getMoonPhase(now);
    currentTemperature.textContent='—'; weatherIcon.textContent='🌱';
}

async function toggleTask(task,checked){
    const update={completada:checked,completed_at:checked?new Date().toISOString():null};
    const {error}=await db.from('tareas_huerto').update(update).eq('id',task.id).eq('huerto_id',garden.id);
    if(error) return alert(`No se pudo actualizar la tarea: ${error.message}`);
    task.completada=checked; task.completed_at=update.completed_at; renderTasks();
}

function renderTasks(){
    taskList.innerHTML='';
    tasks.forEach(task=>{
        const label=document.createElement('label'); label.className=`task-item ${task.completada?'completed':''}`;
        label.innerHTML=`<input type="checkbox" ${task.completada?'checked':''}><span>${escapeHtml(task.titulo)}</span>`;
        label.querySelector('input').addEventListener('change',e=>toggleTask(task,e.target.checked));
        taskList.appendChild(label);
    });
    updateProgress();
}

function updateProgress(){
    const percentage=tasks.length?Math.round(tasks.filter(t=>t.completada).length/tasks.length*100):0;
    progressPercentage.textContent=`${percentage}%`; progressBar.style.width=`${percentage}%`;
    progressMessage.textContent=percentage===100?'¡Excelente! Has completado las tareas de hoy.':percentage>=60?'¡Vas muy bien! Solo quedan algunas tareas.':percentage?'Ya comenzaste. Continúa con el cuidado de tu huerto.':'Revisa las tareas de hoy para mantener tu huerto en buen estado.';
}

async function renderFavorites(){
    const {data,error}=await db.from('plantas_favoritas').select('planta_id,plantas(id,nombre_comun,nombre_cientifico,imagen_url)').eq('usuario_id',user.id);
    if(error){favoritesGrid.innerHTML='<p>No se pudieron cargar tus favoritos.</p>';return;}
    favoritesGrid.innerHTML='';
    (data||[]).forEach(item=>{
        const p=item.plantas; if(!p)return;
        const link=document.createElement('a'); link.className='favorite-card'; link.href=`planta.html?id=${encodeURIComponent(p.id)}`;
        link.innerHTML=`<div class="favorite-image"><img src="${escapeHtml(p.imagen_url||'assets/images/logo.png')}" alt="${escapeHtml(p.nombre_comun)}"></div><div class="favorite-content"><h3>${escapeHtml(p.nombre_comun)}</h3><p>${escapeHtml(p.nombre_cientifico||'')}</p><strong>Ver información →</strong></div>`;
        favoritesGrid.appendChild(link);
    });
    if(!data?.length) favoritesGrid.innerHTML='<p>Aún no tienes plantas favoritas. Añádelas desde el catálogo.</p>';
}

async function switchGarden(id) {
    const selected = gardens.find(g => g.id === Number(id));
    if (!selected || selected.id === garden.id) return;
    garden = selected;
    localStorage.setItem('agropedia_active_garden', String(garden.id));
    selectedIndex = null;
    hideStatusPanel();
    await ensureBeds();
    await loadRecords();
    await loadTasks();
    renderGarden();
    renderTasks();
    renderGardenSelector();
}

async function createGarden() {
    const name = prompt('Nombre del nuevo huerto:', 'Nuevo huerto');
    if (!name?.trim()) return;
    const created = await db.from('huertos').insert({
        usuario_id: user.id, nombre: name.trim(), descripcion: 'Espacio de cultivo de Agropedia', ancho: 6, alto: 4
    }).select().single();
    if (created.error) return alert('No se pudo crear el huerto: ' + created.error.message);
    gardens.push(created.data);
    garden = created.data;
    localStorage.setItem('agropedia_active_garden', String(garden.id));
    await ensureBeds();
    await loadRecords();
    await loadTasks();
    renderGardenSelector();
    renderGarden();
    renderTasks();
}

async function renameCurrentGarden() {
    if (!garden) return;
    const name = prompt('Nuevo nombre del huerto:', garden.nombre);
    if (!name?.trim() || name.trim() === garden.nombre) return;
    const { error } = await db.from('huertos').update({ nombre: name.trim() })
        .eq('id', garden.id).eq('usuario_id', user.id);
    if (error) return alert('No se pudo renombrar: ' + error.message);
    garden.nombre = name.trim();
    renderGardenSelector();
}

async function deleteCurrentGarden() {
    if (gardens.length <= 1) return alert('Debes conservar al menos un huerto.');
    if (!garden) return;
    if (!confirm('¿Eliminar "' + garden.nombre + '"? También se eliminarán sus bancales, plantas, tareas y registros asociados.')) return;
    const id = garden.id;
    const { error } = await db.from('huertos').delete().eq('id', id).eq('usuario_id', user.id);
    if (error) return alert('No se pudo eliminar: ' + error.message);
    gardens = gardens.filter(g => g.id !== id);
    garden = gardens[0];
    localStorage.setItem('agropedia_active_garden', String(garden.id));
    selectedIndex = null;
    await ensureBeds();
    await loadRecords();
    await loadTasks();
    renderGardenSelector();
    renderGarden();
    renderTasks();
    hideStatusPanel();
}

function setupEvents(){
    document.querySelectorAll('.tool-button').forEach(button=>button.addEventListener('click',()=>setActiveTool(button.dataset.tool)));
    gardenSelector?.addEventListener('change', e => switchGarden(e.target.value));
    createGardenButton?.addEventListener('click', createGarden);
    renameGardenButton?.addEventListener('click', renameCurrentGarden);
    deleteGardenButton?.addEventListener('click', deleteCurrentGarden);
    savePlantDetails?.addEventListener('click', saveSelectedPlantDetails);
    refreshHistoryButton?.addEventListener('click', () => { const pb = getPlantForBed(bedAt(selectedIndex)); if (pb) loadPlantHistory(pb.id); });
    const map={wateredCheck:'riego',pestCheck:'plaga',fungusCheck:'hongo',diseaseCheck:'enfermedad',harvestCheck:'cosecha'};
    [wateredCheck,pestCheck,fungusCheck,diseaseCheck,harvestCheck].forEach(check=>check.addEventListener('change',()=>setRecord(map[check.id],check.checked)));
    plantInfoButton.addEventListener('click',()=>{const pb=getPlantForBed(bedAt(selectedIndex));if(pb?.plantas)window.location.href=`planta.html?id=${encodeURIComponent(pb.plantas.id)}`;});
    resetGardenButton.addEventListener('click',async()=>{
        if(!confirm('Esto eliminará las plantas de tu huerto y conservará el huerto. ¿Continuar?'))return;
        const ids=beds.flatMap(b=>b.plantas_bancal||[]).map(x=>x.id);
        if(ids.length){const {error}=await db.from('plantas_bancal').delete().in('id',ids);if(error)return alert(error.message);}
        selectedIndex=null; await reloadGarden();
    });
    commentText.addEventListener('input',()=>characterCount.textContent=`${commentText.value.length} / 500`);
    commentType.addEventListener('change',()=>ratingGroup.style.display=commentType.value==='review'?'block':'none');
    ratingInput.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{selectedRating=Number(b.dataset.rating);ratingInput.querySelectorAll('button').forEach(x=>x.classList.toggle('active',Number(x.dataset.rating)<=selectedRating));}));
    commentForm.addEventListener('submit',e=>{e.preventDefault(); if(!commentText.value.trim())return alert('Escribe un comentario antes de publicarlo.'); alert('Los comentarios de comunidad se integrarán con el módulo social en una fase posterior.'); commentForm.reset(); characterCount.textContent='0 / 500';});
}

function setActiveTool(tool){activeTool=tool;document.querySelectorAll('.tool-button').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));}

async function reloadGarden(){await getOrCreateGarden();await ensureBeds();await loadRecords();await loadTasks();renderGarden();renderTasks();renderFavorites();}

async function initGarden(){
    try{
        if(!await requireUser())return;
        await loadPlants(); await loadStages(); await getOrCreateGarden(); await ensureBeds(); await loadRecords(); await loadTasks();
        setupEvents(); renderGarden(); renderTasks(); renderFavorites(); updateDailyStatus(); characterCount.textContent='0 / 500'; ratingInput.querySelectorAll('button')[4]?.classList.add('active');
    }catch(error){
        console.error(error); gardenBoard.innerHTML='<p class="loading-plants">No pudimos cargar tu huerto. Revisa tu sesión e inténtalo nuevamente.</p>';
    }
}
initGarden();