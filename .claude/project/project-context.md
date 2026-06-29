# Contexto del Proyecto

## Qué es

**Mitos y Leyendas (MYL)** es el TCG (Trading Card Game) más popular de Chile y América Latina.
Este repositorio es el **frontend del sitio oficial de expansiones y productos**.

Desarrollado por **Agencia AgusIgna** para el cliente MYL.

## Propósito del sitio

- Presentar las expansiones de cartas (Leyendas 4.0, Shogun, Edición PBX, etc.).
- Mostrar productos: displays, mazos iniciales, kits de batalla, lootboxes.
- Educar nuevos jugadores (sección "Aprende a Jugar").
- Mostrar contenido de lore, formatos de juego, lista de baneados, tiendas amigas y teams oficiales.

## Stack

| Herramienta | Versión | Rol |
|-------------|---------|-----|
| React | 19 | UI |
| Vite | 8 | Bundler / dev server |
| React Router | 7 | Navegación SPA |
| Framer Motion | 12 | Animaciones |
| Embla Carousel | 8 | Carruseles |
| React Icons | 5 | Íconos |
| CSS propio | — | Estilos (sin Tailwind) |

## Rama principal

`master` — los PRs se hacen contra esta rama.

## Equipo

- Desarrollador: Ignacio (ignacioIA en GitHub).
- Branch actual de trabajo: `creaHeader`.

## Expansiones en el sitio

| Expansión | Ruta | Carpeta assets |
|-----------|------|---------------|
| Leyendas 4.0 | `/mitos4.0` | `src/assets/mitos4.0/` |
| Shogun | `/Shogun` | `src/assets/shogun/` |
| Edición PBX | `/EdicionPBX` | `src/assets/` (pendiente organizar) |
| Mazos Iniciales PB | `/mazoInicialPB` | — |
