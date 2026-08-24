/* =========================================================
   SUPABASE - CONFIGURACIÓN DEL CLIENTE
   Agropedia V.2

   Esta clave es una publishable key y puede utilizarse en
   código del navegador. NUNCA colocar aquí service_role keys.
========================================================= */

'use strict';

const SUPABASE_URL = 'https://vwxsejvmgsqtsxewtueq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mQ1vQxVGBjmD3VFviuaKaQ_xDwIghvv';

const agropediaSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
