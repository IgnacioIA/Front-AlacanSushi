# Naming Conventions

## Componentes React

- **PascalCase**: `HeroSection`, `BuyABox`, `NovedadesGallery`.
- El archivo lleva el mismo nombre: `HeroSection.jsx`.
- Una excepción histórica: `cartaMovible.jsx` (lowercase inicial) — no replicar este patrón.

## Archivos CSS

- **kebab-case**: `hero-background.css`, `showcase-content.css`.
- Mismo nombre que el componente que los usa, pero en kebab.

## Carpetas de páginas

- Minúsculas con el nombre de la expansión o sección: `shogun/`, `leyendas 4.0/`, `mazosInicialesPrimerBloque/`.
- Subcarpetas: `sections/`, `components/`, `styles/`, `data/`.

## Variables CSS

- `--fs-*` para font sizes.
- `--lh-*` para line heights.
- `--ls-*` para letter spacings.
- `--font-*` para familias.
- Colores: `--primary`, `--text`, `--muted`, `--border`.

## Props

- **camelCase**: `cardTitle`, `backgroundImage`, `onSelect`.
- Handlers: prefijo `on` → `onClick`, `onClose`, `onSlideChange`.
- Booleans: `is*` o `has*` → `isActive`, `hasOverlay`.

## Rutas (React Router)

- PascalCase o camelCase según la página: `/Home`, `/Shogun`, `/mazoInicialPB`, `/EdicionPBX`.
- No agregar `/` trailing.

## Assets

Los assets se organizan por expansión:
```
src/assets/
├── mitos4.0/
│   ├── hero/
│   ├── buyABox/
│   ├── cartas/
│   └── novedades/
└── shogun/
    ├── hero/
    ├── buyABox/
    └── ...
```
Nombrar archivos de imagen en MAYÚSCULAS si vienen del equipo de diseño (no renombrar para no romper git history).
