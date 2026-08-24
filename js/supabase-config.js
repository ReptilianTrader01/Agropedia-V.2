/* =========================================================
   SUPABASE - CONFIGURACIÓN DEL CLIENTE
   Agropedia V.2

   La Publishable Key es segura para usarse en el navegador.
   El acceso real a los datos está controlado mediante RLS.
   NUNCA colocar aquí una secret / service_role key.
========================================================= */

'use strict';

const SUPABASE_URL = 'https://vwxsejvmgsqtsxewtueq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mQ1vQxVGBjmD3VFviuaKaQ_xDwIghvv';

const agropediaSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Disponible también para módulos que cargan esta configuración dinámicamente.
window.agropediaSupabase = agropediaSupabase;
