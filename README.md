# Agropedia V.2

Agropedia es una plataforma web orientada al conocimiento, consulta y administración de información sobre plantas y cultivo. El proyecto combina una wiki de plantas con funciones para usuarios, gestión de huertos y contenido educativo.

## Qué incluye

- Catálogo de plantas conectado a una base de datos.
- Fichas individuales de plantas con información de cultivo y cuidados.
- Sistema de usuarios mediante Supabase Auth.
- Favoritos y preferencias de usuario.
- Gestión de uno o varios huertos desde "Mi huerto".
- Registros de cultivo, tareas e historial.
- Sección educativa con cursos, videos, documentos y temas.
- Dashboard administrativo para gestionar contenido.
- Recomendaciones y elementos informativos en la página principal.
- Persistencia de datos mediante Supabase.

## Stack tecnológico

Agropedia V.2 utiliza una arquitectura web sencilla, sin framework ni proceso de compilación:

- **HTML5** para la estructura de las páginas.
- **CSS3** para estilos, diseño y modo oscuro.
- **JavaScript** para la lógica de la interfaz y las interacciones.
- **Supabase** para autenticación, PostgreSQL y acceso a los datos desde el navegador.
- **Supabase Auth + Row Level Security (RLS)** para controlar el acceso a los datos.
- **Supabase JavaScript SDK** cargado desde CDN.

No utiliza:

- React, Vue, Angular u otro framework de frontend.
- Node.js como requisito de ejecución de la aplicación.
- npm como requisito para instalar dependencias.
- Webpack, Vite u otro build step.

## Cómo ejecutar el proyecto localmente

Agropedia necesita ejecutarse mediante un servidor HTTP estático. No es necesario instalar paquetes con npm.

### Opción 1: servidor estático de Python

Si tienes Python instalado:

```bash
python -m http.server 8000
```

Después abre:

```
http://localhost:8000
```

### Opción 2: servidor estático de VS Code

También puedes utilizar una extensión como **Live Server** para abrir el proyecto mediante un servidor local.

> No se recomienda abrir las páginas directamente con `file://`, porque algunas funciones del navegador y las conexiones con servicios externos requieren un contexto HTTP.

## Estructura del proyecto

```text
Agropedia-V.2/
│
├── assets/
│   └── images/
│       ├── logo.png
│       ├── hero-dia.svg
│       ├── hero-día.jpeg
│       ├── hero-noche.svg
│       └── hero-noche.jpeg
│
├── css/
│   ├── navegación y estilos globales
│   ├── estilos de páginas de plantas
│   ├── estilos de Mi huerto
│   ├── estilos de Aprende
│   ├── estilos del Dashboard
│   └── estilos de páginas de contenido
│
├── js/
│   ├── supabase-config.js
│   ├── plantas-supabase.js
│   ├── planta-supabase.js
│   ├── jardin.js
│   ├── preferencias_usuario.js
│   ├── registro.js
│   ├── dashboard.js
│   ├── cms-educativo.js
│   ├── educacion-data.js
│   ├── index.js
│   └── demás módulos JavaScript de la interfaz
│
├── index.html
├── plantas.html
├── planta.html
├── jardin.html
├── aprende.html
├── catalogo.html
├── curso.html
├── tema.html
├── video.html
├── documento.html
├── registro.html
├── preferencias_usuario.html
├── dashboard.html
├── nosotros.html
└── README.md
```

Los archivos JavaScript antiguos que fueron reemplazados por las versiones conectadas a Supabase no forman parte de la estructura actual.

## Configuración de Supabase

La conexión del frontend se configura en:

```
js/supabase-config.js
```

El archivo necesita dos valores principales:

```javascript
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'TU_PUBLISHABLE_KEY';
```

### SUPABASE_URL

Es la URL pública del proyecto de Supabase.

### SUPABASE_PUBLISHABLE_KEY

Es la **Publishable Key** del proyecto. Esta clave está diseñada para utilizarse desde aplicaciones cliente.

El archivo de configuración crea el cliente compartido:

```javascript
const agropediaSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

window.agropediaSupabase = agropediaSupabase;
```

### Seguridad

La configuración del frontend **no debe contener una secret key ni una service_role key**.

La seguridad de los datos no depende de ocultar la Publishable Key. El acceso debe permanecer controlado mediante **Supabase Auth, RLS y las funciones de autorización existentes, incluida `has_role()`**.

No copies claves privadas, secretos ni credenciales administrativas en este README ni en archivos JavaScript que se entreguen al navegador.

## Cache-busting

Los scripts locales se cargan actualmente utilizando una versión común:

```text
?v=20261002
```

Por ejemplo:

```html
<script src="js/index.js?v=20261002"></script>
```

Cuando se realicen cambios en los scripts, la versión puede actualizarse manualmente en las referencias HTML para evitar que el navegador conserve una versión antigua en caché.

## Desarrollo

El proyecto está pensado para evolucionar de forma incremental. Las funciones de frontend consumen las tablas y políticas existentes de Supabase directamente desde el navegador, mientras que las restricciones de acceso deben mantenerse en la base de datos mediante RLS.

Al modificar archivos existentes, conviene conservar:

- La arquitectura de autenticación actual.
- Las políticas RLS existentes.
- El uso de `has_role()` para las comprobaciones de roles administrativos.
- El cliente compartido `window.agropediaSupabase`.
- La separación entre HTML, CSS y JavaScript.
- El esquema actual de cache-busting.
