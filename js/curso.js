/* =========================================================
   CURSO - DATOS DE PRUEBA Y NAVEGACION
   ========================================================= */

const courseData = {
    title: 'Aprende a cultivar tu huerto',
    description: 'Curso introductorio para aprender los fundamentos del cultivo y comenzar tu propio huerto.',
    difficulty: '🌱 Principiante',
    duration: '⏱ 4 horas',
    modules: [
        {
            title: 'Módulo 1 · Introducción',
            lessons: [
                {
                    title: 'Conociendo tu huerto',
                    type: 'Introducción',
                    content: '<p>En esta lección conocerás los elementos básicos que necesitas para comenzar un huerto y cómo organizar tu espacio de cultivo.</p><p>Este contenido es de demostración y posteriormente será administrado desde Supabase.</p>'
                },
                {
                    title: 'Elegir qué cultivar',
                    type: 'Lección',
                    content: '<p>Aprende a seleccionar plantas tomando en cuenta el espacio disponible, la temporada y las condiciones de tu zona.</p>'
                }
            ]
        },
        {
            title: 'Módulo 2 · Preparación',
            lessons: [
                {
                    title: 'Preparar el suelo',
                    type: 'Lección',
                    content: '<p>Conoce los aspectos básicos para preparar un suelo adecuado antes de sembrar.</p>'
                },
                {
                    title: 'Planificar el riego',
                    type: 'Lección',
                    content: '<p>Aprende a organizar el riego según las necesidades de las plantas y las condiciones ambientales.</p>'
                }
            ]
        }
    ]
};

let lessons = [];
let currentLesson = 0;
const completedLessons = new Set();

function initializeCourse() {
    document.getElementById('courseTitle').textContent = courseData.title;
    document.getElementById('courseDescription').textContent = courseData.description;
    document.getElementById('courseDifficulty').textContent = courseData.difficulty;
    document.getElementById('courseDuration').textContent = courseData.duration;

    courseData.modules.forEach((module, moduleIndex) => {
        module.lessons.forEach((lesson, lessonIndex) => {
            lessons.push({
                ...lesson,
                moduleIndex,
                lessonIndex
            });
        });
    });

    document.getElementById('lessonCount').textContent = `${lessons.length} lecciones`;

    renderModules();
    showLesson(0);
}

function renderModules() {
    const container = document.getElementById('courseModules');
    container.innerHTML = '';

    courseData.modules.forEach((module, moduleIndex) => {
        const title = document.createElement('div');
        title.className = 'course-module-title';
        title.textContent = module.title;
        container.appendChild(title);

        module.lessons.forEach((lesson, lessonIndex) => {
            const globalIndex = lessons.findIndex(item =>
                item.moduleIndex === moduleIndex && item.lessonIndex === lessonIndex
            );

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'lesson-button';
            button.dataset.lesson = globalIndex;
            button.textContent = lesson.title;

            button.addEventListener('click', () => showLesson(globalIndex));
            container.appendChild(button);
        });
    });
}

function showLesson(index) {
    if (!lessons[index]) {
        return;
    }

    currentLesson = index;
    const lesson = lessons[index];

    document.getElementById('lessonType').textContent = lesson.type;
    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('lessonContent').innerHTML = lesson.content;

    document.querySelectorAll('.lesson-button').forEach(button => {
        button.classList.toggle('active', Number(button.dataset.lesson) === index);
        button.classList.toggle('completed', completedLessons.has(Number(button.dataset.lesson)));
    });

    document.getElementById('previousLesson').disabled = index === 0;
    document.getElementById('nextLesson').disabled = index === lessons.length - 1;

    updateProgress();
}

function updateProgress() {
    const progress = lessons.length === 0
        ? 0
        : Math.round((completedLessons.size / lessons.length) * 100);

    document.getElementById('courseProgress').textContent = `📊 ${progress}% completado`;
}

document.getElementById('completeLesson').addEventListener('click', () => {
    completedLessons.add(currentLesson);
    showLesson(currentLesson);
});

document.getElementById('previousLesson').addEventListener('click', () => {
    if (currentLesson > 0) {
        showLesson(currentLesson - 1);
    }
});

document.getElementById('nextLesson').addEventListener('click', () => {
    if (currentLesson < lessons.length - 1) {
        showLesson(currentLesson + 1);
    }
});

document.addEventListener('DOMContentLoaded', initializeCourse);
