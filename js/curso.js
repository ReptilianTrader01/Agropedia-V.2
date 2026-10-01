'use strict';
const supabase=window.agropediaSupabase, params=new URLSearchParams(location.search), courseRef=params.get('id')||params.get('slug');
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");
let user=null,lessons=[],current=0,progress=new Map(),course=null;
const $=id=>document.getElementById(id);
async function load(){if(!courseRef)return fail('Curso no especificado.');const c=await AgropediaEducation.getCourse(courseRef);if(c.error)return fail('No encontramos este curso.');course=c.data;$('courseTitle').textContent=course.titulo;$('courseDescription').textContent=course.descripcion||'';$('courseDifficulty').textContent=`🌱 ${course.dificultad}`;$('courseDuration').textContent=`⏱ ${AgropediaEducation.formatDuration(course.duracion_minutos)||'Duración no especificada'}`;
renderCourseTopics();
await loadRelatedResources();
const m=await AgropediaEducation.getCourseModules(course.id);if(m.error)throw m.error;for(const mod of m.data||[]){const l=await AgropediaEducation.getCourseLessons(mod.id);if(l.error)throw l.error;(l.data||[]).forEach(x=>lessons.push({...x,moduleTitulo:mod.titulo}));}
$('lessonCount').textContent=`${lessons.length} lecciones`;renderModules();const auth=await supabase.auth.getUser();user=auth.data?.user||null;if(user){await supabase.from('inscripciones_curso').upsert({usuario_id:user.id,curso_id:course.id},{onConflict:'usuario_id,curso_id',ignoreDuplicates:true});if(lessons.length){const p=await supabase.from('progreso_leccion').select('leccion_id,progreso,completado').eq('usuario_id',user.id).in('leccion_id',lessons.map(x=>x.id));(p.data||[]).forEach(x=>progress.set(x.leccion_id,x));}}showLesson(0);}
async function loadRelatedResources(){
    const grid=$('courseRelatedGrid'); if(!grid)return;
    const topicIds=(course.curso_temas||[]).map(x=>x.tema_id);
    if(!topicIds.length){grid.innerHTML='<p>No hay recursos relacionados con este curso.</p>';return;}
    const [v,d]=await Promise.all([
        supabase.from('video_temas').select('video_id,videos(id,titulo,descripcion,estado,duracion_minutos)').in('tema_id',topicIds),
        supabase.from('documento_temas').select('documento_id,documentos(id,titulo,descripcion,estado,duracion_minutos)').in('tema_id',topicIds)
    ]);
    if(v.error||d.error){grid.innerHTML='<p>No pudimos cargar los recursos relacionados.</p>';return;}
    const seen=new Set(), items=[];
    (v.data||[]).forEach(x=>{const item=x.videos;if(item&&item.estado==='publicado'&&!seen.has('v'+item.id)){seen.add('v'+item.id);items.push({...item,_type:'Video',_url:'video.html?id='+item.id});}});
    (d.data||[]).forEach(x=>{const item=x.documentos;if(item&&item.estado==='publicado'&&!seen.has('d'+item.id)){seen.add('d'+item.id);items.push({...item,_type:'Documento',_url:'documento.html?id='+item.id});}});
    grid.innerHTML=items.length?items.map(x=>'<a class="related-card" href="'+x._url+'"><strong>'+esc(x._type)+'</strong><h3>'+esc(x.titulo)+'</h3><p>'+esc(x.descripcion||'')+'</p></a>').join(''):'<p>No hay recursos relacionados con este curso.</p>';
}
function renderCourseTopics(){
    const box=$('courseTopics'); if(!box)return;
    const topics=(course.curso_temas||[]).map(x=>x.temas).filter(Boolean);
    box.innerHTML=topics.length?topics.map(t=>'<a href="tema.html?tema='+encodeURIComponent(t.slug)+'">🌱 '+esc(t.nombre)+'</a>').join(''):'';
}

function renderModules(){const box=$('courseModules');box.innerHTML='';let last='';lessons.forEach((l,i)=>{if(l.moduleTitulo!==last){const h=document.createElement('div');h.className='course-module-title';h.textContent=l.moduleTitulo;box.appendChild(h);last=l.moduleTitulo;}const b=document.createElement('button');b.type='button';b.className='lesson-button';b.dataset.lesson=i;b.textContent=l.titulo;b.onclick=()=>showLesson(i);box.appendChild(b);});}
function showLesson(i){if(!lessons[i])return;current=i;const l=lessons[i];$('lessonType').textContent=l.tipo_contenido||'Lección';$('lessonTitle').textContent=l.titulo;let html=l.contenido||`<p>${esc(l.descripcion||'Esta lección no tiene contenido publicado todavía.')}</p>`;if(l.tipo_contenido==='video'&&l.video_url)html+=`<p><a href="${esc(l.video_url)}" target="_blank" rel="noopener">Ver vídeo →</a></p>`;if(l.tipo_contenido==='documento'&&l.documento_id)html+=`<p><a href="documento.html?id=${encodeURIComponent(l.documento_id)}">Abrir documento →</a></p>`;$('lessonContent').innerHTML=html;document.querySelectorAll('.lesson-button').forEach(b=>{const i=Number(b.dataset.lesson),done=progress.get(lessons[i].id)?.completado;b.classList.toggle('active',i===current);b.classList.toggle('completed',!!done);});$('previousLesson').disabled=i===0;$('nextLesson').disabled=i===lessons.length-1;updateProgress();}
function updateProgress(){const done=[...progress.values()].filter(x=>x.completado).length;const pct=lessons.length?Math.round(done/lessons.length*100):0;$('courseProgress').textContent=`📊 ${pct}% completado`;}
async function complete(){const l=lessons[current];if(!user){alert('Inicia sesión para guardar tu progreso.');return;}const now=new Date().toISOString();const r=await supabase.from('progreso_leccion').upsert({usuario_id:user.id,leccion_id:l.id,completado:true,progreso:100,fecha_inicio:progress.get(l.id)?.fecha_inicio||now,ultima_visita:now,fecha_completado:now},{onConflict:'usuario_id,leccion_id'}).select().single();if(r.error)return alert('No se pudo guardar el progreso.');progress.set(l.id,r.data);const all=lessons.length&&lessons.every(x=>progress.get(x.id)?.completado);if(all)await supabase.from('inscripciones_curso').update({completado_at:now}).eq('usuario_id',user.id).eq('curso_id',course.id);showLesson(current);}
function fail(msg){$('courseTitle').textContent='Contenido no disponible';$('courseDescription').textContent=msg;}
$('completeLesson').onclick=complete;$('previousLesson').onclick=()=>showLesson(current-1);$('nextLesson').onclick=()=>showLesson(current+1);
load().catch(e=>{console.error(e);fail('No pudimos cargar el curso.');});