# Performance

## Assets

- Fondos grandes → `.webp` obligatorio (los fondos de secciones están en WebP).
- Cartas coleccionables → `.png` (requieren transparencia).
- GIFs animados (`CartaGif.gif`) → solo cuando la animación no se puede replicar en CSS/Framer.
- No importar imágenes desde JS cuando se puede referenciar directamente en CSS (`background-image`).

## Carga de imágenes

- Usar `loading="lazy"` en imágenes bajo el fold.
- El hero siempre carga eager (está above-the-fold).
- Para carruseles (Embla), las imágenes fuera del viewport se cargan lazy.

## Animaciones

- Framer Motion `whileInView` con `viewport={{ once: true }}` — no repetir animación al hacer scroll de vuelta.
- Evitar `useEffect` con intervalos para animaciones — usar CSS `@keyframes` o Framer cuando sea posible.
- El `.glow` decorativo usa `filter: blur(120px)` con `pointer-events: none` — no agregar más de 2-3 por sección para no saturar la GPU.

## Carruseles

- Embla Carousel (`embla-carousel-react`) es la librería elegida.
- No instalar Swiper ni otros carruseles.

## Bundle

- Vite maneja el split automáticamente.
- No importar librerías enteras si solo se usa una función (`import { motion } from 'framer-motion'` está bien).
- Las páginas no tienen lazy loading de rutas aún — agregar `React.lazy` si el bundle crece.
