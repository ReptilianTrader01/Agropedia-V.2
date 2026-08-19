/* Navegación universal de Agropedia */
(function () {
    'use strict';

    const pagina = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const grupos = {
        inicio: ['index.html', ''],
        plantas: ['plantas.html', 'planta.html', 'catalogo.html'],
        aprende: ['aprende.html', 'tema.html'],
        nosotros: ['nosotros.html'],
        registro: ['registro.html'],
        huerto: ['jardin.html'],
        usuario: ['preferencias_usuario.html']
    };

    function grupoActual() {
        return Object.keys(grupos).find(grupo => grupos[grupo].includes(pagina)) || null;
    }

    function crearNavegacion() {
        const nav = document.createElement('nav');
        nav.className = 'agro-navbar';
        nav.setAttribute('aria-label', 'Navegación principal');
        nav.innerHTML = `
            <a class="agro-navbar__logo" href="index.html" aria-label="Agropedia - Inicio">
                <img src="assets/images/logo.png" alt="Logo de Agropedia">
            </a>
            <div class="agro-navbar__links">
                <a class="agro-navbar__link" data-nav="inicio" href="index.html">Inicio</a>
                <a class="agro-navbar__link" data-nav="plantas" href="plantas.html">Plantas</a>
                <a class="agro-navbar__link" data-nav="aprende" href="aprende.html">Aprende</a>
                <a class="agro-navbar__link" data-nav="nosotros" href="nosotros.html">Nosotros</a>
                <span class="agro-navbar__spacer"></span>
                <a class="agro-navbar__link" data-nav="registro" href="registro.html">Regístrate</a>
                <a class="agro-navbar__link" data-nav="huerto" href="jardin.html">Mi huerto</a>
                <a class="agro-navbar__user-link" data-nav="usuario" href="preferencias_usuario.html" aria-label="Preferencias de usuario">
                    <span class="agro-navbar__avatar" aria-hidden="true">👤</span>
                </a>
                <span class="agro-navbar__indicator" aria-hidden="true"></span>
            </div>
        `;

        document.body.insertBefore(nav, document.body.firstChild);
        activar(nav);
    }

    function activar(nav) {
        const actual = grupoActual();
        const activo = nav.querySelector(`[data-nav="${actual}"]`);
        const indicador = nav.querySelector('.agro-navbar__indicator');
        const contenedor = nav.querySelector('.agro-navbar__links');

        if (!activo || !indicador) return;
        activo.classList.add('is-active');

        function moverIndicador(elemento, animar) {
            const contenedorRect = contenedor.getBoundingClientRect();
            const elementoRect = elemento.getBoundingClientRect();
            if (!animar) indicador.style.transition = 'none';
            indicador.style.width = `${elementoRect.width}px`;
            indicador.style.transform = `translateX(${elementoRect.left - contenedorRect.left}px)`;
            if (!animar) requestAnimationFrame(() => indicador.style.transition = '');
        }

        moverIndicador(activo, false);

        nav.querySelectorAll('[data-nav]').forEach(enlace => {
            enlace.addEventListener('mouseenter', () => moverIndicador(enlace, true));
            enlace.addEventListener('mouseleave', () => moverIndicador(activo, true));
        });

        window.addEventListener('resize', () => moverIndicador(activo, false));
    }

    document.addEventListener('DOMContentLoaded', crearNavegacion);
})();
