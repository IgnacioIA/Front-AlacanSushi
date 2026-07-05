# DTO Catalog

Catálogo oficial de los Data Transfer Objects (DTO) compartidos entre el Frontend y la API.

Este documento define la estructura de los datos intercambiados entre ambos sistemas.

No describe endpoints ni reglas HTTP. Cada DTO puede ser utilizado por uno o varios endpoints documentados en `endpoints.md`.

---

# Convenciones

## Campos obligatorios

Los campos marcados con `*` son obligatorios.

---

## Campos opcionales

Los campos marcados con `?` son opcionales.

---

## Tipos utilizados

| Tipo    | Descripción            |
| ------- | ---------------------- |
| string  | Cadena de texto        |
| number  | Valor numérico         |
| boolean | Verdadero/Falso        |
| object  | Objeto JSON            |
| array   | Colección de elementos |

---

# Dominio

## Estados de un pedido

Los estados oficiales del dominio son:

| Valor     | Descripción                   |
| --------- | ----------------------------- |
| NEW_ORDER | Pedido recién ingresado.      |
| CONFIRMED | Pedido aceptado.              |
| PREPARING | Pedido en preparación.        |
| READY     | Pedido listo.                 |
| SENT      | Pedido despachado (Delivery). |
| DELIVERED | Pedido entregado.             |
| CANCELLED | Pedido cancelado.             |
| REJECTED  | Pedido rechazado.             |

---

## Acciones de workflow

| Acción     | Transición                           |
| ---------- | ------------------------------------ |
| ACCEPT     | NEW_ORDER → CONFIRMED                |
| REJECT     | NEW_ORDER → REJECTED                 |
| PREPARE    | CONFIRMED → PREPARING                |
| MARK_READY | PREPARING → READY                    |
| SEND       | READY → SENT                         |
| DELIVER    | READY → DELIVERED ó SENT → DELIVERED |
| CANCEL     | CONFIRMED → CANCELLED                |

### Reglas

* `SEND` sólo aplica a pedidos DELIVERY.
* `DELIVER` desde READY sólo aplica a pedidos PICKUP.

---

## Tipos de pedido

| Valor    | Descripción         |
| -------- | ------------------- |
| DELIVERY | Envío a domicilio.  |
| PICKUP   | Retiro en el local. |

---

# DTOs

---

## OrderResponseDTO

Representa un pedido obtenido desde la API.

```text
OrderResponseDTO
├── id* : string
├── status* : string
├── orderType* : string
├── paymentMethod* : string
├── customer? : CustomerDTO
├── total* : number
└── items* : OrderItemDTO[]
```

### Observaciones

* `availableActions` no forma parte del DTO.
* `canEdit` no forma parte del DTO.
* Ambos valores son calculados por el Frontend.

---

## CreateOrderRequestDTO

Representa la creación de un pedido.

```text
CreateOrderRequestDTO
├── orderType* : string
├── paymentMethod* : string
├── customer? : CustomerDTO
├── items* : OrderItemDTO[]
└── total* : number
```

### Observaciones

El estado del pedido no forma parte del request.

La API asigna automáticamente el estado inicial.

---

## UpdateOrderRequestDTO

Representa la edición de un pedido existente.

```text
UpdateOrderRequestDTO
├── orderType* : string
├── paymentMethod* : string
├── customer? : CustomerDTO
├── items* : OrderItemDTO[]
└── total* : number
```

### Observaciones

No permite modificar:

* status
* id

Las transiciones de estado pertenecen exclusivamente al workflow.

---

## OrderActionRequestDTO

Representa una acción sobre un pedido.

```text
OrderActionRequestDTO
└── actionId* : string
```

### Valores permitidos

* ACCEPT
* REJECT
* PREPARE
* MARK_READY
* SEND
* DELIVER
* CANCEL

---

## CustomerDTO

Información del cliente.

```text
CustomerDTO
└── name? : string
```

### Observaciones

El cliente puede ser nulo cuando el pedido no se encuentra asociado a un cliente registrado.

---

## OrderItemDTO

Representa un producto dentro de un pedido.

```text
OrderItemDTO
├── id* : string
├── quantity* : number
├── name* : string
└── price* : number
```

---

## ProductDTO

Representa un producto del catálogo.

```text
ProductDTO
├── id* : string
├── name* : string
└── price* : number
```

### Observaciones

Actualmente el Frontend únicamente consume estos campos.

La API podrá extender este DTO incorporando información como:

* categoría
* variantes
* modificadores
* stock
* disponibilidad
* imágenes

El Frontend no debe asumir reglas de negocio sobre estos datos mientras no formen parte del contrato oficial.

---

# Objetos derivados

Los siguientes modelos existen únicamente dentro del Frontend.

No forman parte del contrato con la API.

## AvailableActions

Lista de acciones disponibles para un pedido.

Se calcula utilizando:

* status
* orderType

Nunca es enviada por la API.

---

## CanEdit

Indica si un pedido puede editarse.

Se calcula utilizando los estados permitidos para edición.

Nunca es enviada por la API.

---

# Evolución de los DTO

Todo cambio sobre un DTO compartido debe cumplir las reglas definidas en `versioning.md`.

Ningún campo podrá eliminarse o cambiar su significado sin documentar previamente el impacto sobre el otro sistema.
