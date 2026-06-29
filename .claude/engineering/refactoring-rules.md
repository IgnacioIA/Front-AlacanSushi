# Reglas de Refactoring

## Cuándo refactorizar

- El componente hace más de una cosa y esas cosas son independientes.
- Hay CSS duplicado entre dos secciones/páginas de la misma expansión (ej: `BuyABox` de Shogun y de Leyendas 4.0 tienen estructura idéntica).
- Un hook repetido en 3+ componentes.

## Cuándo NO refactorizar

- Dos componentes se parecen pero pertenecen a páginas distintas con contextos diferentes — la duplicación es accidental, no estructural.
- El refactor requiere añadir props/config que hacen el componente genérico más complejo que las dos versiones específicas juntas.
- No hay tests que validen que el comportamiento se preserva.

## Patrón de refactor seguro

1. Leer el componente completo antes de tocar nada.
2. Identificar qué cambia entre instancias (→ props) y qué es constante (→ queda hardcoded).
3. Crear el componente genérico en `src/components/` si aplica a múltiples páginas.
4. Reemplazar una instancia, verificar visualmente, luego la otra.
5. Eliminar los archivos duplicados.

## Refactoring de CSS

- Mover clases comunes a `Global.css` solo si aplican a todo el sitio.
- Si aplican solo a una expansión (Shogun, Leyendas 4.0), crear un archivo CSS a nivel de la página.
- No crear variables CSS nuevas para valores usados una sola vez.

## Prohibido al refactorizar

- Cambiar comportamiento o apariencia como efecto colateral.
- Renombrar props sin buscar todos los usos con grep.
- Mezclar refactor con features nuevas en el mismo commit.
