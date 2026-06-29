# UI / Diseño

## Estética general

**Oscuro, cinematográfico, épico.** El sitio transmite la identidad premium de un TCG.

- Fondos: imágenes WebP de alta calidad + overlays oscuros con `rgba`.
- Paleta: negro profundo, blanco, violeta/púrpura como acento (`--primary`).
- Efectos de luz: blobs con `filter: blur(120px)` clase `.glow`.
- Glassmorphism: clase `.glass` con `backdrop-filter: blur(20px)`.
- Texto: fuentes bold con `letter-spacing` negativo para displays grandes.

## Tokens visuales

```css
/* Gradiente de texto hero */
background: linear-gradient(90deg, #ffffff, #b892ff);

/* Glassmorphism */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);

/* Glow decorativo */
filter: blur(120px);
opacity: 0.5;
```

## Secciones típicas por página de expansión

Cada página de expansión sigue una estructura similar:
1. **Hero** — pantalla completa, imagen de fondo, título display, CTA.
2. **TextoYCarta** — carta 3D interactiva + descripción de la expansión.
3. **BuyABox** — carrusel de cartas del set + incentivo de compra.
4. **Novedades** — galería de personajes/cartas nuevas.
5. **Lore** — imagen + texto narrativo.
6. **Productos** — productos disponibles (display, mazo, kit).

## Cartas interactivas

El componente `FrameFX` (`src/components/ui/cartaMovible/`) implementa el efecto 3D de carta con mouse tracking.
Es el efecto más distintivo del sitio — preservarlo y no simplificarlo.

## Carruseles

Usar Embla Carousel. La estructura estándar:
- `CarouselViewport` → el contenedor scroll.
- `CarouselSlide` → cada slide individual.
- `CarouselControls` → botones prev/next.

## Responsive

El sitio tiene versiones **desktop y mobile** bien diferenciadas en las secciones hero.
En mobile, los fondos pueden cambiar (ej: `FONDO HERO MOBILE.webp` vs `FONDO HERO.webp` en Shogun).
