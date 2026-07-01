# Integration Contract — OrderPanel

Documento oficial de contrato de integración entre el frontend del módulo **OrderPanel** y la futura API.

Este archivo debe mantenerse sincronizado con la implementación en todo momento.
Toda funcionalidad implementada debe tener su sección correspondiente actualizada antes de cerrar la fase.

---

## Convenciones del documento

- **Frontend Model**: estructura de datos utilizada internamente por el frontend (React state, hooks).
- **Request DTO**: payload enviado hacia la API.
- **Response DTO**: payload recibido desde la API.
- Los campos marcados con `*` son obligatorios.
- Los campos marcados con `?` son opcionales.

---

## Estado del documento por fase

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 0 | Estandarización del dominio | ✅ Completada |
| Fase 1 | Robustez de la capa de datos | ✅ Completada |
| Fase 2 | Infraestructura de modal y formulario | ✅ Completada |
| Fase 3 | Alta manual de pedidos | ✅ Completada |
| Fase 4 | Edición de pedidos | ✅ Completada |
| Fase Final | Estabilización | ✅ Completada |

---

## Dominio — Nomenclatura estandarizada (Fase 0)

Esta sección documenta las convenciones de nombres acordadas para todo el módulo.
No afecta endpoints de API pero establece el vocabulario compartido entre frontend y backend.

### Estados de pedido (`order.status`)

| Valor | Significado |
|-------|-------------|
| `NEW_ORDER` | Pedido recién ingresado, pendiente de aceptación |
| `CONFIRMED` | Pedido aceptado por el operador |
| `PREPARING` | Pedido en preparación en cocina |
| `READY` | Pedido listo para entrega o retiro |
| `SENT` | Pedido enviado (sólo aplica a `orderType: "DELIVERY"`) |
| `DELIVERED` | Pedido entregado al cliente (estado terminal) |
| `CANCELLED` | Pedido cancelado (estado terminal) |
| `REJECTED` | Pedido rechazado (estado terminal) |

### Acciones de workflow (`actionId`)

| Valor | Transición | Descripción |
|-------|-----------|-------------|
| `ACCEPT` | `NEW_ORDER → CONFIRMED` | Acepta el pedido |
| `REJECT` | `NEW_ORDER → REJECTED` | Rechaza el pedido |
| `PREPARE` | `CONFIRMED → PREPARING` | Envía el pedido a cocina |
| `MARK_READY` | `PREPARING → READY` | Marca el pedido como listo |
| `SEND` | `READY → SENT` | Despacha el pedido (sólo DELIVERY) |
| `DELIVER` | `READY → DELIVERED` \| `SENT → DELIVERED` | Confirma entrega al cliente |
| `CANCEL` | `CONFIRMED → CANCELLED` | Cancela el pedido |

**Reglas de workflow:**
- La acción `SEND` sólo está disponible para pedidos con `orderType: "DELIVERY"`.
- La acción `DELIVER` desde el estado `READY` sólo está disponible para pedidos con `orderType: "PICKUP"`.

### Tipos de pedido (`order.orderType`)

| Valor | Descripción |
|-------|-------------|
| `DELIVERY` | Pedido con envío a domicilio |
| `PICKUP` | Pedido para retiro en el local |

### Estados que permiten edición

Un pedido sólo puede editarse si su `status` pertenece al siguiente conjunto:

```
["NEW_ORDER", "CONFIRMED"]
```

Todo pedido en `PREPARING` o posterior tiene prohibida la edición.

Implementado en Fase 4 como `ORDER_EDIT_ALLOWED_STATUSES` en
`constants/orderEditAllowedStatuses.js`.

---

## Capa de servicios — interfaz actual y futura (Fase 1)

### `orderService` — estado actual (Mock)

Hoy `orderService.js` es un módulo singleton con estado mutable en memoria
(`let orders = [...]`) y un mecanismo de pub/sub propio (`subscribeOrders`)
para notificar cambios a `useOrders`.

```
getOrders(): Promise<Order[]>
dispatchOrderAction(orderId, actionId): Promise<Order[]>
subscribeOrders(callback): unsubscribe
createOrder(orderData): Promise<Order[]>        // implementado — Fase 3
updateOrder(orderId, updates): Promise<Order[]> // implementado — Fase 4
```

### `orderService` — interfaz futura (API)

Al integrar la API real, `orderService` deja de mantener estado propio y
pasa a ser una capa de acceso a datos pura (sólo solicitudes HTTP):

| Función actual | Endpoint sugerido | Método |
|---|---|---|
| `getOrders()` | `GET /orders` | GET |
| `dispatchOrderAction(orderId, actionId)` | `POST /orders/:id/actions` | POST |
| `createOrder(orderData)` | `POST /orders` | POST |
| `updateOrder(orderId, updates)` | `PATCH /orders/:id` | PATCH (ver detalle abajo) |
| `subscribeOrders(callback)` | WebSocket / SSE (a definir) | — |

**Cambio de responsabilidad:** el estado de `orders` deja de vivir en el
servicio y pasa a vivir exclusivamente en `useOrders` (React state). El
servicio sólo expone funciones async que resuelven contra la API.

**`subscribeOrders` con API real:** el mecanismo de pub/sub local (array de
`subscribers` notificados de forma síncrona) deberá reemplazarse por un
listener de WebSocket/SSE, o por polling si no hay tiempo real disponible.
La firma pública (`subscribeOrders(callback): unsubscribe`) puede mantenerse
igual desde la perspectiva de `useOrders`, cambiando sólo la implementación
interna.

---

### `GET /orders`

**Objetivo:** Obtener el listado de pedidos activos para el panel.

**Request:** sin body.

**Response DTO (sugerido):**
```json
{
  "orders": [
    {
      "id": "string*",
      "status": "string*",
      "orderType": "string*",
      "paymentMethod": "string*",
      "customer": { "id": "string?", "name": "string?" } ,
      "total": "number*",
      "items": [
        { "id": "string*", "quantity": "number*", "name": "string*", "price": "number*" }
      ]
    }
  ]
}
```

**Campos obligatorios:** `id`, `status`, `orderType`, `paymentMethod`, `total`, `items`.
**Campos opcionales:** `customer` (ver sección "Pedido manual sin cliente").

**Observación:** `availableActions` **no** debe ser parte de la respuesta de
la API — es derivado en el frontend a partir de `status` y `orderType`
mediante `orderWorkflow.js`. Mantener esta responsabilidad en el frontend
evita duplicar la máquina de estados en dos capas. Lo mismo aplica a
`canEdit` (agregado en Fase 4): se deriva en el frontend a partir de
`status` (`ORDER_EDIT_ALLOWED_STATUSES`, ver sección "Estados que permiten
edición") y tampoco debe ser parte de la respuesta de la API.

**Posibles códigos de respuesta:** `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.

---

### `POST /orders/:id/actions`

**Objetivo:** Ejecutar una transición de workflow sobre un pedido existente.

**Request DTO:**
```json
{
  "actionId": "string*"
}
```

`actionId` debe ser uno de los valores documentados en "Acciones de
workflow" (sección Fase 0): `ACCEPT`, `REJECT`, `PREPARE`, `MARK_READY`,
`SEND`, `DELIVER`, `CANCEL`.

**Response DTO:** el pedido actualizado, mismo shape que un elemento de
`GET /orders`.

**Validaciones realizadas por el frontend:** ninguna validación de negocio
— el frontend confía en `orderWorkflow.getNextStatus` sólo para decidir qué
botones mostrar (UX), pero la transición real debe validarse en el backend
(ej.: no aceptar una acción inválida para el estado actual).

**Posibles códigos de respuesta:** `200 OK`, `400 Bad Request` (acción
inválida para el estado actual), `404 Not Found`, `409 Conflict` (el pedido
cambió de estado entre que se cargó y se envió la acción).

**Observaciones para la futura integración:** el frontend actualmente no
maneja `409 Conflict` de forma especial — esto es un riesgo conocido
(ver R5 del Documento Técnico, edición concurrente) a resolver en una fase
posterior.

---

### `PATCH /orders/:id`

**Objetivo:** Actualizar el contenido de un pedido existente (alta vía
edición manual). Implementado en Fase 4.

**Request DTO:** pedido completo (sin operaciones incrementales, decisión
aprobada — ver "Decisiones aprobadas" en memoria de proyecto):
```json
{
  "orderType": "string*",
  "paymentMethod": "string*",
  "customer": { "name": "string?" },
  "items": [
    { "id": "string*", "quantity": "number*", "name": "string*", "price": "number*" }
  ],
  "total": "number*"
}
```

**Response DTO:** el pedido actualizado, mismo shape que un elemento de
`GET /orders`.

**Campo `status`:** **no** forma parte del request — `PATCH /orders/:id`
nunca modifica el estado del pedido; las transiciones de estado siguen
siendo responsabilidad exclusiva de `POST /orders/:id/actions`. Mantener
esta separación evita que la edición manual pueda saltarse la máquina de
estados.

**Validaciones realizadas por el frontend:** sólo se permite invocar esta
acción si `order.canEdit` es `true` (derivado de `status` vía
`ORDER_EDIT_ALLOWED_STATUSES`); el botón de edición no se renderiza en caso
contrario. La validación de negocio real (rechazar la edición si el estado
cambió en el backend entre que se abrió el formulario y se envió) debe
hacerse en el backend.

**Posibles códigos de respuesta:** `200 OK`, `400 Bad Request` (payload
inválido), `404 Not Found`, `409 Conflict` (el pedido dejó de ser editable
entre que se abrió el formulario y se envió — mismo riesgo conocido R5
mencionado arriba, no manejado especialmente por el frontend aún).

---

## Catálogo de productos (Fase 1)

### Filosofía de integración

El catálogo de productos es un dominio propio de la API. El frontend
**no define ni modela su estructura de negocio** — sólo consume y renderiza
los campos que la API entregue. `mockProducts.js` y `productService.js`
fueron construidos respetando esta filosofía: contienen únicamente los
campos mínimos indispensables para que el formulario de pedidos (Fase 2)
pueda funcionar.

> **[REQUIERE DEFINICIÓN POR LA API]** La estructura real del catálogo
> (categorías, modificadores, disponibilidad/stock, variantes, imágenes,
> etc.) debe ser confirmada por el equipo de backend. El modelo a
> continuación es **provisional** y cubre sólo lo necesario para Fase 2.

### `GET /products`

**Objetivo:** Obtener el catálogo de productos disponible para construir pedidos manuales.

**Request:** sin body.

**Response DTO (provisional, sujeto a confirmación):**
```json
{
  "products": [
    { "id": "string*", "name": "string*", "price": "number*" }
  ]
}
```

**Frontend Model (provisional):**
```
Product {
  id: string | number
  name: string
  price: number
}
```

**Campos obligatorios:** `id`, `name`, `price`.
**Campos opcionales:** ninguno definido aún — pendiente de confirmación de la API.

**Posibles códigos de respuesta:** `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.

**Observaciones para la futura integración:** si la API expone campos
adicionales (categoría, stock, variantes), el frontend deberá extender este
contrato sin asumir reglas de negocio sobre ellos (por ejemplo: no decidir
en el frontend si un producto "está disponible" — ese estado debe venir
resuelto desde la API).

---

## Manejo de errores (Fase 1)

`useOrders` expone `{ loading, error, columns, dispatchOrderAction }`.

- `error` se establece en `"No se pudieron cargar los pedidos."` si falla la
  carga inicial (`GET /orders`).
- `error` se establece en `"No se pudo actualizar el pedido."` si falla el
  despacho de una acción (`POST /orders/:id/actions`).
- `error` se limpia (`null`) en cada operación exitosa subsiguiente.

**Observación de alcance:** en esta fase el estado `error` queda expuesto
por el hook pero **no se renderiza en `OrderPanel.jsx`** — la fase 1 no
incorpora UI nueva según el roadmap aprobado. El consumo visual de este
estado (mensaje, toast, etc.) queda pendiente para cuando exista
infraestructura de notificaciones (ver Oportunidades de mejora del
Documento Técnico).

---

## Infraestructura de modal y formulario (Fase 2)

*Esta fase construye la base compartida de alta y edición de pedidos.
No conecta con el servicio: `createOrder`/`updateOrder` aún no existen
(Fase 3 y Fase 4 respectivamente). El botón "Guardar" del formulario está
operativo en su validación, pero su `onSubmit` está temporalmente apuntado
a `closeModal` como placeholder.*

### Estructura creada

```
hooks/
├── useOrderPanel.js   # { isModalOpen, editingOrder, formSessionId, openCreateModal, openEditModal, closeModal }
└── useOrderForm.js    # { orderType, paymentMethod, customerName, items, addItem, removeItem,
                        #   updateItemQuantity, total, isValid, buildOrderPayload }
components/
├── OrderFormModal/    # Wrapper de modal: overlay, ESC, click-fuera, animación, foco automático, scroll interno
├── OrderForm/          # Compone los siguientes, formulario único para alta y edición
├── ProductSelector/    # Lista el catálogo (productService.getProducts()) y agrega ítems
└── OrderItemList/      # Lista los ítems del pedido en construcción, +/-, quitar
constants/
└── paymentMethods.js   # PAYMENT_METHODS: lista provisional de strings (ver nota de dominio abajo)
```

`OrderPanel.jsx` ahora instancia `useOrderPanel()` y renderiza
`<OrderFormModal>` de forma condicional. **No existe aún ningún disparador
visible** (botón "Nuevo pedido" en `PanelHeader` y botón de edición en
`OrderHeader` son responsabilidad de Fase 3 y Fase 4 respectivamente) —
por diseño, conforme al roadmap aprobado.

### `useOrderForm` — payload de salida (`buildOrderPayload`)

```
{
  orderType: "PICKUP" | "DELIVERY",
  paymentMethod: string,
  customer: { name: string } | null,
  items: [{ id, name, price, quantity }],
  total: number
}
```

Este es el shape que `onSubmit` recibirá — en Fase 3 se conectará a
`orderService.createOrder(payload)`, en Fase 4 a
`orderService.updateOrder(orderId, payload)`. Confirma la decisión
aprobada: el submit siempre entrega el pedido completo, sin operaciones
incrementales.

### Decisión de remount vs. reseteo por efecto

`useOrderForm` inicializa su estado con `useState(initialData?.x ?? …)` y
**no** usa un `useEffect` para resetear el estado cuando `initialData`
cambia (eso dispara la regla `react-hooks/set-state-in-effect` —
confirmado por ESLint — y genera renders en cascada innecesarios). En su
lugar, `OrderPanel.jsx` le pasa `key={formSessionId}` a `<OrderForm>`,
donde `formSessionId` se incrementa en cada `openCreateModal`/
`openEditModal`. Esto fuerza un remount limpio del formulario en cada
apertura, incluso entre dos aperturas consecutivas en modo creación.

### Nota de dominio: `paymentMethod`

`PAYMENT_METHODS` (`constants/paymentMethods.js`) es una lista de strings
en español definida por el frontend para poblar el selector, **no** una
estandarización de dominio — `paymentMethod` no formó parte del alcance de
Fase 0 y sigue siendo un string libre en `mockOrders.js` (ej.:
`"Mercado Pago"`). Pendiente de definición formal si la API termina
modelándolo como un enum.

### Verificación de esta fase

- `npx vite build` y `npx eslint src/components/OrderPanel`: limpios.
- **Limitación conocida:** no hay herramienta de automatización de
  navegador disponible en este entorno, por lo que el criterio "el modal
  abre y cierra correctamente" se verificó mediante revisión de código
  (lógica de overlay/ESC/clases CSS) y no mediante prueba visual
  interactiva. Recomendado verificar manualmente en el navegador la primera
  vez que exista un disparador real (Fase 3).
- Detectado y corregido durante esta fase: error de lint
  `react-hooks/set-state-in-effect` en el primer borrador de
  `useOrderForm.js` (ver decisión de remount arriba).
- Detectado, no corregido (fuera de alcance): `OrderCard.jsx` importa
  `useState` sin usarlo (`no-unused-vars`) — preexistente a esta fase,
  candidato para Fase Final.

---

## Alta manual de pedidos (Fase 3)

*Esta fase conecta el formulario construido en Fase 2 con el servicio,
habilitando la creación de pedidos manuales desde el panel.*

### Cambios

```
services/orderService.js
└── createOrder(orderData): Promise<Order[]>
    - Genera id: Math.max(...orders.map(o => o.id), 0) + 1 (estrategia de mock,
      no aplica una vez exista la API real, que asignará el id)
    - status inicial: "NEW_ORDER" (todo pedido manual ingresa como nuevo,
      igual que un pedido recibido por cualquier otro canal)
    - Copia orderType, paymentMethod, customer, total, items desde orderData
      (el shape exacto que entrega useOrderForm.buildOrderPayload(), ver
      sección Fase 2)
    - Empuja al array `orders`, notifica subscribers, retorna getOrders()
      (mismo patrón de retorno que dispatchOrderAction, por consistencia)

hooks/useOrders.js
└── createOrder(orderData): Promise<void>
    - Envuelve orderService.createOrder con try/catch
    - error = "No se pudo crear el pedido." si falla

components/PanelHeader/PanelHeader.jsx
└── Recibe prop `onCreateOrder`, renderiza botón "+ Nuevo pedido"
    (min-height 44px, color de marca #ff7b00, ver PanelHeader.css)

OrderPanel.jsx
└── Conecta: PanelHeader.onCreateOrder = useOrderPanel.openCreateModal
    OrderForm.onSubmit = handleCreateOrder, que llama
    useOrders.createOrder(orderData) y luego closeModal()
```

### Flujo completo

1. Usuario hace click en "+ Nuevo pedido" (`PanelHeader`) →
   `useOrderPanel.openCreateModal()` → `editingOrder = null`,
   `isModalOpen = true`, `formSessionId++`.
2. `OrderFormModal` se abre con título "Nuevo pedido"; `OrderForm` se
   remonta limpio (sin datos previos) por el cambio de `formSessionId`.
3. Usuario completa tipo de pedido, método de pago, cliente (opcional) y
   agrega productos vía `ProductSelector`.
4. Al enviar (`isValid` true: al menos un ítem y método de pago no vacío),
   `buildOrderPayload()` arma el payload y se invoca
   `orderService.createOrder(payload)`.
5. `orderService` agrega el pedido con `status: "NEW_ORDER"` y notifica a
   los subscribers; `useOrders` (suscrito desde su `useEffect` inicial)
   actualiza su estado `orders`, lo que recalcula `columns` y renderiza el
   nuevo pedido en la columna `NEW_ORDER` sin recargar la página.
6. El modal se cierra (`closeModal()`).

### Nota de alcance: rama de edición en `OrderPanel.jsx`

`OrderForm.onSubmit` está conectado únicamente a `handleCreateOrder` en
esta fase. No se agregó una rama condicional para `editingOrder` (modo
edición) porque `updateOrder` todavía no existe y el único disparador de
apertura del modal hasta ahora es el botón de creación — `editingOrder`
nunca es distinto de `null` en el flujo real actual. Esa rama se agregará
en Fase 4 junto con `useOrders.updateOrder`, evitando lógica condicional
sin función real (implementación a medias) en esta fase.

### Verificación de esta fase

- `npx vite build` y `npx eslint src/components/OrderPanel --max-warnings 0`:
  limpios.
- Trazado manual del flujo completo por revisión de código (ver "Flujo
  completo" arriba), confirmando que `mapOrderToCard` (en
  `OrderCard/model/orderCardMapper.js`) y `OrderMeta.jsx` consumen
  correctamente el shape del pedido creado (incluyendo `customer: null`
  para pedidos sin cliente, manejado con `customer?.name`).
- **Limitación conocida (igual que en Fase 2):** no hay herramienta de
  automatización de navegador en este entorno; se intentó además una
  verificación funcional vía script Node standalone importando
  `orderService.js` directamente, mecanismo descartado porque Node ESM no
  resuelve imports sin extensión (`"../mocks/mockOrders"`) — eso es una
  capacidad de resolución específica de Vite, no un error del código.
  Recomendado verificar visualmente en el navegador el flujo de creación
  de principio a fin en la próxima oportunidad.

---

## Edición de pedidos (Fase 4)

*Esta fase reutiliza el `OrderForm` de Fase 2 en modo edición, conectándolo
con `updateOrder`, y agrega el segundo disparador del modal (`OrderHeader`,
Opción A aprobada).*

### Cambios

```
constants/orderEditAllowedStatuses.js (nuevo)
└── ORDER_EDIT_ALLOWED_STATUSES = ["NEW_ORDER", "CONFIRMED"]

services/orderService.js
├── isEditable(order) — helper interno, ORDER_EDIT_ALLOWED_STATUSES.includes(order.status)
├── getOrders() y notifySubscribers() ahora agregan canEdit: isEditable(order)
│   al objeto de pedido (mismo lugar y patrón que availableActions)
└── updateOrder(orderId, updates): Promise<Order[]>
    - Reemplaza orderType, paymentMethod, customer, items, total
    - NO modifica status (las transiciones siguen siendo exclusivas de
      dispatchOrderAction/orderWorkflow)
    - notifySubscribers() + retorna getOrders(), mismo patrón que createOrder

hooks/useOrders.js
└── updateOrder(orderId, updates): Promise<void>
    - Wrapper try/catch, error = "No se pudo actualizar el pedido."
      (mismo mensaje que dispatchOrderAction, ambas son "actualizar")

model/orderCardMapper.js (OrderCard)
└── mapOrderToCard agrega canEdit: order.canEdit al modelo de UI

ui/OrderHeader/OrderHeader.jsx (OrderCard)
└── Recibe canEdit, onEdit; renderiza botón "✎" (44×44px) como hermano del
    botón de toggle (no anidado, sin necesidad de stopPropagation) —
    visible sólo si canEdit es true

OrderCard.jsx
└── Recibe onEdit; handleEdit() llama onEdit(order) con el pedido completo
    (no el modelo de UI); pasa canEdit={card.canEdit} y onEdit={handleEdit}
    a OrderHeader

OrderColumn.jsx
└── Recibe onEdit, lo reenvía a cada OrderCard

OrderPanel.jsx
└── Pasa onEdit={openEditModal} a cada OrderColumn
    Unifica el submit del formulario: handleCreateOrder (Fase 3) se
    reemplaza por handleSubmit(orderData), que llama updateOrder si
    editingOrder existe, o createOrder si no, y luego closeModal()
```

### Por qué `canEdit` se calcula en `orderService.js` y no en `OrderCard`

`OrderCard` es un componente de presentación que no importa nada de
`OrderPanel` (mismo patrón ya usado por `availableActions`, resuelto en el
servicio y consumido tal cual por `OrderActions`). Calcular `canEdit` en
`orderService.js` y exponerlo ya resuelto evita acoplar `OrderCard` a las
constantes de dominio de `OrderPanel`, preservando la separación existente
en vez de introducir una nueva dependencia cruzada entre carpetas.

### Ajuste de layout en `OrderHeader.css`

`.OrderHeader-Toggle` pasó de `width: 100%` a `flex: 1; min-width: 0`, para
dejar espacio al nuevo botón de edición como hermano dentro del mismo
`<header>` flex. El botón de toggle no se modificó en su comportamiento ni
estructura interna — sólo el ancho que ocupa dentro del header.

### Flujo completo

1. Un pedido con `status` en `["NEW_ORDER", "CONFIRMED"]` muestra el botón
   "✎" en su `OrderHeader`.
2. Click en "✎" → `OrderCard.handleEdit()` → `onEdit(order)` (pedido
   completo) → `useOrderPanel.openEditModal(order)` → `editingOrder =
   order`, `isModalOpen = true`, `formSessionId++`.
3. `OrderFormModal` abre con título `Editar pedido #{id}`; `OrderForm` se
   remonta (por `formSessionId`) con `initialData = editingOrder`,
   precargando tipo de pedido, método de pago, cliente e ítems.
4. Usuario modifica campos/ítems y guarda (`isValid` true) →
   `buildOrderPayload()` arma el pedido completo →
   `OrderPanel.handleSubmit` detecta `editingOrder` no nulo → llama
   `useOrders.updateOrder(editingOrder.id, orderData)`.
5. `orderService.updateOrder` reemplaza los campos editables (manteniendo
   `status` intacto) y notifica subscribers; `useOrders` actualiza su
   estado, recalculando `columns` — el pedido refleja los cambios
   (ej.: nuevo total, nuevos ítems) sin recargar la página y sin cambiar de
   columna (editar no transiciona estado).
6. El modal se cierra (`closeModal()`).

### Verificación de esta fase

- `npx vite build`: limpio.
- `npx eslint src/components/OrderPanel src/components/OrderCard
  --max-warnings 0`: un único error preexistente, ya documentado en Fase 2
  y Fase 3 (`OrderCard.jsx` importa `useState` sin usarlo) — no introducido
  ni modificado en esta fase, candidato a Fase Final.
- Trazado manual del flujo completo por revisión de código (ver "Flujo
  completo" arriba), confirmando compatibilidad de shape entre
  `mockOrders.js` (`customer.name`, `items[].{id,quantity,name,price}`) y
  lo que `useOrderForm` espera como `initialData`.
- **Limitación conocida (igual que Fases 2 y 3):** no hay herramienta de
  automatización de navegador en este entorno; no hubo prueba visual
  interactiva del flujo de edición de principio a fin.

---

## Estabilización final (Fase Final)

*Esta fase no agrega funcionalidad. Limpia código muerto, elimina
referencias de tarea en comentarios y deja el módulo en estado listo para
integración con API real.*

### Cambios

```
src/components/OrderCard/OrderCard.jsx
└── Eliminado `import { useState } from "react"` — era un import huérfano
    preexistente; el estado de la tarjeta (expanded) vive en useOrderCard().

src/components/OrderPanel/mocks/mockOrders.js
└── Eliminados los arrays `availableActions` de cada mock. Eran código muerto:
    orderService.getOrders() y notifySubscribers() los sobreescriben con
    buildAvailableActions(order) en cada llamada, haciendo irrelevante el
    valor inicial hardcodeado en el mock.

src/components/OrderPanel/components/OrderForm/OrderForm.jsx
└── Limpiados los nombres de fase ("Fase 3", "Fase 4") del comentario de
    cabecera. Referencias a tareas pertenecen al historial de commits, no al
    código fuente.
```

### Hallazgos sin cambio (decisiones conscientes)

- **Columna SENT ausente en ORDER_COLUMNS**: las columnas del panel cubren
  `NEW_ORDER`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`. El estado
  `SENT` no tiene columna asignada — los pedidos en ese estado no aparecen
  en el panel (el guard `if (grouped[order.status])` en `useOrders.js` los
  omite silenciosamente). Esta es una decisión de diseño preexistente al
  roadmap, no una omisión de las fases. Queda pendiente de definición de
  producto.

- **Columnas CANCELLED y REJECTED ausentes**: misma decisión; los estados
  terminales no se muestran en el panel. Sin cambios.

- **`mockOrders.js` / `mockProducts.js` siguen en codebase**: son datos de
  desarrollo necesarios hasta que exista la API real. Su remoción es
  responsabilidad de la fase de integración con backend, fuera del alcance
  de este roadmap.

- **Limitación de prueba visual no resuelta**: sigue sin haber herramienta
  de automatización de navegador en este entorno. El flujo completo
  (crear pedido → aparece en panel / editar pedido → refleja cambios)
  queda pendiente de verificación manual antes del primer despliegue.

### Verificación final

- `npx vite build`: limpio.
- `npx eslint src/components/OrderPanel src/components/OrderCard
  --max-warnings 0`: limpio — el error `no-unused-vars` de `useState` en
  `OrderCard.jsx` ya no existe.
- Revisión completa de imports en todos los archivos del módulo: sin
  imports huérfanos adicionales.
- Revisión de nomenclatura: todos los identificadores siguen las
  convenciones de Fase 0 (status, acciones, constantes, hooks, servicios).
- Revisión de comentarios: sin referencias a fases ni a tareas. El único
  comentario funcional restante (`useOrderForm.js`, sobre el patrón de
  remount vía `key`) explica un invariante no obvio que un lector futuro
  necesita conocer.

---

*Última actualización: Fase Final — Estabilización. Documento completo y sincronizado.*
