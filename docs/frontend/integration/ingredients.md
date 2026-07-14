# Integración Frontend ↔ API — Ingredients

Estado: **implementado y validado contra el backend real** (Etapas 0-4 completas). El módulo ya no depende de ningún mock. Registrar/consultar movimientos de stock quedan documentados para una ronda futura (requieren construir UI nueva).

Contratos fuente: `frontend/.claude/INTEGRATION_GUIDE.md`, `frontend/.claude/integration-contract.md`, `frontend/.claude/ingredients/*.md`, `frontend/.claude/measurement-units/list-measurement-units.md`.

## Alcance de esta ronda

| Caso de uso | Estado en esta integración |
|---|---|
| Listar Ingredientes | ✅ Implementado y validado (Etapa 1) |
| Consultar Unidades de Medida (catálogo) | ✅ Implementado y validado (Etapa 2) |
| Crear Ingrediente | ✅ Implementado y validado (Etapa 3) |
| Actualizar Ingrediente | ✅ Implementado y validado (Etapa 3) |
| Desactivar Ingrediente | ✅ Implementado y validado (Etapa 4) |
| Registrar ingreso de stock | 📋 Documentado abajo, implementación en una ronda futura (requiere UI nueva) |
| Registrar pérdida de stock | 📋 Documentado abajo, implementación en una ronda futura |
| Registrar corrección de stock | 📋 Documentado abajo, implementación en una ronda futura |
| Consultar movimientos | 📋 Documentado abajo, implementación en una ronda futura |

Este mismo formato (una sección "Alcance de esta ronda" + un flujo completo por caso de uso, implementado o no) se repite para cada módulo futuro (`docs/frontend/integration/products.md`, `recipes.md`, etc.) a medida que se integren.

## Decisiones tomadas

1. **Vocabulario de stock**: se adoptan las 3 categorías reales del backend tal cual (`SIN_STOCK` / `NECESITA_REPOSICION` / `CON_STOCK`), en vez de forzarlas dentro de una escala HIGH/MEDIUM/LOW inventada. Razón: `NECESITA_REPOSICION` (0 < cantidadActual < stockMinimo) es la señal de "reponer antes de que se acabe" — no es lo mismo que `SIN_STOCK` (cantidadActual = 0), que es un estado más severo y merece su propia etiqueta, no compartir la de "Bajo". No existe un "Medio" real en el dominio del backend; inventar uno sería agregar lógica de negocio en el frontend.
   - `stockLevelMeta.js` (compartido) se extiende **de forma aditiva** con estas 3 claves nuevas — no se tocan ni se quitan `HIGH`/`MEDIUM`/`LOW`, que Productos sigue usando con su propio mock hasta tener su contrato real.
   - La respuesta de `GET /ingredients` no trae la categoría como campo directo, sólo `stock.cantidadActual`, `stock.stockMinimo` y `stock.necesitaReposicion`. El mapper deriva la categoría aplicando exactamente la partición que el propio backend documenta para su filtro `inventario` (sin inventar umbrales propios): `cantidadActual === 0` → `SIN_STOCK`; `necesitaReposicion && cantidadActual > 0` → `NECESITA_REPOSICION`; si no, `CON_STOCK`.
2. **Unidad de medida** *(actualizada en esta revisión)*: ya existe contrato (`GET /measurement-units`) → `unit` deja de ser texto libre. `IngredientForm` usa un selector real, poblado desde un catálogo compartido (ver "Convenciones" y la nueva sección "Cargar catálogo de Unidades de Medida").
3. **Campo "Stock inicial" en edición**: se quita del formulario de edición — sólo existe en el alta.
4. **Alcance**: sólo Listar/Catálogo de unidades/Crear/Editar/Desactivar se implementan en esta ronda; los 4 casos de movimientos/historial quedan documentados como referencia para la próxima.

## Convenciones de esta integración

- Cliente HTTP: `src/services/httpClient.js` (Axios, instancia única, baseURL por variable de entorno).
- Normalización de errores: `src/services/apiError.js` — convierte el `ProblemDetail` (RFC 7807) del backend en `{ status, code, title, detail }` consistente.
- **Catálogos de referencia compartidos** *(categoría nueva en esta revisión)*: servicios sin mutaciones, consumidos por más de un módulo de dominio, que viven fuera de cualquier módulo — `src/services/catalogs/measurementUnitService.js` es el primero. Mismo criterio que aplicó el propio backend al no anidar `/measurement-units` bajo `/ingredients` (ver Notas del contrato): es un atributo de `Articulo` en general, no exclusivo de esta pantalla. El índice del backend ya anticipa 2 catálogos más con el mismo tratamiento (`article-types`, `movement-types`, hoy "⏳ Pendiente"). El catálogo se resuelve una única vez por sesión (memoizado en el servicio, sin refetch en cada apertura de formulario) porque el propio contrato aclara que no cambia en runtime (carga por seed).
- `Ingredients/services/ingredientService.js` sigue siendo el único punto que llama a `httpClient` **para recursos de Ingredients**. Ningún componente ni hook fuera de los services hace HTTP.
- `Ingredients/model/ingredientMapper.js` pasa a ser **bidireccional**: `mapIngredientToCard(dto)` (DTO→UI, como hoy) y `mapFormToCreateRequest(payload)` / `mapFormToUpdateRequest(payload)` (UI→DTO, nuevo). Los componentes nunca arman el body de un request a mano.
- Sin push en tiempo real: tras cada mutación exitosa se refetchea la página actual del listado (reemplaza el `subscribeIngredients` in-memory actual).

---

## Cargar listado

```
Pantalla: Ingredientes (grilla principal)
↓
Componente: IngredientsPage → IngredientsToolbar (busca/filtra/ordena) + IngredientGrid
↓
Hook: useIngredients (estado de página/tamaño) + useIngredientFilters (dispara refetch, ya no filtra en cliente)
↓
Service: ingredientService.getIngredients({ page, size, search, sort, estado, inventario })
↓
Endpoint: GET /ingredients?page=&size=&search=&sort=&estado=&inventario=
↓
Respuesta esperada: 200 con { content[], page, size, totalElements, totalPages, first, last, empty }
↓
Actualización de la UI: IngredientGrid renderiza content.map(mapIngredientToCard); IngredientsToolbar/Grid muestran controles de paginación (nuevos); stockLevel de cada card sale de mapIngredientToCard derivando SIN_STOCK/NECESITA_REPOSICION/CON_STOCK a partir de stock.cantidadActual + stock.stockMinimo + stock.necesitaReposicion (ver "Decisiones tomadas")
```

Por defecto se pide `estado=ACTIVO` (implícito, igual que el backend) — no se listan inactivos salvo que el usuario filtre explícitamente.

## Cargar catálogo de Unidades de Medida

Soporte para Crear/Editar (no es una acción visible propia, se resuelve antes de mostrar el formulario).

```
Pantalla: Ingredientes → modal de alta/edición
↓
Componente: IngredientForm (selector de unidad)
↓
Hook: nuevo useMeasurementUnits() — expone la lista y un flag de carga; memoiza el resultado a nivel de módulo, un solo fetch por sesión
↓
Service: measurementUnitService.getMeasurementUnits()  (src/services/catalogs/)
↓
Endpoint: GET /measurement-units
↓
Respuesta esperada: 200 con array plano [{ id, nombre, abreviatura }] (sin envelope de paginación)
↓
Actualización de la UI: IngredientForm popula el <select> de unidad con { value: id, label: `${nombre} (${abreviatura})` }; si ya se cargó antes en la sesión, no vuelve a pedirlo
```

Sin parámetros, sin errores propios (siempre 200). Es un catálogo compartido — no vive dentro de `Ingredients/services/`, para que Productos/Recetas lo reutilicen sin duplicarlo cuando integren sus propios formularios.

## Crear ingrediente

```
Pantalla: Ingredientes
↓
Componente: IngredientsHeader/IngredientsToolbar ("+ Agregar") → Modal → IngredientForm (selector de unidad poblado desde measurementUnitService)
↓
Hook: useIngredientsPanel (abre modal) + useIngredientForm (valida formato, arma payload) + useMeasurementUnits (catálogo)
↓
Service: ingredientService.createIngredient(payload)
↓
Endpoint: POST /ingredients  body: mapFormToCreateRequest(payload) → { nombre, unidadMedidaId, descripcion, stockMinimo, stockInicial?: { cantidad } }
↓
Respuesta esperada: 201 Created con el ingrediente completo (incluye Location: /ingredients/{id})
↓
Actualización de la UI: cierra el modal, refetch de la página actual del listado
```

Nunca se envía: `tipoArticulo`, `id`, fechas, `cantidadReservada`, tipo/sentido de movimiento. `unidadMedidaId` sale del selector real (ver "Cargar catálogo de Unidades de Medida") — ya no es texto libre.

Errores posibles: `VALIDATION_ERROR` (400), `UNIDAD_MEDIDA_NOT_FOUND` (404 — no debería ocurrir en la práctica si el selector sólo ofrece IDs del catálogo, pero el backend lo valida igual), `INTERNAL_CONFIGURATION_ERROR` (500) — mostrar mensaje distinto por `code`, no uno genérico.

## Editar ingrediente

```
Pantalla: Ingredientes
↓
Componente: IngredientCard (menú ⋮ → Editar) → Modal → IngredientForm (con initialData, selector de unidad preseleccionado en la unidad actual)
↓
Hook: useIngredientsPanel (abre en modo edición) + useIngredientForm + useMeasurementUnits (catálogo)
↓
Service: ingredientService.updateIngredient(id, payload)
↓
Endpoint: PUT /ingredients/{id}  body: mapFormToUpdateRequest(payload) → { nombre, descripcion, unidadMedidaId, stockMinimo }
↓
Respuesta esperada: 200 OK con el ingrediente completo actualizado
↓
Actualización de la UI: cierra el modal, refetch de la página actual
```

**El campo "Stock inicial" (`quantity`) no existe en este formulario** — se quita de `IngredientForm` en modo edición (el backend no lo acepta al editar; sólo al crear, y luego sólo mediante los endpoints de movimientos).

Errores posibles: `VALIDATION_ERROR` (400), `ARTICLE_NOT_FOUND` (404), `UNIDAD_MEDIDA_NOT_FOUND` (404), `UNIDAD_MEDIDA_BLOQUEADA` (409 — se intentó cambiar la unidad de un ingrediente con stock/movimientos ya registrados; el resto de los campos igual se guarda).

## Desactivar ingrediente

```
Pantalla: Ingredientes
↓
Componente: IngredientCard (menú ⋮ → "Desactivar", reemplaza a "Eliminar") → ConfirmDialog
↓
Hook: useIngredientsPanel (abre confirmación) + useIngredients (ejecuta)
↓
Service: ingredientService.deactivateIngredient(id)
↓
Endpoint: POST /ingredients/{id}/desactivar
↓
Respuesta esperada: 200 OK con { ingrediente, recetasActivasQueLoUtilizan }
↓
Actualización de la UI: cierra el ConfirmDialog; si recetasActivasQueLoUtilizan > 0, mostrar advertencia adicional; refetch del listado (el ingrediente desaparece del listado por defecto, que sólo muestra ACTIVO)
```

Copy del `ConfirmDialog` deja de decir "esta acción no se puede deshacer" en el mismo sentido — es una baja lógica, no una eliminación física. Operación idempotente: desactivar un ya-inactivo no falla.

Errores posibles: `ARTICLE_NOT_FOUND` (404).

---

# Futuro — documentado, no se implementa en esta ronda

Los siguientes 4 casos de uso están validados y disponibles en el backend, pero requieren construir UI nueva (no sólo conectar un service). Quedan documentados aquí para la próxima ronda de este mismo módulo.

## Registrar ingreso de stock

```
Pantalla: Ingredientes (nueva acción, no existe hoy)
↓
Componente: IngredientCard/IngredientDetails (nueva acción "Registrar ingreso") → Modal → nuevo StockMovementForm (variante "ingreso")
↓
Hook: nuevo useStockMovementForm (cantidad > 0)
↓
Service: ingredientService.registerStockEntry(id, { cantidad })
↓
Endpoint: POST /ingredients/{id}/ingresos  body: { cantidad }
↓
Respuesta esperada: 200 OK con el ingrediente completo (stock actualizado)
↓
Actualización de la UI: cierra el modal, refetch del listado/detalle
```

Errores: `VALIDATION_ERROR` (400, cantidad ≤ 0), `ARTICLE_NOT_FOUND` (404), `ARTICULO_INACTIVO` (409 — no admite movimientos si está desactivado).

## Registrar pérdida de stock

```
Pantalla: Ingredientes (nueva acción)
↓
Componente: igual que "ingreso", variante "pérdida"
↓
Hook: useStockMovementForm (cantidad > 0, no puede superar el disponible)
↓
Service: ingredientService.registerStockLoss(id, { cantidad })
↓
Endpoint: POST /ingredients/{id}/perdidas  body: { cantidad }
↓
Respuesta esperada: 200 OK con el ingrediente completo
↓
Actualización de la UI: cierra el modal, refetch del listado/detalle
```

Errores: `VALIDATION_ERROR` (400, cantidad ≤ 0 o mayor al disponible), `ARTICLE_NOT_FOUND` (404), `ARTICULO_INACTIVO` (409).

## Registrar corrección de stock

```
Pantalla: Ingredientes (nueva acción)
↓
Componente: igual patrón, pero pide "cantidad real contada", no una cantidad relativa
↓
Hook: useStockMovementForm (variante "corrección": cantidadReal >= 0)
↓
Service: ingredientService.registerStockCorrection(id, { cantidadReal })
↓
Endpoint: POST /ingredients/{id}/correcciones  body: { cantidadReal }
↓
Respuesta esperada: 200 OK con el ingrediente completo (el Backend calcula la dirección del ajuste)
↓
Actualización de la UI: cierra el modal, refetch del listado/detalle
```

Errores: `VALIDATION_ERROR` (400, `cantidadReal` negativa), `ARTICLE_NOT_FOUND` (404), `ARTICULO_INACTIVO` (409).

## Consultar movimientos

```
Pantalla: Ingredientes → detalle de un ingrediente
↓
Componente: IngredientDetails (nueva sección "Historial de movimientos", paginada)
↓
Hook: nuevo useIngredientMovements(id, { page, size })
↓
Service: ingredientService.getStockMovements(id, { page, size })
↓
Endpoint: GET /ingredients/{id}/movimientos?page=&size=
↓
Respuesta esperada: 200 OK con { content: [{id, tipoMovimiento, sentido, cantidad, momento}], page, size, totalElements, totalPages, ... }
↓
Actualización de la UI: lista ordenada por momento descendente dentro del modal de detalle; sin búsqueda/filtro (no existen en el contrato)
```

Errores: `ARTICLE_NOT_FOUND` (404).

## Refrescar listado

No hay endpoint propio: "refrescar" es volver a ejecutar `GET /ingredients` con los mismos parámetros actuales (página/búsqueda/filtro/orden vigentes). Se dispara automáticamente después de cualquier mutación exitosa (crear/editar/desactivar/ingreso/pérdida/corrección) y, opcionalmente, con un botón manual "Refrescar" en `IngredientsToolbar` si se decide agregarlo.

## Manejo de errores

Todas las respuestas de error siguen RFC 7807 + campo `code` (ver `INTEGRATION_GUIDE.md`). Patrón propuesto:

1. `httpClient.js` normaliza cualquier error de red en `{ status, code, title, detail }` vía `apiError.js` (interceptor de respuesta).
2. Cada método de `ingredientService.js` deja pasar ese error normalizado (no lo swallowea en un `catch {}` genérico).
3. Cada hook (`useIngredients`, futuro `useStockMovementForm`, etc.) guarda `{ code, message }` en su estado de error, en vez de un string fijo por operación.
4. Los componentes deciden el mensaje final a partir de `code` cuando existe un caso especial documentado (ej. `UNIDAD_MEDIDA_BLOQUEADA`, `ARTICULO_INACTIVO`), y un mensaje genérico para el resto.
5. El frontend nunca decide comportamiento a partir de `detail` (texto humano, puede cambiar) — sólo de `code`.

---

## Plan de implementación (esta ronda) — completo

| Etapa | Objetivo | Archivos principales | Estado |
|---|---|---|---|
| 0 | Infraestructura HTTP transversal | `src/services/httpClient.js`, `src/services/apiError.js`, `.env.example` | ✅ |
| 1 | Listar Ingredientes real, con paginación server-side | `ingredientService.js`, `ingredientMapper.js`, `useIngredients.js`, `useIngredientFilters.js`, paginación en `IngredientsPage`/`IngredientsToolbar` | ✅ |
| 2 | Catálogo de Unidades de Medida | `src/services/catalogs/measurementUnitService.js`, `useMeasurementUnits` | ✅ |
| 3 | Crear y Editar reales, selector real de unidad, sin `quantity` en edición | `ingredientMapper.js` (bidireccional), `useIngredientForm.js`, `IngredientForm.jsx`, `IngredientsPage.jsx` (error distinguible) | ✅ |
| 4 | Desactivar (reemplaza "Eliminar") | `ingredientService.js`, `useIngredients.js`, `useIngredientsPanel.js`, `IngredientCard.jsx`, `IngredientGrid.jsx`, `IngredientsPage.jsx` | ✅ |

Cada etapa se validó con build + lint limpios y prueba real contra el backend (Playwright) antes de pasar a la siguiente. Ver los informes de cierre de cada etapa para el detalle.

Con la Etapa 4, `ingredientService.js` quedó sin ningún mock ni estado en memoria — las 4 funciones que expone (`getIngredients`, `createIngredient`, `updateIngredient`, `deactivateIngredient`) llaman todas a la API real.
