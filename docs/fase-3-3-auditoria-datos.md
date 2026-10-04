# Fase 3.3 — Auditoría de datos para recomendaciones

Fecha de auditoría: 2026-10-03

## Objetivo

Auditar la base de datos real antes de diseñar el motor de recomendaciones. La auditoría se centra en los datos de plantas, relaciones con usuarios/huertos y estructuras existentes que puedan alimentar recomendaciones sin crear todavía un nuevo motor ni una nueva tabla de recomendaciones.

## 1. Datos de las 11 plantas actuales

La tabla `public.plantas` contiene actualmente 11 registros.

| Campo | Plantas con dato | Cobertura |
|---|---:|---:|
| clima_preferido | 11/11 | 100% |
| suelo_preferido | 11/11 | 100% |
| luz | 11/11 | 100% |
| ciclo | 11/11 | 100% |
| dificultad | 11/11 | 100% |
| familia_id | 10/11 | 90.9% |
| epoca_siembra | 11/11 | 100% |
| riego | 11/11 | 100% |

Por lo tanto, los campos principales propuestos para recomendaciones **sí están suficientemente poblados** en el conjunto actual. El único faltante es `familia_id` en "Planta de prueba".

### Plantas auditadas

- Tomate — Solanaceae
- Chile — Solanaceae
- Albahaca — Lamiaceae
- Pepino — Cucurbitaceae
- Calabaza — Cucurbitaceae
- Lechuga — Asteraceae
- Zanahoria — Apiaceae
- Menta — Lamiaceae
- Lavanda — Lamiaceae
- Rosal — Rosaceae
- Planta de prueba — sin familia

Los valores de clima, suelo, luz, ciclo, dificultad, época de siembra y riego están presentes en los 11 registros.

## 2. Compatibilidad entre especies

Sí existe una tabla específica:

`public.plantas_compatibles`

Columnas:
- `planta_id`
- `planta_relacionada_id`
- `compatible`
- `descripcion`

Actualmente contiene solamente **3 relaciones**, todas correspondientes a Tomate:

- Tomate → Chile
- Tomate → Albahaca
- Tomate → Lavanda

Las tres están marcadas como compatibles.

Esto significa que **la compatibilidad no necesita inferirse desde cero**, porque existe una fuente explícita. Sin embargo, su cobertura actual es muy baja: solo 1 de las 11 plantas tiene relaciones registradas.

La tabla debe tratarse inicialmente como un dato adicional, no como la base completa del sistema de recomendaciones.

## 3. Favoritos

`public.plantas_favoritas` existe y contiene actualmente 3 registros, correspondientes a 3 plantas distintas.

Campos relevantes:
- `usuario_id`
- `planta_id`
- `created_at`

Esto permite utilizar los favoritos como señal real de interés del usuario.

## 4. Mi Jardín

`public.huertos` existe y actualmente contiene 2 huertos.

`public.plantas_bancal` contiene 10 cultivos, correspondientes a 5 plantas distintas.

Campos útiles de `plantas_bancal`:
- `planta_id`
- `cantidad`
- `fecha_siembra`
- `fecha_cosecha_estimada`
- `etapa_id`
- `estado`
- `notas`

Esto permite saber qué plantas ya cultiva el usuario y evitar recomendarle exactamente las mismas plantas cuando la recomendación pretenda descubrir nuevas opciones.

## 5. Preferencias del usuario

`public.preferencias_usuario` existe y contiene, entre otros:
- `clima_preferido`
- `frecuencia_recomendaciones`
- `mostrar_recomendaciones_luna`
- `mostrar_recomendaciones_clima`

Por tanto, existe una base para personalizar la frecuencia y preferencias generales de recomendación.

Sin embargo, el perfil/huerto no contiene actualmente una combinación completa de características físicas del jardín como suelo, horas de luz o dimensiones agronómicas suficientes para afirmar que una planta es compatible con el lugar real. `huertos` contiene dimensiones generales (`ancho`, `alto`), pero no suelo ni luz.

## 6. Temporadas

Existe la estructura:
- `temporadas`
- `temporadas_planta`

Las cuatro temporadas existen en `temporadas`, pero actualmente `temporadas_planta` tiene **0 relaciones**.

Por tanto, aunque `plantas.epoca_siembra` sí está poblado en las 11 plantas, no existe actualmente una relación estructurada planta → temporada que permita usar `temporadas_planta` como fuente de recomendación.

El motor inicial no debe depender de esta tabla hasta que tenga datos.

## 7. Condiciones de planta

`public.condiciones_planta` existe y contiene 40 registros, todos con `valor` poblado.

Esto puede convertirse en una fuente complementaria de características de cultivo, pero primero habrá que auditar el significado exacto de sus nombres/valores antes de incorporarla al cálculo del motor.

## 8. Otras fuentes relacionadas

También existen:
- `planta_nutrientes`: actualmente 0 relaciones.
- `planta_problemas`: actualmente 0 relaciones.
- `tareas_cultivo`: 7 registros.
- `zonas_climaticas`: la tabla existe, pero actualmente no devuelve registros.
- `perfiles.zona_climatica_id`: existe la relación potencial, pero no hay zonas climáticas pobladas actualmente.

## 9. Relaciones relevantes con plantas

Las relaciones FK relevantes encontradas incluyen:

- `plantas.familia_id → familias.id`
- `plantas_bancal.planta_id → plantas.id`
- `plantas_compatibles.planta_id → plantas.id`
- `plantas_compatibles.planta_relacionada_id → plantas.id`
- `plantas_favoritas.planta_id → plantas.id`
- `tareas_cultivo.planta_id → plantas.id`
- `temporadas_planta.planta_id → plantas.id`
- `condiciones_planta.planta_id → plantas.id`
- `planta_etiquetas.planta_id → plantas.id`
- `planta_nutrientes.planta_id → plantas.id`
- `planta_problemas.planta_id → plantas.id`
- `planta_propagacion.planta_id → plantas.id`

Estas relaciones permiten construir el sistema sobre datos relacionales existentes, sin necesidad de crear una tabla de recomendaciones en esta etapa.

## 10. Conclusión de la auditoría

La hipótesis de que faltaban datos suficientes para construir recomendaciones **no se confirma**.

Los 8 campos solicitados como base están prácticamente completos:

- 7 de 8 campos tienen 11/11 registros.
- familia tiene 10/11.
- En consecuencia, la cobertura de los ocho campos considerados es alta.

El problema principal no está en la ficha de las plantas, sino en la **cobertura de datos relacionales**:

- compatibilidad: solo 3 relaciones;
- temporadas estructuradas: 0 relaciones;
- zonas climáticas: 0 registros;
- nutrientes relacionados: 0;
- problemas relacionados: 0.

## 11. Subconjunto de datos con el que sí podemos construir algo útil ahora

La primera versión del motor puede construirse con datos que realmente existen hoy:

### Núcleo de recomendación
1. `clima_preferido`
2. `suelo_preferido`
3. `luz`
4. `ciclo`
5. `dificultad`
6. `familia_id`
7. `epoca_siembra`
8. `riego`

### Personalización
9. `plantas_favoritas`
10. plantas que el usuario ya tiene en `plantas_bancal`
11. `preferencias_usuario.clima_preferido`

### Señales complementarias
12. `plantas_compatibles`, únicamente donde exista una relación explícita.
13. `condiciones_planta`, después de validar semánticamente sus valores.

### Datos que NO deberían ser dependencia del motor inicial
- `temporadas_planta`, porque tiene 0 relaciones.
- `zonas_climaticas`, porque actualmente no tiene registros.
- `planta_nutrientes`, porque actualmente tiene 0 relaciones.
- `planta_problemas`, porque actualmente tiene 0 relaciones.

## 12. Decisión para 3.3.1

El diseño del motor debe partir de este estado real de datos.

La primera versión no necesita IA ni una tabla nueva de recomendaciones. Puede ser un motor determinista en JavaScript que genere recomendaciones a partir de coincidencias y señales existentes.

La compatibilidad explícita deberá tener mayor confianza que una compatibilidad inferida. Las relaciones inexistentes no deben presentarse como hechos de compatibilidad.

La auditoría no modifica el esquema, las políticas RLS ni la arquitectura de autenticación.
