# Fase 3.3.1 — Diseño del motor de recomendaciones

Fecha: 2026-10-03

## 1. Criterio de diseño

Este diseño se basa exclusivamente en los datos confirmados durante la auditoría 3.3.2.

La primera versión será un motor determinista, explicable y ejecutado con datos existentes. No se introducirá una tabla de recomendaciones ni se utilizará IA.

## 2. Decisión sobre `condiciones_planta`

La auditoría adicional de sus 40 registros muestra que contienen cuatro tipos de datos por planta:

- Luz
- Riego
- Clima
- Suelo

Sus valores son descriptivos y se parecen a los campos correspondientes de `plantas`. Sin embargo, no existe suficiente documentación contractual en la estructura consultada que permita establecer que `condiciones_planta` tenga una semántica distinta, una escala adicional o reglas propias.

Por el criterio solicitado —no adivinar el significado de una tabla bloqueante— **`condiciones_planta` queda excluida del motor 3.3 inicial**.

Los datos equivalentes de `plantas` sí se utilizarán, porque esos campos forman parte de la ficha principal auditada y ya constituyen la fuente estable del sistema.

No se eliminará ni modificará `condiciones_planta`; simplemente no será una dependencia del motor.

## 3. Fuentes permitidas

### 3.1 Perfil de planta

Se utilizarán:

- `clima_preferido`
- `suelo_preferido`
- `luz`
- `ciclo`
- `dificultad`
- `familia_id`
- `epoca_siembra`
- `riego`

### 3.2 Señales del usuario

Cuando exista un usuario autenticado:

- favoritos de `plantas_favoritas`
- plantas actualmente cultivadas en `plantas_bancal`
- `preferencias_usuario.clima_preferido`

### 3.3 Compatibilidad

Se podrá consultar `plantas_compatibles`, pero únicamente para relaciones explícitamente registradas.

No se inferirá compatibilidad entre especies a partir de familia, similitud de cultivo, clima u otros campos.

Una ausencia de relación significa **"sin datos de compatibilidad registrados"**, no "incompatible".

### 3.4 Fuentes excluidas

No serán dependencias del motor inicial:

- `condiciones_planta`
- `temporadas_planta`
- `zonas_climaticas`
- `planta_nutrientes`
- `planta_problemas`

Esto evita que la primera versión dependa de tablas actualmente vacías o de semántica no confirmada.

## 4. Tipos de recomendación

La primera versión tendrá tres familias de recomendaciones.

### A. Plantas relacionadas con intereses del usuario

Se parte de los favoritos del usuario y se buscan plantas relacionadas mediante características objetivas de la ficha:

- misma familia
- mismo clima preferido
- misma luz
- mismo tipo/ciclo cuando sea aplicable
- características de suelo y riego compatibles

El sistema debe mostrar el motivo de la recomendación.

Ejemplo:

> "Te puede interesar porque comparte familia y condiciones de luz con una de tus favoritas."

No se presentará la coincidencia como una preferencia confirmada del usuario.

### B. Plantas potencialmente adecuadas para el jardín

Se comparan las características conocidas de las plantas con las señales disponibles del usuario.

En esta primera versión, la comparación personalizada estará limitada a los datos realmente disponibles. No se afirmará que una planta es adecuada para un terreno concreto si no conocemos las condiciones de ese terreno.

Si no existen datos suficientes para personalizar la recomendación, se mostrará una recomendación general basada en el catálogo en lugar de inventar condiciones.

### C. Diversificación del jardín

Se excluyen las plantas que el usuario ya tiene en `plantas_bancal` y se buscan alternativas del catálogo.

La diversificación no se interpretará como una afirmación agronómica de que una especie "debe" cultivarse. Será únicamente una función de descubrimiento.

## 5. Reglas de exclusión

Antes de calcular recomendaciones:

1. excluir plantas que el usuario ya cultiva cuando la sección sea de descubrimiento/diversificación;
2. evitar duplicados;
3. excluir la propia planta que originó una recomendación;
4. no utilizar registros sin datos necesarios para una comparación concreta;
5. no convertir ausencia de datos en una puntuación negativa;
6. no inferir compatibilidad entre especies sin relación explícita.

## 6. Manejo de favoritos: estados vacíos

Debido a que actualmente existen pocos favoritos, el comportamiento queda definido desde ahora.

### 0 favoritos

No se intentará fabricar recomendaciones "basadas en favoritos".

La sección deberá mostrar un estado vacío útil, por ejemplo:

> "Aún no tienes plantas favoritas. Agrega algunas a favoritos para recibir recomendaciones relacionadas con tus intereses."

Mientras tanto, otras recomendaciones independientes de favoritos podrán seguir apareciendo.

### 1 favorito

El favorito se utiliza como **una sola señal de interés**, no como evidencia suficiente para afirmar un patrón de preferencias.

El sistema podrá recomendar plantas relacionadas con ese único favorito, pero el texto debe expresarlo como relación con esa planta, no como una conclusión general sobre los gustos del usuario.

Ejemplo:

> "Porque marcaste Tomate como favorito…"

y no:

> "Porque te gustan las plantas de clima cálido…"

### 2 o más favoritos

Se pueden buscar patrones compartidos entre favoritos, siempre que haya coincidencias reales.

Una característica presente en un solo favorito no debe convertirse automáticamente en una preferencia general del usuario.

## 7. Manejo del huerto

### Sin huerto o sin plantas cultivadas

No se mostrará una sección de diversificación personalizada.

Puede mostrarse descubrimiento general o recomendaciones basadas en favoritos.

### Con 1 planta cultivada

La planta se utiliza únicamente como referencia para evitar recomendarla de nuevo en la sección de diversificación.

No se asumirá que una sola planta define las condiciones completas del jardín.

### Con 2 o más plantas

Se pueden identificar características compartidas, pero no se debe asumir que esas características representan necesariamente las preferencias o condiciones del jardín.

La cantidad de plantas disponibles determina la cantidad de evidencia, no una certeza automática.

## 8. Manejo de compatibilidad sin datos

La compatibilidad tendrá un estado explícito.

### Si existen relaciones

Se muestra la sección correspondiente con las relaciones registradas.

### Si no existen relaciones

No se mostrará una lista vacía ni se afirmará que no existen plantas compatibles.

Se mostrará:

> "Aún no tenemos datos de compatibilidad para esta planta."

Esto aplica especialmente a las 10 plantas que actualmente no tienen relaciones en `plantas_compatibles`.

La ausencia de datos queda diferenciada de una incompatibilidad confirmada.

## 9. Arranque en frío total

Se define explícitamente el comportamiento para el caso en que el usuario no tenga:

- favoritos;
- plantas cultivadas en el huerto;
- `preferencias_usuario.clima_preferido`.

En este estado no existe ninguna señal personalizada suficiente para justificar una recomendación "para ti".

### Decisión

**No se ocultará la sección completa.** Se mostrará una combinación de descubrimiento general y orientación para empezar a personalizarla.

La sección se presentará con un encabezado o mensaje que deje claro que todavía no es personalizada, por ejemplo:

> "Recomendaciones para empezar"

y un texto secundario:

> "Todavía no tenemos suficientes datos sobre tus intereses o tu huerto. Estas son algunas plantas del catálogo para que puedas explorar."

El conjunto mostrado será **genérico y basado únicamente en datos confirmados del catálogo**. No se afirmará que esas plantas son las mejores para el usuario, su jardín o su clima.

### Criterio verificable de selección

Para evitar que el contenido genérico dependa de una suposición sobre el usuario, **el arranque en frío utilizará el catálogo completo disponible como universo de candidatos y una rotación determinista basada en el propio catálogo**.

La regla será:

1. consultar las plantas disponibles en `plantas`;
2. ordenar los candidatos de forma determinista a partir de un valor estable del registro, utilizando `id` como base de ordenación;
3. calcular una posición de inicio rotativa a partir de la fecha actual, de modo que no se muestre siempre el mismo primer bloque;
4. seleccionar **5 plantas por bloque** y recorrer circularmente el catálogo si es necesario;
5. no aplicar filtros de `dificultad`, `ciclo`, `clima_preferido`, `suelo_preferido`, experiencia ni ninguna otra característica como supuesto sobre el usuario.

El tamaño de 5 plantas se establece deliberadamente por debajo de la mitad del catálogo actual de 11 plantas, evitando que un bloque pueda recorrer casi todo el catálogo y haciendo perceptible la rotación. El motor deberá evitar repetir una misma planta dentro del mismo bloque: si en algún caso futuro el catálogo contiene menos de 5 candidatos válidos, se mostrarán únicamente los disponibles en lugar de repetir registros.

Este número es un parámetro de presentación de la v1 y deberá revisarse si el catálogo crece o se reduce significativamente.

La rotación será únicamente una técnica de presentación. **No constituye una señal de recomendación ni modifica el significado agronómico de las plantas.** Si el catálogo cambia, las nuevas plantas pasan a formar parte automáticamente del universo disponible.

Por tanto, una planta aparece en "Recomendaciones para empezar" porque pertenece al catálogo disponible y entra en el bloque rotativo correspondiente, no porque el motor haya determinado que sea especialmente adecuada para ese usuario.

No se inventará una preferencia a partir de este estado. En particular:

- no se asumirá que el usuario prefiere plantas fáciles;
- no se asumirá que prefiere ciclos cortos;
- no se asumirá un clima, suelo o nivel de experiencia;
- no se utilizará la ausencia de favoritos o de huerto como señal negativa.

El motor podrá utilizar los datos completos de la ficha para ordenar el conjunto general, pero la interfaz deberá identificarlo como **descubrimiento general**, no como personalización.

Además, se mostrará una invitación breve a generar señales futuras, por ejemplo:

> "Agrega plantas a favoritos o configura tu clima preferido para recibir recomendaciones más personalizadas."

### Regla de transición

En cuanto exista al menos una señal válida —un favorito, una planta cultivada o un `clima_preferido` configurado— el motor podrá activar las recomendaciones personalizadas que correspondan a esa señal.

Esto no significa que una sola señal permita inferir preferencias generales. Se aplican las reglas de favoritos y huerto definidas en las secciones anteriores.

### Relación con el fallback general

El arranque en frío total es un caso específico del fallback general: **el sistema siempre tiene algo útil que mostrar, pero nunca presenta el contenido genérico como personalizado**.

## 10. Puntuación interna

La puntuación será únicamente un mecanismo técnico para ordenar candidatos; no se mostrará al usuario como calificación de una planta.

Se recomienda una suma de señales binarias/normalizadas:

- coincidencia de clima
- coincidencia de suelo
- coincidencia de luz
- coincidencia de ciclo
- coincidencia de familia
- coincidencia de riego
- coincidencia de época de siembra
- relación explícita de compatibilidad, cuando exista
- relación con favoritos
- exclusión por cultivo actual

La implementación concreta de pesos se definirá al programar el motor, pero deberá cumplir dos reglas:

1. una señal inexistente no equivale a una señal negativa;
2. una relación explícita de compatibilidad nunca será sustituida por una inferencia.

## 11. Explicación de cada recomendación

Cada tarjeta recomendada deberá poder explicar por qué apareció.

Ejemplos de motivos válidos:

- "Comparte familia con una de tus favoritas."
- "Coincide con tu clima preferido."
- "Comparte condiciones de luz con una planta que ya cultivas."
- "No la tienes actualmente en tu huerto."

No se utilizarán motivos basados en datos que el motor no haya consultado.

## 12. Fallback general

Si el usuario no tiene favoritos, no tiene huerto o no existen suficientes señales personalizadas:

1. se elimina la personalización que no tenga evidencia;
2. se continúa con recomendaciones generales basadas en los datos completos del catálogo;
3. se informa al usuario cuando una sección depende de información que todavía no tiene.

El sistema nunca debe quedarse completamente vacío simplemente porque falte una señal opcional.

El arranque en frío total está definido específicamente en la sección 9 y debe respetar sus reglas de presentación y etiquetado.

## 13. Alcance de la primera implementación

La primera implementación del motor no incluirá:

- IA/ML
- recomendaciones nutricionales
- recomendaciones de enfermedades/plagas
- recomendaciones climáticas basadas en una zona geográfica
- calendario estacional estructurado mediante `temporadas_planta`
- inferencia de compatibilidad entre especies
- utilización de `condiciones_planta`

Estas funciones pueden incorporarse posteriormente cuando las fuentes correspondientes tengan datos y semántica suficientemente definidos.

## 14. Principio general

El motor debe distinguir siempre entre:

**dato confirmado** → puede utilizarse para recomendar;

**dato ausente** → se ignora o produce un estado vacío;

**relación explícita** → puede mostrarse como tal;

**relación no registrada** → significa "sin datos", nunca "incompatible".

Este principio evita que Agropedia presente inferencias como hechos agronómicos.
