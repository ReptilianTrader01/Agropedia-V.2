/* =========================================================
   PÁGINA NOSOTROS

   Esta versión funciona completamente con contenido local.
   No utiliza Supabase ni ninguna base de datos.
   ========================================================= */

(() => {
    'use strict';

    // =========================================================
    // INICIALIZACIÓN
    // =========================================================

    function init() {
        prepararAnimaciones();
    }

    // =========================================================
    // ANIMACIONES DE ENTRADA
    // =========================================================

    function prepararAnimaciones() {
        const elementos = document.querySelectorAll(
            '.mission-card, .feature-card, .vision-item, .social-card'
        );

        if (!('IntersectionObserver' in window)) {
            return;
        }

        elementos.forEach(elemento => {
            elemento.classList.add('reveal-on-scroll');
        });

        const observer = new IntersectionObserver(
            entradas => {
                entradas.forEach(entrada => {
                    if (!entrada.isIntersecting) {
                        return;
                    }

                    entrada.target.classList.add('is-visible');
                    observer.unobserve(entrada.target);
                });
            },
            {
                threshold: 0.12
            }
        );

        elementos.forEach(elemento => {
            observer.observe(elemento);
        });
    }

    // =========================================================
    // INICIAR PÁGINA
    // =========================================================

    document.addEventListener('DOMContentLoaded', init);
})();
