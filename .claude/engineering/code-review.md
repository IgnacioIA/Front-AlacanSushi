# Code Review Checklist

## Corrección

- [ ] El componente renderiza correctamente en desktop y mobile.
- [ ] No hay warnings de React en consola (keys faltantes, deps de useEffect incompletas).
- [ ] Los imports son correctos y no hay dependencias circulares.
- [ ] Las imágenes referencian rutas existentes en `src/assets/`.

## CSS

- [ ] No duplica clases de utilidad de `Global.css` o `Typography.css`.
- [ ] Usa `clamp()` para tipografía y espaciado responsivo.
- [ ] El CSS está co-locado con su componente, no en un archivo global.
- [ ] No usa `!important`.
- [ ] No hay valores `px` fijos para tipografía.

## React

- [ ] Componentes en PascalCase, archivos en el mismo nombre.
- [ ] No hay lógica de negocio inline en JSX (extraer a variable o función).
- [ ] `key` único en listas — no usar `index` si la lista puede reordenarse.
- [ ] Las props tienen nombres claros (no `data`, `info`, `obj`).

## Performance

- [ ] Imágenes de fondo en `.webp`.
- [ ] `loading="lazy"` en imágenes bajo el fold.
- [ ] Animaciones Framer con `viewport={{ once: true }}`.

## Accesibilidad

- [ ] `alt` en todas las imágenes de cartas.
- [ ] Botones con texto o `aria-label`.
- [ ] HTML semántico (`section`, `article`, `nav`, `h2`...).

## Estructura

- [ ] El componente está en la carpeta correcta (específico de página vs. compartido).
- [ ] Si es nueva página, la ruta está registrada en `AppRoutes.jsx`.
- [ ] Archivos data (arrays de cartas, productos) en `sections/[seccion]/data/`.
