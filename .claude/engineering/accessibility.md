# Accesibilidad

## HTML semántico

- Secciones de página → `<section>` con un `<h2>` o `<h3>` visible (o `aria-label` si es solo visual).
- Navegación → `<nav>`.
- Imágenes de cartas → `alt="[nombre de la carta] — [tipo]"`. Las imágenes decorativas usan `alt=""`.
- Botones que solo tienen icono → `aria-label` descriptivo.

## Foco y teclado

- No remover el outline de foco con `outline: none` sin reemplazarlo.
- Los elementos interactivos (botones, links) deben ser alcanzables con Tab.
- El carrusel Embla ya maneja foco internamente.

## Contraste

- Texto sobre fondos oscuros: verificar ratio mínimo 4.5:1.
- El texto `.text-muted` sobre fondo negro puede ser borderline — no bajar más `opacity`.

## Movimiento

- Las animaciones Framer deben respetar `prefers-reduced-motion`:

```jsx
import { useReducedMotion } from 'framer-motion';

const shouldReduce = useReducedMotion();
const variants = shouldReduce ? {} : { hidden: {...}, visible: {...} };
```

## Imágenes de cartas coleccionables

Son el contenido principal del sitio. Siempre llevan:
- `alt` con el nombre del set y número (ej: `"Carta LPB4-001 — Leyendas Primer Bloque 4"`).
- `width` y `height` explícitos para evitar layout shift.
