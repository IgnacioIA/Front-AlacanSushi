# Arquitectura React

## Estructura de carpetas

```
src/
├── routes/          # AppRoutes.jsx — único archivo de rutas
├── layout/          # Header, Navigation, Footer, MainLayout
├── pages/           # Una carpeta por página
│   └── [pagina]/
│       ├── [Pagina].jsx        # Componente raíz de la página
│       └── sections/
│           └── [seccion]/
│               ├── [Seccion].jsx         # Componente de sección
│               ├── components/           # Sub-componentes
│               └── styles/               # CSS co-locado
├── components/      # Componentes reutilizables entre páginas
│   ├── ui/          # Átomos (Button, cartaMovible, etc.)
│   └── showcase-section/  # Componentes más complejos compartidos
├── styles/          # CSS global
│   └── ui/
└── assets/          # Imágenes por expansión
    ├── mitos4.0/
    ├── shogun/
    └── ...
```

## Jerarquía Page → Section → Component

1. **Page** (`pages/shogun/Shogun.jsx`): importa y ordena las secciones, no tiene lógica propia.
2. **Section** (`pages/shogun/sections/hero/HeroSection.jsx`): una región visible de la página. Puede tener estado propio.
3. **Component** (`pages/shogun/sections/hero/components/HeroBackground.jsx`): pieza atómica dentro de una sección.

## Layout global

`MainLayout` (en `src/layout/`) envuelve todas las rutas con `<Header>` y `<Footer>`.
La estructura proviene de `<Outlet />` de React Router v7.

## Rutas

Todas las rutas están en `src/routes/AppRoutes.jsx`.
Al agregar una página nueva:
1. Crear la carpeta en `src/pages/[nombre]/`.
2. Importar en `AppRoutes.jsx`.
3. Agregar `<Route path="/[ruta]" element={<NuevaPagina />} />` dentro del `<Route element={<MainLayout />}>`.

## Estado

- Estado local con `useState` / `useRef`.
- No hay store global (Redux/Zustand/Context) — el proyecto no lo requiere aún.
- Los datos estáticos (cartas, productos) viven en archivos `data/*.jsx` dentro de la sección.
