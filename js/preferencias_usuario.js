/* ==================================================
   PREFERENCIAS DE USUARIO - JAVASCRIPT
   Agropedia V2 - Supabase
================================================== */
'use strict';

const supabase = window.agropediaSupabase;
const body = document.body;
const sessionNotice = document.getElementById('sessionNotice');
const darkMode = document.getElementById('darkMode');
const showFavorites = document.getElementById('showFavorites');
const moonRecommendations = document.getElementById('moonRecommendations');
const gardenTips = document.getElementById('gardenTips');
const recommendationFrequency = document.getElementById('recommendationFrequency');
const profileForm = document.getElementById('profileForm');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileContact = document.getElementById('profileContact');
const profileZone = document.getElementById('profileZone');
const profileClimate = document.getElementById('profileClimate');
const saveMessage = document.getElementById('saveMessage');
const logoutButton = document.getElementById('logoutButton');
const deleteAccountButton = document.getElementById('deleteAccountButton');
const enrolledCount = document.getElementById('enrolledCount');
const inProgressCount = document.getElementById('inProgressCount');
const completedCount = document.getElementById('completedCount');
const overallProgress = document.getElementById('overallProgress');
const courseList = document.getElementById('courseList');

let user = null;

const escapeHtml = value => {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
};

async function requireUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        sessionNotice.textContent = 'Inicia sesión para guardar tus preferencias.';
        profileForm.querySelectorAll('input,select,button').forEach(el => el.disabled = true);
        return false;
    }
    user = data.user;
    sessionNotice.textContent = `Sesión activa: ${user.email || 'usuario autenticado'}`;
    return true;
}

function applyGlobalTheme(enabled) {
    body.classList.toggle('agropedia-dark', enabled);
    body.classList.toggle('preferences-dark', enabled);
    localStorage.setItem('agropedia_theme_cache', enabled ? 'dark' : 'light');
}

async function loadPreferences() {
    const { data, error } = await supabase.from('preferencias_usuario').select('*').eq('usuario_id',user.id).maybeSingle();
    if (error) throw error;

    const preferences = data || {
        modo_nocturno:false,
        mostrar_favoritas:true,
        mostrar_recomendaciones_luna:true,
        mostrar_recomendaciones_clima:true,
        frecuencia_recomendaciones:'daily',
        clima_preferido:'auto'
    };

    darkMode.checked = preferences.modo_nocturno;
    showFavorites.checked = preferences.mostrar_favoritas;
    moonRecommendations.checked = preferences.mostrar_recomendaciones_luna;
    gardenTips.checked = preferences.mostrar_recomendaciones_clima;
    recommendationFrequency.value = preferences.frecuencia_recomendaciones || 'daily';
    profileClimate.value = preferences.clima_preferido || 'auto';
    applyGlobalTheme(preferences.modo_nocturno);
}

async function savePreferences() {
    const payload = {
        usuario_id:user.id,
        modo_nocturno:darkMode.checked,
        mostrar_favoritas:showFavorites.checked,
        mostrar_recomendaciones_luna:moonRecommendations.checked,
        mostrar_recomendaciones_clima:gardenTips.checked,
        frecuencia_recomendaciones:recommendationFrequency.value,
        clima_preferido:profileClimate.value
    };
    const { error } = await supabase.from('preferencias_usuario').upsert(payload,{onConflict:'usuario_id'});
    if (error) {
        console.error(error);
        saveMessage.textContent = 'No se pudieron guardar las preferencias.';
        return;
    }
    applyGlobalTheme(darkMode.checked);
    saveMessage.textContent = '✓ Preferencias guardadas en tu cuenta.';
    window.setTimeout(()=>{saveMessage.textContent='';},2500);
}

async function loadProfile() {
    const { data, error } = await supabase.from('perfiles').select('nombre,nombre_usuario,telefono,ubicacion').eq('id',user.id).maybeSingle();
    if (error) throw error;
    if (!data) return;
    profileName.value = data.nombre || '';
    profileUsername.value = data.nombre_usuario || '';
    profileContact.value = data.telefono || '';
    profileZone.value = data.ubicacion || '';
}

async function saveProfile() {
    const payload = {
        id:user.id,
        nombre:profileName.value.trim(),
        nombre_usuario:profileUsername.value.trim(),
        telefono:profileContact.value.trim() || null,
        ubicacion:profileZone.value.trim() || null
    };
    if (!payload.nombre || !payload.nombre_usuario) {
        saveMessage.textContent = 'El nombre y el nombre de usuario son obligatorios.';
        return;
    }
    const { error } = await supabase.from('perfiles').upsert(payload,{onConflict:'id'});
    if (error) {
        console.error(error);
        saveMessage.textContent = 'No se pudo guardar el perfil.';
        return;
    }
    await savePreferences();
    saveMessage.textContent = '✓ Perfil y preferencias guardados en tu cuenta.';
}

async function loadCourses() {
    const { data, error } = await supabase.from('inscripciones_curso')
        .select('curso_id,completado_at,cursos(id,titulo,descripcion,imagen_url)')
        .eq('usuario_id',user.id);
    if (error) throw error;

    const enrollments = data || [];
    const ids = enrollments.map(x=>x.curso_id);
    let progressMap = new Map();

    if (ids.length) {
        const modules = await supabase.from('modulos_curso').select('id,curso_id,lecciones_curso(id)').in('curso_id',ids);
        if (!modules.error) {
            const lessonIds = (modules.data||[]).flatMap(m=>(m.lecciones_curso||[]).map(l=>l.id));
            if (lessonIds.length) {
                const progress = await supabase.from('progreso_leccion').select('leccion_id,progreso,completado').eq('usuario_id',user.id).in('leccion_id',lessonIds);
                if (!progress.error) {
                    const lessonsByCourse = new Map();
                    (modules.data||[]).forEach(m=>(m.lecciones_curso||[]).forEach(l=>{
                        if(!lessonsByCourse.has(m.curso_id)) lessonsByCourse.set(m.curso_id,[]);
                        lessonsByCourse.get(m.curso_id).push(l.id);
                    }));
                    ids.forEach(courseId=>{
                        const ls=lessonsByCourse.get(courseId)||[];
                        const vals=ls.map(id=>(progress.data||[]).find(p=>p.leccion_id===id)?.progreso||0);
                        progressMap.set(courseId,vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0);
                    });
                }
            }
        }
    }

    const cards=enrollments.map(item=>({...item,progress:item.completado_at?100:(progressMap.get(item.curso_id)||0)}));
    const inProgress=cards.filter(c=>c.progress>0&&c.progress<100);
    const completed=cards.filter(c=>c.progress===100);
    const average=cards.length?Math.round(cards.reduce((a,c)=>a+c.progress,0)/cards.length):0;
    enrolledCount.textContent=cards.length;
    inProgressCount.textContent=inProgress.length;
    completedCount.textContent=completed.length;
    overallProgress.textContent=`${average}%`;
    courseList.innerHTML='';

    cards.forEach(course=>{
        const card=document.createElement('article');
        card.className='course-card';
        card.innerHTML=`
            <div class="course-card__top"><span class="course-card__icon">🌱</span><span class="course-status">${course.progress===100?'Completado':course.progress?'En progreso':'No iniciado'}</span></div>
            <h3>${escapeHtml(course.cursos?.titulo||'Curso')}</h3>
            <p>${escapeHtml(course.cursos?.descripcion||'')}</p>
            <div class="course-progress-row"><span>Progreso</span><strong>${course.progress}%</strong></div>
            <div class="course-progress-track"><div class="course-progress-bar" style="width:${course.progress}%"></div></div>
        `;
        courseList.appendChild(card);
    });
    if(!cards.length) courseList.innerHTML='<p>Aún no estás inscrito en ningún curso.</p>';
}

async function savePreferenceField() {
    if (!user) return;
    await savePreferences();
}

function setupEvents() {
    [darkMode,showFavorites,moonRecommendations,gardenTips,recommendationFrequency].forEach(el=>el.addEventListener('change',savePreferenceField));
    profileClimate.addEventListener('change',savePreferenceField);
    profileForm.addEventListener('submit',e=>{e.preventDefault();saveProfile();});
    logoutButton.addEventListener('click',async()=>{
        if(!confirm('¿Quieres cerrar sesión?'))return;
        const {error}=await supabase.auth.signOut();
        if(error)return alert('No se pudo cerrar sesión.');
        window.location.href='index.html';
    });
    deleteAccountButton.addEventListener('click',()=>{
        alert('La eliminación permanente de la cuenta requiere un endpoint seguro de administración. No se ejecutará desde el navegador para proteger tu cuenta.');
    });
}

async function initPreferences(){
    try{
        if(!await requireUser())return;
        await loadPreferences();
        await loadProfile();
        await loadCourses();
        setupEvents();
    }catch(error){
        console.error(error);
        saveMessage.textContent='No pudimos cargar tus datos. Recarga la página e inténtalo nuevamente.';
    }
}

initPreferences();
