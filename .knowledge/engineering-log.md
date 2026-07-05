# Engineering Log

## Objetivo

Registrar cronológicamente la evolución técnica del proyecto.

Cada entrada representa un objetivo completado, independientemente del tiempo que haya llevado realizarlo.

Este archivo constituye la fuente principal de conocimiento del proyecto y servirá posteriormente para generar:

- publicaciones técnicas;
- resúmenes semanales;
- contexto para IA;
- documentación de decisiones;
- material para portfolio;
- retrospectivas del proyecto.

No es un diario personal ni un changelog.

Su propósito es registrar el razonamiento detrás del desarrollo.

---

# Plantilla

---

## Fecha

AAAA-MM-DD

---

## Objetivo

¿Qué objetivo se completó?

---

## Problema

¿Qué problema existía?

---

## Solución

¿Qué se implementó?

---

## ¿Por qué esta solución?

Explicar brevemente el razonamiento.

---

## Resultado

¿Qué cambió en el proyecto?

---

## Aprendizajes

¿Qué aprendiste durante este objetivo?

---

## Próximo objetivo

¿Cuál es el siguiente paso lógico?

---

# Entradas

Las nuevas entradas deberán agregarse en orden cronológico.

Cada entrada debe representar un objetivo completamente finalizado.

---

## Fecha

2026-07-04

---

## Objetivo

Implementar el primer módulo del sistema de inventario: Ingredientes (UI completa sobre datos mock, sin lógica de negocio).

---

## Problema

No existía ningún módulo de inventario. Además, la mayoría de los componentes visuales (tarjeta, modal, confirmación, indicador de stock, buscador, toolbar, tarjeta vacía, menú contextual) no existían todavía como piezas reutilizables: sólo estaban implementados de forma acoplada dentro de OrderPanel/OrderCard.

---

## Solución

Se extrajeron ocho componentes compartidos a `src/components/` (Card, Modal, ConfirmDialog, StockIndicator, SearchBar, Toolbar, EmptyStateCard, DropdownMenu), y sobre ellos se construyó el módulo `src/components/Ingredients/`, siguiendo la misma arquitectura por capas que OrderPanel (`hooks/`, `services/`, `constants/`, `mocks/`, `model/`, `components/`).

Flujos implementados: alta, edición, borrado con confirmación y vista de detalle de sólo lectura; búsqueda, filtro por nivel de stock y orden en la toolbar; validación de formulario (campos obligatorios/formato) con foco automático en el primer error y una pequeña animación de vibración; confirmación al cancelar si hay cambios sin guardar.

`ingredientService.js` es un mock en memoria (mismo patrón que `orderService.js`: array + subscribers). El nivel de stock (`stockLevel: HIGH/MEDIUM/LOW`) viene ya resuelto en los datos — nunca se calcula en el frontend; al crear un ingrediente nuevo el mock le asigna `"MEDIUM"` como placeholder hasta que exista el endpoint real.

---

## ¿Por qué esta solución?

Reutilización por responsabilidad, no por nombre: `IngredientCard` compone `Card` + `StockIndicator` + `DropdownMenu`, y cualquier `ProductCard` futura deberá componer los mismos compartidos en lugar de reutilizar `IngredientCard`. `Modal` y `ConfirmDialog` se generalizaron a partir del patrón ya probado en `OrderFormModal` (overlay, ESC, foco, animación) para no repetirlo en cada módulo nuevo.

---

## Resultado

Nuevos directorios: `src/components/{Card,Modal,ConfirmDialog,StockIndicator,SearchBar,Toolbar,EmptyStateCard,DropdownMenu}/` y `src/components/Ingredients/`. `src/pages/private/Ingredientes.jsx` quedó como wrapper delgado (mismo patrón que `PanelPedidos.jsx` sobre `OrderPanel`).

Verificado: `npx vite build` y `npx eslint . --max-warnings 0` limpios; flujo completo probado en navegador real (Playwright contra `vite dev`) — alta, edición, borrado con confirmación, validación con foco y vibración, apertura/cierre de detalle, menú contextual sin disparar el modal de detalle. Se detectó y corrigió un overflow real: la fila de tres columnas del formulario (Unidad/Stock inicial/Stock mínimo) desbordaba el modal porque los `flex: 1` no tenían `min-width: 0`: los `<input>` no se achicaban por debajo de su ancho intrínseco.

---

## Aprendizajes

Cuando un componente compone otro compartido y necesita sobrescribir sus estilos por defecto (ej. `EmptyStateCard` sobre `Card`), el orden de los imports importa: el CSS del componente hijo debe importarse después del CSS de la dependencia para ganar la cascada a igual especificidad.

`react-refresh/only-export-components` rompe si un archivo de componente exporta también una constante (pasó con `STOCK_LEVEL_META` en `StockIndicator.jsx`); la metadata puramente visual debe vivir en su propio archivo.

Los `flex: 1` sin `min-width: 0` no se achican por debajo del ancho intrínseco de su contenido (inputs, texto de error largo) y desbordan el contenedor sin que sea evidente en el código — sólo se detectó al ejecutar el flujo real en navegador, no por build ni lint.

---

## Próximo objetivo

Definir con la API el contrato real de Ingredientes (`GET/POST/PUT/DELETE /ingredients`, forma de `stockLevel`) en `.contracts/`, y evaluar si `ProductCard` (módulo Productos) puede reutilizar los mismos compartidos (`Card`, `StockIndicator`, `DropdownMenu`, `Modal`, `ConfirmDialog`) sin modificarlos.

---

## Fecha

2026-07-04

---

## Objetivo

Implementar el segundo módulo de inventario: Productos, reutilizando al máximo la infraestructura construida para Ingredientes.

---

## Problema

Había que confirmar si los ocho componentes compartidos extraídos para Ingredientes (`Card`, `Modal`, `ConfirmDialog`, `StockIndicator`, `SearchBar`, `Toolbar`, `EmptyStateCard`, `DropdownMenu`) realmente servían para un segundo dominio sin modificarlos, y resolver un caso nuevo: Productos tiene una acción de negocio propia ("Producir") que Ingredientes no tiene.

---

## Solución

Se siguió el proceso reutilización → refactor → creación: los ocho compartidos se reutilizaron **sin ningún cambio** (Paso 1 resuelto; no hizo falta Paso 2). El módulo `src/components/Products/` se construyó replicando exactamente la arquitectura por capas de Ingredientes (`hooks/`, `services/`, `constants/`, `mocks/`, `model/`, `components/`), con dos piezas nuevas propias del dominio Productos: `ProductCard` agrega un botón "Producir" con jerarquía visual superior a Editar/Eliminar (no vive en el menú contextual), y `ProduceProductForm` es un modal independiente (cantidad + receta mock) que sólo captura la intención del usuario — no descuenta stock ni ejecuta lógica de producción, eso queda para la API.

Se agregó `useRecipes` (hook propio de Products, no compartido globalmente) porque tres componentes del módulo (`ProductDetails`, `ProductForm`, `ProduceProductForm`) necesitaban el mismo catálogo mock de recetas; evita que cualquiera de ellos importe `mocks/mockRecipes.js` directamente.

---

## ¿Por qué esta solución?

Regla de reutilización por responsabilidad: ningún compartido se modificó para acomodar Productos, confirmando que quedaron bien desacoplados del dominio Ingredientes desde el principio. Los hooks de datos (`useProducts`, `useProductFilters`, `useProductsPanel`, `useProductForm`) se duplicaron deliberadamente en vez de compartirse con sus equivalentes de Ingredientes, siguiendo el mismo criterio ya establecido entre `OrderPanel` e `Ingredients`: cada módulo de dominio mantiene sus propios hooks aunque la forma sea similar, evitando acoplar dos dominios de negocio distintos a una abstracción común prematura.

---

## Resultado

Nuevo directorio `src/components/Products/`; `src/pages/private/Productos.jsx` como wrapper delgado (mismo patrón que Ingredientes/OrderPanel). Ningún archivo de `src/components/{Card,Modal,ConfirmDialog,StockIndicator,SearchBar,Toolbar,EmptyStateCard,DropdownMenu}/` ni de `src/components/Ingredients/` se modificó.

Verificado: `npx vite build` y `npx eslint . --max-warnings 0` limpios; flujo completo probado en navegador real (Playwright) — alta/edición con select de receta, borrado con confirmación, detalle de sólo lectura (incluye receta activa resuelta por nombre), menú contextual sin abrir detalle, y el flujo nuevo de Producir (validación con foco/vibración, envío que no altera el stock de la tarjeta, modal independiente del de detalle/edición).

---

## Aprendizajes

Durante la implementación se detectó una tentación de acoplamiento: `ProductDetails` importaba `mocks/mockRecipes.js` directamente para resolver el nombre de la receta activa. Se corrigió antes de dar la tarea por terminada introduciendo `useRecipes` (consume `recipeService`, no el mock), sin cambiar el comportamiento visual — exactamente el tipo de mejora arquitectónica que vale la pena aplicar en el momento en que se detecta, en lugar de posponerla.

Confirmar reutilización antes de escribir código (Paso 1 del proceso) evitó recrear ocho componentes que ya existían; el único trabajo genuinamente nuevo fue lo específico del dominio Productos (Producir).

---

## Próximo objetivo

Implementar el módulo Recetas real y reemplazar `Products/mocks/mockRecipes.js` + `Products/services/recipeService.js` por el catálogo real cuando exista; en ese momento evaluar si `ProduceProductForm` debe consumir el mismo servicio de recetas que use el módulo Recetas.

---

## Fecha

2026-07-04

---

## Objetivo

Implementar el tercer módulo de inventario: Recetas, representando la relación Producto-Ingredientes.

---

## Problema

Recetas necesitaba referenciar Productos e Ingredientes (relación real, no un simple mock aislado como en los módulos anteriores) sin crear una dependencia de importación entre los tres módulos de dominio, y agregar dos capacidades que no existían todavía: agrupar la grilla por un criterio (Producto/Ingrediente) y construir una lista de líneas (ingrediente + cantidad + unidad) dentro de un formulario.

---

## Solución

Los siete compartidos aplicables (`Card`, `Modal`, `ConfirmDialog`, `Toolbar`, `SearchBar`, `EmptyStateCard`, `DropdownMenu`) se reutilizaron sin cambios; `StockIndicator` no aplica a este dominio (una receta no tiene stock) y no se usó. Se evaluó crear un `GroupedGrid` compartido para la agrupación y se descartó: Recetas es, por ahora, el único módulo que la necesita, así que la lógica quedó dentro de `RecipesGrid` (módulo específico).

Para la relación con Productos e Ingredientes se optó por referencias livianas propias del módulo (`Recipes/mocks/mockProducts.js` y `Recipes/mocks/mockIngredients.js`, sólo `{id, name}` / `{id, name, unit}`) en lugar de importar los mocks completos de `Products`/`Ingredients` — mismo criterio ya usado entre `OrderPanel` y `Products` (ver decisión "extraer compartidos" y el propio `Products/mocks/mockRecipes.js`). Ningún módulo de dominio importa la estructura interna de otro.

El constructor de ingredientes de `RecipeForm` (`RecipeIngredientPicker` + `RecipeIngredientList`) replica exactamente el patrón ya usado en `OrderPanel` para armar pedidos (`ProductSelector` + `OrderItemList`: elegir de un catálogo, sumar/restar cantidad, quitar), aplicado a ingredientes en lugar de productos de venta.

---

## ¿Por qué esta solución?

Evitar que los tres módulos de inventario (Ingredientes, Productos, Recetas) se importen entre sí mantiene cada uno reemplazable de forma independiente por su futuro endpoint real, sin que un cambio de forma en un mock rompa a otro módulo. Reutilizar el patrón selector+lista de OrderPanel en lugar de reinventar uno propio para Recetas evitó duplicar una decisión de UX ya validada (permitir sumar/restar y quitar ítems de una lista en construcción).

---

## Resultado

Nuevo directorio `src/components/Recipes/`; `src/pages/private/Recetas.jsx` como wrapper delgado. Ningún compartido ni ningún archivo de `Ingredients/`/`Products/` se modificó.

Durante la implementación, dos reglas nuevas de `eslint-plugin-react-hooks` (`react-hooks/refs` y `react-hooks/purity`) rechazaron leer un `ref` dentro de un `useMemo` y llamar `Date.now()` dentro de un `useMemo` evaluado en render; se resolvió guardando el catálogo de productos en estado (no en un `ref`) y capturando el instante de carga una única vez vía el inicializador perezoso de `useState(() => Date.now())`, evitando además un tercer rechazo (`react-hooks/set-state-in-effect`) que hubiera aparecido al recalcular esa cuenta con `setState` dentro de un efecto.

Verificado: `npx vite build` y `npx eslint . --max-warnings 0` limpios; flujo completo probado en navegador real (Playwright) — alta con selector de producto + constructor de ingredientes, detalle de sólo lectura con la lista completa, borrado con confirmación, menú contextual sin abrir detalle, y las dos vistas agrupadas (por Producto y por Ingrediente, esta última repite una misma receta en cada grupo de ingrediente que contiene, comportamiento esperado de una vista de referencia cruzada).

---

## Aprendizajes

Cuando un dato mostrado en UI depende de "ahora" (fechas relativas, ventanas de tiempo), las reglas de pureza de render de las hooks de React más recientes exigen capturar ese instante una sola vez (inicializador de `useState`) en lugar de recalcularlo en cada render o dentro de un efecto con `setState` — un patrón a repetir en cualquier futuro cálculo de "tiempo transcurrido".

Mantener referencias livianas y propias por módulo (en vez de importar el mock completo de otro módulo) es más código repetido a corto plazo, pero evita acoplar tres dominios que deberán reemplazarse por endpoints reales de forma independiente y en momentos distintos.

---

## Próximo objetivo

Con los tres módulos de inventario implementados sobre mock (Ingredientes, Productos, Recetas), el siguiente paso lógico es definir en `.contracts/` los DTO y endpoints reales de los tres dominios, y planificar el reemplazo ordenado de cada mock por su fuente de datos real.