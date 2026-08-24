// Agropedia V2 - catálogo de plantas conectado a Supabase
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('plantsGrid');
    const search = document.getElementById('plantSearch');
    const difficulty = document.getElementById('difficultyFilter');
    const climate = document.getElementById('climateFilter');
    const sun = document.getElementById('sunFilter');
    const container = document.getElementById('containerFilter');
    const clear = document.getElementById('clearFilters');
    const count = document.getElementById('plantCount');
    const empty = document.getElementById('noResults');
    const suggestions = document.getElementById('searchSuggestions');
    const searchButton = document.getElementById('plantSearchButton');
    let plants = [];
    let category = 'todas';

    const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    function card(plant) {
        const tags = (plant.planta_etiquetas || [])
            .map(x => x.etiquetas_planta?.nombre).filter(Boolean);
        const article = document.createElement('article');
        article.className = 'plant-card';
        article.dataset.name = norm(plant.nombre_comun);
        article.dataset.category = tags.map(norm).join(' ');
        article.dataset.difficulty = plant.dificultad;
        article.dataset.climate = norm(plant.clima_preferido);
        article.dataset.sun = norm(plant.luz);
        article.dataset.container = norm(plant.tipo_cultivo);

        article.innerHTML = `
            <a href="planta.html?id=${encodeURIComponent(plant.id)}">
                <div class="plant-card-image">
                    <img src="${plant.imagen_url || 'assets/images/logo.png'}" alt="${plant.nombre_comun}" loading="lazy">
                    <span class="plant-card-category">${tags[0] || 'Planta'}</span>
                </div>
                <div class="plant-card-content">
                    <h3>${plant.nombre_comun}</h3>
                    <p class="scientific-name"><em>${plant.nombre_cientifico || ''}</em></p>
                    <p class="plant-card-description">${plant.descripcion || ''}</p>
                    <div class="plant-tags">
                        ${tags.slice(0, 3).map(tag => `<span>${tag}</span>`).join('')}
                        <span>${({facil:'Fácil',media:'Intermedio',dificil:'Difícil'})[plant.dificultad] || 'Intermedio'}</span>
                    </div>
                    <span class="view-plant">Ver planta →</span>
                </div>
            </a>`;
        article.querySelector('img').addEventListener('error', event => event.target.src = 'assets/images/logo.png');
        return article;
    }

    function categories() {
        const box = document.querySelector('.categories-container');
        const map = new Map();
        plants.forEach(p => (p.planta_etiquetas || []).forEach(x => {
            const name = x.etiquetas_planta?.nombre;
            if (name) map.set(norm(name), name);
        }));
        box.innerHTML = '<button type="button" class="category-button active" data-category="todas">Todas</button>';
        [...map.entries()].sort((a,b) => a[1].localeCompare(b[1], 'es')).forEach(([value, name]) => {
            box.insertAdjacentHTML('beforeend', `<button type="button" class="category-button" data-category="${value}">${name}</button>`);
        });
        box.querySelectorAll('.category-button').forEach(button => button.addEventListener('click', () => {
            box.querySelectorAll('.category-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active'); category = button.dataset.category; filter();
        }));
    }

    function filter() {
        const q = norm(search.value), d = difficulty.value, c = norm(climate.value), s = norm(sun.value), ct = norm(container.value);
        let visible = 0;
        grid.querySelectorAll('.plant-card').forEach(card => {
            const ok = card.dataset.name.includes(q)
                && (category === 'todas' || card.dataset.category.split(' ').includes(category))
                && (d === 'todas' || card.dataset.difficulty === d)
                && (c === 'todos' || card.dataset.climate.includes(c))
                && (s === 'todas' || card.dataset.sun.includes(s))
                && (ct === 'todos' || card.dataset.container === ct || card.dataset.container === 'ambos');
            card.style.display = ok ? '' : 'none';
            if (ok) visible++;
        });
        count.textContent = visible;
        empty.style.display = visible ? 'none' : 'block';
    }

    function suggest() {
        const q = norm(search.value);
        if (!q) { suggestions.classList.remove('active'); suggestions.innerHTML = ''; return; }
        const matches = plants.filter(p => norm(p.nombre_comun).includes(q) || norm(p.nombre_cientifico).includes(q)).slice(0,5);
        suggestions.innerHTML = matches.map(p => `
            <a class="search-suggestion" href="planta.html?id=${encodeURIComponent(p.id)}">
                <img src="${p.imagen_url || 'assets/images/logo.png'}" alt="${p.nombre_comun}">
                <div><strong>${p.nombre_comun}</strong><br><small>${p.nombre_cientifico || ''}</small></div>
            </a>`).join('');
        suggestions.classList.toggle('active', matches.length > 0);
    }

    async function load() {
        grid.innerHTML = '<p class="loading-plants">Cargando plantas...</p>';
        const { data, error } = await agropediaSupabase.from('plantas').select(`id,nombre_comun,nombre_cientifico,descripcion,imagen_url,clima_preferido,suelo_preferido,dificultad,luz,tipo_cultivo,planta_etiquetas(etiquetas_planta(nombre))`).order('nombre_comun');
        if (error) {
            console.error(error); grid.innerHTML = ''; empty.style.display = 'block';
            empty.querySelector('h3').textContent = 'No pudimos cargar las plantas';
            empty.querySelector('p').textContent = 'Revisa la conexión con Supabase e inténtalo nuevamente.';
            count.textContent = '0'; return;
        }
        plants = data || []; grid.innerHTML = '';
        plants.forEach(p => grid.appendChild(card(p)));
        categories(); filter();
    }

    search.addEventListener('input', () => { suggest(); filter(); });
    searchButton.addEventListener('click', filter);
    [difficulty, climate, sun, container].forEach(x => x.addEventListener('change', filter));
    clear.addEventListener('click', () => {
        search.value = ''; difficulty.value = 'todas'; climate.value = 'todos'; sun.value = 'todas'; container.value = 'todos'; category = 'todas';
        document.querySelectorAll('.category-button').forEach(b => b.classList.toggle('active', b.dataset.category === 'todas'));
        suggestions.classList.remove('active'); suggestions.innerHTML = ''; filter();
    });
    document.addEventListener('click', event => { if (!event.target.closest('.plants-search')) suggestions.classList.remove('active'); });
    await load();
});
