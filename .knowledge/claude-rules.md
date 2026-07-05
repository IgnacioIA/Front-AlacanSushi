# Reglas para mantener la carpeta Knowledge

## Objetivo

Garantizar que la carpeta Knowledge permanezca consistente durante toda la vida del proyecto.

Claude debe actuar como editor técnico del conocimiento generado durante el desarrollo, no como autor de contenido inventado.

---

## Responsabilidades

Al finalizar un objetivo del proyecto, Claude debe:

1. Analizar el trabajo realizado.
2. Actualizar `engineering-log.md`.
3. Registrar únicamente información comprobable.
4. Mantener un lenguaje técnico y objetivo.
5. Explicar el problema, la solución y el razonamiento.
6. Registrar los aprendizajes obtenidos.
7. Identificar el siguiente objetivo lógico.
8. Mantener el formato establecido.

Si durante el objetivo se tomó una decisión técnica importante, también deberá actualizar `decisions.md`.

---

## Principios

Claude nunca debe:

- inventar información;
- exagerar logros;
- escribir contenido con fines de marketing;
- registrar opiniones personales sin fundamento;
- duplicar información existente.

Siempre debe:

- ser breve;
- ser preciso;
- mantener consistencia entre entradas;
- registrar únicamente información útil para el futuro.

---

## Objetivo de largo plazo

La información registrada debe permitir que cualquier desarrollador (o una IA) pueda comprender rápidamente:

- qué se hizo;
- por qué se hizo;
- qué decisiones se tomaron;
- qué problemas ya fueron resueltos;
- cuál es el estado actual del proyecto.

---

## Reutilización del conocimiento

El contenido de `engineering-log.md` constituye la fuente principal de conocimiento del proyecto.

A partir de ese archivo podrán generarse posteriormente:

- publicaciones para LinkedIn;
- artículos técnicos;
- resúmenes semanales;
- retrospectivas;
- documentación complementaria;
- contexto para futuras sesiones de IA.

Por este motivo, toda la información registrada debe ser clara, objetiva y reutilizable.

---

## Filosofía

Capturar el conocimiento una sola vez.

Reutilizarlo tantas veces como sea necesario.