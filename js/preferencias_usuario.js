/* ==================================================
   PREFERENCIAS DE USUARIO - JAVASCRIPT
   V2 sin base de datos.
   Las preferencias se guardan localmente en el navegador
   únicamente para poder probar la interfaz.
================================================== */

'use strict';

/* ==================================================
   DATOS DE DEMOSTRACIÓN
================================================== */

const courses = [
    {
        icon: '🌱',
        title: 'Introducción a la jardinería',
        description: 'Conoce los fundamentos para comenzar a cultivar.',
        progress: 75
    },
    {
        icon: '🌎',
        title: 'Preparación y cuidado del suelo',
        description: 'Aprende sobre nutrientes, estructura y fertilidad.',
        progress: 40
    },
    {
        icon: '💧',
        title: 'Riego y cuidados básicos',
        description: 'Aprende a identificar las necesidades de tus plantas.',
        progress: 100
    },
    {
        icon: '🐛',
        title: 'Plagas y enfermedades',
        description: 'Identifica problemas comunes y aprende a prevenirlos.',
        progress: 0
    },
    {
        icon: '🌙',
        title: 'Cultivo y fases de la luna',
        description: 'Conoce las prácticas tradicionales relacionadas con el ciclo lunar.',
        progress: 60
    },
    {
        icon: '🌿',
        title: 'Planificación de un huerto',
        description: 'Organiza el espacio y selecciona plantas compatibles.',
        progress: 100
    }
];

const defaultPreferences = {
    darkMode: false,
    showFavorites: true,
    moonRecommendations: true,
    gardenTips: true,
    recommendationFrequency: 'daily'
};

const defaultProfile = {
    name: '',
    username: '',
    contact: '',
    zone: '',
    climate: 'auto'
};

/* ==================================================
   ELEMENTOS DEL DOM
================================================== */

const body = document.body;
const sessionNotice = document.getElementById('sessionNotice');

const darkMode = document.getElementById('darkMode');
const showFavorites = document.getElementById('showFavorites');
const moonRecommendations = document.getElementById('moonRecommendations');
const gardenTips = document.getElementById('gardenTips');
const recommendationFrequency = document.getElementById('recommendationFrequency');

const profileForm = document.getElementById('profileForm');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileContact = document.getElementById('profileContact');
const profileZone = document.getElementById('profileZone');
const profileClimate = document.getElementById('profileClimate');
const saveMessage = document.getElementById('saveMessage');

const logoutButton = document.getElementById('logoutButton');
const deleteAccountButton = document.getElementById('deleteAccountButton');

const enrolledCount = document.getElementById('enrolledCount');
const inProgressCount = document.getElementById('inProgressCount');
const completedCount = document.getElementById('completedCount');
const overallProgress = document.getElementById('overallProgress');
const courseList = document.getElementById('courseList');

/* ==================================================
   ALMACENAMIENTO LOCAL
================================================== */

function loadLocalData() {
    const storedPreferences = localStorage.getItem('agropedia_preferences');
    const storedProfile = localStorage.getItem('agropedia_profile');

    const preferences = storedPreferences
        ? { ...defaultPreferences, ...JSON.parse(storedPreferences) }
        : { ...defaultPreferences };

    const profile = storedProfile
        ? { ...defaultProfile, ...JSON.parse(storedProfile) }
        : { ...defaultProfile };

    applyPreferences(preferences);
    fillProfile(profile);
}

function savePreferences() {
    const preferences = {
        darkMode: darkMode.checked,
        showFavorites: showFavorites.checked,
        moonRecommendations: moonRecommendations.checked,
        gardenTips: gardenTips.checked,
        recommendationFrequency: recommendationFrequency.value
    };

    localStorage.setItem(
        'agropedia_preferences',
        JSON.stringify(preferences)
    );
}

function saveProfile() {
    const profile = {
        name: profileName.value.trim(),
        username: profileUsername.value.trim(),
        contact: profileContact.value.trim(),
        zone: profileZone.value.trim(),
        climate: profileClimate.value
    };

    localStorage.setItem(
        'agropedia_profile',
        JSON.stringify(profile)
    );
}

function applyPreferences(preferences) {
    darkMode.checked = preferences.darkMode;
    showFavorites.checked = preferences.showFavorites;
    moonRecommendations.checked = preferences.moonRecommendations;
    gardenTips.checked = preferences.gardenTips;
    recommendationFrequency.value = preferences.recommendationFrequency;

    body.classList.toggle('preferences-dark', preferences.darkMode);
}

function fillProfile(profile) {
    profileName.value = profile.name;
    profileUsername.value = profile.username;
    profileContact.value = profile.contact;
    profileZone.value = profile.zone;
    profileClimate.value = profile.climate;
}

/* ==================================================
   PROGRESO DE CURSOS
================================================== */

function renderCourses() {
    const enrolledCourses = courses.filter(course => course.progress > 0);
    const completedCourses = courses.filter(course => course.progress === 100);
    const inProgressCourses = courses.filter(
        course => course.progress > 0 && course.progress < 100
    );

    const average = courses.length
        ? Math.round(
            courses.reduce((total, course) => total + course.progress, 0) /
            courses.length
        )
        : 0;

    enrolledCount.textContent = enrolledCourses.length;
    inProgressCount.textContent = inProgressCourses.length;
    completedCount.textContent = completedCourses.length;
    overallProgress.textContent = `${average}%`;

    courseList.innerHTML = '';

    courses.forEach(course => {
        const card = document.createElement('article');
        const completed = course.progress === 100;
        const enrolled = course.progress > 0;

        card.className = 'course-card';

        card.innerHTML = `
            <div class="course-card__top">
                <span class="course-card__icon">${course.icon}</span>
                <span class="course-status">
                    ${completed ? 'Completado' : enrolled ? 'En progreso' : 'No iniciado'}
                </span>
            </div>

            <h3>${escapeHtml(course.title)}</h3>

            <p>
                ${escapeHtml(course.description)}
            </p>

            <div class="course-progress-row">
                <span>Progreso</span>
                <strong>${course.progress}%</strong>
            </div>

            <div class="course-progress-track">
                <div
                    class="course-progress-bar"
                    style="width: ${course.progress}%"
                ></div>
            </div>
        `;

        courseList.appendChild(card);
    });
}

/* ==================================================
   PREFERENCIAS DEL SITIO
================================================== */

function setupPreferenceEvents() {
    darkMode.addEventListener('change', () => {
        body.classList.toggle('preferences-dark', darkMode.checked);
        savePreferences();
    });

    showFavorites.addEventListener('change', savePreferences);
    moonRecommendations.addEventListener('change', savePreferences);
    gardenTips.addEventListener('change', savePreferences);
    recommendationFrequency.addEventListener('change', savePreferences);
}

/* ==================================================
   PERFIL
================================================== */

profileForm.addEventListener('submit', event => {
    event.preventDefault();

    saveProfile();

    saveMessage.textContent = '✓ Cambios guardados en este navegador.';

    window.setTimeout(() => {
        saveMessage.textContent = '';
    }, 3000);
});

/* ==================================================
   CUENTA
================================================== */

logoutButton.addEventListener('click', () => {
    const confirmed = confirm('¿Quieres cerrar sesión?');

    if (!confirmed) return;

    // No existe autenticación todavía. Esta acción solamente limpia
    // los datos locales de demostración.
    localStorage.removeItem('agropedia_profile');
    localStorage.removeItem('agropedia_preferences');

    alert('Sesión cerrada en la demostración.');
    window.location.reload();
});

deleteAccountButton.addEventListener('click', () => {
    const firstConfirmation = confirm(
        'Borrar una cuenta será una acción permanente cuando exista la base de datos. ¿Quieres simularla ahora?'
    );

    if (!firstConfirmation) return;

    const secondConfirmation = confirm(
        'Esta demostración eliminará los datos locales de Agropedia. ¿Continuar?'
    );

    if (!secondConfirmation) return;

    localStorage.clear();

    alert('Los datos locales de demostración fueron eliminados.');
    window.location.reload();
});

/* ==================================================
   UTILIDAD
================================================== */

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

/* ==================================================
   INICIALIZACIÓN
================================================== */

function initPreferences() {
    loadLocalData();
    renderCourses();
    setupPreferenceEvents();
}

initPreferences();
