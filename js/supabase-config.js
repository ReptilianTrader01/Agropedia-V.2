/* =========================================================
   SUPABASE - CONFIGURACIÓN DEL CLIENTE
   Agropedia V.2

   Esta clave es pública y está limitada por RLS.
   NUNCA colocar aquí una service_role / secret key.
========================================================= */

'use strict';

const SUPABASE_URL = 'https://vwxsejvmgsqtsxewtueq.supabase.co';

// Temporalmente usamos la clave anon legacy porque el endpoint REST
// del proyecto está respondiendo 401 con la publishable key actual.
// La clave anon es apta para el navegador cuando RLS está correctamente configurado.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3eHNlanZtZ3NxdHN4ZXd0dWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNTgyNTcsImV4cCI6MjEwMjkzNDI1N30.s9BIkBgona0ybri0XmgvtYVJlw04MEIUiVc9GTwjKTY';

const agropediaSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
