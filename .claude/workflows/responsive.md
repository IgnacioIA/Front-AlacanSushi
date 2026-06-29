# Workflow: Diseño Responsivo

## Filosofía

**Mobile-aware, no mobile-first ni desktop-first.**
El diseño se construye con `clamp()` para que funcione en todos los tamaños,
y `@media` solo para los casos donde el layout debe cambiar estructuralmente.

## Herramientas principales

### clamp() para tipografía y espaciado

```css
/* En lugar de: */
font-size: 3rem;

/* Usar: */
font-size: clamp(1.5rem, 4vw, 3rem);
/*              mínimo   fluido  máximo */
```

Las variables de tipografía ya están definidas en `Typography.css`:
```css
font-size: var(--fs-display-xl);   /* clamp(4rem, 10vw, 8rem) */
font-size: var(--fs-title-lg);     /* clamp(2rem, 4vw, 3rem) */
```

Usar siempre las variables antes de definir un `clamp()` propio.

### Breakpoints

Solo dos breakpoints en uso:

```css
@media (max-width: 768px) { /* mobile */ }
@media (max-width: 480px) { /* mobile pequeño */ }
```

No crear breakpoints intermedios a menos que sea estrictamente necesario.

## Patrones responsivos comunes

### Layout de dos columnas → una columna en mobile

```css
.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
  }
}
```

### `.flex-between` ya maneja mobile automáticamente

La clase `.flex-between` de `Global.css` ya incluye:
```css
@media (max-width: 768px) {
  .flex-between {
    flex-direction: column;
    gap: 1.5rem;
  }
}
```

### Fondos diferentes en mobile

Algunos heroes tienen imagen específica para mobile (ej: Shogun):
```jsx
<picture>
  <source media="(max-width: 768px)" srcSet={fondoMobile} />
  <img src={fondo} alt="" />
</picture>
```

O con CSS:
```css
.hero-bg {
  background-image: url('../assets/shogun/hero/FONDO HERO.webp');
}

@media (max-width: 768px) {
  .hero-bg {
    background-image: url('../assets/shogun/hero/FONDO HERO MOBILE.webp');
  }
}
```

## Checklist responsivo

- [ ] Probar en 375px (iPhone SE), 768px (tablet), 1280px (desktop), 1440px+.
- [ ] Textos no se desbordan del contenedor.
- [ ] Las imágenes no se distorsionan (`object-fit: cover` cuando sea necesario).
- [ ] El carrusel es swipeable en touch.
- [ ] Los botones tienen tamaño mínimo de 44x44px en mobile.
- [ ] El padding es suficiente para no pegar contenido al borde (usar `.container`).
