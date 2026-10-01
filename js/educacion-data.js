'use strict';

const AgropediaEducation = {
    published: 'publicado',
    async getCourses(filters = {}) {
        let q = agropediaSupabase.from('cursos').select('id,titulo,slug,descripcion,imagen_url,dificultad,duracion_minutos,estado,curso_temas(tema_id,temas(id,nombre,slug))').eq('estado',this.published).order('created_at',{ascending:false});
        if(filters.search) q=q.or(`titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`);
        if(filters.topicId) q=q.eq('curso_temas.tema_id',filters.topicId);
        if(filters.slug) q=q.eq('slug',filters.slug);
        return q;
    },
    async getVideos(filters = {}) {
        let q = agropediaSupabase.from('videos').select('id,titulo,slug,descripcion,video_url,miniatura_url,dificultad,duracion_minutos,estado,video_temas(tema_id,temas(id,nombre,slug))').eq('estado',this.published).order('created_at',{ascending:false});
        if(filters.search) q=q.or(`titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`);
        if(filters.topicId) q=q.eq('video_temas.tema_id',filters.topicId);
        if(filters.slug) q=q.eq('slug',filters.slug);
        return q;
    },
    async getDocuments(filters = {}) {
        let q = agropediaSupabase.from('documentos').select('id,titulo,slug,descripcion,archivo_path,archivo_url,dificultad,duracion_minutos,estado,documento_temas(tema_id,temas(id,nombre,slug))').eq('estado',this.published).order('created_at',{ascending:false});
        if(filters.search) q=q.or(`titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`);
        if(filters.topicId) q=q.eq('documento_temas.tema_id',filters.topicId);
        if(filters.slug) q=q.eq('slug',filters.slug);
        return q;
    },
    async getCourse(ref){
        const query = agropediaSupabase.from('cursos').select('*,curso_temas(tema_id,temas(id,nombre,slug))').eq('estado', this.published);
        return /^\d+$/.test(String(ref)) ? query.eq('id', Number(ref)).single() : query.eq('slug', ref).single();
    },
    async getCourseModules(id){ return agropediaSupabase.from('modulos_curso').select('*').eq('curso_id',id).order('orden',{ascending:true}); },
    async getCourseLessons(id){ return agropediaSupabase.from('lecciones_curso').select('*').eq('modulo_id',id).order('orden',{ascending:true}); },
    async getVideo(ref){
        const query = agropediaSupabase.from('videos').select('*,video_temas(tema_id,temas(id,nombre,slug))').eq('estado', this.published);
        return /^\d+$/.test(String(ref)) ? query.eq('id', Number(ref)).single() : query.eq('slug', ref).single();
    },
    async getDocument(ref){
        const query = agropediaSupabase.from('documentos').select('*,documento_temas(tema_id,temas(id,nombre,slug))').eq('estado', this.published);
        return /^\d+$/.test(String(ref)) ? query.eq('id', Number(ref)).single() : query.eq('slug', ref).single();
    },
    async getTopics(){ return agropediaSupabase.from('temas').select('id,nombre,slug,descripcion,imagen_url,frase').order('nombre',{ascending:true}); },
    formatDuration(m){ if(!m)return ''; if(m<60)return `${m} min`; const h=Math.floor(m/60),r=m%60; return r?`${h} h ${r} min`:`${h} h`; },
    topicNames(item,key){ return (item[key]||[]).map(x=>x.temas?.nombre).filter(Boolean); }
};