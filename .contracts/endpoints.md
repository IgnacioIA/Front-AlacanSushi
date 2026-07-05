# Endpoints

Catálogo oficial de endpoints utilizados por el Frontend.

Este documento describe el comportamiento funcional de cada operación disponible en la API.

La estructura detallada de Request y Response DTO se documenta en `dto-catalog.md`.

---

# Orders

---

## Obtener pedidos

### Endpoint

```
GET /orders
```

### Objetivo

Obtener el listado de pedidos activos que serán representados en el panel.

### Request

Sin body.

### Response

Devuelve la colección completa de pedidos activos.

La estructura del objeto `OrderResponseDTO` se encuentra documentada en `dto-catalog.md`.

### Reglas

* Debe devolver únicamente el estado persistido del pedido.
* No debe calcular información exclusiva de la interfaz.
* `availableActions` no forma parte del contrato.
* `canEdit` no forma parte del contrato.
* Ambas propiedades son derivadas por el Frontend utilizando las reglas de workflow.

### Posibles respuestas

| Código | Significado                |
| ------ | -------------------------- |
| 200    | Operación exitosa          |
| 401    | Usuario no autenticado     |
| 500    | Error interno del servidor |

---

## Ejecutar una acción sobre un pedido

### Endpoint

```
POST /orders/{id}/actions
```

### Objetivo

Ejecutar una transición de estado sobre un pedido existente.

### Request

Recibe un `OrderActionRequestDTO`.

La estructura completa se documenta en `dto-catalog.md`.

### Response

Devuelve el pedido actualizado.

### Reglas

Las acciones válidas son:

* ACCEPT
* REJECT
* PREPARE
* MARK_READY
* SEND
* DELIVER
* CANCEL

El Frontend utiliza estas acciones únicamente para decidir qué botones mostrar.

La validación real de la transición pertenece exclusivamente a la API.

La API debe rechazar cualquier transición inválida, incluso si el Frontend permitió ejecutarla.

### Posibles respuestas

| Código | Significado                                                |
| ------ | ---------------------------------------------------------- |
| 200    | Operación exitosa                                          |
| 400    | Acción inválida                                            |
| 404    | Pedido inexistente                                         |
| 409    | El pedido cambió de estado antes de completar la operación |

---

## Actualizar pedido

### Endpoint

```
PATCH /orders/{id}
```

### Objetivo

Actualizar la información editable de un pedido.

### Request

Recibe un `UpdateOrderRequestDTO`.

La estructura completa se encuentra documentada en `dto-catalog.md`.

### Response

Devuelve el pedido actualizado.

### Reglas

Esta operación modifica únicamente:

* Tipo de pedido
* Método de pago
* Cliente
* Productos
* Cantidades
* Total

Esta operación nunca modifica el estado del pedido.

Las transiciones de estado son responsabilidad exclusiva de:

```
POST /orders/{id}/actions
```

El Frontend únicamente permite editar pedidos que considere editables.

La API debe volver a validar esta condición antes de persistir los cambios.

### Posibles respuestas

| Código | Significado                    |
| ------ | ------------------------------ |
| 200    | Operación exitosa              |
| 400    | Request inválido               |
| 404    | Pedido inexistente             |
| 409    | El pedido dejó de ser editable |

---

# Products

---

## Obtener catálogo

### Endpoint

```
GET /products
```

### Objetivo

Obtener el catálogo de productos disponible para construir pedidos.

### Request

Sin body.

### Response

Devuelve el catálogo completo de productos.

La estructura del `ProductDTO` se documenta en `dto-catalog.md`.

### Reglas

El catálogo pertenece completamente al dominio de la API.

El Frontend únicamente consume la información necesaria para renderizar la interfaz.

No debe asumir reglas de negocio relacionadas con:

* disponibilidad
* stock
* categorías
* variantes
* modificadores

Estas reglas deben llegar resueltas desde la API.

### Posibles respuestas

| Código | Significado                |
| ------ | -------------------------- |
| 200    | Operación exitosa          |
| 401    | Usuario no autenticado     |
| 500    | Error interno del servidor |

---

# Consideraciones generales

## Estado del dominio

Los estados oficiales del pedido pertenecen al dominio de la API.

El Frontend puede utilizarlos para construir la interfaz, pero no debe modificarlos.

---

## Responsabilidad de validación

El Frontend puede validar datos para mejorar la experiencia del usuario.

La API siempre debe realizar nuevamente todas las validaciones antes de ejecutar cualquier operación.

---

## Tiempo real

Cuando la sincronización deje de realizarse mediante mocks y pase a utilizar WebSocket o Server-Sent Events, las operaciones documentadas en este archivo continuarán siendo la referencia funcional del contrato.

La tecnología utilizada para sincronizar datos no modifica el comportamiento esperado de los endpoints.
