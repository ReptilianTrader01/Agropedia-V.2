'use strict';
const params=new URLSearchParams(location.search);
const ref=params.get('id')||params.get('slug');
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");
async function init(){
if(!ref){document.getElementById('documentTitle').textContent='Documento no especificado';return;}const r=await AgropediaEducation.getDocument(ref);if(r.error){document.getElementById('documentTitle').textContent='Documento no disponible';return;}const d=r.data;document.getElementById('documentTitle').textContent=d.titulo;document.getElementById('documentDescription').textContent=d.descripcion||'';document.getElementById('documentHeading').textContent=d.titulo;document.getElementById('documentText').textContent=d.descripcion||'';document.getElementById('documentDifficulty').textContent=`📊 ${d.dificultad}`;document.getElementById('documentDuration').textContent=`⏱ ${AgropediaEducation.formatDuration(d.duracion_minutos)||'Duración no especificada'}`;document.getElementById('documentTopic').textContent=`🌱 ${AgropediaEducation.topicNames(d,'documento_temas').join(', ')||'Agropedia'}`;const url=d.archivo_url||null;
document.getElementById('documentLink').href=url||'#';
document.getElementById('documentViewer').innerHTML=url?`<iframe src="${esc(url)}" title="${esc(d.titulo)}" style="width:100%;height:700px;border:0"></iframe>`:'<div class="document-placeholder"><span>📄</span><h2>Archivo no disponible</h2><p>El registro existe en Agropedia, pero todavía no tiene una URL de archivo accesible.</p></div>';
await loadRelated(d);
}
async function loadRelated(d){
 const box=document.getElementById('relatedDocuments'); if(!box)return;
 const ids=(d.documento_temas||[]).map(x=>x.tema_id); if(!ids.length){box.innerHTML='<p>No hay contenido relacionado.</p>';return;}
 const [c,v]=await Promise.all([
   supabase.from('curso_temas').select('curso_id,cursos(id,titulo,descripcion,estado)').in('tema_id',ids),
   supabase.from('video_temas').select('video_id,videos(id,titulo,descripcion,estado)').in('tema_id',ids)
 ]);
 const items=[];
 (c.data||[]).forEach(x=>{if(x.cursos?.estado==='publicado')items.push({...x.cursos,url:'curso.html?id='+x.cursos.id,type:'Curso'});});
 (v.data||[]).forEach(x=>{if(x.videos?.estado==='publicado')items.push({...x.videos,url:'video.html?id='+x.videos.id,type:'Video'});});
 box.innerHTML=items.length?items.map(x=>`<a class="related-card" href="${x.url}"><strong>${esc(x.type)}</strong><h3>${esc(x.titulo)}</h3><p>${esc(x.descripcion||'')}</p></a>`).join(''):'<p>No hay contenido relacionado.</p>';
}
init().catch(console.error);