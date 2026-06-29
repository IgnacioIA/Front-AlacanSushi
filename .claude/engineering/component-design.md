# Diseño de Componentes

## Reglas generales

- Un componente = un archivo `.jsx` + un archivo `.css` co-locado (mismo nombre, misma carpeta).
- El componente exporta `default` y no tiene lógica de negocio — eso va en custom hooks o en el padre.
- Props: solo las necesarias. No aceptar objetos enteros si alcanza con dos strings.

## Cuándo partir un componente

Partir cuando:
- El JSX supera ~60 líneas y tiene partes claramente separables (visual + lógica).
- Un sub-árbol se repite dos o más veces.
- Un fragmento necesita su propio `useEffect` o `useState`.

No partir si solo mueve markup a otro archivo sin reducir complejidad.

## Co-locación de CSS

```
sections/
└── hero/
    ├── HeroSection.jsx
    ├── components/
    │   ├── HeroBackground.jsx
    │   ├── HeroContent.jsx
    │   └── HeroScrollButton.jsx
    └── styles/
        ├── hero-background.css
        └── hero-overlay.css
```

El CSS de un componente importa solo ese componente. No importar CSS de secciones ajenas.

## Componentes reutilizables (`src/components/`)

Mover a `src/components/` solo cuando el componente se usa en **más de una página**.
Si es exclusivo de una página, queda en `pages/[pagina]/`.

Ejemplos actuales compartidos:
- `src/components/ui/button/Button.jsx`
- `src/components/ui/cartaMovible/FrameFX.jsx`
- `src/components/showcase-section/ShowcaseSection.jsx`

## Framer Motion

Usar `motion.*` solo en el componente que lo necesita. No envolver todo en `motion.div` por costumbre.
Preferir `whileInView` con `viewport={{ once: true }}` para animaciones de entrada.
