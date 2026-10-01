'use strict';
const params=new URLSearchParams(location.search);
const ref=params.get('id')||params.get('slug');
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");
async function init(){
if(!ref){document.getElementById('videoTitle').textContent='Video no especificado';return;}const r=await AgropediaEducation.getVideo(ref);if(r.error){document.getElementById('videoTitle').textContent='Video no disponible';return;}const v=r.data;document.getElementById('videoTitle').textContent=v.titulo;document.getElementById('videoDescription').textContent=v.descripcion||'';document.getElementById('videoHeading').textContent=v.titulo;document.getElementById('videoText').textContent=v.descripcion||'';document.getElementById('videoDifficulty').textContent=`📊 ${v.dificultad}`;document.getElementById('videoDuration').textContent=`⏱ ${AgropediaEducation.formatDuration(v.duracion_minutos)||'Duración no especificada'}`;const player=document.getElementById('videoPlayer');
const youtubeId=(v.video_url||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/)?.[1];
if(youtubeId){
    player.innerHTML=`<iframe src="https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}" title="${esc(v.titulo)}" style="width:100%;aspect-ratio:16/9;border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}else if(v.video_url){
    player.innerHTML=`<video controls preload="metadata" poster="${esc(v.miniatura_url||'')}" style="width:100%;height:auto"><source src="${esc(v.video_url)}"></video>`;
}else{
    player.innerHTML='<div class="video-placeholder"><span>▶</span><p>Video no disponible.</p></div>';
}document.getElementById('videoTopic').textContent=`🌱 ${AgropediaEducation.topicNames(v,'video_temas').join(', ')||'Agropedia'}`;}
init().catch(console.error);