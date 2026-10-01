'use strict';
const supabase=window.agropediaSupabase;
const params=new URLSearchParams(location.search);\nconst slug=params.get('tema')||params.get('slug');
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");
const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const grid=document.getElementById('topicContentGrid'),search=document.getElementById('topicSearch'),empty=document.getElementById('topicEmpty');
let topic=null,items=[];
async function related(table, idField, resourceTable){
    const rel=await supabase.from(table).select(idField).eq('tema_id',topic.id);
    if(rel.error) throw rel.error;
    const ids=(rel.data||[]).map(x=>x[idField]);
    if(!ids.length)return [];
    const r=await supabase.from(resourceTable).select('*').eq('estado','publicado').in('id',ids).order('created_at',{ascending:false});
    if(r.error)throw r.error;
    return r.data||[];
}
async function init(){
    const t=await AgropediaEducation.getTopics(); if(t.error)throw t.error;
    topic=(t.data||[]).find(x=>String(x.id)===String(slug)||x.slug===slug);
    if(!topic){document.getElementById('topicTitle').textContent='Tema no disponible';return;}
    document.getElementById('topicTitle').textContent=topic.nombre;
    document.getElementById('topicHeading').textContent=topic.nombre.toLowerCase();
    document.getElementById('topicPhrase').textContent=topic.frase||topic.descripcion||'Explora contenido de Agropedia.';
    document.getElementById('topicIcon').textContent='🌙';
    const [c,v,d]=await Promise.all([
        related('curso_temas','curso_id','cursos'),
        related('video_temas','video_id','videos'),
        related('documento_temas','documento_id','documentos')
    ]);
    items=[...(c||[]).map(x=>({...x,_type:'Curso'})),...(v||[]).map(x=>({...x,_type:'Video'})),...(d||[]).map(x=>({...x,_type:'Documento'}))];
    render();
}
function render(){
    grid.innerHTML='';
    items.forEach(x=>{
        const a=document.createElement('a');a.className='topic-content-card';
        a.href=`${x._type==='Curso'?'curso':x._type==='Video'?'video':'documento'}.html?id=${encodeURIComponent(x.id)}`;
        a.dataset.search=norm(`${x.titulo} ${x.descripcion||''}`);
        a.innerHTML=`<div class="topic-content-card__icon">${x._type==='Curso'?'📚':x._type==='Video'?'🎥':'📄'}</div><div class="topic-content-card__body"><span>${esc(x._type)}</span><h3>${esc(x.titulo)}</h3><p>${esc(x.descripcion||'')}</p><div><span>${esc(AgropediaEducation.formatDuration(x.duracion_minutos))}</span><span>Explorar →</span></div></div>`;
        grid.appendChild(a);
    });
    filter();
}
function filter(){
    const q=norm(search.value);let n=0;
    document.querySelectorAll('.topic-content-card').forEach(c=>{const ok=!q||c.dataset.search.includes(q);c.classList.toggle('hidden',!ok);if(ok)n++;});
    empty.classList.toggle('hidden',n>0);
    document.getElementById('topicSearchMessage').textContent=`${n} resultado(s) disponibles.`;
}
search.addEventListener('input',filter);
document.getElementById('clearTopicSearch').addEventListener('click',()=>{search.value='';filter();});
document.getElementById('resetTopicSearch').addEventListener('click',()=>{search.value='';filter();});
init().catch(e=>{console.error(e);document.getElementById('topicSearchMessage').textContent='No pudimos cargar el contenido de este tema.';});
