# Pedidos

Fuente: `Pedido/api/controller/PedidoController.java`, DTOs y mapper de `Pedido/api`, servicios de `Pedido/application`, `Pedido/domain/model` (`Pedido`, `ItemPedido`, `EstadoPedido`, `TipoPedido`, `CanalPedido`), `PedidoRepositoryImpl`, `PedidoGlobalExceptionHandler`, tests del paquete `Pedido`.

Contratos SDD de origen: [`../05-contracts/api/pedido-public/`](../05-contracts/api/pedido-public/) y [`../05-contracts/api/pedido-admin/`](../05-contracts/api/pedido-admin/).

## Inventario

| Id | Operación | Método y ruta | Acceso | Estado |
|---|---|---|---|---|
| PED-01 | Crear pedido | `POST /pedidos` | Público | `IMPLEMENTADO` |
| PED-02 | Listar pedidos | `GET /pedidos` | `ADMIN` | `IMPLEMENTADO` |
| PED-03 | Consultar un pedido | `GET /pedidos/{id}` | `ADMIN` | `IMPLEMENTADO` |
| PED-04 | Confirmar | `POST /pedidos/{id}/confirmar` | `ADMIN` | `IMPLEMENTADO` |
| PED-05 | Pasar a preparación | `POST /pedidos/{id}/en-preparacion` | `ADMIN` | `IMPLEMENTADO` |
| PED-06 | Marcar listo | `POST /pedidos/{id}/listo` | `ADMIN` | `IMPLEMENTADO` |
| PED-07 | Marcar entregado | `POST /pedidos/{id}/entregado` | `ADMIN` | `IMPLEMENTADO` |
| PED-08 | Cancelar | `POST /pedidos/{id}/cancelar` | `ADMIN` | `IMPLEMENTADO` |
| PED-09 | Rechazar | `POST /pedidos/{id}/rechazar` | `ADMIN` | `IMPLEMENTADO` |
| PED-10 | Agregar producto a un pedido | `POST /pedidos/{id}/productos` | `ADMIN` | `IMPLEMENTADO`, fuera del MVP |
| PED-11 | Agregar combo a un pedido | `POST /pedidos/{id}/combos` | `ADMIN` | `IMPLEMENTADO`, fuera del MVP |
| PED-12 | Eliminar una línea | `DELETE /pedidos/{id}/items/{itemId}` | `ADMIN` | `IMPLEMENTADO`, fuera del MVP |
| PED-13 | Modificar la cantidad de una línea | `PATCH /pedidos/{id}/items/{itemId}/cantidad` | `ADMIN` | `IMPLEMENTADO`, fuera del MVP |

## Modelo de un pedido

La misma representación (`PedidoDTO`) se usa en la respuesta del alta, en el detalle y en cada elemento del listado.

```json
{
  "id": 15,
  "estado": "NUEVO",
  "tipoPedido": "DELIVERY",
  "canal": "WEB",
  "nombreCliente": "Cliente de Ejemplo",
  "telefonoCliente": "+54 11 5555-0100",
  "direccion": "Calle Falsa 123, piso 2",
  "fechaCreacion": "2026-10-09T20:15:31.482913",
  "total": 29500.00,
  "items": [
    {
      "id": 31,
      "tipo": "PRODUCTO",
      "referenciaId": 1,
      "nombre": "Hamburguesa clásica",
      "precioUnitario": 8500.00,
      "cantidad": 2,
      "subtotal": 17000.00,
      "observacion": "sin tomate"
    },
    {
      "id": 32,
      "tipo": "COMBO",
      "referenciaId": 1,
      "nombre": "Combo clásico",
      "precioUnitario": 12500.00,
      "cantidad": 1,
      "subtotal": 12500.00,
      "observacion": null
    }
  ]
}
```

| Campo | Tipo | Nulo | Notas |
|---|---|---|---|
| `id` | number (entero) | No | — |
| `estado` | string | No | Ver [Estados](#estados-y-transiciones) |
| `tipoPedido` | string | No | `DELIVERY` o `TAKEAWAY` en pedidos de la web. El enum también define `SALON`, que el alta pública rechaza |
| `canal` | string | No | `WEB` en todo pedido creado por el alta pública. El enum también define `TOTEM`, `APP_MOVIL` y `MOZO`, que ninguna operación actual asigna |
| `nombreCliente` | string | No | Hasta 80 caracteres |
| `telefonoCliente` | string | No | Hasta 30 caracteres. Sin formato validado |
| `direccion` | string | Sí | Hasta 200 caracteres. Siempre presente si `tipoPedido` es `DELIVERY`. En `TAKEAWAY` puede venir `null` o con valor, si el cliente la envió |
| `fechaCreacion` | string | No | Fecha y hora ISO 8601 **sin zona horaria**. Ver [`modelos.md`](modelos.md#fechas) |
| `total` | number (decimal) | No | Suma de los `subtotal`. Lo calcula el servidor |
| `items` | array | No | Al menos una línea |
| `items[].id` | number (entero) | No | Id de la línea. Es el `itemId` de PED-12 y PED-13 |
| `items[].tipo` | string | No | `PRODUCTO` o `COMBO` |
| `items[].referenciaId` | number (entero) | No | Id del producto o combo comercial de origen. Informativo |
| `items[].nombre` | string | No | Copia del nombre al crear la línea |
| `items[].precioUnitario` | number (decimal) | No | Copia del precio al crear la línea |
| `items[].cantidad` | number (entero) | No | De 1 a 50 |
| `items[].subtotal` | number (decimal) | No | `precioUnitario` × `cantidad`. Lo calcula el servidor |
| `items[].observacion` | string | Sí | Hasta 200 caracteres |

**Snapshots.** `nombre` y `precioUnitario` se copian al crear la línea y no cambian aunque después se modifique o desactive el producto o combo. El panel debe mostrar los datos del pedido, no volver a consultar el catálogo.

**Lo que el pedido no tiene.** No hay número de pedido distinto del `id`, ni medio de pago, ni costo de envío, ni descuentos, ni observación general del pedido, ni fecha de cada cambio de estado, ni usuario que lo operó, ni motivo de cancelación.

`PENDIENTE_DE_CONFIRMAR`: el orden de `items` dentro de un pedido. Los tests verifican que las líneas y el total se conservan, pero el código no declara un orden. Evidencia faltante: una regla de orden en la entidad.

## Estados y transiciones

Estados que un pedido puede tener hoy: `NUEVO`, `CONFIRMADO`, `EN_PREPARACION`, `LISTO`, `ENTREGADO`, `CANCELADO`.

El enum incluye además `ENVIADO`. **Ningún endpoint lleva un pedido a `ENVIADO`**: no debe ofrecerse como acción ni como etapa visible. Solo es válido como valor del filtro del listado, donde devuelve vacío. No existe `RECHAZADO`.

```text
NUEVO --confirmar--> CONFIRMADO --en-preparacion--> EN_PREPARACION --listo--> LISTO --entregado--> ENTREGADO

Cancelar o rechazar: desde cualquier estado excepto ENTREGADO --> CANCELADO
```

| Operación | Estado de origen aceptado | Estado resultante |
|---|---|---|
| `confirmar` | `NUEVO` | `CONFIRMADO` |
| `en-preparacion` | `CONFIRMADO` | `EN_PREPARACION` |
| `listo` | `EN_PREPARACION` | `LISTO` |
| `entregado` | `LISTO` | `ENTREGADO` |
| `cancelar`, `rechazar` | `NUEVO`, `CONFIRMADO`, `EN_PREPARACION`, `LISTO`, `CANCELADO` | `CANCELADO` |

- El flujo es **el mismo para `DELIVERY` y `TAKEAWAY`**.
- No hay transiciones hacia atrás ni saltos de etapa.
- `ENTREGADO` y `CANCELADO` son finales. Cancelar un pedido ya cancelado responde `200` y lo deja igual.
- `rechazar` ejecuta exactamente lo mismo que `cancelar`. No queda registro de cuál de los dos se usó.

Acciones que el panel puede ofrecer según el estado:

| Estado | Avanzar | Cancelar |
|---|---|---|
| `NUEVO` | Confirmar | Sí (como "rechazar" o "cancelar") |
| `CONFIRMADO` | Pasar a preparación | Sí |
| `EN_PREPARACION` | Marcar listo | Sí |
| `LISTO` | Marcar entregado | Sí |
| `ENTREGADO` | — | No |
| `CANCELADO` | — | — |

Esta tabla es una ayuda de interfaz. La autoridad es el backend: una acción no permitida responde `400 VALIDATION_ERROR`, y el frontend debe manejarlo (por ejemplo, si otro administrador ya cambió el estado).

---

## PED-01 — Crear pedido (público)

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /pedidos` |
| Autenticación | Ninguna |
| CSRF | **Exento.** No necesita token ni cookies |
| `Content-Type` | `application/json` |

**Finalidad.** Crear un pedido completo, con todas sus líneas, en una sola operación atómica.

**Cuerpo** (`CrearPedidoRequest`):

| Campo | Tipo | Requerido | Reglas |
|---|---|---|---|
| `tipoPedido` | string | Sí | Exactamente `DELIVERY` o `TAKEAWAY`. `SALON` se rechaza. Minúsculas o espacios se rechazan |
| `nombreCliente` | string | Sí | No vacío, máximo 80. Se guarda sin espacios exteriores |
| `telefonoCliente` | string | Sí | No vacío, máximo 30. Se guarda sin espacios exteriores. Sin validación de formato |
| `direccion` | string | Solo si `DELIVERY` | Máximo 200. Se guarda sin espacios exteriores. En blanco equivale a no enviarla |
| `items` | array | Sí | De 1 a 20 elementos, sin repetir `tipo` + `id` |
| `items[].tipo` | string | Sí | Exactamente `PRODUCTO` o `COMBO`, como lo entrega `GET /catalogo` |
| `items[].id` | number | Sí | **Entero JSON.** El `id` del elemento del catálogo |
| `items[].cantidad` | number | Sí | **Entero JSON**, de 1 a 50 |
| `items[].observacion` | string \| null | No | Máximo 200. No se recorta |

```json
{
  "tipoPedido": "DELIVERY",
  "nombreCliente": "Cliente de Ejemplo",
  "telefonoCliente": "+54 11 5555-0100",
  "direccion": "Calle Falsa 123, piso 2",
  "items": [
    { "tipo": "PRODUCTO", "id": 1, "cantidad": 2, "observacion": "sin tomate" },
    { "tipo": "COMBO", "id": 1, "cantidad": 1 }
  ]
}
```

**Respuesta `201 Created`**, con `Location: /pedidos/15`: el pedido completo (el JSON de [Modelo de un pedido](#modelo-de-un-pedido)), con `estado: "NUEVO"` y `canal: "WEB"`.

**Errores:**

| Status | `code` | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | JSON ilegible; dato faltante, inválido o fuera de límites; `SALON`; línea repetida; `id` o `cantidad` no enteros |
| 404 | `PRODUCTO_COMERCIAL_NOT_FOUND` | Una línea `PRODUCTO` referencia un id inexistente |
| 404 | `COMBO_COMERCIAL_NOT_FOUND` | Una línea `COMBO` referencia un id inexistente |
| 409 | `PRODUCTO_COMERCIAL_INACTIVO` | Una línea referencia un producto desactivado |
| 409 | `COMBO_COMERCIAL_INACTIVO` | Una línea referencia un combo desactivado |

Textos de `detail` para `VALIDATION_ERROR` (orientativos; no decidir por ellos):

| Causa | `detail` |
|---|---|
| JSON ilegible | "El cuerpo de la solicitud no es un JSON valido para esta operacion" |
| `tipoPedido` ausente | "Tipo de pedido requerido" |
| `tipoPedido` desconocido | "Tipo de pedido inválido: delivery" |
| `SALON` | "Tipo de pedido no permitido para un pedido web: SALON" |
| `items` vacío o ausente | "El pedido debe tener al menos un item" |
| Más de 20 líneas | "Un pedido no puede tener más de 20 líneas" |
| Línea incompleta | "Cada item requiere tipo, id y cantidad" |
| `id` o `cantidad` no enteros | "'cantidad' debe ser un número entero" |
| Cantidad fuera de rango | "La cantidad de cada item debe estar entre 1 y 50" |
| Línea repetida | "Item repetido: PRODUCTO 1 aparece más de una vez" |
| Nombre ausente | "Nombre del cliente requerido" |
| Teléfono ausente | "Telefono del cliente requerido" |
| `DELIVERY` sin dirección | "Un pedido delivery requiere dirección" |
| Observación larga | "La observación no puede superar 200 caracteres" |

```json
{
  "title": "Producto Comercial inactivo",
  "status": 409,
  "detail": "Producto Comercial inactivo: id=4",
  "instance": "/pedidos",
  "code": "PRODUCTO_COMERCIAL_INACTIVO"
}
```

**Reglas que debe respetar el frontend.**

- **El servidor decide precios, nombres, subtotales y total.** El cuerpo no los lleva; si se envían, se ignoran. Lo que el carrito muestra es una estimación: el importe real es el `total` de la respuesta.
- **El cliente no decide `estado` ni `canal`.** Si se envían, se ignoran.
- **Enteros estrictos:** `2.0`, `2.9`, `"3"` y `true` se rechazan en `id` y `cantidad`. Enviar números enteros, no cadenas.
- **Sin líneas repetidas:** el carrito debe unificar por `tipo` + `id` antes de enviar. Un producto y un combo con el mismo `id` son líneas distintas y válidas.
- **Solo lo activo:** un elemento desactivado después de cargar el catálogo produce `409`. Ante un `404` o un `409`, recargar `GET /catalogo`, quitar del carrito lo que ya no está y avisar al cliente.
- **Atómico:** ante cualquier error no se crea nada. No hay pedido parcial que limpiar.
- **Orden de validación:** primero lo que depende solo del cuerpo (`400`), después existencia (`404`) y estado activo (`409`). Solo se informa el primer error.
- **No es idempotente:** cada envío exitoso crea un pedido. Deshabilitar el botón durante el envío. Si la respuesta se pierde por un corte de red, no hay forma de saber desde el cliente si el pedido se creó.
- **La respuesta es todo lo que el cliente recibe.** `GET /pedidos/{id}` es administrativo: la pantalla de confirmación debe construirse con la respuesta del `POST` y no puede recargarse desde la API.
- La cabecera `Location` apunta a una ruta administrativa; no sirve para el cliente público.

**Depende de.** CAT-01. **Lo consume.** Checkout.

---

## PED-02 — Listar pedidos

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /pedidos` |
| Autenticación / CSRF | `ADMIN` / no aplica |

**Parámetros de query**, todos opcionales:

| Parámetro | Tipo | Default | Reglas |
|---|---|---|---|
| `estado` | string, **repetible** | — | Uno o más de `NUEVO`, `CONFIRMADO`, `EN_PREPARACION`, `LISTO`, `ENVIADO`, `ENTREGADO`, `CANCELADO`. Omitido = todos |
| `page` | entero | `0` | Base cero. Negativo: `400` |
| `size` | entero | `15` | Mínimo 1, **máximo 100**. Fuera de rango: `400` (no se recorta) |

Reglas del filtro `estado`:

- Varios valores se combinan con OR y **cada uno va en su propio parámetro**: `?estado=NUEVO&estado=CONFIRMADO`.
- `?estado=NUEVO,CONFIRMADO` (separado por comas) se rechaza con `400`.
- `?estado=` (vacío) se rechaza con `400`. Para no filtrar, omitir el parámetro.
- Valores exactos, en mayúsculas y sin espacios. Un valor desconocido invalida toda la petición.
- Repetir un valor no cambia el resultado.

Con `URLSearchParams`: `params.append("estado", "NUEVO"); params.append("estado", "CONFIRMADO");`. Con Axios, configurar la serialización de arreglos como `estado=A&estado=B` (sin corchetes ni comas).

**No existen:** búsqueda por texto, filtro por fecha, por tipo de pedido o por cliente, ni parámetro `sort`.

**Orden:** `fechaCreacion` ascendente y, a igual fecha, `id` ascendente. **El pedido más antiguo va primero**; los nuevos quedan al final, en la última página.

Ejemplo: `GET /pedidos?estado=NUEVO&estado=CONFIRMADO&page=0&size=15`

**Respuesta `200 OK`:**

```json
{
  "content": [
    {
      "id": 15,
      "estado": "NUEVO",
      "tipoPedido": "DELIVERY",
      "canal": "WEB",
      "nombreCliente": "Cliente de Ejemplo",
      "telefonoCliente": "+54 11 5555-0100",
      "direccion": "Calle Falsa 123, piso 2",
      "fechaCreacion": "2026-10-09T20:15:31.482913",
      "total": 29500.00,
      "items": [
        { "id": 31, "tipo": "PRODUCTO", "referenciaId": 1, "nombre": "Hamburguesa clásica", "precioUnitario": 8500.00, "cantidad": 2, "subtotal": 17000.00, "observacion": "sin tomate" },
        { "id": 32, "tipo": "COMBO", "referenciaId": 1, "nombre": "Combo clásico", "precioUnitario": 12500.00, "cantidad": 1, "subtotal": 12500.00, "observacion": null }
      ]
    },
    {
      "id": 16,
      "estado": "CONFIRMADO",
      "tipoPedido": "TAKEAWAY",
      "canal": "WEB",
      "nombreCliente": "Otra Persona de Ejemplo",
      "telefonoCliente": "11 5555-0101",
      "direccion": null,
      "fechaCreacion": "2026-10-09T20:22:05.107",
      "total": 10500.00,
      "items": [
        { "id": 33, "tipo": "PRODUCTO", "referenciaId": 2, "nombre": "Papas fritas", "precioUnitario": 3500.00, "cantidad": 3, "subtotal": 10500.00, "observacion": null }
      ]
    }
  ],
  "page": 0,
  "size": 15,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true,
  "empty": false
}
```

Cada elemento es un pedido **completo, con sus líneas**: el listado alcanza para mostrar el detalle sin otra llamada. Sin resultados: `200 OK` con `content: []`, `totalElements: 0`, `empty: true`.

**Errores:** `400 VALIDATION_ERROR` para cualquier parámetro inválido, incluidos `page` o `size` no numéricos.

```json
{
  "title": "Solicitud invalida",
  "status": 400,
  "detail": "Estado de pedido inválido: RECHAZADO",
  "instance": "/pedidos",
  "code": "VALIDATION_ERROR"
}
```

**Reglas para el frontend.**

- No hay notificaciones ni actualización en tiempo real. Para ver pedidos nuevos hay que volver a consultar (recarga manual o consulta periódica).
- Para una vista de "pedidos activos": `estado=NUEVO&estado=CONFIRMADO&estado=EN_PREPARACION&estado=LISTO`.
- Para mostrar primero lo más reciente hay que pedir la última página (`totalPages - 1`) e invertir el orden en el cliente; el servidor no ofrece orden descendente.
- Contadores por estado: no hay un endpoint. Se obtienen con una consulta por estado y `size=1`, leyendo `totalElements`.

**Lo consumen.** Listado de pedidos; vista inicial del panel.

---

## PED-03 — Consultar un pedido

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /pedidos/{id}` |
| Autenticación / CSRF | `ADMIN` / no aplica |
| Parámetro de ruta | `id`: entero |

**Respuesta `200 OK`:** un pedido ([Modelo de un pedido](#modelo-de-un-pedido)).

**Errores:**

| Status | `code` | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `id` no numérico. `detail`: "El valor del parametro 'id' no es valido" |
| 404 | `PEDIDO_NOT_FOUND` | No existe |

**Lo consumen.** Detalle de pedido; recarga después de una acción.

---

## PED-04 a PED-09 — Transiciones de estado

Las seis operaciones tienen la misma forma.

| Id | Método y ruta | Desde | Hacia |
|---|---|---|---|
| PED-04 | `POST /pedidos/{id}/confirmar` | `NUEVO` | `CONFIRMADO` |
| PED-05 | `POST /pedidos/{id}/en-preparacion` | `CONFIRMADO` | `EN_PREPARACION` |
| PED-06 | `POST /pedidos/{id}/listo` | `EN_PREPARACION` | `LISTO` |
| PED-07 | `POST /pedidos/{id}/entregado` | `LISTO` | `ENTREGADO` |
| PED-08 | `POST /pedidos/{id}/cancelar` | Cualquiera menos `ENTREGADO` | `CANCELADO` |
| PED-09 | `POST /pedidos/{id}/rechazar` | Cualquiera menos `ENTREGADO` | `CANCELADO` |

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Autenticación / CSRF | `ADMIN` / **requerido** |
| Cabeceras | `X-CSRF-TOKEN`. Enviar cookies |
| Cuerpo | **Ninguno.** No se envía motivo ni ningún otro dato |

**Respuesta `200 OK` con cuerpo vacío.** No devuelve el pedido: para ver el estado nuevo hay que llamar a PED-03 o recargar el listado. No intentar interpretar la respuesta como JSON.

```text
POST /pedidos/15/confirmar
X-CSRF-TOKEN: kQ3n...9aZ
Cookie: ALACAN_SESSION=...

HTTP/1.1 200
(sin cuerpo)
```

**Errores:**

| Status | `code` | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | El pedido no está en el estado de origen requerido; o `id` no numérico |
| 401 | `NO_AUTENTICADO` | Sin sesión |
| 403 | `CSRF_INVALIDO` | Con sesión, sin token válido |
| 404 | `PEDIDO_NOT_FOUND` | No existe |

Textos de `detail` de una transición rechazada (orientativos):

| Operación | `detail` |
|---|---|
| `confirmar` | "Solo pedidos nuevos pueden confirmarse" |
| `en-preparacion` | "Solo pedidos confirmados pasan a preparación" |
| `listo` | "El pedido debe estar en preparación" |
| `entregado` | "Estado inválido para entregar" |
| `cancelar`, `rechazar` | "No se puede cancelar un pedido entregado" |

```json
{
  "title": "Solicitud invalida",
  "status": 400,
  "detail": "Solo pedidos nuevos pueden confirmarse",
  "instance": "/pedidos/15/confirmar",
  "code": "VALIDATION_ERROR"
}
```

**Reglas para el frontend.**

- **Una transición inválida es `400 VALIDATION_ERROR`, el mismo código que un dato mal formado.** No hay un código propio. En una pantalla de acciones sobre un pedido, tratar ese `400` como "el pedido cambió de estado": recargarlo y avisar.
- Después de cualquier transición, **recargar el pedido** en lugar de asumir el estado nuevo en el cliente.
- Las transiciones no modifican las líneas ni el total.
- Sin control de concurrencia: si dos acciones llegan a la vez, prevalece la última.
- `cancelar` y `rechazar` son equivalentes. Qué etiqueta mostrar es una decisión de interfaz; una opción coherente con el dominio es "Rechazar" para un pedido `NUEVO` y "Cancelar" para el resto.
- Cancelar es irreversible: no hay operación para reabrir un pedido. Conviene pedir confirmación.

**Dependen de.** AUTH-01, PED-02 o PED-03. **Las consumen.** Detalle y listado de pedidos.

---

## PED-10 a PED-13 — Edición de líneas (fuera del MVP)

Existen, están protegidas y tienen tests, pero **no forman parte del flujo del MVP ni tienen contrato SDD** (`docs/MVP-ROADMAP.md`, R9). Se documentan para que el inventario esté completo. No conviene construir pantallas sobre ellas sin una decisión de producto.

Comunes a las cuatro: sesión `ADMIN`, token CSRF, respuesta **`200 OK` con cuerpo vacío**, y errores `400 VALIDATION_ERROR`, `404 PEDIDO_NOT_FOUND`.

| En qué estados se permite | Agregar línea | Eliminar línea | Modificar cantidad |
|---|---|---|---|
| `NUEVO`, `CONFIRMADO` | Sí | Sí | Sí |
| `EN_PREPARACION` | No | No | Sí |
| `LISTO`, `ENTREGADO`, `CANCELADO` | No | No | No |

Fuera de esos estados: `400 VALIDATION_ERROR`.

### PED-10 — Agregar producto

`POST /pedidos/{id}/productos`

| Campo | Tipo | Requerido | Reglas |
|---|---|---|---|
| `productoId` | number | Sí | Entero JSON. Producto comercial existente y activo |
| `cantidad` | number | Sí | Entero JSON, de 1 a 50 |
| `observacion` | string \| null | No | Máximo 200 |

```json
{ "productoId": 3, "cantidad": 2, "observacion": null }
```

Errores propios: `404 PRODUCTO_COMERCIAL_NOT_FOUND`, `409 PRODUCTO_COMERCIAL_INACTIVO`, `400` si el producto ya está en el pedido o si se superan 20 líneas. Toma el nombre y el precio vigentes en ese momento.

### PED-11 — Agregar combo

`POST /pedidos/{id}/combos`

Igual que PED-10, con `comboId` en lugar de `productoId`.

```json
{ "comboId": 1, "cantidad": 1, "observacion": null }
```

Errores propios: `404 COMBO_COMERCIAL_NOT_FOUND`, `409 COMBO_COMERCIAL_INACTIVO`.

### PED-12 — Eliminar una línea

`DELETE /pedidos/{id}/items/{itemId}` — sin cuerpo. `itemId` es `items[].id`.

`400 VALIDATION_ERROR` si la línea no existe en ese pedido ("Item no encontrado") o si es la última ("Un pedido no puede quedar sin items").

### PED-13 — Modificar la cantidad de una línea

`PATCH /pedidos/{id}/items/{itemId}/cantidad`

```json
{ "cantidad": 3 }
```

| Valor | Efecto |
|---|---|
| 1 a 50 | Fija la cantidad |
| 0 | Elimina la línea; si es la última, `400` |
| Negativo, mayor a 50, o no entero | `400 VALIDATION_ERROR` |

En las cuatro operaciones el servidor recalcula el `total`.

---

## Operaciones que no existen

Estado `PENDIENTE`. No tienen ruta.

| Operación | Observación |
|---|---|
| Consulta pública del estado de un pedido (seguimiento) | Fuera del MVP. El cliente solo tiene la respuesta del alta |
| Marcar un pedido como enviado | El estado `ENVIADO` existe en el enum, sin endpoint |
| Reabrir o deshacer una transición | — |
| Registrar un motivo de cancelación o rechazo | — |
| Editar los datos del cliente o la dirección | — |
| Modificar la observación de una línea existente | — |
| Crear un pedido desde el panel (salón, teléfono) | `POST /pedidos` es el alta web y fija `canal: WEB` |
| Búsqueda, filtro por fecha, orden descendente | — |
| Resumen o estadísticas (cantidad por estado, ventas del día) | Los contadores se derivan de PED-02 |
| Notificaciones en tiempo real | Consulta periódica |
| Pagos | Fuera del MVP |
