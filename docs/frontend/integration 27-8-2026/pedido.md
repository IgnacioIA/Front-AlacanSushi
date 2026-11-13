---
id: DOM-PEDIDO
type: domain-spec
spec_status: DRAFT
version: "1.0"
---

# Pedido (+ ItemPedido, ItemProducto, ItemCombo)

Estado: `DRAFT` — primera Domain Spec formal de `Pedido`. `implementation_status: IMPLEMENTED (domain), VERIFIED (api)` para las capacidades cubiertas por esta especificación (creación, agregar producto/combo, listar, obtener, confirmar, cancelar/rechazar), desde la tarea "Cierre de Etapa 1 — Comercial + Catálogo + Pedido" (2026-08-27).

**Alcance de este documento — importante:** no es un backfill completo de todo `Pedido` (11 operaciones, máquina de estados completa desde `NUEVO` hasta `ENTREGADO`). Documenta lo necesario para dejar trazables los cambios de esta tarea: el modelo de datos del comprador, el patrón de snapshot hacia Comercial, y el mapeo de "rechazar". El resto del comportamiento de `Pedido` (modificar cantidad, eliminar ítem, pasar a preparación, marcar listo/entregado) sigue siendo deuda documental preexistente (`docs/SDD-PANEL-API-ROADMAP.md` §7), no agrandada ni resuelta acá.

Fuente: código (`Pedido.domain.model.*`, `Pedido.application.*`), decisiones explícitas de sesión 2026-08-27.

## Concept

Qué pidió el cliente y en qué estado está — responde la pregunta ya fijada en `docs/V1-DOMAIN-MODEL.md` §4.4. No conoce cómo se produce nada (frontera con Producción) ni depende de que la oferta comercial vigente siga siendo la misma que cuando se creó (frontera con Comercial — ver Business Rules).

## Identity

`id` autogenerado.

## Attributes

| Atributo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `estado` | `EstadoPedido` | — | Ver States |
| `tipoPedido` | `TipoPedido` (`SALON`\|`DELIVERY`\|`TAKEAWAY`) | Sí | — |
| `canal` | `CanalPedido` (`TOTEM`\|`APP_MOVIL`\|`WEB`\|`MOZO`) | Sí | Atributo del pedido, no un tipo — independencia de canal ya lograda antes de esta tarea (`V1-DOMAIN-MODEL.md` §8) |
| `nombreCliente` | String | Sí | **Cambio de esta tarea** — ver Business Rules |
| `telefonoCliente` | String | Sí | **Cambio de esta tarea** — ver Business Rules |
| `direccion` | String | Solo si `tipoPedido = DELIVERY` | — |
| `items` | Lista de `ItemPedido` | — | Ver Relationships |
| `total` | Decimal | — | Recalculado en cada cambio de `items`, nunca fijado manualmente |

## Behavior (cubierto por esta tarea)

- `Pedido(tipoPedido, canal, direccion, nombreCliente, telefonoCliente)` — valida `nombreCliente`/`telefonoCliente` no vacíos; valida `direccion` obligatoria si `DELIVERY`.
- `agregarProducto(productoId, nombre, precio, cantidad, observacion)` — **firma cambiada en esta tarea** (antes recibía una entidad `Catalogo.Producto` completa). Ver Business Rules, "Snapshot, no referencia viva".
- `agregarCombo(comboId, nombre, precio, cantidad, observacion)` — mismo cambio.
- `confirmar()` — sin cambios: solo transición de estado, sin verificar stock/disponibilidad/producción (`DECIDIDO`, ver sección "Confirmación en Etapa 1").
- `cancelar()` — sin cambios en el dominio; expuesto además como `POST /pedidos/{id}/rechazar` (mismo método, ver Business Rules "Rechazar").

## Invariants

Sin invariantes nuevas introducidas por esta tarea — las validaciones de `nombreCliente`/`telefonoCliente` (no vacíos) y de `direccion` (obligatoria si `DELIVERY`) ya existían en forma equivalente para los campos que reemplazan.

## States

Sin cambios — `NUEVO → CONFIRMADO → EN_PREPARACION → LISTO → (ENVIADO si DELIVERY) → ENTREGADO`, con rama `CANCELADO` desde cualquier estado salvo `ENTREGADO`. Instrucción explícita de esta tarea: no modificar esta máquina de estados.

## Relationships

- `1` Pedido → `0..*` ItemPedido (`ItemProducto` | `ItemCombo`, herencia `SINGLE_TABLE`).
- `Pedido` ⇢ **(solo en el momento de agregar un ítem, vía la capa de aplicación)** `Comercial.ProductoComercial` / `Comercial.ComboComercial` — resuelto por `AgregarProductoAlPedido`/`AgregarComboAlPedido`, nunca por el agregado `Pedido` en sí. **El dominio de `Pedido` no importa ningún tipo de `Comercial` ni de `Catalogo`** — recibe únicamente primitivos ya resueltos (`id`, `nombre`, `precio`). Ver Business Rules.
- `Pedido` no tiene relación con `Produccion` ni con `Stock` — confirmado, sin cambios de esta tarea.

## Business Rules

### Snapshot, no referencia viva

`ItemProducto`/`ItemCombo` conservan `productoId`/`comboId` (referencia informativa, nunca re-consultada en lecturas posteriores) + `nombre` + `precio` tomados en el momento de agregarse. Ya estaba implementado así contra `Catalogo`; se migró la fuente a `Comercial` sin tocar este comportamiento. **El precio nunca se confía al Frontend** — `AgregarProductoRequest`/`AgregarComboRequest` no tienen campo `precio`; el único dato que viaja desde el cliente es el id y la cantidad, y el precio se resuelve siempre server-side contra el Producto/Combo Comercial vigente. Verificado: `AgregarProductoAlPedidoApiTest.modificarElProductoComercialDespuesNoAlteraElPedidoYaCreado`.

### Datos del comprador (`nombreCliente`/`telefonoCliente`)

Reemplazan a `clienteId` (`Long` sin ninguna entidad `Cliente` detrás — hallazgo ya registrado en `docs/V1-SCOPE.md` §11, cerrado en esta tarea). Decisión explícita: estructura mínima acotada al MVP — sin entidad `Cliente`, sin autenticación, sin cuentas, sin historial, sin CRM. Suficiente para que recepción reciba el pedido y el frontend arme el mensaje de WhatsApp (consigna de esta tarea, secciones 11-12).

### Confirmación en Etapa 1

`confirmar()` significa únicamente "recepción acepta el pedido recibido" — no verifica stock, disponibilidad, producción ni recetas. Esa verificación pertenece a Etapa 2 (`docs/V1-SCOPE.md` §8, reafirmado explícitamente en esta tarea, sección 1). Sin cambios de código — ya era así.

### Rechazar

No existe un estado `RECHAZADO`. `POST /pedidos/{id}/rechazar` invoca la misma transición `cancelar()` ya existente — decisión explícita para no modificar las invariantes de estado de `Pedido` (instrucción de esta tarea). Si en el futuro el negocio necesita distinguir "cancelado por el cliente" de "rechazado por recepción" con comportamiento realmente distinto (reportes, métricas), es una decisión nueva, no tomada acá.

## Related Requirements

- [REQ-COM-004](../01-requirements/REQ-COM-004-integrar-comercial-con-pedido.md)

## Related Domain

- [`producto-comercial.md`](producto-comercial.md), [`combo-comercial.md`](combo-comercial.md) (fuente del snapshot)

## Related Tests

`CrearPedidoApiTest` (5), `AgregarProductoAlPedidoApiTest` (4), `AgregarComboAlPedidoApiTest` (2), `ListarYObtenerPedidoApiTest` (4), `ConfirmarCancelarRechazarPedidoApiTest` (4) — 19/19 en verde. Cubren lo descrito en este documento; **no** cubren `ModificarCantidad`, `EliminarItemService`, `PasarAEnPreparacionService`, `MarcarComoListoService`, `MarcarComoEntregadoService` — fuera del alcance de esta tarea, siguen sin test (deuda preexistente, sin agrandar).

## Deuda técnica relacionada, no resuelta en esta tarea

- `Pedido.domain.service.CalculadorConsumoIngredientes` sigue importando `Catalogo` — es código muerto (nunca se instancia como bean, nunca se invoca), no forma parte del flujo activo migrado. Ver `docs/09-traceability/traceability.md`, registro de gaps.
- Sin contrato SDD propio en `05-contracts/api/` para ningún endpoint de `Pedido` — deuda documental preexistente, no agrandada.
- Sin tests para `ModificarCantidad`, `EliminarItemService`, `PasarAEnPreparacionService`, `MarcarComoListoService`, `MarcarComoEntregadoService`.
