# Fase 3.3.1 — Decisión de implementación: bloque personalizado

Fecha: 2026-10-03

El diseño fija explícitamente un bloque de 5 plantas para el arranque en frío. Para mantener una experiencia visual coherente con el carrusel existente de la página principal, la primera implementación utilizará también **5 plantas como tamaño máximo del bloque personalizado**.

## Regla

- El motor puede calcular y ordenar todos los candidatos válidos.
- La interfaz principal mostrará como máximo 5 candidatos personalizados.
- No se rellenará el bloque repitiendo plantas.
- Si existen menos de 5 candidatos válidos, se mostrarán únicamente los disponibles.
- El tamaño 5 es un parámetro de presentación, no una señal del algoritmo ni un criterio agronómico.
- Esta regla no modifica el bloque de arranque en frío: ambos utilizan 5 por motivos de presentación, pero el bloque de arranque en frío conserva su rotación determinista independiente.

## Motivo

El límite permite reutilizar el carrusel actual de la página principal sin crear una nueva estructura visual para la primera versión del motor. La cantidad no representa una puntuación ni una preferencia del usuario.
