# Estado de la API

Inventario de todos los endpoints HTTP del backend al 2026-10-09 (rama `feature/mvp`, Slices 0 a 4), con su estado, sus brechas y sus dependencias.

Relevado sobre los ocho controladores y la configuración de seguridad: `AuthController` y `SecurityConfig` (Seguridad), `CatalogoPublicoController`, `ProductoComercialController`, `ComboComercialController` (Comercial), `PedidoController` (Pedido), `IngredienteController`, `ProductController`, `MeasurementUnitController` (Producción).

## Significado de los estados

| Estado | Significado |
|---|---|
| `IMPLEMENTADO` | Existe en el código y su comportamiento está cubierto por tests automáticos |
| `IMPLEMENTADO_NO_VALIDADO` | Existe en el código; el comportamiento descrito se dedujo leyéndolo, sin un test ni una ejecución que lo confirme |
| `PARCIAL` | Existe, pero no cubre todo lo que una pantalla necesita |
| `PENDIENTE` | No está implementado. No tiene ruta |
| `DECISIÓN_REQUERIDA` | Hay una ambigüedad funcional que alguien debe resolver |
| `PENDIENTE_DE_CONFIRMAR` | Un detalle no pudo determinarse desde el código |

## Nivel de validación

Lo que respalda cada `IMPLEMENTADO`:

| Evidencia | Estado |
|---|---|
| Tests automáticos (`./mvnw -o clean verify`): 363 tests, 0 fallos, 0 errores, 0 omitidos | Ejecutados el 2026-10-21. La suite corre sobre **H2 en modo MySQL**, salvo `EsquemaSobreMysqlRealTest` |
| Ejecución contra **MySQL real** | **Realizada el 2026-10-21** sobre MySQL 8.0, base aislada `alacan_test`: `EsquemaSobreMysqlRealTest`, 4 de 4. Cubre AUTH-02, CAT-01, COM-P-03, COM-C-03, COM-C-04, PED-01 (incluido un rechazo con `404`), PED-02, PED-04 a PED-07 y el rechazo de PED-08 sobre un pedido entregado, además de `401` sin sesión y `403` sin token CSRF. Los demás endpoints se probaron solo sobre H2 |
| Prueba con un **navegador real** contra una instancia desplegada (CORS, cookies) | **No realizada.** Hay tests de sesión sobre HTTP real y de CORS, pero sin navegador |
| Prueba con el frontend React | No realizada: el frontend no está en este repositorio |

Ningún comportamiento de este conjunto de documentos fue verificado ejecutando la aplicación durante su redacción: se relevó el código y se usaron los tests existentes como evidencia.

## Inventario por área

### A. Autenticación y sesión — 4 endpoints

| Id | Método y ruta | Acceso | CSRF | Estado | Documento |
|---|---|---|---|---|---|
| AUTH-01 | `GET /auth/csrf` | Público | — | `IMPLEMENTADO` | [`autenticacion.md`](autenticacion.md) |
| AUTH-02 | `POST /auth/login` | Público | Sí | `IMPLEMENTADO` | [`autenticacion.md`](autenticacion.md) |
| AUTH-03 | `GET /auth/session` | Público | — | `IMPLEMENTADO` | [`autenticacion.md`](autenticacion.md) |
| AUTH-04 | `POST /auth/logout` | Público | Sí | `IMPLEMENTADO` | [`autenticacion.md`](autenticacion.md) |

### B. Catálogo público — 1 endpoint

| Id | Método y ruta | Acceso | CSRF | Estado | Documento |
|---|---|---|---|---|---|
| CAT-01 | `GET /catalogo` | Público | — | `IMPLEMENTADO` | [`catalogo-publico.md`](catalogo-publico.md) |

### C. Administración del catálogo comercial — 12 endpoints

| Id | Método y ruta | Acceso | CSRF | Estado |
|---|---|---|---|---|
| COM-P-01 | `GET /admin/comercial/productos` | `ADMIN` | — | `IMPLEMENTADO` |
| COM-P-02 | `GET /admin/comercial/productos/{id}` | `ADMIN` | — | `IMPLEMENTADO` |
| COM-P-03 | `POST /admin/comercial/productos` | `ADMIN` | Sí | `IMPLEMENTADO` |
| COM-P-04 | `PUT /admin/comercial/productos/{id}` | `ADMIN` | Sí | `IMPLEMENTADO` |
| COM-P-05 | `POST /admin/comercial/productos/{id}/activar` | `ADMIN` | Sí | `IMPLEMENTADO` |
| COM-P-06 | `POST /admin/comercial/productos/{id}/desactivar` | `ADMIN` | Sí | `IMPLEMENTADO` |
| COM-C-01 | `GET /admin/comercial/combos` | `ADMIN` | — | `IMPLEMENTADO` |
| COM-C-02 | `GET /admin/comercial/combos/{id}` | `ADMIN` | — | `IMPLEMENTADO` |
| COM-C-03 | `POST /admin/comercial/combos` | `ADMIN` | Sí | `IMPLEMENTADO` |
| COM-C-04 | `PUT /admin/comercial/combos/{id}` | `ADMIN` | Sí | `IMPLEMENTADO` |
| COM-C-05 | `POST /admin/comercial/combos/{id}/activar` | `ADMIN` | Sí | `IMPLEMENTADO` |
| COM-C-06 | `POST /admin/comercial/combos/{id}/desactivar` | `ADMIN` | Sí | `IMPLEMENTADO` |

Documento: [`catalogo-admin.md`](catalogo-admin.md). Aspectos `IMPLEMENTADO_NO_VALIDADO` dentro de esta área: la respuesta ante JSON ilegible, ids no numéricos, textos de más de 255 caracteres y componentes sin `productoComercialId`.

### D. Pedidos — 13 endpoints

| Id | Método y ruta | Acceso | CSRF | Estado |
|---|---|---|---|---|
| PED-01 | `POST /pedidos` | Público | Exento | `IMPLEMENTADO` |
| PED-02 | `GET /pedidos` | `ADMIN` | — | `IMPLEMENTADO` |
| PED-03 | `GET /pedidos/{id}` | `ADMIN` | — | `IMPLEMENTADO` |
| PED-04 | `POST /pedidos/{id}/confirmar` | `ADMIN` | Sí | `IMPLEMENTADO` |
| PED-05 | `POST /pedidos/{id}/en-preparacion` | `ADMIN` | Sí | `IMPLEMENTADO` |
| PED-06 | `POST /pedidos/{id}/listo` | `ADMIN` | Sí | `IMPLEMENTADO` |
| PED-07 | `POST /pedidos/{id}/entregado` | `ADMIN` | Sí | `IMPLEMENTADO` |
| PED-08 | `POST /pedidos/{id}/cancelar` | `ADMIN` | Sí | `IMPLEMENTADO` |
| PED-09 | `POST /pedidos/{id}/rechazar` | `ADMIN` | Sí | `IMPLEMENTADO` |
| PED-10 | `POST /pedidos/{id}/productos` | `ADMIN` | Sí | `IMPLEMENTADO` — fuera del MVP |
| PED-11 | `POST /pedidos/{id}/combos` | `ADMIN` | Sí | `IMPLEMENTADO` — fuera del MVP |
| PED-12 | `DELETE /pedidos/{id}/items/{itemId}` | `ADMIN` | Sí | `IMPLEMENTADO` — fuera del MVP |
| PED-13 | `PATCH /pedidos/{id}/items/{itemId}/cantidad` | `ADMIN` | Sí | `IMPLEMENTADO` — fuera del MVP |

Documento: [`pedidos.md`](pedidos.md).

### E. Recursos auxiliares (inventario) — 17 endpoints

| Ids | Rutas | Acceso | Estado |
|---|---|---|---|
| AUX-01 | `GET /measurement-units` | `ADMIN` | `IMPLEMENTADO` — fuera del MVP |
| AUX-02 a AUX-09 | `/ingredients` (8 operaciones) | `ADMIN` | `IMPLEMENTADO` — fuera del MVP |
| AUX-10 a AUX-17 | `/products` (8 operaciones) | `ADMIN` | `IMPLEMENTADO` — fuera del MVP |

Documento: [`recursos-auxiliares.md`](recursos-auxiliares.md).

### Total

| Área | Endpoints | Del MVP |
|---|---|---|
| Autenticación y sesión | 4 | 4 |
| Catálogo público | 1 | 1 |
| Catálogo comercial (administración) | 12 | 12 |
| Pedidos | 13 | 9 |
| Recursos auxiliares | 17 | 0 |
| **Total** | **47** | **26** |

## Brechas

### Endpoints que no existen (`PENDIENTE`)

| Necesidad | Afecta a | Alternativa hoy |
|---|---|---|
| Resumen o estadísticas del panel | Vista inicial | Contadores por estado con `GET /pedidos?estado=X&size=1` |
| Seguimiento público de un pedido | Web pública | Ninguna. Fuera del MVP |
| Subida de imágenes | Formularios de producto y combo | `imagen` como texto |
| Eliminación de productos y combos | Catálogo | Desactivar |
| Categorías del catálogo | Catálogo público y administración | Separar por `tipo` |
| Búsqueda, filtro por fecha y orden descendente de pedidos | Listado de pedidos | Filtro por estado; última página |
| Motivo de cancelación | Detalle de pedido | Ninguna |
| Marcar un pedido como enviado | — | El estado `ENVIADO` no se usa |
| Alta de pedidos desde el panel | — | Fuera del MVP |
| Gestión de usuarios y cambio de contraseña | — | Variables de entorno al arrancar |
| Notificación de pedidos nuevos | Listado de pedidos | Consulta periódica |
| Listar qué combos usan un producto | Desactivar producto | Recorrer el listado de combos |
| Tipos de artículo, tipos de movimiento, recetas, producción | Inventario (Etapa 2) | Ninguna |
| Pagos, promociones, mesas | — | Fuera del MVP |

### Decisiones funcionales abiertas (`DECISIÓN_REQUERIDA`)

| Tema | Qué hay que decidir | A quién bloquea |
|---|---|---|
| Campo `imagen` | Si guarda una URL absoluta, una ruta o un identificador; y cómo se cargan las imágenes | Formularios y tarjetas del catálogo. No bloquea: se puede avanzar con un campo de texto |
| Zona horaria de las fechas | Entregar `fechaCreacion` con zona explícita | Presentación de fechas. No bloquea si servidor y usuarios comparten zona |
| Contenido de la vista inicial del panel | Qué mostrar, dado que no hay API de resumen | Vista inicial |
| Edición de líneas de un pedido | Si entra al alcance del MVP | Detalle de pedido |
| Etiquetas "rechazar" y "cancelar" | Cuándo ofrecer cada una; el backend no las distingue | Detalle de pedido. Decisión de interfaz |
| Contenido institucional | Si será estático en el frontend o administrable | Páginas de inicio, contacto, horarios |
| Moneda | La API no la informa | Formato de importes |

### Detalles sin confirmar (`PENDIENTE_DE_CONFIRMAR`)

| Detalle | Evidencia que falta |
|---|---|
| Presencia del campo `type` en los errores de controlador | Un test que lo fije |
| Cuerpo de los errores no manejados (JSON ilegible o id no numérico en Comercial y Producción; 405; 415; 500) | Un test o una ejecución real |
| Respuesta cuando `nombre`, `descripcion` o `imagen` superan 255 caracteres | Ídem |
| Cómo se guarda un `precio` con más de dos decimales | Ídem |
| Respuesta cuando un componente de combo llega sin `productoComercialId` | Ídem |
| Orden de `componentes` en un combo y de `items` en un pedido | Una regla de orden en las entidades |
| `Path` y `Domain` de la cookie de sesión; cabeceras de caché de `GET /catalogo` | Cabeceras de una ejecución real |
| Puerto de la API | No está en la configuración del repositorio |
| Comportamiento sobre MySQL de los endpoints que la prueba de MySQL no cubre | Ampliar `EsquemaSobreMysqlRealTest` o probar contra una instancia desplegada |

## Dependencias entre endpoints

```text
AUTH-01 (csrf) ──> AUTH-02 (login) ──> AUTH-01 (csrf nuevo) ──> toda escritura del panel
AUTH-03 (session) ──> decide login o panel

COM-P-03 (crear producto) ──> COM-C-03 (crear combo: necesita productos activos)
COM-P-03 / COM-C-03 ──> CAT-01 (catálogo: muestra lo activo)
CAT-01 ──> PED-01 (crear pedido: usa tipo + id del catálogo)
PED-01 ──> PED-02 / PED-03 (el administrador lo ve)
PED-03 ──> PED-04 ──> PED-05 ──> PED-06 ──> PED-07
PED-03 ──> PED-08 / PED-09
```

Para preparar un entorno de prueba desde cero: provisionar el administrador (variables `ALACAN_ADMIN_USERNAME` y `ALACAN_ADMIN_PASSWORD`), iniciar sesión, crear productos, crear combos, y recién entonces el catálogo público devuelve datos. **La base no trae productos ni combos de ejemplo.**

## Discrepancias encontradas durante el relevamiento

| Discrepancia | Tratamiento |
|---|---|
| `05-contracts/api/pedido-admin/listar-pedidos.md` y `consultar-pedido.md` tenían la sección de autenticación con texto corrupto: mezclaba la regla vigente con el texto anterior al Slice 3 ("Ninguna todavía…") | Corregido en esos dos archivos: la regla real es sesión `ADMIN` |
| `05-contracts/README.md` dice que `api/` está vacío y que la autenticación es "ninguna" | Desactualizado: `api/` tiene 18 contratos y la API tiene autenticación. No se modificó; se registra |
| `integration/integration-contract.md` menciona `GET /article-types` y `GET /movement-types` "a confirmar" | No existen en el código. Figuran aquí como `PENDIENTE` |
| Comentario en `CatalogoPublicoController`: "ninguna [autenticación] existe en el proyecto todavía" | Desactualizado. El endpoint es público por una regla explícita de `SecurityConfig` |
| Comentario en `ProductoComercial`: menciona `Catalogo.Producto` | El módulo `Catalogo` se eliminó en el Slice 4 |
| `integration/INTEGRATION_GUIDE.md` muestra el campo `type: "about:blank"` en los errores; los contratos de `05-contracts` no | El framework actual (Spring 7.0.6) no asigna `type` por defecto, así que no se espera en la respuesta. Sin test que lo fije: `PENDIENTE_DE_CONFIRMAR`. El frontend debe tratarlo como opcional |
| Las transiciones de estado inválidas responden `400`, mientras otros conflictos de estado responden `409` | Decisión registrada (`MVP-ROADMAP.md`, G15). Se documenta el comportamiento real |
| Comercial y Producción no manejan JSON ilegible ni parámetros no numéricos; Pedido sí | Inconsistencia real entre módulos. Documentada; no se modificó código |
| El listado de pedidos tiene `size` máximo 100; los demás listados no tienen máximo | Documentado |

Los comentarios desactualizados del código Java no se corrigieron: esta tarea no modifica código.

## Riesgos para el frontend

| Riesgo | Mitigación |
|---|---|
| Integración real sin probar (CORS, cookies, `Secure`, `SameSite`) | Probar el login contra una API real al comenzar, no al final |
| MySQL validado solo para los flujos principales | En los endpoints no cubiertos puede haber diferencias respecto de lo documentado, sobre todo en orden alfabético y en textos largos |
| `VALIDATION_ERROR` no identifica el campo | Validación de UX en los formularios |
| Doble envío del checkout crea dos pedidos | Deshabilitar el botón; no reintentar automáticamente |
| Sesiones en memoria | Manejar `401` en cualquier llamada |
| Fechas sin zona | No convertir entre zonas |
| Sin datos de ejemplo en la base | Cargar el catálogo desde el panel antes de probar la web pública |
