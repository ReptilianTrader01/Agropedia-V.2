# Fase 3.3.1 — Decisión de implementación: pesos iniciales

Fecha: 2026-10-03

La auditoría y el diseño definen las señales que puede utilizar el motor, pero dejan los pesos concretos para la implementación. Esta decisión fija la primera ponderación determinista y explicable.

## Ponderación v1

Para ordenar candidatos personalizados se utilizarán:

| Señal | Puntos |
|---|---:|
| Clima coincidente con `preferencias_usuario.clima_preferido` | 3 |
| Suelo coincidente | 2 |
| Luz coincidente | 2 |
| Ciclo coincidente | 1 |
| Familia coincidente | 1 |
| Riego coincidente | 1 |
| Época de siembra coincidente | 1 |
| Relación explícita de compatibilidad | 4 |
| Relación con una planta favorita | 3 |

Puntuación máxima teórica cuando todas las señales aplicables coinciden: 18 puntos.

## Reglas

- Una señal ausente no resta puntos.
- Una señal no aplicable no resta puntos.
- La compatibilidad explícita recibe el mayor peso individual porque es una relación registrada directamente en `plantas_compatibles`.
- El clima preferido del usuario recibe mayor peso que las demás características de la ficha porque es la única preferencia ambiental explícita del perfil disponible en la auditoría.
- La relación con favoritos tiene un peso alto, pero no convierte una característica de un solo favorito en una preferencia general.
- La puntuación sirve únicamente para ordenar candidatos y no se mostrará como calificación al usuario.
- Los empates se resolverán por `id` ascendente para mantener un resultado determinista.
- Las reglas de exclusión del diseño se aplican antes de puntuar.

## Motivo

Esta ponderación no pretende establecer una verdad agronómica universal. Es una configuración inicial de producto que permite implementar y probar un motor explicable con las fuentes confirmadas. Podrá revisarse posteriormente con datos de uso, pero cualquier cambio deberá documentarse como una decisión independiente.
