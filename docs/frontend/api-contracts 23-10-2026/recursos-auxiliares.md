# Recursos auxiliares: inventario y unidades de medida

Fuente: `Produccion/api/controller/IngredienteController.java`, `ProductController.java`, `MeasurementUnitController.java`, DTOs de `Produccion/api/dto`, `Produccion/api/exception/GlobalExceptionHandler.java`.

Contratos detallados, uno por operación: [`../integration/`](../integration/) (índice en [`integration-contract.md`](../integration/integration-contract.md)).

## Relación con el MVP

**Ninguna pantalla del MVP necesita estos endpoints.** Pertenecen al módulo de inventario y producción (Etapa 2): existen, funcionan y están protegidos, pero el flujo *catálogo → pedido → gestión del pedido* no los usa.

| Recurso | Rutas | ¿Lo necesita el MVP? |
|---|---|---|
| Ingredientes (inventario) | `/ingredients` | No — funcionalidad futura |
| Productos de inventario | `/products` | No — funcionalidad futura |
| Unidades de medida | `/measurement-units` | No — solo sirve a los formularios de inventario |

Advertencias para no confundir conceptos:

- **`/products` no es el catálogo que se vende.** Son artículos de inventario con unidad de medida y stock. Los productos que ve el cliente están en `/admin/comercial/productos` ([`catalogo-admin.md`](catalogo-admin.md)).
- Un producto de inventario y un producto comercial no están relacionados: no comparten ids ni datos.
- Crear un pedido **no descuenta stock**. No hay consumo de ingredientes.
- Los formularios de producto y combo comercial **no usan** unidades de medida ni ningún otro recurso de este documento.

## Reglas comunes

- **Autenticación:** sesión `ADMIN`. Sin sesión: `401 NO_AUTENTICADO`.
- **CSRF:** requerido en `POST` y `PUT`.
- **Nombres:** las rutas están en inglés (`/ingredients`, `/products`, `/measurement-units`) y los campos JSON en español (`nombre`, `unidadMedida`, `cantidadActual`). Las acciones de las rutas también están en español (`/desactivar`, `/ingresos`, `/perdidas`, `/correcciones`, `/movimientos`).
- **Errores:** RFC 7807 con `code`. Códigos propios: `ARTICLE_NOT_FOUND`, `UNIDAD_MEDIDA_NOT_FOUND` (404); `INSUFFICIENT_STOCK`, `UNIDAD_MEDIDA_BLOQUEADA`, `ARTICULO_INACTIVO` (409); `VALIDATION_ERROR` (400); `INTERNAL_CONFIGURATION_ERROR` (500). Un JSON ilegible o un parámetro no numérico devuelven un `400` de Spring sin `code`.

Estado de todos los endpoints de este documento: `IMPLEMENTADO` (con tests en el paquete `Produccion`), **fuera del MVP**.

---

## Unidades de medida

### AUX-01 — Listar unidades de medida

`GET /measurement-units` — sin parámetros.

**Respuesta `200 OK`** — arreglo plano, sin paginación:

```json
[
  { "id": 1, "nombre": "GRAMO", "abreviatura": "g" },
  { "id": 2, "nombre": "KILOGRAMO", "abreviatura": "kg" },
  { "id": 3, "nombre": "MILILITRO", "abreviatura": "ml" },
  { "id": 4, "nombre": "LITRO", "abreviatura": "l" },
  { "id": 5, "nombre": "UNIDAD", "abreviatura": "u" }
]
```

Son datos de referencia cargados por la migración `V2`. No hay endpoints para crearlas, modificarlas ni eliminarlas. Los ids del ejemplo son ilustrativos: usar los que devuelva la API.

---

## Ingredientes y productos de inventario

Los dos controladores son idénticos en forma: mismas operaciones, mismos parámetros, mismos cuerpos. Solo cambian la ruta base y el nombre de la clave que envuelve el recurso al desactivar.

| Id | Operación | `/ingredients` | `/products` |
|---|---|---|---|
| AUX-02 / AUX-10 | Listar | `GET /ingredients` | `GET /products` |
| AUX-03 / AUX-11 | Crear | `POST /ingredients` | `POST /products` |
| AUX-04 / AUX-12 | Modificar | `PUT /ingredients/{id}` | `PUT /products/{id}` |
| AUX-05 / AUX-13 | Desactivar | `POST /ingredients/{id}/desactivar` | `POST /products/{id}/desactivar` |
| AUX-06 / AUX-14 | Registrar ingreso de stock | `POST /ingredients/{id}/ingresos` | `POST /products/{id}/ingresos` |
| AUX-07 / AUX-15 | Registrar pérdida de stock | `POST /ingredients/{id}/perdidas` | `POST /products/{id}/perdidas` |
| AUX-08 / AUX-16 | Registrar corrección de stock | `POST /ingredients/{id}/correcciones` | `POST /products/{id}/correcciones` |
| AUX-09 / AUX-17 | Listar movimientos de stock | `GET /ingredients/{id}/movimientos` | `GET /products/{id}/movimientos` |

No existen: obtener un artículo por id (`GET /ingredients/{id}`), reactivar un artículo, ni eliminarlo.

### Listar (AUX-02, AUX-10)

| Parámetro | Default | Notas |
|---|---|---|
| `page` | `0` | Base cero |
| `size` | `15` | Mínimo 1. Sin máximo |
| `search` | — | Texto libre |
| `sort` | `nombre,asc` | Formato `campo,direccion`. Campos: `nombre`, `cantidadActual`, `cantidadDisponible`, `stockMinimo`, `necesitaReposicion`. Dirección: `asc` o `desc` |
| `estado` | — | `ACTIVO` o `INACTIVO` |
| `inventario` | — | `SIN_STOCK`, `NECESITA_REPOSICION` o `CON_STOCK` |
| `unidadMedidaId` | — | Entero |

Respuesta: página ([`modelos.md`](modelos.md#página)) de elementos con esta forma:

```json
{
  "id": 13,
  "nombre": "Pan casero",
  "unidadMedida": { "id": 5, "nombre": "UNIDAD", "abreviatura": "u" },
  "descripcion": "Pan elaborado en el local",
  "activo": true,
  "stock": {
    "cantidadActual": 10,
    "cantidadReservada": 0,
    "cantidadDisponible": 10,
    "stockMinimo": 3,
    "necesitaReposicion": false
  }
}
```

### Crear (AUX-03, AUX-11)

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | string | — |
| `unidadMedidaId` | number (entero) | Id de AUX-01 |
| `descripcion` | string \| null | — |
| `stockMinimo` | number (decimal) \| null | — |
| `stockInicial` | objeto \| null | `{ "cantidad": number }` |

Respuesta `201 Created`, con `Location: /ingredients/{id}` o `/products/{id}`. El recurso creado incluye además `tipoArticulo`:

```json
{
  "id": 13,
  "nombre": "Pan casero",
  "tipoArticulo": { "id": 3, "nombre": "PRODUCTO" },
  "unidadMedida": { "id": 5, "nombre": "UNIDAD", "abreviatura": "u" },
  "descripcion": "Pan elaborado en el local",
  "activo": true,
  "stock": { "cantidadActual": 10, "cantidadReservada": 0, "cantidadDisponible": 10, "stockMinimo": 3, "necesitaReposicion": false }
}
```

El tipo de artículo lo fija el servidor según la ruta; no se envía.

### Modificar (AUX-04, AUX-12)

Cuerpo: `nombre`, `descripcion`, `unidadMedidaId`, `stockMinimo`. Respuesta `200 OK` con el recurso completo.

### Desactivar (AUX-05, AUX-13)

Sin cuerpo. Respuesta `200 OK` con una envoltura distinta en cada caso:

```json
{ "ingrediente": { "...": "recurso completo" }, "recetasActivasQueLoUtilizan": 0 }
```

```json
{ "producto": { "...": "recurso completo" }, "tieneRecetaActivaQueLoProduce": false }
```

### Movimientos de stock (AUX-06 a AUX-08, AUX-14 a AUX-16)

| Operación | Cuerpo |
|---|---|
| Ingreso, pérdida | `{ "cantidad": number }` |
| Corrección | `{ "cantidadReal": number }` |

Respuesta `200 OK` con el recurso completo y su stock actualizado.

### Listar movimientos (AUX-09, AUX-17)

Parámetros `page` y `size`. Orden: `momento` descendente. Página de:

```json
{
  "id": 201,
  "tipoMovimiento": { "id": 1, "nombre": "INGRESO" },
  "sentido": "ENTRADA",
  "cantidad": 10,
  "momento": "2026-10-09T18:40:12.551"
}
```

`momento` tiene el mismo formato de fecha sin zona que `fechaCreacion` de un pedido.

Las validaciones, las reglas de negocio y los ejemplos de error de cada una de estas operaciones están en su contrato individual dentro de [`../integration/`](../integration/). Los valores de `tipoArticulo.nombre`, `tipoMovimiento.nombre` y `sentido` de los ejemplos son ilustrativos: `PENDIENTE_DE_CONFIRMAR` contra esos contratos antes de usarlos en una pantalla.

---

## Recursos que no tienen endpoint

Que exista una tabla o una entidad no significa que exista una API. Estado `PENDIENTE` para todos:

| Recurso | Situación |
|---|---|
| Tipos de artículo | Tabla y datos de referencia; **sin endpoint**. Solo aparecen embebidos en las respuestas |
| Tipos de movimiento | Ídem |
| Recetas | Entidades y servicios internos; sin endpoint |
| Ejecución de producción | Servicio interno con tests; sin endpoint |
| Stock como recurso propio | Solo embebido en ingredientes y productos |
| Usuarios | Tabla `usuario`; sin endpoints de gestión |
| Mesas, salón, pagos, promociones, estadísticas | No existen en el sistema |
