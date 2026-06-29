# Workflow: Crear un Componente

## 1. Determinar dónde va

**¿Se usa en una sola página?**
→ Va en `src/pages/[pagina]/sections/[seccion]/components/`

**¿Se usa en múltiples páginas?**
→ Va en `src/components/ui/` (átomo) o `src/components/[nombre]/` (compuesto)

## 2. Crear los archivos

```
components/
├── MiComponente.jsx
└── MiComponente.css    ← mismo nombre, misma carpeta
```

O si la sección tiene carpeta `styles/`:
```
sections/
└── hero/
    ├── components/
    │   └── MiComponente.jsx
    └── styles/
        └── mi-componente.css
```

## 3. Estructura del JSX

```jsx
// No agregar comentario de ruta — el nombre del archivo ya lo dice

function MiComponente({ titulo, imagen }) {
  return (
    <div className="mi-componente">
      <h2 className="title-lg">{titulo}</h2>
      <img src={imagen} alt={`Imagen de ${titulo}`} loading="lazy" />
    </div>
  );
}

export default MiComponente;
```

## 4. Estructura del CSS

```css
.mi-componente {
  /* estilos específicos de este componente */
  /* usar variables CSS del sistema, no valores hardcoded */
}
```

## 5. Importar el CSS en el JSX

```jsx
import './MiComponente.css';
// o si está en styles/:
import '../styles/mi-componente.css';
```

## 6. Importar el componente en el padre

```jsx
import MiComponente from './components/MiComponente';
```

## Checklist antes de cerrar

- [ ] El nombre es PascalCase y descriptivo.
- [ ] El CSS no duplica utilidades de `Global.css`.
- [ ] Las imágenes tienen `alt` y `loading="lazy"` si aplica.
- [ ] Las props tienen nombres claros.
- [ ] El componente se puede ver correctamente en mobile.
