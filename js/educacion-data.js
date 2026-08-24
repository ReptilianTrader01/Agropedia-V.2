/* =========================================================
   CAPA DE DATOS EDUCATIVOS
   Agropedia V.2

   Centraliza las consultas a Supabase para que las páginas
   no dependan directamente de la estructura de la BD.
========================================================= */

'use strict';

const AgropediaEducation = {
    async getCourses(filters = {}) {
        let query = agropediaSupabase
            .from('cursos')
            .select('*')
            .eq('publicado', true)
            .order('created_at', { ascending: false });

        if (filters.topicId) {
            query = query.eq('tema_id', filters.topicId);
        }

        if (filters.search) {
            query = query.ilike('titulo', `%${filters.search}%`);
        }

        return query;
    },

    async getVideos(filters = {}) {
        let query = agropediaSupabase
            .from('videos')
            .select('*')
            .eq('publicado', true)
            .order('created_at', { ascending: false });

        if (filters.topicId) {
            query = query.eq('tema_id', filters.topicId);
        }

        if (filters.search) {
            query = query.ilike('titulo', `%${filters.search}%`);
        }

        return query;
    },

    async getDocuments(filters = {}) {
        let query = agropediaSupabase
            .from('documentos')
            .select('*')
            .eq('publicado', true)
            .order('created_at', { ascending: false });

        if (filters.topicId) {
            query = query.eq('tema_id', filters.topicId);
        }

        if (filters.search) {
            query = query.ilike('titulo', `%${filters.search}%`);
        }

        return query;
    },

    async getCourse(id) {
        return agropediaSupabase
            .from('cursos')
            .select('*')
            .eq('id', id)
            .eq('publicado', true)
            .single();
    },

    async getCourseModules(courseId) {
        return agropediaSupabase
            .from('modulos_curso')
            .select('*')
            .eq('curso_id', courseId)
            .order('orden', { ascending: true });
    },

    async getCourseLessons(moduleId) {
        return agropediaSupabase
            .from('lecciones_curso')
            .select('*')
            .eq('modulo_id', moduleId)
            .order('orden', { ascending: true });
    },

    async getVideo(id) {
        return agropediaSupabase
            .from('videos')
            .select('*')
            .eq('id', id)
            .eq('publicado', true)
            .single();
    },

    async getDocument(id) {
        return agropediaSupabase
            .from('documentos')
            .select('*')
            .eq('id', id)
            .eq('publicado', true)
            .single();
    },

    async getTopics() {
        return agropediaSupabase
            .from('temas')
            .select('*')
            .eq('activo', true)
            .order('nombre', { ascending: true });
    }
};
