# Administración del catálogo comercial

Fuente: `Comercial/api/controller/ProductoComercialController.java`, `ComboComercialController.java`, DTOs y mappers de `Comercial/api`, servicios de `Comercial/application`, entidades de `Comercial/domain/model`, `ComercialGlobalExceptionHandler`, tests del paquete `Comercial`.

Contratos SDD de origen: [`../05-contracts/api/comercial-admin/`](../05-contracts/api/comercial-admin/).

## Tres conceptos que no hay que confundir

| Concepto | Qué es | Rutas | ¿MVP? |
|---|---|---|---|
| **Producto comercial** | Algo que se vende, con nombre y precio | `/admin/comercial/productos` | Sí |
| **Combo comercial** | Un conjunto de productos comerciales que se vende a un precio propio | `/admin/comercial/combos` | Sí |
| **Artículo de inventario** (ingrediente o producto de inventario) | Algo que se almacena y se cuenta, con unidad de medida y stock | `/ingredients`, `/products` | **No** — ver [`recursos-auxiliares.md`](recursos-auxiliares.md) |

- Un producto comercial **no está relacionado** con ningún artículo de inventario. No comparten ids, ni datos, ni endpoints.
- `/products` es inventario. El catálogo que se vende está en `/admin/comercial/productos`. La similitud de nombres es histórica.
- Un combo solo puede contener productos comerciales, nunca otro combo.

## Reglas comunes a todos los endpoints de este documento

- **Autenticación:** sesión de administrador (cookie `ALACAN_SESSION`, rol `ADMIN`). Sin sesión: `401 NO_AUTENTICADO`.
- **CSRF:** las escrituras (`POST`, `PUT`) requieren `X-CSRF-TOKEN`. Con sesión y sin token: `403 CSRF_INVALIDO`.
- **Cabeceras:** `Content-Type: application/json` en las escrituras con cuerpo. Enviar cookies siempre.
- **Estado activo/inactivo:** campo booleano `activo` en las respuestas. Se cambia solo con los endpoints `/activar` y `/desactivar`; no se envía en los cuerpos de creación ni de modificación.
- **No existe eliminación.** No hay ningún `DELETE`. Lo que se deja de vender se desactiva.
- **Todo se crea activo.**
- **Errores de formato no manejados:** un JSON ilegible o un `id` no numérico en la ruta devuelven un `400` generado por Spring, sin `code` (`IMPLEMENTADO_NO_VALIDADO`; ver [`errores-y-seguridad.md`](errores-y-seguridad.md#3-errores-que-ningún-manejador-intercepta)).

### Campos editables y de solo lectura

| Recurso | Editables (cuerpo de `POST` y `PUT`) | Solo lectura |
|---|---|---|
| Producto comercial | `nombre`, `descripcion`, `precio`, `imagen` | `id`, `activo` |
| Combo comercial | `nombre`, `descripcion`, `precio`, `imagen`, `componentes` | `id`, `activo`, `componentes[].nombre` |

### Validaciones del servidor

| Campo | Regla verificada en el código | Sin validar en el código |
|---|---|---|
| `nombre` | Obligatorio, no vacío ni solo espacios | Largo (la columna admite 255), unicidad, espacios exteriores (no se recortan) |
| `precio` | Obligatorio, mayor a cero | Tope máximo, cantidad de decimales |
| `descripcion` | Opcional | Largo (la columna admite 255) |
| `imagen` | Opcional | Largo (la columna admite 255), formato |
| `componentes` | Al menos uno; `cantidad` mayor a cero; sin productos repetidos; cada producto debe existir y estar activo | Tope de componentes y de cantidad |

`PENDIENTE_DE_CONFIRMAR`:

- Qué responde la API si `nombre`, `descripcion` o `imagen` superan 255 caracteres. No hay validación previa; se espera un error del servidor sin `code`. Evidencia faltante: un test o una ejecución real. **Recomendación:** limitar esos campos a 255 caracteres en el formulario.
- Cómo se guarda un `precio` con más de dos decimales (la columna tiene dos). **Recomendación:** que el formulario admita como máximo dos decimales.
- Dos productos pueden tener el mismo nombre: no hay regla de unicidad.

---

# Productos comerciales

Modelo de respuesta (`ProductoComercialResponse`):

```json
{
  "id": 1,
  "nombre": "Hamburguesa clásica",
  "descripcion": "Carne vacuna, lechuga, tomate y queso",
  "precio": 8500.00,
  "imagen": "https://cdn.example/img/hamburguesa-clasica.jpg",
  "activo": true
}
```

| Campo | Tipo | Nulo |
|---|---|---|
| `id` | number (entero) | No |
| `nombre` | string | No |
| `descripcion` | string | Sí |
| `precio` | number (decimal) | No |
| `imagen` | string | Sí |
| `activo` | boolean | No |

## COM-P-01 — Listar productos comerciales

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /admin/comercial/productos` |
| Autenticación / CSRF | `ADMIN` / no aplica |

**Parámetros de query**, todos opcionales:

| Parámetro | Tipo | Default | Notas |
|---|---|---|---|
| `page` | entero | `0` | Base cero. Negativo: `400` |
| `size` | entero | `15` | Mínimo 1. **Sin máximo** |
| `search` | string | — | Busca dentro de `nombre`, sin distinguir mayúsculas. Vacío = sin filtro |
| `estado` | string | — | `ACTIVO` o `INACTIVO`, sin distinguir mayúsculas. Vacío = todos. Otro valor: `400` |

**Orden:** `nombre` ascendente, fijo. No hay parámetro `sort`.

Ejemplo: `GET /admin/comercial/productos?estado=ACTIVO&search=papas&page=0&size=15`

**Respuesta `200 OK`:**

```json
{
  "content": [
    { "id": 4, "nombre": "Ensalada César", "descripcion": null, "precio": 6000.00, "imagen": null, "activo": false },
    { "id": 3, "nombre": "Gaseosa 500 ml", "descripcion": "Línea cola, botella individual", "precio": 2000.00, "imagen": null, "activo": true },
    { "id": 1, "nombre": "Hamburguesa clásica", "descripcion": "Carne vacuna, lechuga, tomate y queso", "precio": 8500.00, "imagen": "https://cdn.example/img/hamburguesa-clasica.jpg", "activo": true },
    { "id": 2, "nombre": "Papas fritas", "descripcion": null, "precio": 3500.00, "imagen": null, "activo": true }
  ],
  "page": 0,
  "size": 15,
  "totalElements": 4,
  "totalPages": 1,
  "first": true,
  "last": true,
  "empty": false
}
```

Sin resultados: `200 OK` con `content: []` y `empty: true`. Estructura de página: [`modelos.md`](modelos.md#página).

**Errores:** `400 VALIDATION_ERROR` (`estado` inválido, `page` negativo, `size` menor a 1). `page` o `size` no numéricos: `400` sin `code`.

**Lo consumen.** Listado de productos; selector de productos del formulario de combos.

## COM-P-02 — Obtener un producto comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /admin/comercial/productos/{id}` |
| Autenticación / CSRF | `ADMIN` / no aplica |
| Parámetro de ruta | `id`: entero |

**Respuesta `200 OK`:** un `ProductoComercialResponse`. Devuelve también productos inactivos.

**Errores:** `404 PRODUCTO_COMERCIAL_NOT_FOUND`.

```json
{
  "title": "Producto Comercial no encontrado",
  "status": 404,
  "detail": "Producto Comercial no encontrado: id=999",
  "instance": "/admin/comercial/productos/999",
  "code": "PRODUCTO_COMERCIAL_NOT_FOUND"
}
```

**Lo consume.** Formulario de edición de producto.

## COM-P-03 — Crear un producto comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /admin/comercial/productos` |
| Autenticación / CSRF | `ADMIN` / requerido |
| `Content-Type` | `application/json` |

**Cuerpo** (`CrearProductoComercialRequest`):

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `nombre` | string | Sí | No vacío |
| `precio` | number | Sí | Mayor a cero |
| `descripcion` | string \| null | No | — |
| `imagen` | string \| null | No | — |

```json
{
  "nombre": "Papas fritas",
  "descripcion": null,
  "precio": 3500.00,
  "imagen": null
}
```

**Respuesta `201 Created`**, con `Location: /admin/comercial/productos/2`:

```json
{ "id": 2, "nombre": "Papas fritas", "descripcion": null, "precio": 3500.00, "imagen": null, "activo": true }
```

**Errores:** `400 VALIDATION_ERROR` (nombre vacío: `detail` "Nombre requerido"; precio nulo, cero o negativo: "Precio invalido").

```json
{
  "title": "Solicitud invalida",
  "status": 400,
  "detail": "Precio invalido",
  "instance": "/admin/comercial/productos",
  "code": "VALIDATION_ERROR"
}
```

**Reglas.** No es idempotente: dos envíos crean dos productos. Un campo desconocido en el cuerpo (por ejemplo `activo`) no tiene efecto.

## COM-P-04 — Modificar un producto comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `PUT /admin/comercial/productos/{id}` |
| Autenticación / CSRF | `ADMIN` / requerido |
| `Content-Type` | `application/json` |

**Cuerpo** (`ActualizarProductoComercialRequest`): los mismos cuatro campos que la creación, con las mismas reglas.

**Es un reemplazo completo.** Hay que enviar los cuatro campos: un `descripcion` o `imagen` omitido o `null` **borra** el valor guardado. No hay modificación parcial.

```json
{
  "nombre": "Papas fritas grandes",
  "descripcion": "Porción para compartir",
  "precio": 4200.00,
  "imagen": null
}
```

**Respuesta `200 OK`:** el `ProductoComercialResponse` actualizado. `activo` no cambia.

**Errores:** `400 VALIDATION_ERROR`, `404 PRODUCTO_COMERCIAL_NOT_FOUND`.

**Reglas.**

- Se puede modificar un producto inactivo.
- Cambiar el nombre o el precio **no altera los pedidos ya creados**: cada línea de pedido guarda su propia copia.
- El nombre nuevo se ve de inmediato en los combos que lo incluyen.

## COM-P-05 — Activar un producto comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /admin/comercial/productos/{id}/activar` |
| Autenticación / CSRF | `ADMIN` / requerido |
| Cuerpo | Ninguno |

**Respuesta `200 OK`:** el producto con `activo: true`. Idempotente: activar uno ya activo responde igual.

**Errores:** `404 PRODUCTO_COMERCIAL_NOT_FOUND`.

## COM-P-06 — Desactivar un producto comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /admin/comercial/productos/{id}/desactivar` |
| Autenticación / CSRF | `ADMIN` / requerido |
| Cuerpo | Ninguno |

**Respuesta `200 OK`:** el producto con `activo: false`. Idempotente.

**Errores:**

| Status | `code` | Cuándo |
|---|---|---|
| 404 | `PRODUCTO_COMERCIAL_NOT_FOUND` | No existe |
| 409 | `PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO` | Es componente de al menos un combo **activo** |

```json
{
  "title": "Producto Comercial en uso",
  "status": 409,
  "detail": "Producto Comercial 1 no puede desactivarse: es componente de al menos un Combo Comercial activo",
  "instance": "/admin/comercial/productos/1/desactivar",
  "code": "PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO"
}
```

**Reglas.**

- Un producto desactivado deja de aparecer en `GET /catalogo` y no puede pedirse.
- La respuesta `409` **no dice qué combos** lo usan, y no hay un endpoint que lo informe. Para desbloquear, el administrador debe desactivar o modificar esos combos. El frontend puede buscarlos recorriendo `GET /admin/comercial/combos?estado=ACTIVO` y mirando `componentes[].productoComercialId`.

---

# Combos comerciales

Modelo de respuesta (`ComboComercialResponse`):

```json
{
  "id": 1,
  "nombre": "Combo clásico",
  "descripcion": "Hamburguesa, papas y gaseosa",
  "precio": 12500.00,
  "imagen": null,
  "activo": true,
  "componentes": [
    { "productoComercialId": 1, "nombre": "Hamburguesa clásica", "cantidad": 1 },
    { "productoComercialId": 2, "nombre": "Papas fritas", "cantidad": 1 },
    { "productoComercialId": 3, "nombre": "Gaseosa 500 ml", "cantidad": 1 }
  ]
}
```

| Campo | Tipo | Nulo | Notas |
|---|---|---|---|
| `id` | number (entero) | No | — |
| `nombre` | string | No | — |
| `descripcion` | string | Sí | — |
| `precio` | number (decimal) | No | Propio del combo; no se calcula |
| `imagen` | string | Sí | — |
| `activo` | boolean | No | — |
| `componentes` | array | No | Al menos uno |
| `componentes[].productoComercialId` | number (entero) | No | — |
| `componentes[].nombre` | string | No | Nombre actual del producto. Solo lectura |
| `componentes[].cantidad` | number (entero) | No | Mayor a cero |

`PENDIENTE_DE_CONFIRMAR`: el orden de `componentes` en la respuesta. No hay un orden declarado en el código. Evidencia faltante: una regla de orden en la entidad o un test.

## COM-C-01 — Listar combos comerciales

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /admin/comercial/combos` |
| Autenticación / CSRF | `ADMIN` / no aplica |

Mismos parámetros, orden y reglas que [COM-P-01](#com-p-01--listar-productos-comerciales): `page`, `size`, `search`, `estado`; orden por `nombre` ascendente.

**Respuesta `200 OK`:** página de `ComboComercialResponse`, cada uno con sus componentes.

```json
{
  "content": [
    {
      "id": 1,
      "nombre": "Combo clásico",
      "descripcion": "Hamburguesa, papas y gaseosa",
      "precio": 12500.00,
      "imagen": null,
      "activo": true,
      "componentes": [
        { "productoComercialId": 1, "nombre": "Hamburguesa clásica", "cantidad": 1 },
        { "productoComercialId": 2, "nombre": "Papas fritas", "cantidad": 1 },
        { "productoComercialId": 3, "nombre": "Gaseosa 500 ml", "cantidad": 1 }
      ]
    }
  ],
  "page": 0,
  "size": 15,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "empty": false
}
```

**Errores:** `400 VALIDATION_ERROR`.

## COM-C-02 — Obtener un combo comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /admin/comercial/combos/{id}` |
| Autenticación / CSRF | `ADMIN` / no aplica |

**Respuesta `200 OK`:** un `ComboComercialResponse`. **Errores:** `404 COMBO_COMERCIAL_NOT_FOUND`.

## COM-C-03 — Crear un combo comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /admin/comercial/combos` |
| Autenticación / CSRF | `ADMIN` / requerido |
| `Content-Type` | `application/json` |

**Cuerpo** (`CrearComboComercialRequest`):

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `nombre` | string | Sí | No vacío |
| `precio` | number | Sí | Mayor a cero. Lo decide el administrador |
| `descripcion` | string \| null | No | — |
| `imagen` | string \| null | No | — |
| `componentes` | array | Sí | Al menos un elemento |
| `componentes[].productoComercialId` | number (entero) | Sí | Producto comercial existente y **activo** |
| `componentes[].cantidad` | number (entero) | Sí | Mayor a cero. Omitido equivale a `0` y se rechaza |

```json
{
  "nombre": "Combo clásico",
  "descripcion": "Hamburguesa, papas y gaseosa",
  "precio": 12500.00,
  "imagen": null,
  "componentes": [
    { "productoComercialId": 1, "cantidad": 1 },
    { "productoComercialId": 2, "cantidad": 1 },
    { "productoComercialId": 3, "cantidad": 1 }
  ]
}
```

**Respuesta `201 Created`**, con `Location: /admin/comercial/combos/1`: el `ComboComercialResponse` completo, `activo: true`.

**Errores:**

| Status | `code` | Cuándo | `detail` |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Nombre vacío | "Nombre requerido" |
| 400 | `VALIDATION_ERROR` | Precio nulo, cero o negativo | "Precio invalido" |
| 400 | `VALIDATION_ERROR` | `componentes` vacío u omitido | "Un Combo Comercial debe tener al menos un componente" |
| 400 | `VALIDATION_ERROR` | `cantidad` menor o igual a cero | "La cantidad debe ser mayor a 0" |
| 400 | `VALIDATION_ERROR` | El mismo producto dos veces | "El Producto Comercial 1 ya es componente de este combo" |
| 404 | `PRODUCTO_COMERCIAL_NOT_FOUND` | Un componente referencia un producto inexistente | — |
| 409 | `PRODUCTO_COMERCIAL_INACTIVO` | Un componente referencia un producto inactivo | — |

Ante cualquier error no se guarda nada.

`PENDIENTE_DE_CONFIRMAR`: la respuesta cuando un componente llega sin `productoComercialId` (o `null`). El código no lo valida antes de consultar la base; se espera un error sin `code`. Evidencia faltante: un test. **El formulario debe impedir enviarlo.**

**Reglas.** El selector de productos del formulario debe ofrecer solo productos activos (`GET /admin/comercial/productos?estado=ACTIVO`). No hay un endpoint "todos sin paginar": usar un `size` suficiente o búsqueda incremental con `search`.

## COM-C-04 — Modificar un combo comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `PUT /admin/comercial/combos/{id}` |
| Autenticación / CSRF | `ADMIN` / requerido |
| `Content-Type` | `application/json` |

**Cuerpo** (`ActualizarComboComercialRequest`): igual que la creación.

**Es un reemplazo completo, incluidos los componentes.** La lista enviada sustituye a la anterior entera: para quitar un componente se lo omite; para conservar los demás hay que reenviarlos.

**Respuesta `200 OK`:** el combo actualizado. `activo` no cambia.

**Errores:** los de la creación, más `404 COMBO_COMERCIAL_NOT_FOUND`.

**Reglas.**

- Todos los componentes enviados deben estar activos, **también los que el combo ya tenía**. Si un combo inactivo conserva un componente que fue desactivado, modificarlo sin quitar ese componente responde `409 PRODUCTO_COMERCIAL_INACTIVO`.
- No altera los pedidos ya creados.

## COM-C-05 — Activar un combo comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /admin/comercial/combos/{id}/activar` |
| Autenticación / CSRF | `ADMIN` / requerido |
| Cuerpo | Ninguno |

**Respuesta `200 OK`:** el combo con `activo: true`. Idempotente.

**Errores:**

| Status | `code` | Cuándo |
|---|---|---|
| 404 | `COMBO_COMERCIAL_NOT_FOUND` | No existe |
| 409 | `COMBO_COMERCIAL_COMPONENTE_INACTIVO` | Alguno de sus componentes está inactivo |

```json
{
  "title": "Componente inactivo",
  "status": 409,
  "detail": "El Combo Comercial 1 no puede activarse: su componente Producto Comercial 2 esta inactivo",
  "instance": "/admin/comercial/combos/1/activar",
  "code": "COMBO_COMERCIAL_COMPONENTE_INACTIVO"
}
```

El id del componente inactivo aparece solo en el texto de `detail`, no como campo. Para identificarlo de forma fiable, consultar cada componente con COM-P-02.

## COM-C-06 — Desactivar un combo comercial

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /admin/comercial/combos/{id}/desactivar` |
| Autenticación / CSRF | `ADMIN` / requerido |
| Cuerpo | Ninguno |

**Respuesta `200 OK`:** el combo con `activo: false`. Idempotente. Sin restricciones.

**Errores:** `404 COMBO_COMERCIAL_NOT_FOUND`.

---

## Datos que necesita cada formulario

| Formulario | Campos | Carga inicial | Envío |
|---|---|---|---|
| Alta de producto | `nombre`*, `precio`*, `descripcion`, `imagen` | — | COM-P-03 |
| Edición de producto | Los mismos | COM-P-02 | COM-P-04 |
| Alta de combo | `nombre`*, `precio`*, `descripcion`, `imagen`, `componentes`* (producto + cantidad) | COM-P-01 con `estado=ACTIVO` para el selector | COM-C-03 |
| Edición de combo | Los mismos | COM-C-02 y COM-P-01 con `estado=ACTIVO` | COM-C-04 |
| Activar / desactivar | — | — | COM-P-05/06, COM-C-05/06 |

\* obligatorio.

## Operaciones que no existen

Estado `PENDIENTE`. No tienen ruta.

| Operación | Alternativa actual |
|---|---|
| Eliminar un producto o un combo | Desactivar |
| Modificación parcial (`PATCH`) | `PUT` con todos los campos |
| Subir una imagen | Ninguna: `imagen` es un texto |
| Ordenar el listado por otro campo | Ninguna: orden fijo por nombre |
| Listar sin paginar para un selector | `size` grande o `search` |
| Saber qué combos usan un producto | Recorrer COM-C-01 |
| Categorías, etiquetas, destacados, orden manual del catálogo | Ninguna |
| Vista previa del catálogo público desde el panel | `GET /catalogo` |
