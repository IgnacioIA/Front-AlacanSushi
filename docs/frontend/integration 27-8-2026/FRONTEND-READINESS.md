# Preparación del Backend para los Frontends de Etapa 1

Versión: 1.0
Estado: `DRAFT` — informe de cierre de la tarea "Cierre de Etapa 1 — Comercial + Catálogo + Pedido" (2026-08-27).
Alcance: describe el estado real del backend tal como quedó implementado — **no implementa ningún frontend**, es la referencia para cuando esa implementación empiece (instrucción explícita: "no comenzar inmediatamente a escribir frontend").

---

## A. Frontend público

### Flujo

```text
GET /catalogo
    ↓ renderización
carrito local (100% responsabilidad del frontend, no existe en la API)
    ↓ checkout
POST /pedidos  →  POST /pedidos/{id}/productos | /combos  (uno por cada línea del carrito)
    ↓
GET /pedidos/{id}  (para confirmar al usuario qué quedó registrado)
    ↓
frontend construye el texto y abre WhatsApp — la API no participa de este paso
```

### Endpoints que consume

| Endpoint | Método | Para qué |
|---|---|---|
| `/catalogo` | `GET` | Traer productos y combos publicados (contrato: [`comercial-public/catalogo-publico.md`](05-contracts/api/comercial-public/catalogo-publico.md)) |
| `/pedidos` | `POST` | Crear el pedido — `tipoPedido`, `canal` (usar `WEB`), `direccion` (solo si `DELIVERY`), `nombreCliente`, `telefonoCliente` |
| `/pedidos/{id}/productos` | `POST` | Agregar un Producto Comercial al pedido — `productoId`, `cantidad`, `observacion` opcional. **Sin campo de precio** |
| `/pedidos/{id}/combos` | `POST` | Agregar un Combo Comercial — `comboId`, `cantidad`, `observacion` opcional. **Sin campo de precio** |
| `/pedidos/{id}` | `GET` | Confirmar el pedido creado (nombre/precio/subtotal/total ya resueltos por la API) antes de armar el mensaje de WhatsApp |

### Qué información recibe

De `/catalogo`: `id`, `tipo` (`PRODUCTO`\|`COMBO`), `nombre`, `descripcion`, `precio`, `imagen`, y para combos `componentes` (`productoId`, `nombre`, `cantidad`). De `/pedidos/{id}`: el pedido completo con `items[]` ya resueltos (`nombre`, `precioUnitario`, `cantidad`, `subtotal`) y `total`.

### Qué debe mantener localmente

El carrito completo (selección + cantidades) hasta el checkout — no existe ningún endpoint de "carrito" en la API, es una decisión ya cerrada (`docs/V1-SCOPE.md`, `docs/V1-COMMERCIAL-CATALOG.md` §11).

### Qué NO debe intentar obtener

Nada de Producción: ingredientes, recetas, stock, costos internos, disponibilidad productiva — ninguno de esos datos existe en `/catalogo` ni en ningún endpoint público (frontera ya fijada en `docs/V1-DOMAIN-MODEL.md`). Tampoco debe consumir ningún endpoint bajo `/admin/**` — la separación es exigida por la consigna de esta tarea, sección 14, y estructural (`/admin/comercial/**` no tiene ninguna razón para responderle a un cliente público, aunque hoy no hay autenticación que lo bloquee — ver Riesgos).

---

## B. Frontend administrativo (Panel)

### Productos Comerciales

| Endpoint | Método |
|---|---|
| `/admin/comercial/productos` | `POST` (crear), `GET` (listar, incluye inactivos) |
| `/admin/comercial/productos/{id}` | `PUT` (modificar), `GET` (detalle) |
| `/admin/comercial/productos/{id}/activar` | `POST` |
| `/admin/comercial/productos/{id}/desactivar` | `POST` — puede devolver `409 PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO` si el producto es componente de un Combo activo; el Panel debe mostrar ese caso explícitamente, no como un error genérico |

### Combos Comerciales

| Endpoint | Método |
|---|---|
| `/admin/comercial/combos` | `POST` (crear — incluye `componentes[]`), `GET` (listar) |
| `/admin/comercial/combos/{id}` | `PUT` (modificar — reemplazo completo de `componentes[]`), `GET` (detalle) |
| `/admin/comercial/combos/{id}/activar` | `POST` — puede devolver `409 COMBO_COMERCIAL_COMPONENTE_INACTIVO` si algún componente quedó inactivo mientras el combo estaba inactivo |
| `/admin/comercial/combos/{id}/desactivar` | `POST` |

### Pedidos

| Endpoint | Método |
|---|---|
| `/pedidos` | `GET` (listar todos) |
| `/pedidos/{id}` | `GET` (detalle) |
| `/pedidos/{id}/productos`, `/pedidos/{id}/combos` | `POST` (editar: agregar ítem) |
| `/pedidos/{id}/items/{itemId}` | `DELETE` (editar: quitar ítem) |
| `/pedidos/{id}/items/{itemId}/cantidad` | `PATCH` (editar: cambiar cantidad) |
| `/pedidos/{id}/confirmar` | `POST` — "recepción acepta el pedido", sin verificar stock/producción |
| `/pedidos/{id}/rechazar` | `POST` — mismo efecto que `/cancelar` (ver `docs/02-domain/pedido.md`) |
| `/pedidos/{id}/cancelar` | `POST` — disponible también para cancelar en etapas posteriores a la recepción |

**Fuera de Etapa 1** (existen en el código pero no forman parte del circuito validado en esta tarea): `/pedidos/{id}/en-preparacion`, `/pedidos/{id}/listo`, `/pedidos/{id}/entregado`.

---

## C. Responsabilidades exclusivas del frontend

- Construir y mantener el carrito antes del checkout.
- Toda la experiencia visual: tarjetas, categorías, layout.
- Construir el texto del mensaje de WhatsApp y abrir/iniciar la app — la API no participa (`docs/V1-SCOPE.md` §4.6).
- Decidir cómo mostrar los códigos de error (`code` del `ProblemDetail`) al usuario.

## D. Responsabilidades exclusivas de la API

- Resolver el precio y el nombre vigentes de cada Producto/Combo Comercial al agregarse a un pedido — nunca los recibe del cliente.
- Persistir el pedido de forma independiente de si el mensaje de WhatsApp se envía o no.
- Todas las validaciones de negocio (activo/inactivo, existencia, invariantes de estado de `Pedido`).
- Filtrar qué está publicado antes de responder `/catalogo` — el frontend nunca decide ni pide ese filtro.

## E. Datos que nunca deben confiarse al frontend

**El precio es el caso central, ya resuelto por diseño, no solo por convención:** `AgregarProductoRequest`/`AgregarComboRequest` **no tienen campo `precio`** — estructuralmente, el frontend no puede enviarlo aunque quisiera. El frontend envía únicamente `productoId`/`comboId` + `cantidad` (+ `observacion` opcional); la API resuelve el precio vigente contra `Comercial` y arma el snapshot del `Pedido` (`docs/02-domain/pedido.md`, "Snapshot, no referencia viva"). Verificado con test: `AgregarProductoAlPedidoApiTest.modificarElProductoComercialDespuesNoAlteraElPedidoYaCreado`.

Tampoco deben confiarse al frontend: el estado `activo`/publicado de un elemento (se filtra siempre server-side), ni ningún id de Producción/Stock (no existen en ningún contrato expuesto).

---

## Riesgos para quien empiece el frontend

- **Sin autenticación todavía** (`docs/PROJECT.md` §6) — nada impide hoy que el frontend público llame a `/admin/**`, ni que un frontend no autorizado llame a `/pedidos/{id}/confirmar`. No es un problema introducido por esta tarea; es una limitación conocida del backend completo, relevante recién cuando estos frontends se conecten a un entorno real.
- **Sin CORS configurado** para `Comercial` ni para `Pedido` (`Produccion` sí tiene `CorsConfig`, ver `SDD-PANEL-API-ROADMAP.md` §7) — un frontend corriendo en otro origen necesitará esto resuelto antes de poder consumir la API desde el navegador. No resuelto en esta tarea (fuera de alcance).
- `Pedido` no tiene contratos SDD en `05-contracts/api/` — los endpoints de la sección B (Pedidos) están documentados en este informe y en `docs/02-domain/pedido.md`, no con el formato completo de contrato que sí tienen Comercial/Producción.
