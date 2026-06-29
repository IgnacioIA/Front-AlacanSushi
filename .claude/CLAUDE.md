# CartasInicialFront — Guía para Claude

Frontend del sitio oficial de **Mitos y Leyendas (MYL)**, el TCG chileno.
Stack: **React 19 + Vite + React Router v7 + CSS custom + Framer Motion**.

## Arquitectura

- Página → Secciones → Componentes (ver [react-architecture](engineering/react-architecture.md))
- CSS propio sin Tailwind (ver [css-system](engineering/css-system.md))
- Rutas en `src/routes/AppRoutes.jsx`, layout global en `src/layout/`

## Páginas actuales

| Ruta | Página |
|------|--------|
| `/Home` | Home |
| `/mazoInicialPB` | Mazos Iniciales Primer Bloque |
| `/mitos4.0` | Leyendas 4.0 |
| `/Shogun` | Shogun |
| `/EdicionPBX` | Edición PBX |
| `/Apj` | Aprende a Jugar |
| `/BanList` | Lista de Baneados |
| `/LorePage` | Lore |
| `/Formatos` | Formatos |
| `/TiendasAmigas` | Tiendas Amigas |
| `/TeamsOficiales` | Teams Oficiales |
| `/HistoriaMYL` | Historia MYL |

## Documentación

### Ingeniería
- [Filosofía frontend](engineering/frontend-philosophy.md)
- [Arquitectura React](engineering/react-architecture.md)
- [Diseño de componentes](engineering/component-design.md)
- [Sistema CSS](engineering/css-system.md)
- [Performance](engineering/performance.md)
- [Accesibilidad](engineering/accessibility.md)
- [Reglas de refactoring](engineering/refactoring-rules.md)
- [Code review](engineering/code-review.md)
- [Naming conventions](engineering/naming-conventions.md)

### Proyecto
- [Contexto del proyecto](project/project-context.md)
- [UI / Diseño](project/ui-design.md)
- [Reglas del TCG](project/tcg-rules.md)

### Workflows
- [Crear componente](workflows/create-component.md)
- [Refactorizar componente](workflows/refactor-component.md)
- [Corregir bug](workflows/fix-bug.md)
- [Responsivo](workflows/responsive.md)
