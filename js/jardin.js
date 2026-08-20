/* ==================================================
   MI HUERTO - JAVASCRIPT
   V2 sin base de datos.
   Todo se mantiene en memoria mientras la página está abierta.
================================================== */

'use strict';

/* ==================================================
   DATOS DE DEMOSTRACIÓN
================================================== */

const plantCatalog = {
    tomate: {
        name: 'Tomate',
        icon: '🍅',
        type: 'Hortaliza',
        slug: 'tomate'
    },
    chile: {
        name: 'Chile',
        icon: '🌶️',
        type: 'Hortaliza',
        slug: 'chile'
    },
    albahaca: {
        name: 'Albahaca',
        icon: '🌿',
        type: 'Aromática',
        slug: 'albahaca'
    },
    zanahoria: {
        name: 'Zanahoria',
        icon: '🥕',
        type: 'Hortaliza',
        slug: 'zanahoria'
    },
    fresa: {
        name: 'Fresa',
        icon: '🍓',
        type: 'Frutilla',
        slug: 'fresa'
    },
    lechuga: {
        name: 'Lechuga',
        icon: '🥬',
        type: 'Hortaliza',
        slug: 'lechuga'
    }
};

const initialGarden = [
    { plant: 'tomate', watered: true, pest: false, fungus: false, disease: false, harvest: false },
    { plant: 'tomate', watered: true, pest: false, fungus: false, disease: false, harvest: false },
    null,
    { plant: 'chile', watered: false, pest: false, fungus: false, disease: false, harvest: false },
    null,
    { plant: 'albahaca', watered: true, pest: false, fungus: false, disease: false, harvest: false },
    null,
    { plant: 'albahaca', watered: true, pest: false, fungus: false, disease: false, harvest: false },
    { plant: 'zanahoria', watered: false, pest: false, fungus: false, disease: false, harvest: false },
    null,
    { plant: 'zanahoria', watered: true, pest: false, fungus: false, disease: false, harvest: false },
    null,
    null,
    { plant: 'chile', watered: true, pest: true, fungus: false, disease: false, harvest: false },
    null,
    { plant: 'fresa', watered: true, pest: false, fungus: false, disease: false, harvest: false },
    null,
    { plant: 'lechuga', watered: true, pest: false, fungus: false, disease: false, harvest: false },
    null,
    null,
    null,
    null,
    null,
    null
];

const favoritePlants = [
    plantCatalog.tomate,
    plantCatalog.chile,
    plantCatalog.albahaca,
    plantCatalog.fresa,
    plantCatalog.zanahoria
];

let garden = cloneGarden(initialGarden);
let selectedIndex = null;
let activeTool = 'select';
let selectedRating = 5;

/* ==================================================
   ELEMENTOS DEL DOM
================================================== */

const gardenBoard = document.getElementById('gardenBoard');
const emptyStatus = document.getElementById('emptyStatus');
const statusContent = document.getElementById('statusContent');
const selectedCellLabel = document.getElementById('selectedCellLabel');

const plantCount = document.getElementById('plantCount');
const healthyCount = document.getElementById('healthyCount');
const attentionCount = document.getElementById('attentionCount');
const harvestCount = document.getElementById('harvestCount');

const statusPlantIcon = document.getElementById('statusPlantIcon');
const statusPlantType = document.getElementById('statusPlantType');
const statusPlantName = document.getElementById('statusPlantName');
const statusLocation = document.getElementById('statusLocation');
const statusCondition = document.getElementById('statusCondition');

const wateredCheck = document.getElementById('wateredCheck');
const pestCheck = document.getElementById('pestCheck');
const fungusCheck = document.getElementById('fungusCheck');
const diseaseCheck = document.getElementById('diseaseCheck');
const harvestCheck = document.getElementById('harvestCheck');

const plantInfoButton = document.getElementById('plantInfoButton');
const resetGardenButton = document.getElementById('resetGarden');

const currentDate = document.getElementById('currentDate');
const currentSeason = document.getElementById('currentSeason');
const currentMoon = document.getElementById('currentMoon');
const currentTemperature = document.getElementById('currentTemperature');
const weatherIcon = document.getElementById('weatherIcon');

const progressPercentage = document.getElementById('progressPercentage');
const progressBar = document.getElementById('progressBar');
const progressMessage = document.getElementById('progressMessage');
const taskList = document.getElementById('taskList');

const favoritesGrid = document.getElementById('favoritesGrid');
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');
const commentText = document.getElementById('commentText');
const characterCount = document.getElementById('characterCount');
const commentType = document.getElementById('commentType');
const ratingGroup = document.getElementById('ratingGroup');
const ratingInput = document.getElementById('ratingInput');

/* ==================================================
   UTILIDADES
================================================== */

function cloneGarden(source) {
    return source.map(cell => cell ? { ...cell } : null);
}

function getCellCoordinates(index) {
    const row = Math.floor(index / 6);
    const column = index % 6;

    return {
        row,
        column,
        rowName: row + 1,
        columnName: String.fromCharCode(65 + column)
    };
}

function getPlantStatus(cell) {
    if (!cell) {
        return 'empty';
    }

    if (cell.harvest) {
        return 'harvest';
    }

    if (cell.pest || cell.fungus || cell.disease) {
        return 'danger';
    }

    if (!cell.watered) {
        return 'warning';
    }

    return 'healthy';
}

function getStatusText(cell) {
    const status = getPlantStatus(cell);

    if (status === 'harvest') {
        return '🌾 Ciclo completado';
    }

    if (status === 'danger') {
        return '🔴 Necesita atención';
    }

    if (status === 'warning') {
        return '🟡 Necesita riego';
    }

    return '🟢 Saludable';
}

function getStatusClass(cell) {
    const status = getPlantStatus(cell);

    if (status === 'danger') return 'danger';
    if (status === 'warning') return 'warning';
    if (status === 'harvest') return 'harvest';

    return '';
}

/* ==================================================
   DIAGRAMA DEL HUERTO
================================================== */

function renderGarden() {
    gardenBoard.innerHTML = '';

    garden.forEach((cell, index) => {
        const cellElement = document.createElement('button');
        const coordinates = getCellCoordinates(index);

        cellElement.type = 'button';
        cellElement.className = 'garden-cell';
        cellElement.dataset.index = index;
        cellElement.setAttribute(
            'aria-label',
            cell
                ? `${plantCatalog[cell.plant].name}, celda ${coordinates.columnName}${coordinates.rowName}`
                : `Celda vacía ${coordinates.columnName}${coordinates.rowName}`
        );

        if (!cell) {
            cellElement.classList.add('empty');
        }

        if (index === selectedIndex) {
            cellElement.classList.add('selected');
        }

        if (cell) {
            const plant = plantCatalog[cell.plant];
            const status = getStatusClass(cell);

            cellElement.innerHTML = `
                <span class="cell-plant">${plant.icon}</span>
                <span class="cell-name">${plant.name}</span>
                <span class="cell-status ${status}"></span>
            `;
        }

        cellElement.addEventListener('click', () => handleCellAction(index));
        gardenBoard.appendChild(cellElement);
    });

    updateSummary();
}

function handleCellAction(index) {
    const cell = garden[index];

    if (activeTool === 'add') {
        addPlantToCell(index);
        return;
    }

    if (activeTool === 'edit') {
        if (!cell) {
            alert('Primero selecciona una celda que tenga una planta.');
            return;
        }

        selectCell(index);
        editSelectedPlant();
        return;
    }

    if (activeTool === 'delete') {
        deletePlantFromCell(index);
        return;
    }

    if (activeTool === 'bed') {
        alert('El modo de bancales está preparado para ampliar el editor en una próxima versión.');
        setActiveTool('select');
        return;
    }

    if (activeTool === 'clear') {
        if (cell) {
            garden[index] = null;
            selectedIndex = null;
            renderGarden();
            hideStatusPanel();
        }

        return;
    }

    selectCell(index);
}

function selectCell(index) {
    selectedIndex = index;

    const cell = garden[index];
    const coordinates = getCellCoordinates(index);

    selectedCellLabel.textContent = `Celda ${coordinates.columnName}${coordinates.rowName}`;

    renderGarden();

    if (cell) {
        showStatusPanel(cell, coordinates);
    } else {
        hideStatusPanel();
    }
}

function addPlantToCell(index) {
    if (garden[index]) {
        alert('Esta celda ya tiene una planta. Selecciona una celda vacía.');
        return;
    }

    const plantKey = prompt(
        'Escribe la planta que deseas agregar:\n\n' +
        'tomate, chile, albahaca, zanahoria, fresa o lechuga'
    );

    if (!plantKey) return;

    const normalized = plantKey.trim().toLowerCase();

    if (!plantCatalog[normalized]) {
        alert('Planta no encontrada en el catálogo de demostración.');
        return;
    }

    garden[index] = {
        plant: normalized,
        watered: false,
        pest: false,
        fungus: false,
        disease: false,
        harvest: false
    };

    selectedIndex = index;
    setActiveTool('select');
    renderGarden();
    selectCell(index);
}

function editSelectedPlant() {
    if (selectedIndex === null || !garden[selectedIndex]) return;

    const currentPlant = garden[selectedIndex].plant;
    const newPlant = prompt(
        'Escribe la nueva planta:\n\n' +
        'tomate, chile, albahaca, zanahoria, fresa o lechuga',
        currentPlant
    );

    if (!newPlant) return;

    const normalized = newPlant.trim().toLowerCase();

    if (!plantCatalog[normalized]) {
        alert('Planta no encontrada en el catálogo de demostración.');
        return;
    }

    garden[selectedIndex].plant = normalized;
    renderGarden();
    selectCell(selectedIndex);
}

function deletePlantFromCell(index) {
    if (!garden[index]) {
        alert('Esta celda ya está vacía.');
        return;
    }

    const plantName = plantCatalog[garden[index].plant].name;
    const confirmed = confirm(`¿Quieres eliminar ${plantName} de esta celda?`);

    if (!confirmed) return;

    garden[index] = null;
    selectedIndex = null;
    hideStatusPanel();
    renderGarden();
}

function setActiveTool(tool) {
    activeTool = tool;

    document.querySelectorAll('.tool-button').forEach(button => {
        button.classList.toggle('active', button.dataset.tool === tool);
    });
}

/* ==================================================
   PANEL DE ESTADO
================================================== */

function showStatusPanel(cell, coordinates) {
    const plant = plantCatalog[cell.plant];

    emptyStatus.classList.add('hidden');
    statusContent.classList.remove('hidden');

    statusPlantIcon.textContent = plant.icon;
    statusPlantType.textContent = plant.type;
    statusPlantName.textContent = plant.name;
    statusLocation.textContent = `Bancal principal · Celda ${coordinates.columnName}${coordinates.rowName}`;
    statusCondition.textContent = getStatusText(cell);

    wateredCheck.checked = cell.watered;
    pestCheck.checked = cell.pest;
    fungusCheck.checked = cell.fungus;
    diseaseCheck.checked = cell.disease;
    harvestCheck.checked = cell.harvest;
}

function hideStatusPanel() {
    emptyStatus.classList.remove('hidden');
    statusContent.classList.add('hidden');
    selectedCellLabel.textContent = 'Selecciona un bancal';
}

function updateSelectedPlantStatus(property, value) {
    if (selectedIndex === null || !garden[selectedIndex]) return;

    garden[selectedIndex][property] = value;

    renderGarden();
    selectCell(selectedIndex);
    updateProgress();
}

/* ==================================================
   RESUMEN
================================================== */

function updateSummary() {
    const plants = garden.filter(Boolean);
    const healthy = plants.filter(cell => getPlantStatus(cell) === 'healthy');
    const attention = plants.filter(cell => ['warning', 'danger'].includes(getPlantStatus(cell)));
    const harvested = plants.filter(cell => cell.harvest);

    plantCount.textContent = plants.length;
    healthyCount.textContent = healthy.length;
    attentionCount.textContent = attention.length;
    harvestCount.textContent = harvested.length;
}

/* ==================================================
   FECHA, ESTACIÓN Y FASE LUNAR
================================================== */

function updateDailyStatus() {
    const now = new Date();

    currentDate.textContent = now.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    currentSeason.textContent = getSeason(now);
    currentMoon.textContent = getMoonPhase(now);

    // Temperatura local de demostración hasta conectar una API de clima.
    currentTemperature.textContent = getDemoTemperature(now) + ' °C';

    weatherIcon.textContent = getWeatherIcon(now);
}

function getSeason(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
        return 'Primavera';
    }

    if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 22)) {
        return 'Verano';
    }

    if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day < 21)) {
        return 'Otoño';
    }

    return 'Invierno';
}

function getMoonPhase(date) {
    // Cálculo aproximado basado en una luna nueva de referencia.
    const reference = new Date(Date.UTC(2000, 0, 6, 18, 14));
    const current = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes()
    );

    const days = (current - reference.getTime()) / 86400000;
    const cycle = 29.53058867;
    const age = ((days % cycle) + cycle) % cycle;

    if (age < 1.845) return 'Luna nueva';
    if (age < 7.382) return 'Creciente';
    if (age < 9.227) return 'Cuarto creciente';
    if (age < 14.765) return 'Gibosa creciente';
    if (age < 16.610) return 'Luna llena';
    if (age < 22.148) return 'Gibosa menguante';
    if (age < 23.993) return 'Cuarto menguante';
    return 'Menguante';
}

function getDemoTemperature(date) {
    const month = date.getMonth() + 1;
    const hour = date.getHours();

    const baseTemperatures = {
        1: 17,
        2: 19,
        3: 22,
        4: 25,
        5: 27,
        6: 25,
        7: 24,
        8: 24,
        9: 23,
        10: 22,
        11: 19,
        12: 17
    };

    const dailyVariation = hour >= 12 && hour <= 17 ? 3 : 0;

    return baseTemperatures[month] + dailyVariation;
}

function getWeatherIcon(date) {
    const hour = date.getHours();

    if (hour < 6 || hour >= 20) {
        return '🌙';
    }

    if (hour < 9) {
        return '🌤️';
    }

    return '☀️';
}

/* ==================================================
   TAREAS Y PROGRESO
================================================== */

let tasks = [];

function createTasks() {
    const season = getSeason(new Date());
    const moon = getMoonPhase(new Date());
    const plants = garden.filter(Boolean);

    tasks = [
        {
            id: 'water',
            text: plants.some(cell => !cell.watered)
                ? 'Revisar y regar las plantas que lo necesiten'
                : 'Revisar la humedad del suelo',
            completed: false
        },
        {
            id: 'health',
            text: plants.some(cell => cell.pest || cell.fungus || cell.disease)
                ? 'Revisar las plantas con posibles problemas'
                : 'Inspeccionar hojas y tallos en busca de plagas',
            completed: false
        },
        {
            id: 'season',
            text: `Realizar cuidados propios de ${season.toLowerCase()}`,
            completed: false
        },
        {
            id: 'moon',
            text: `Planificar labores considerando la fase ${moon.toLowerCase()}`,
            completed: false
        },
        {
            id: 'garden',
            text: 'Revisar el estado general de los bancales',
            completed: false
        }
    ];

    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const label = document.createElement('label');
        label.className = `task-item ${task.completed ? 'completed' : ''}`;

        label.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span>${task.text}</span>
        `;

        const checkbox = label.querySelector('input');

        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            renderTasks();
            updateProgress();
        });

        taskList.appendChild(label);
    });

    updateProgress();
}

function updateProgress() {
    if (!tasks.length) {
        progressPercentage.textContent = '0%';
        progressBar.style.width = '0%';
        return;
    }

    const completed = tasks.filter(task => task.completed).length;
    const percentage = Math.round((completed / tasks.length) * 100);

    progressPercentage.textContent = `${percentage}%`;
    progressBar.style.width = `${percentage}%`;

    if (percentage === 100) {
        progressMessage.textContent = '¡Excelente! Has completado las tareas de hoy.';
    } else if (percentage >= 60) {
        progressMessage.textContent = '¡Vas muy bien! Solo quedan algunas tareas.';
    } else if (percentage > 0) {
        progressMessage.textContent = 'Ya comenzaste. Continúa con el cuidado de tu huerto.';
    } else {
        progressMessage.textContent = 'Revisa las tareas de hoy para mantener tu huerto en buen estado.';
    }
}

/* ==================================================
   PLANTAS FAVORITAS
================================================== */

function renderFavorites() {
    favoritesGrid.innerHTML = '';

    favoritePlants.forEach(plant => {
        const link = document.createElement('a');

        link.className = 'favorite-card';
        link.href = `planta.html?id=${encodeURIComponent(plant.slug)}`;
        link.innerHTML = `
            <div class="favorite-image">${plant.icon}</div>
            <div class="favorite-content">
                <h3>${plant.name}</h3>
                <p>${plant.type}</p>
                <strong>Ver información →</strong>
            </div>
        `;

        favoritesGrid.appendChild(link);
    });
}

/* ==================================================
   COMENTARIOS
================================================== */

const demoComments = [
    {
        author: 'Jardinero_01',
        rating: 5,
        type: 'Reseña',
        text: 'Me gusta la idea de poder organizar visualmente los bancales. Sería genial poder guardar diferentes huertos.',
        date: 'Hace 3 días'
    },
    {
        author: 'CultivaMX',
        rating: 4,
        type: 'Recomendación',
        text: 'Me gustaría que Agropedia añadiera alertas para saber cuándo regar o cosechar.',
        date: 'Hace 1 semana'
    }
];

function renderComments(comments = demoComments) {
    commentsList.innerHTML = '';

    comments.forEach(comment => {
        const article = document.createElement('article');
        article.className = 'community-comment';

        const stars = '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating);

        article.innerHTML = `
            <div class="comment-author-row">
                <span class="comment-author">🌱 ${escapeHtml(comment.author)}</span>
                <span class="comment-stars">${stars}</span>
            </div>

            <div class="comment-type">
                ${escapeHtml(comment.type)}
            </div>

            <p>
                ${escapeHtml(comment.text)}
            </p>

            <span class="comment-date">
                ${escapeHtml(comment.date)}
            </span>
        `;

        commentsList.appendChild(article);
    });
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

function updateCharacterCount() {
    characterCount.textContent = `${commentText.value.length} / 500`;
}

function updateRatingVisibility() {
    ratingGroup.style.display = commentType.value === 'review' ? 'block' : 'none';
}

function setRating(rating) {
    selectedRating = rating;

    ratingInput.querySelectorAll('button').forEach(button => {
        const buttonRating = Number(button.dataset.rating);
        button.classList.toggle('active', buttonRating <= rating);
    });
}

/* ==================================================
   EVENTOS
================================================== */

document.querySelectorAll('.tool-button').forEach(button => {
    button.addEventListener('click', () => {
        setActiveTool(button.dataset.tool);
    });
});

[wateredCheck, pestCheck, fungusCheck, diseaseCheck, harvestCheck].forEach(check => {
    check.addEventListener('change', () => {
        const propertyMap = {
            wateredCheck: 'watered',
            pestCheck: 'pest',
            fungusCheck: 'fungus',
            diseaseCheck: 'disease',
            harvestCheck: 'harvest'
        };

        updateSelectedPlantStatus(
            propertyMap[check.id],
            check.checked
        );
    });
});

plantInfoButton.addEventListener('click', () => {
    if (selectedIndex === null || !garden[selectedIndex]) return;

    const plant = plantCatalog[garden[selectedIndex].plant];

    window.location.href = `planta.html?id=${encodeURIComponent(plant.slug)}`;
});

resetGardenButton.addEventListener('click', () => {
    const confirmed = confirm('¿Quieres restaurar el huerto de demostración?');

    if (!confirmed) return;

    garden = cloneGarden(initialGarden);
    selectedIndex = null;
    setActiveTool('select');
    hideStatusPanel();
    renderGarden();
    createTasks();
});

commentText.addEventListener('input', updateCharacterCount);
commentType.addEventListener('change', updateRatingVisibility);

ratingInput.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        setRating(Number(button.dataset.rating));
    });
});

commentForm.addEventListener('submit', event => {
    event.preventDefault();

    const text = commentText.value.trim();

    if (!text) {
        alert('Escribe un comentario antes de publicarlo.');
        return;
    }

    const newComment = {
        author: 'Tú',
        rating: commentType.value === 'review' ? selectedRating : 0,
        type: commentType.options[commentType.selectedIndex].text,
        text,
        date: 'Justo ahora'
    };

    const comments = [newComment, ...demoComments];
    renderComments(comments);

    commentForm.reset();
    setRating(5);
    updateCharacterCount();
    updateRatingVisibility();

    alert('Tu comentario se agregó a la demostración. En una futura versión se guardará en tu cuenta.');
});

/* ==================================================
   INICIALIZACIÓN
================================================== */

function initGarden() {
    renderGarden();
    updateDailyStatus();
    createTasks();
    renderFavorites();
    renderComments();
    updateCharacterCount();
    setRating(5);
    updateRatingVisibility();
}

initGarden();
