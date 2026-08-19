// ============================================================
// AGROPEDIA V2 - CATÁLOGO DE PLANTAS
//
// Código reutilizado de Agropedia V1.
// Esta versión trabaja únicamente con datos locales.
// No utiliza Supabase ni ninguna base de datos.
// ============================================================

'use strict';


document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // ELEMENTOS DE LA PÁGINA
    // ========================================================

    const plantsGrid = document.getElementById('plantsGrid');
    const plantSearch = document.getElementById('plantSearch');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const climateFilter = document.getElementById('climateFilter');
    const sunFilter = document.getElementById('sunFilter');
    const containerFilter = document.getElementById('containerFilter');
    const clearFilters = document.getElementById('clearFilters');
    const plantCount = document.getElementById('plantCount');
    const noResults = document.getElementById('noResults');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const plantSearchButton = document.getElementById('plantSearchButton');

    let selectedCategory = 'todas';


    // ========================================================
    // DATOS LOCALES
    // ========================================================

    // Estos datos son temporales.
    // Más adelante podremos sustituirlos por información real
    // proveniente de Supabase, pero por ahora NO conectamos BD.

    const plants = [
        {
            id: 'tomate',
            nombre: 'Tomate',
            cientifico: 'Solanum lycopersicum',
            categoria: 'Hortaliza',
            categorias: ['hortaliza', 'fruto', 'comestible'],
            dificultad: 'media',
            dificultadTexto: 'Intermedio',
            clima: 'calido',
            luz: 'sol',
            cultivo: 'ambos',
            imagen: 'assets/images/plants/tomate.jpg',
            descripcion: 'Hortaliza de fruto que necesita buena iluminación, suelo fértil y riego constante.'
        },
        {
            id: 'chile',
            nombre: 'Chile',
            cientifico: 'Capsicum annuum',
            categoria: 'Hortaliza',
            categorias: ['hortaliza', 'fruto', 'comestible'],
            dificultad: 'media',
            dificultadTexto: 'Intermedio',
            clima: 'calido',
            luz: 'sol',
            cultivo: 'ambos',
            imagen: 'assets/images/plants/chile.jpg',
            descripcion: 'Planta de fruto que se desarrolla mejor con temperaturas cálidas y varias horas de sol.'
        },
        {
            id: 'albahaca',
            nombre: 'Albahaca',
            cientifico: 'Ocimum basilicum',
            categoria: 'Aromática',
            categorias: ['aromatica', 'comestible', 'medicinal'],
            dificultad: 'facil',
            dificultadTexto: 'Fácil',
            clima: 'calido',
            luz: 'sol',
            cultivo: 'maceta',
            imagen: 'assets/images/plants/albahaca.jpg',
            descripcion: 'Hierba aromática de crecimiento rápido que puede cultivarse fácilmente en macetas.'
        },
        {
            id: 'pepino',
            nombre: 'Pepino',
            cientifico: 'Cucumis sativus',
            categoria: 'Hortaliza',
            categorias: ['hortaliza', 'fruto', 'comestible'],
            dificultad: 'media',
            dificultadTexto: 'Intermedio',
            clima: 'calido',
            luz: 'sol',
            cultivo: 'jardin',
            imagen: 'assets/images/plants/pepino.jpg',
            descripcion: 'Planta de fruto que necesita buena exposición solar, humedad y espacio para crecer.'
        },
        {
            id: 'calabaza',
            nombre: 'Calabaza',
            cientifico: 'Cucurbita pepo',
            categoria: 'Hortaliza',
            categorias: ['hortaliza', 'fruto', 'comestible'],
            dificultad: 'facil',
            dificultadTexto: 'Fácil',
            clima: 'calido',
            luz: 'sol',
            cultivo: 'jardin',
            imagen: 'assets/images/plants/calabaza.jpg',
            descripcion: 'Cultivo de crecimiento vigoroso que requiere espacio, sol y suelo con buen drenaje.'
        },
        {
            id: 'lechuga',
            nombre: 'Lechuga',
            cientifico: 'Lactuca sativa',
            categoria: 'Hortaliza',
            categorias: ['hortaliza', 'hoja', 'comestible'],
            dificultad: 'facil',
            dificultadTexto: 'Fácil',
            clima: 'templado',
            luz: 'semisombra',
            cultivo: 'ambos',
            imagen: 'assets/images/plants/lechuga.jpg',
            descripcion: 'Hortaliza de hoja que crece rápidamente y puede cultivarse en espacios pequeños.'
        },
        {
            id: 'zanahoria',
            nombre: 'Zanahoria',
            cientifico: 'Daucus carota',
            categoria: 'Hortaliza',
            categorias: ['hortaliza', 'raiz', 'comestible'],
            dificultad: 'media',
            dificultadTexto: 'Intermedio',
            clima: 'templado',
            luz: 'sol',
            cultivo: 'ambos',
            imagen: 'assets/images/plants/zanahoria.jpg',
            descripcion: 'Raíz comestible que necesita un suelo suelto y profundo para desarrollarse correctamente.'
        },
        {
            id: 'menta',
            nombre: 'Menta',
            cientifico: 'Mentha',
            categoria: 'Aromática',
            categorias: ['aromatica', 'medicinal'],
            dificultad: 'facil',
            dificultadTexto: 'Fácil',
            clima: 'templado',
            luz: 'semisombra',
            cultivo: 'maceta',
            imagen: 'assets/images/plants/menta.jpg',
            descripcion: 'Planta aromática de crecimiento vigoroso que se adapta bien al cultivo en maceta.'
        },
        {
            id: 'lavanda',
            nombre: 'Lavanda',
            cientifico: 'Lavandula angustifolia',
            categoria: 'Ornamental',
            categorias: ['ornamental', 'aromatica', 'flor'],
            dificultad: 'facil',
            dificultadTexto: 'Fácil',
            clima: 'templado',
            luz: 'sol',
            cultivo: 'ambos',
            imagen: 'assets/images/plants/lavanda.jpg',
            descripcion: 'Planta aromática y ornamental que prefiere mucho sol y suelos con buen drenaje.'
        },
        {
            id: 'rosal',
            nombre: 'Rosal',
            cientifico: 'Rosa',
            categoria: 'Ornamental',
            categorias: ['ornamental', 'flor'],
            dificultad: 'dificil',
            dificultadTexto: 'Difícil',
            clima: 'templado',
            luz: 'sol',
            cultivo: 'jardin',
            imagen: 'assets/images/plants/rosal.jpg',
            descripcion: 'Planta ornamental que requiere atención regular, buena iluminación y podas adecuadas.'
        }
    ];


    // ========================================================
    // UTILIDADES
    // ========================================================

    function normalizar(texto = '') {
        return texto
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }


    // ========================================================
    // CREAR TARJETA DE PLANTA
    // ========================================================

    function crearTarjeta(planta) {
        const tarjeta = document.createElement('article');

        tarjeta.className = 'plant-card';
        tarjeta.dataset.name = normalizar(planta.nombre);
        tarjeta.dataset.category = planta.categorias
            .map(categoria => normalizar(categoria))
            .join(' ');
        tarjeta.dataset.difficulty = planta.dificultad;
        tarjeta.dataset.climate = planta.clima;
        tarjeta.dataset.sun = planta.luz;
        tarjeta.dataset.container = planta.cultivo;

        const enlace = document.createElement('a');
        enlace.href = `planta.html?id=${encodeURIComponent(planta.id)}`;

        const imagenContenedor = document.createElement('div');
        imagenContenedor.className = 'plant-card-image';

        const img = document.createElement('img');
        img.src = planta.imagen;
        img.alt = planta.nombre;
        img.loading = 'lazy';

        img.onerror = () => {
            img.src = 'assets/images/logo.png';
        };

        const categoria = document.createElement('span');
        categoria.className = 'plant-card-category';
        categoria.textContent = planta.categoria;

        imagenContenedor.append(img, categoria);

        const contenido = document.createElement('div');
        contenido.className = 'plant-card-content';

        const titulo = document.createElement('h3');
        titulo.textContent = planta.nombre;

        const cientifico = document.createElement('p');
        cientifico.className = 'scientific-name';

        const cientificoEm = document.createElement('em');
        cientificoEm.textContent = planta.cientifico;
        cientifico.appendChild(cientificoEm);

        const descripcion = document.createElement('p');
        descripcion.className = 'plant-card-description';
        descripcion.textContent = planta.descripcion;

        const tags = document.createElement('div');
        tags.className = 'plant-tags';

        planta.categorias.slice(0, 3).forEach(nombreCategoria => {
            const tag = document.createElement('span');
            tag.textContent = nombreCategoria;
            tags.appendChild(tag);
        });

        const dificultadTag = document.createElement('span');
        dificultadTag.textContent = planta.dificultadTexto;
        tags.appendChild(dificultadTag);

        const ver = document.createElement('span');
        ver.className = 'view-plant';
        ver.textContent = 'Ver planta →';

        contenido.append(
            titulo,
            cientifico,
            descripcion,
            tags,
            ver
        );

        enlace.append(
            imagenContenedor,
            contenido
        );

        tarjeta.appendChild(enlace);

        return tarjeta;
    }


    // ========================================================
    // MOSTRAR PLANTAS
    // ========================================================

    function cargarPlantas() {
        plantsGrid.innerHTML = '';

        plants.forEach(planta => {
            plantsGrid.appendChild(crearTarjeta(planta));
        });

        actualizarCategorias();
        filterPlants();
    }


    // ========================================================
    // CATEGORÍAS
    // ========================================================

    function actualizarCategorias() {
        const categoriasContainer = document.querySelector(
            '.categories-container'
        );

        const categorias = new Map();

        plants.forEach(planta => {
            planta.categorias.forEach(categoria => {
                const clave = normalizar(categoria);

                if (!categorias.has(clave)) {
                    categorias.set(clave, categoria);
                }
            });
        });

        categoriasContainer.innerHTML = '';

        const todas = document.createElement('button');
        todas.type = 'button';
        todas.className = 'category-button active';
        todas.dataset.category = 'todas';
        todas.textContent = 'Todas';
        categoriasContainer.appendChild(todas);

        [...categorias.entries()]
            .sort((a, b) => a[1].localeCompare(b[1], 'es'))
            .forEach(([valor, nombre]) => {
                const boton = document.createElement('button');

                boton.type = 'button';
                boton.className = 'category-button';
                boton.dataset.category = valor;
                boton.textContent = nombre;

                categoriasContainer.appendChild(boton);
            });

        categoriasContainer
            .querySelectorAll('.category-button')
            .forEach(button => {
                button.addEventListener('click', () => {
                    categoriasContainer
                        .querySelectorAll('.category-button')
                        .forEach(btn => btn.classList.remove('active'));

                    button.classList.add('active');
                    selectedCategory = button.dataset.category;
                    filterPlants();
                });
            });
    }


    // ========================================================
    // FILTROS
    // ========================================================

    function filterPlants() {
        const search = normalizar(plantSearch.value);
        const difficulty = difficultyFilter.value;
        const climate = normalizar(climateFilter.value);
        const sun = normalizar(sunFilter.value);
        const container = normalizar(containerFilter.value);

        const cards = plantsGrid.querySelectorAll('.plant-card');
        let visiblePlants = 0;

        cards.forEach(card => {
            const matchesSearch = card.dataset.name.includes(search);

            const matchesCategory =
                selectedCategory === 'todas' ||
                card.dataset.category.split(' ').includes(selectedCategory);

            const matchesDifficulty =
                difficulty === 'todas' ||
                card.dataset.difficulty === difficulty;

            const matchesClimate =
                climate === 'todos' ||
                card.dataset.climate === climate;

            const matchesSun =
                sun === 'todas' ||
                card.dataset.sun === sun;

            const matchesContainer =
                container === 'todos' ||
                card.dataset.container === container ||
                card.dataset.container === 'ambos';

            const mostrar =
                matchesSearch &&
                matchesCategory &&
                matchesDifficulty &&
                matchesClimate &&
                matchesSun &&
                matchesContainer;

            card.style.display = mostrar ? '' : 'none';

            if (mostrar) {
                visiblePlants++;
            }
        });

        plantCount.textContent = visiblePlants;
        noResults.style.display = visiblePlants === 0 ? 'block' : 'none';
    }


    // ========================================================
    // SUGERENCIAS DE BÚSQUEDA
    // ========================================================

    function mostrarSugerencias() {
        const texto = normalizar(plantSearch.value);

        if (!texto) {
            searchSuggestions.classList.remove('active');
            searchSuggestions.innerHTML = '';
            return;
        }

        const resultados = plants
            .filter(planta => {
                const nombre = normalizar(planta.nombre);
                const cientifico = normalizar(planta.cientifico);

                return (
                    nombre.includes(texto) ||
                    cientifico.includes(texto)
                );
            })
            .slice(0, 5);

        searchSuggestions.innerHTML = '';

        resultados.forEach(planta => {
            const enlace = document.createElement('a');

            enlace.className = 'search-suggestion';
            enlace.href = `planta.html?id=${encodeURIComponent(planta.id)}`;

            const img = document.createElement('img');
            img.src = planta.imagen;
            img.alt = planta.nombre;

            const textoResultado = document.createElement('div');

            const nombre = document.createElement('strong');
            nombre.textContent = planta.nombre;

            const cientifico = document.createElement('small');
            cientifico.textContent = planta.cientifico;

            textoResultado.append(
                nombre,
                document.createElement('br'),
                cientifico
            );

            enlace.append(
                img,
                textoResultado
            );

            searchSuggestions.appendChild(enlace);
        });

        searchSuggestions.classList.toggle(
            'active',
            resultados.length > 0
        );
    }


    // ========================================================
    // EVENTOS DE BÚSQUEDA Y FILTROS
    // ========================================================

    plantSearch.addEventListener('input', () => {
        filterPlants();
        mostrarSugerencias();
    });

    plantSearchButton.addEventListener('click', filterPlants);

    document.addEventListener('click', event => {
        if (!event.target.closest('.plants-search')) {
            searchSuggestions.classList.remove('active');
        }
    });

    difficultyFilter.addEventListener('change', filterPlants);
    climateFilter.addEventListener('change', filterPlants);
    sunFilter.addEventListener('change', filterPlants);
    containerFilter.addEventListener('change', filterPlants);

    clearFilters.addEventListener('click', () => {
        plantSearch.value = '';
        difficultyFilter.value = 'todas';
        climateFilter.value = 'todos';
        sunFilter.value = 'todas';
        containerFilter.value = 'todos';

        selectedCategory = 'todas';

        document
            .querySelectorAll('.category-button')
            .forEach(button => button.classList.remove('active'));

        document
            .querySelector('.category-button[data-category="todas"]')
            ?.classList.add('active');

        searchSuggestions.classList.remove('active');

        filterPlants();
    });


    // ========================================================
    // INICIO
    // ========================================================

    cargarPlantas();
});
