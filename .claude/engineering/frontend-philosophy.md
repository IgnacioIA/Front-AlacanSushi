# Filosofía Frontend

## Principios core

- **CSS primero**: la lógica de estilo vive en CSS, no en JS. No existe Tailwind ni CSS-in-JS.
- **Semántico**: HTML que comunica estructura sin depender de clases para el significado.
- **Cinematográfico**: el estilo visual es oscuro, épico y propio de un TCG premium.
- **Clamp over breakpoints**: preferir `clamp()` para tipografía y espaciado antes de `@media`.
- **Sin abstracciones prematuras**: no crear helpers hasta necesitarlos tres veces.

## Lo que NO hacemos

- No usar inline styles salvo para valores dinámicos (posición de un elemento, color de un personaje).
- No crear clases de utilidad que dupliquen las que ya existen en `Global.css` o `Typography.css`.
- No instalar librerías de UI (MUI, Chakra, etc.) — el sistema de diseño es propio.
- No usar `!important`.
- No crear componentes wrapper vacíos solo para agrupar — usar `section`, `div` directamente.

## Estética

El sitio debe sentirse como un **producto oficial de un TCG**:
glow, glassmorphism sutil, fondos con imágenes WebP de alta calidad,
tipografía display bold con `letter-spacing` negativo.
Ver [ui-design](../project/ui-design.md) para tokens visuales concretos.
