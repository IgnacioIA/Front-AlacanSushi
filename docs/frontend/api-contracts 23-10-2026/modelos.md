# Modelos, enums y formatos

Esquemas JSON de todo lo que la API recibe y devuelve en el alcance del MVP. Los nombres de campo son los reales: salen de los getters de los DTO, no de las entidades de persistencia.

Los modelos de inventario están en [`recursos-auxiliares.md`](recursos-auxiliares.md).

## Convenciones de formato

### Nombres

- Campos JSON en **camelCase y en español**: `nombreCliente`, `precioUnitario`, `fechaCreacion`.
- Los campos de la página son la excepción, en inglés: `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `empty`.
- También en inglés: `headerName` y `token` (CSRF), y los campos de error (`type`, `title`, `status`, `detail`, `instance`, `code`).

Nombres que cambian según el contexto — **no asumir que un mismo dato se llama igual en todos lados**:

| Dato | En `GET /catalogo` | En la API administrativa | En un pedido (respuesta) | En un pedido (petición) |
|---|---|---|---|---|
| Id del producto dentro de un combo | `componentes[].productoId` | `componentes[].productoComercialId` | — | — |
| Id del producto o combo pedido | `id` (+ `tipo`) | `id` | `items[].referenciaId` (+ `tipo`) | `items[].id` (+ `tipo`) en el alta; `productoId` / `comboId` en la edición |
| Precio | `precio` | `precio` | `items[].precioUnitario` | No se envía |
| Id de la línea de pedido | — | — | `items[].id` | `{itemId}` en la ruta |

Atención: en la **respuesta** de un pedido, `items[].id` es el id de la línea; en la **petición** de alta, `items[].id` es el id del producto o combo.

### Importes

- Tipo JSON **number**, decimal. Nunca cadena, sin símbolo de moneda ni separador de miles.
- La API **no informa la moneda**. Es una convención de presentación del frontend.
- La base guarda dos decimales. Un valor leído de la base se serializa con dos (`8500.00`); un valor recién enviado por el cliente puede volver con la escala con que llegó (`8500`). En JavaScript ambos son el mismo número: **formatear siempre al mostrar** (`Intl.NumberFormat`) y no depender de la cantidad de decimales del JSON.
- No recalcular totales en el cliente para mostrarlos como definitivos: usar `subtotal` y `total` del servidor. Para la estimación del carrito, evitar errores de coma flotante trabajando en centavos enteros.

### Fechas

`fechaCreacion` (pedidos) y `momento` (movimientos de stock):

```text
2026-10-09T20:15:31.482913
```

- ISO 8601 **sin zona horaria ni desplazamiento**.
- La fracción de segundo tiene una cantidad variable de dígitos (hasta seis) y puede faltar.
- Representa la hora del reloj del servidor que creó el dato. La respuesta no dice a qué zona corresponde.

Qué puede hacer el frontend: mostrar el valor como hora local "tal cual" y usarlo para ordenar. **No** convertirlo entre zonas ni agregarle una `Z`. `new Date("2026-10-09T20:15:31.482913")` lo interpreta como hora local del navegador, que coincide con la intención solo si el navegador y el servidor están en la misma zona.

`DECISIÓN_REQUERIDA`: entregar las fechas con zona explícita. Está registrada como pendiente en [`../05-contracts/api/pedido-admin/consultar-pedido.md`](../05-contracts/api/pedido-admin/consultar-pedido.md).

### Identificadores

Enteros positivos (`Long` en el servidor). Productos y combos tienen numeraciones independientes: `id: 1` puede ser a la vez un producto y un combo.

### Nulos y campos ausentes

- En las respuestas, un campo sin valor llega como `null`; no se omite.
- En las peticiones, omitir un campo opcional equivale a enviarlo como `null`.
- Los campos desconocidos de una petición se ignoran.

---

## Enums

| Enum | Valores del código | Valores que el frontend verá en el MVP |
|---|---|---|
| Estado de pedido (`estado`) | `NUEVO`, `CONFIRMADO`, `EN_PREPARACION`, `LISTO`, `ENVIADO`, `ENTREGADO`, `CANCELADO` | Todos menos `ENVIADO` |
| Tipo de pedido (`tipoPedido`) | `SALON`, `DELIVERY`, `TAKEAWAY` | `DELIVERY`, `TAKEAWAY` |
| Canal (`canal`) | `TOTEM`, `APP_MOVIL`, `WEB`, `MOZO` | `WEB` |
| Tipo de elemento (`tipo`) | `PRODUCTO`, `COMBO` | Ambos |
| Rol (`rol`) | `ADMIN` | `ADMIN` |
| Filtro de estado del catálogo (`estado`, query) | `ACTIVO`, `INACTIVO` | Ambos |

- Todos viajan como cadenas en mayúsculas.
- En peticiones de pedidos, los valores deben ser exactos. En el filtro `estado` del catálogo administrativo no se distinguen mayúsculas.
- `tipo` no es un enum compartido en el servidor: es un discriminador que cada DTO escribe como texto. Los valores son los mismos en el catálogo y en los pedidos.
- Conviene que el frontend tolere un valor desconocido (mostrarlo tal cual) en lugar de fallar: el servidor define valores que hoy no se usan.

Etiquetas sugeridas para la interfaz (no vienen de la API):

| Valor | Etiqueta |
|---|---|
| `NUEVO` | Nuevo |
| `CONFIRMADO` | Confirmado |
| `EN_PREPARACION` | En preparación |
| `LISTO` | Listo |
| `ENTREGADO` | Entregado |
| `CANCELADO` | Cancelado |
| `DELIVERY` | Envío a domicilio |
| `TAKEAWAY` | Retiro en el local |

---

## Modelos de respuesta

### Página

`PaginaResponse<T>` — envoltura de todos los listados paginados.

| Campo | Tipo | Notas |
|---|---|---|
| `content` | array de `T` | Elementos de la página |
| `page` | number (entero) | Página actual, base cero |
| `size` | number (entero) | Tamaño pedido |
| `totalElements` | number (entero) | Total de elementos que cumplen el filtro |
| `totalPages` | number (entero) | `0` si no hay elementos |
| `first` | boolean | Es la primera página |
| `last` | boolean | Es la última página |
| `empty` | boolean | `content` está vacío |

Pedir una página más allá de la última devuelve `200` con `content: []`.

Listados **paginados**: `/admin/comercial/productos`, `/admin/comercial/combos`, `/pedidos`, `/ingredients`, `/products`, `.../movimientos`.
Listados **sin paginar** (arreglo plano): `/catalogo`, `/measurement-units`.

| Listado | `size` por defecto | `size` máximo |
|---|---|---|
| `/pedidos` | 15 | 100 |
| Los demás | 15 | Sin límite |

### `Sesion`

`GET /auth/session`, `POST /auth/login`.

| Campo | Tipo | Nulo |
|---|---|---|
| `autenticado` | boolean | No |
| `username` | string | Sí (sin sesión) |
| `rol` | string | Sí (sin sesión) |

### `TokenCsrf`

`GET /auth/csrf`.

| Campo | Tipo | Nulo |
|---|---|---|
| `headerName` | string | No |
| `token` | string | No |

### `ElementoCatalogo`

`GET /catalogo` (`CatalogoPublicoItemResponse`).

| Campo | Tipo | Nulo |
|---|---|---|
| `id` | number (entero) | No |
| `tipo` | `PRODUCTO` \| `COMBO` | No |
| `nombre` | string | No |
| `descripcion` | string | Sí |
| `precio` | number (decimal) | No |
| `imagen` | string | Sí |
| `componentes` | array de `{ productoId, nombre, cantidad }` | Sí (`null` en `PRODUCTO`) |

### `ProductoComercial`

`/admin/comercial/productos` (`ProductoComercialResponse`).

| Campo | Tipo | Nulo | Editable |
|---|---|---|---|
| `id` | number (entero) | No | No |
| `nombre` | string | No | Sí |
| `descripcion` | string | Sí | Sí |
| `precio` | number (decimal) | No | Sí |
| `imagen` | string | Sí | Sí |
| `activo` | boolean | No | Solo con `/activar` y `/desactivar` |

### `ComboComercial`

`/admin/comercial/combos` (`ComboComercialResponse`). Los campos de `ProductoComercial`, más:

| Campo | Tipo | Nulo | Editable |
|---|---|---|---|
| `componentes` | array | No | Sí, como lista completa |
| `componentes[].productoComercialId` | number (entero) | No | Sí |
| `componentes[].nombre` | string | No | No |
| `componentes[].cantidad` | number (entero) | No | Sí |

### `Pedido` y `LineaPedido`

`PedidoDTO` e `ItemDTO`. Tabla completa en [`pedidos.md`](pedidos.md#modelo-de-un-pedido).

Campos calculados o fijados por el servidor, que el cliente nunca envía: `id`, `estado`, `canal`, `fechaCreacion`, `total`, `items[].id`, `items[].nombre`, `items[].precioUnitario`, `items[].subtotal`.

### `Problema` (error)

| Campo | Tipo | Presente |
|---|---|---|
| `type` | string | `PENDIENTE_DE_CONFIRMAR`; no se espera. Tratarlo como opcional (ver `errores-y-seguridad.md`) |
| `title` | string | Siempre |
| `status` | number (entero) | Siempre |
| `detail` | string | Siempre |
| `instance` | string | Siempre: la ruta de la petición |
| `code` | string | Siempre. Catálogo en [`errores-y-seguridad.md`](errores-y-seguridad.md#catálogo-de-códigos-de-error) |

Los errores no manejados por la aplicación tienen otra forma y no traen `code`.

---

## Modelos de petición

| Operación | Modelo | Campos |
|---|---|---|
| `POST /auth/login` | Formulario | `username`, `password` |
| `POST /admin/comercial/productos`, `PUT .../{id}` | `ProductoComercialEntrada` | `nombre`\*, `precio`\*, `descripcion`, `imagen` |
| `POST /admin/comercial/combos`, `PUT .../{id}` | `ComboComercialEntrada` | `nombre`\*, `precio`\*, `descripcion`, `imagen`, `componentes`\* → `{ productoComercialId*, cantidad* }` |
| `POST /pedidos` | `PedidoEntrada` | `tipoPedido`\*, `nombreCliente`\*, `telefonoCliente`\*, `direccion` (obligatoria en `DELIVERY`), `items`\* → `{ tipo*, id*, cantidad*, observacion }` |
| `POST /pedidos/{id}/productos` | — | `productoId`\*, `cantidad`\*, `observacion` |
| `POST /pedidos/{id}/combos` | — | `comboId`\*, `cantidad`\*, `observacion` |
| `PATCH /pedidos/{id}/items/{itemId}/cantidad` | — | `cantidad`\* |

\* obligatorio.

### Diferencias entre petición y respuesta

| Recurso | En la petición | En la respuesta |
|---|---|---|
| Producto comercial | Sin `id` ni `activo` | Con `id` y `activo` |
| Combo comercial | Componentes con `productoComercialId` y `cantidad` | Componentes además con `nombre` |
| Pedido | Líneas con `tipo`, `id` (del producto o combo), `cantidad`, `observacion` | Líneas con `id` (de la línea), `tipo`, `referenciaId`, `nombre`, `precioUnitario`, `cantidad`, `subtotal`, `observacion` |

### Límites

| Dato | Límite | Dónde se valida |
|---|---|---|
| Líneas por pedido | 1 a 20 | Servidor |
| Cantidad por línea | 1 a 50 | Servidor |
| `nombreCliente` | 80 caracteres | Servidor |
| `telefonoCliente` | 30 caracteres | Servidor |
| `direccion` | 200 caracteres | Servidor |
| `observacion` | 200 caracteres | Servidor |
| `size` en `/pedidos` | 1 a 100 | Servidor |
| `nombre`, `descripcion`, `imagen` de producto y combo | 255 caracteres | **Solo la base de datos.** Limitar en el formulario |
| `precio` | Mayor a cero | Servidor. Sin tope ni validación de decimales |

Los límites se pueden replicar en el frontend como validación de UX, pero la autoridad es el servidor.

---

## Tipos TypeScript de referencia

Derivados de las tablas de este documento. Son una ayuda, no un artefacto generado.

```ts
export type TipoElemento = "PRODUCTO" | "COMBO";
export type EstadoPedido =
  | "NUEVO" | "CONFIRMADO" | "EN_PREPARACION" | "LISTO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";
export type TipoPedido = "DELIVERY" | "TAKEAWAY" | "SALON";
export type CanalPedido = "WEB" | "TOTEM" | "APP_MOVIL" | "MOZO";

export interface Pagina<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Sesion {
  autenticado: boolean;
  username: string | null;
  rol: "ADMIN" | null;
}

export interface TokenCsrf {
  headerName: string;
  token: string;
}

export interface ElementoCatalogo {
  id: number;
  tipo: TipoElemento;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
  componentes: { productoId: number; nombre: string; cantidad: number }[] | null;
}

export interface ProductoComercial {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
  activo: boolean;
}

export interface ProductoComercialEntrada {
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
}

export interface ComboComercial extends ProductoComercial {
  componentes: { productoComercialId: number; nombre: string; cantidad: number }[];
}

export interface ComboComercialEntrada extends ProductoComercialEntrada {
  componentes: { productoComercialId: number; cantidad: number }[];
}

export interface LineaPedido {
  id: number;
  tipo: TipoElemento;
  referenciaId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  observacion: string | null;
}

export interface Pedido {
  id: number;
  estado: EstadoPedido;
  tipoPedido: TipoPedido;
  canal: CanalPedido;
  nombreCliente: string;
  telefonoCliente: string;
  direccion: string | null;
  fechaCreacion: string;
  total: number;
  items: LineaPedido[];
}

export interface PedidoEntrada {
  tipoPedido: "DELIVERY" | "TAKEAWAY";
  nombreCliente: string;
  telefonoCliente: string;
  direccion?: string | null;
  items: { tipo: TipoElemento; id: number; cantidad: number; observacion?: string | null }[];
}

export interface Problema {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code?: string;
}
```
