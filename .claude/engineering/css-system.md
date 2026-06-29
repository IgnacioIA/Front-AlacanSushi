# Sistema CSS

## Archivos base

| Archivo | Contenido |
|---------|-----------|
| `src/styles/Global.css` | Contenedores, grid, flex, botones, efectos, spacing helpers |
| `src/Typography.css` | Variables `--fs-*`, `--lh-*`, `--ls-*` y clases display/title/text |
| `src/Animations.css` | Keyframes globales reutilizables |

## Variables CSS (`:root`)

El tema vive en variables CSS. Las más usadas:

```css
--primary        /* color acento principal */
--text           /* texto principal */
--muted          /* texto secundario */
--border         /* bordes sutiles */
--font-title     /* fuente para displays y títulos */
```

## Clases de utilidad — Layout

```css
.container       /* max-width: 1400px, padding responsive */
.container-sm    /* max-width: 900px */
.section         /* padding-block con clamp, isolation: isolate */
.grid-auto-fit   /* grid con auto-fit minmax(280px, 1fr) */
.flex-center     /* display:flex + center ambos ejes */
.flex-between    /* display:flex + space-between */
```

## Clases de utilidad — Tipografía

Escala definida en `Typography.css` con `clamp()`:

```
.display-xl / .display-lg / .display-md   → títulos hero
.title-xl / .title-lg / .title-md / .title-sm
.text-lg / .text-md / .text-sm
.caption / .overline
.text-gradient   → gradiente blanco → violeta
.text-balance
.uppercase
```

## Clases de utilidad — Efectos

```css
.glass    /* glassmorphism: bg rgba(255,255,255,0.05) + blur(20px) + border */
.glow     /* blob blur(120px), para luces de fondo */
```

## Clases de utilidad — Botones

```css
.btn           /* base: height 56px, border-radius 999px, transition */
.btn-primary   /* background: var(--primary) */
.btn-secondary /* fondo semitransparente + border */
```

## Responsive

- Preferir `clamp(min, vw, max)` sobre `@media` para tipografía y espaciado.
- Breakpoint principal: `768px` (mobile). Secundario: `480px`.
- No crear breakpoints ad-hoc — usar los establecidos.

## Lo que NO hacer

- No duplicar clases de utilidad ya existentes.
- No usar `px` fijos para tipografía — usar las variables `--fs-*`.
- No poner estilos globales en archivos CSS de componentes.
