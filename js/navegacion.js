/* Navegación universal de Agropedia */
(function () {
    'use strict';

    /* ==================================================
       TEMA GLOBAL
       Se carga automáticamente en todas las páginas.
    ================================================== */

    function cargarTemaGlobal() {
        if (document.getElementById('agropedia-global-theme')) {
            return;
        }

        const link = document.createElement('link');
        link.id = 'agropedia-global-theme';
        link.rel = 'stylesheet';
        link.href = 'css/tema_global.css';

        document.head.appendChild(link);
    }

    cargarTemaGlobal();

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
        return Object.keys(grupos).find(
            grupo => grupos[grupo].includes(pagina)
        ) || null;
    }

    /* ==================================================
       MODO NOCTURNO GLOBAL
    ================================================== */

    function leerPreferencias() {
        try {
            return JSON.parse(
                localStorage.getItem('agropedia_preferences') || '{}'
            );
        } catch (error) {
            return {};
        }
    }

    function aplicarModoNocturno() {
        const activo = leerPreferencias().darkMode === true;

        document.documentElement.classList.toggle('agropedia-dark', activo);
        document.body.classList.toggle('agropedia-dark', activo);
    }

    function observarCambiosDeModo() {
        window.addEventListener('storage', event => {
            if (event.key === 'agropedia_preferences') {
                aplicarModoNocturno();
            }
        });
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

                <a
                    class="agro-navbar__user-link"
                    data-nav="usuario"
                    href="preferencias_usuario.html"
                    aria-label="Preferencias de usuario"
                >
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

        if (!activo || !indicador) {
            return;
        }

        activo.classList.add('is-active');

        function moverIndicador(elemento, animar) {
            const contenedorRect = contenedor.getBoundingClientRect();
            const elementoRect = elemento.getBoundingClientRect();

            if (!animar) {
                indicador.style.transition = 'none';
            }

            indicador.style.width = `${elementoRect.width}px`;
            indicador.style.transform = `translateX(${elementoRect.left - contenedorRect.left}px)`;

            if (!animar) {
                requestAnimationFrame(() => {
                    indicador.style.transition = '';
                });
            }
        }

        moverIndicador(activo, false);

        nav.querySelectorAll('[data-nav]').forEach(enlace => {
            enlace.addEventListener('mouseenter', () => moverIndicador(enlace, true));
            enlace.addEventListener('mouseleave', () => moverIndicador(activo, true));
        });

        window.addEventListener('resize', () => moverIndicador(activo, false));
    }

    /* ==================================================
       FOOTER UNIVERSAL
    ================================================== */

    function crearFooter() {
        if (document.querySelector('.site-footer')) {
            return;
        }

        const footer = document.createElement('footer');
        footer.className = 'site-footer';

        footer.innerHTML = `
            <div class="site-footer__main">
                <div class="site-footer__brand">
                    <strong class="site-footer__wordmark">Agropedia</strong>
                    <p>Herramienta de aprendizaje, gestión y planeación de huertos.</p>
                </div>

                <div class="site-footer__column">
                    <h3>Explora</h3>
                    <a href="nosotros.html">Nosotros</a>
                    <a href="plantas.html">Plantas</a>
                    <a href="aprende.html">Aprende</a>
                </div>

                <div class="site-footer__column">
                    <h3>Tu espacio</h3>
                    <a href="registro.html">Regístrate</a>
                    <a href="jardin.html">Mi huerto</a>
                    <a href="preferencias_usuario.html">Preferencias</a>
                </div>
            </div>

            <div class="site-footer__bottom">
                <span>© 2026 Agropedia. Todos los derechos reservados.</span>
                <span>Cultiva conocimiento.</span>
            </div>
        `;

        document.body.appendChild(footer);
    }

    document.addEventListener('DOMContentLoaded', () => {
        aplicarModoNocturno();
        crearNavegacion();
        crearFooter();
        observarCambiosDeModo();
    });
})();
