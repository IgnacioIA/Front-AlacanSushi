# Guía de integración para el frontend (React)

Cómo construir las pantallas del MVP contra esta API, y cómo avanzar con mocks mientras tanto. No incluye implementación del frontend: los fragmentos de código son ilustrativos.

Referencias: [`autenticacion.md`](autenticacion.md), [`errores-y-seguridad.md`](errores-y-seguridad.md), [`modelos.md`](modelos.md), [`estado-de-api.md`](estado-de-api.md).

## 1. Configuración del cliente HTTP

| Aspecto | Valor |
|---|---|
| URL base | Configurable por entorno. `PENDIENTE_DE_CONFIRMAR`: el puerto de la API no está fijado en la configuración del repositorio; vale el predeterminado del servidor (`8080`) salvo que el despliegue lo cambie |
| Prefijo de rutas | Ninguno. No hay `/api` ni versión en la ruta |
| Cookies | Enviarlas **siempre** en el panel y en `/auth`: `credentials: "include"` (`fetch`) o `withCredentials: true` (Axios) |
| Autenticación | Cookie de sesión. **No** hay `Authorization: Bearer` ni token en `localStorage` |
| Cabeceras propias permitidas | Solo `Content-Type` y `X-CSRF-TOKEN`. Cualquier otra rompe el preflight de CORS |
| Origen del frontend en desarrollo | `http://localhost:5173` (permitido por defecto en el perfil `dev`). `http://127.0.0.1:5173` **no** lo está |
| HTTPS | Obligatorio fuera de desarrollo: la cookie es `Secure` |

Las dos llamadas públicas (`GET /catalogo`, `POST /pedidos`) funcionan sin cookies ni token. Enviar cookies igualmente no causa problemas.

### Cliente de referencia

```ts
const API = import.meta.env.VITE_API_URL;

let csrf: { headerName: string; token: string } | null = null;

async function obtenerCsrf(forzar = false) {
  if (!csrf || forzar) {
    const r = await fetch(`${API}/auth/csrf`, { credentials: "include" });
    csrf = await r.json();
  }
  return csrf!;
}

export function descartarCsrf() {
  csrf = null;
}

export class ErrorDeApi extends Error {
  constructor(public status: number, public code: string | undefined, public detail: string | undefined) {
    super(code ?? `HTTP ${status}`);
  }
}

export async function api<T>(metodo: string, ruta: string, cuerpo?: unknown, reintento = false): Promise<T> {
  const escritura = metodo !== "GET";
  const headers: Record<string, string> = {};
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
  if (escritura) {
    const { headerName, token } = await obtenerCsrf();
    headers[headerName] = token;
  }

  const r = await fetch(`${API}${ruta}`, {
    method: metodo,
    credentials: "include",
    headers,
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });

  if (r.ok) {
    // Transiciones de pedido y logout responden sin cuerpo.
    const texto = await r.text();
    return (texto ? JSON.parse(texto) : undefined) as T;
  }

  const problema = await r.json().catch(() => null);
  if (r.status === 403 && problema?.code === "CSRF_INVALIDO" && !reintento) {
    await obtenerCsrf(true);
    return api<T>(metodo, ruta, cuerpo, true);
  }
  throw new ErrorDeApi(r.status, problema?.code, problema?.detail);
}
```

Puntos que este cliente resuelve y que cualquier otro debe resolver:

1. **Respuestas `200` y `204` sin cuerpo.** Llamar a `response.json()` sobre ellas lanza un error.
2. **Errores sin `code`**, o cuyo cuerpo no es JSON.
3. **Reintento único** ante `CSRF_INVALIDO`.
4. **`401 NO_AUTENTICADO`** debe propagarse a un manejador global que limpie el estado y lleve al login.

`POST /pedidos` no necesita token CSRF. El cliente de arriba lo pediría igual, abriendo una sesión innecesaria para cada visitante: conviene que la web pública use una función aparte que no lo solicite.

## 2. Autenticación desde React

### Login

```ts
export async function iniciarSesion(username: string, password: string): Promise<Sesion> {
  const { headerName, token } = await obtenerCsrf(true);
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { [headerName]: token },
    body: new URLSearchParams({ username, password }), // formulario, no JSON
  });
  if (!r.ok) {
    const problema = await r.json().catch(() => null);
    throw new ErrorDeApi(r.status, problema?.code, problema?.detail);
  }
  descartarCsrf(); // el token cambió con el login
  return r.json();
}
```

### Ciclo de vida

| Momento | Acción |
|---|---|
| Carga de la aplicación | `GET /auth/session`. Guardar `{ autenticado, username, rol }` en un contexto |
| Ruta del panel sin sesión | Redirigir al login, recordando la ruta de destino |
| Login correcto | Descartar el token CSRF, guardar la sesión, ir a la ruta de destino |
| Login con `401 CREDENCIALES_INVALIDAS` | Mensaje único: "Usuario o contraseña incorrectos" |
| Cualquier `401 NO_AUTENTICADO` | Limpiar la sesión y los datos en memoria, ir al login con el aviso "Tu sesión venció" |
| Logout | `POST /auth/logout`; con `204`, descartar token y estado, ir al login |

Lo que **no** hay que hacer:

- Guardar credenciales, tokens o el estado de sesión en `localStorage` como fuente de verdad. La fuente es `GET /auth/session`.
- Leer o escribir la cookie `ALACAN_SESSION`: es `HttpOnly`.
- Confiar en ocultar rutas o botones como protección. Es solo experiencia de uso: la API autoriza cada llamada.
- Pedir que se desactive CSRF, que se abra CORS con `*`, o que la cookie deje de ser `HttpOnly` para simplificar el desarrollo. Si algo no funciona en local, la solución es un origen permitido (`ALACAN_CORS_ALLOWED_ORIGINS`) o un proxy del servidor de desarrollo.

### Proxy de desarrollo (opcional)

Con un proxy de Vite hacia la API, el navegador ve un solo origen y CORS no interviene. Las cookies y el CSRF funcionan igual. Si el proxy reescribe la ruta (por ejemplo `/api/pedidos` → `/pedidos`), recordar que la API no tiene prefijo.

## 3. Mapa de pantallas y endpoints

| Pantalla | Endpoints | Datos derivables en el cliente | Debe venir del backend |
|---|---|---|---|
| **Login** | `GET /auth/csrf`, `POST /auth/login` | — | Resultado de la autenticación |
| **Estado de sesión** (arranque, guardas) | `GET /auth/session` | — | `autenticado`, `username`, `rol` |
| **Layout y navegación del panel** | `GET /auth/session`, `POST /auth/logout` | Menú (estático: Pedidos, Productos, Combos) | Nombre de usuario |
| **Vista inicial del panel** | `GET /pedidos?estado=…&size=1` (una por estado) | Contadores por estado, a partir de `totalElements` | No hay API de resumen |
| **Listado de productos** | `GET /admin/comercial/productos` | — | Lista, paginación, `activo` |
| **Formulario de producto** | `GET …/productos/{id}`, `POST …/productos`, `PUT …/productos/{id}` | Validación de UX (obligatorios, precio > 0, 255 caracteres) | Resultado; errores |
| **Activar / desactivar producto** | `POST …/productos/{id}/activar`, `/desactivar` | — | Bloqueo `409` |
| **Listado de combos** | `GET /admin/comercial/combos` | — | Lista con componentes |
| **Formulario de combo** | `GET …/combos/{id}`, `GET …/productos?estado=ACTIVO`, `POST …/combos`, `PUT …/combos/{id}` | Suma de precios de los componentes como referencia visual | Resultado; errores `404` / `409` |
| **Activar / desactivar combo** | `POST …/combos/{id}/activar`, `/desactivar` | — | Bloqueo `409` |
| **Listado de pedidos** | `GET /pedidos` | Etiquetas de estado, formato de fecha e importe | Lista, filtro, paginación |
| **Detalle de pedido** | `GET /pedidos/{id}` (o el elemento del listado) | Acciones disponibles según `estado` | Datos del pedido |
| **Acciones de estado** | `POST /pedidos/{id}/confirmar`, `/en-preparacion`, `/listo`, `/entregado`, `/cancelar`, `/rechazar` | — | Si la transición se aceptó |
| **Catálogo público** | `GET /catalogo` | Agrupar por `tipo`; búsqueda local por nombre | Qué se vende y a qué precio |
| **Carrito** | Ninguno (estado local) | Líneas, cantidades, subtotal **estimado** | — |
| **Checkout** | `POST /pedidos` | Validación de UX de los campos | Precios, total, aceptación |
| **Confirmación de pedido** | Ninguno: usa la respuesta de `POST /pedidos` | — | El pedido creado |
| **Sesión expirada** | Disparada por `401 NO_AUTENTICADO` | — | — |
| **Error, carga, vacío** | Transversales | — | — |

### Notas por pantalla

**Vista inicial del panel.** No existe una API de dashboard. Lo que se puede mostrar sin inventar datos: cantidad de pedidos por estado (una consulta por estado con `size=1`) y accesos directos. Ventas del día, productos más vendidos o gráficos **no se pueden obtener**: requieren un endpoint futuro. No calcularlos recorriendo todas las páginas de pedidos.

**Listado de pedidos.** El orden es ascendente por fecha: los más viejos primero. Para una bandeja de "pendientes" eso es adecuado (se atiende primero el más antiguo). No hay aviso de pedidos nuevos: usar consulta periódica (por ejemplo cada 30 a 60 segundos) con un indicador visible de la última actualización.

**Detalle de pedido.** El listado ya trae el pedido completo; el detalle puede abrirse sin otra llamada y refrescarse con `GET /pedidos/{id}`. El teléfono es texto libre: si se arma un enlace de WhatsApp o `tel:`, normalizarlo con cuidado y tolerar formatos inválidos.

**Carrito.** Identidad de línea: `tipo` + `id`. Máximo 20 líneas y 50 unidades por línea. Persistirlo en `localStorage` es una decisión del frontend; al restaurarlo, revalidar contra `GET /catalogo`, porque un elemento puede haber cambiado de precio o desaparecido.

**Checkout.** Campos: tipo de pedido (`DELIVERY` / `TAKEAWAY`), nombre, teléfono, dirección (visible y obligatoria solo en `DELIVERY`), observación por línea. No hay medio de pago, horario de entrega, costo de envío ni observación general.

**Confirmación.** Se construye con la respuesta del `POST`. No se puede recargar ni compartir por URL: no hay consulta pública de un pedido. Si el usuario recarga la página, los datos se pierden salvo que el frontend los conserve localmente.

## 4. Matriz de preparación

| Pantalla | Con la API actual | Con mocks | Bloqueos |
|---|---|---|---|
| Login | **Lista** | Lista | — |
| Estado de sesión y guardas | **Lista** | Lista | — |
| Layout y navegación | **Lista** | Lista | — |
| Vista inicial del panel | **Parcial**: solo contadores por estado | Lista | Estadísticas: `PENDIENTE` (no hay endpoint). Contenido de la vista: `DECISIÓN_REQUERIDA` |
| Listado de productos | **Lista** | Lista | — |
| Formulario de producto | **Lista** | Lista | Carga de imágenes: `DECISIÓN_REQUERIDA` (formato de `imagen`) y `PENDIENTE` (endpoint de subida). Mientras tanto, campo de texto |
| Listado de combos | **Lista** | Lista | — |
| Formulario de combo | **Lista** | Lista | Ídem imagen |
| Listado de pedidos | **Lista** | Lista | Orden descendente, búsqueda, filtro por fecha: `PENDIENTE` |
| Detalle de pedido | **Lista** | Lista | — |
| Acciones de estado | **Lista** | Lista | Motivo de cancelación: `PENDIENTE`. Etiqueta "rechazar" vs "cancelar": decisión de interfaz |
| Edición de líneas de un pedido | Disponible, **fuera del MVP** | — | `DECISIÓN_REQUERIDA`: si entra al alcance |
| Catálogo público | **Lista** | Lista | Categorías: `PENDIENTE`. Imágenes: ídem |
| Carrito | **Lista** (sin API) | Lista | — |
| Checkout | **Lista** | Lista | Pagos, costo de envío, horarios: fuera del MVP |
| Confirmación de pedido | **Lista** | Lista | Seguimiento público: `PENDIENTE` |
| Sesión expirada, error, carga, vacío | **Lista** | Lista | — |
| Contenido institucional (inicio, contacto, horarios) | Sin API | Contenido estático | `DECISIÓN_REQUERIDA`: no hay CMS |

**Lista con la API actual** significa que los endpoints están implementados y cubiertos por tests automáticos sobre H2. Además, el 2026-10-21 `EsquemaSobreMysqlRealTest` validó contra MySQL 8.0, sobre la base aislada `alacan_test`, los flujos que cubre (4 de 4 tests): login, alta y modificación del catálogo, catálogo público, alta de pedido, listado y transiciones. Los demás endpoints siguen pendientes de validación contra MySQL, y ninguno se probó todavía con un navegador contra una instancia desplegada ([`estado-de-api.md`](estado-de-api.md#nivel-de-validación)).

## 5. Estrategia de mocks

### Principios

1. Los mocks devuelven **exactamente** las formas de [`modelos.md`](modelos.md): mismos nombres, mismos nulos, mismas envolturas.
2. Simular también lo incómodo: respuestas sin cuerpo, errores con y sin `code`, `401` en cualquier momento, token CSRF que cambia.
3. No codificar en el mock reglas que el frontend después "aprenda" como propias. El mock imita al servidor; la pantalla sigue tratando al servidor como autoridad.

Una capa de intercepción de red (por ejemplo Mock Service Worker) permite que el código de producción no cambie al pasar de mocks a la API real. Es una recomendación, no un requisito.

### Datos de ejemplo

Coherentes entre sí y con los ejemplos de los demás documentos.

**Productos comerciales** (`GET /admin/comercial/productos` → `content`):

```json
[
  { "id": 4, "nombre": "Ensalada César", "descripcion": null, "precio": 6000.00, "imagen": null, "activo": false },
  { "id": 3, "nombre": "Gaseosa 500 ml", "descripcion": "Línea cola, botella individual", "precio": 2000.00, "imagen": null, "activo": true },
  { "id": 1, "nombre": "Hamburguesa clásica", "descripcion": "Carne vacuna, lechuga, tomate y queso", "precio": 8500.00, "imagen": "https://cdn.example/img/hamburguesa-clasica.jpg", "activo": true },
  { "id": 2, "nombre": "Papas fritas", "descripcion": null, "precio": 3500.00, "imagen": null, "activo": true }
]
```

**Combos comerciales** (`GET /admin/comercial/combos` → `content`):

```json
[
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
]
```

**Catálogo público** (`GET /catalogo`): los tres productos activos por nombre y luego el combo — JSON completo en [`catalogo-publico.md`](catalogo-publico.md#cat-01--consultar-el-catálogo). La ensalada (inactiva) no aparece.

**Pedidos** (`GET /pedidos` → `content`): pedidos 15 y 16 de [`pedidos.md`](pedidos.md#ped-02--listar-pedidos). Comprobación de coherencia:

| Pedido | Líneas | Total |
|---|---|---|
| 15 — `NUEVO`, `DELIVERY` | 2 × Hamburguesa clásica (8500.00) = 17000.00; 1 × Combo clásico (12500.00) = 12500.00 | 29500.00 |
| 16 — `CONFIRMADO`, `TAKEAWAY` | 3 × Papas fritas (3500.00) = 10500.00 | 10500.00 |

Para probar todos los estados, agregar pedidos con el mismo formato en `EN_PREPARACION`, `LISTO`, `ENTREGADO` y `CANCELADO`.

**Sesión:**

```json
{ "autenticado": true, "username": "administrador", "rol": "ADMIN" }
```

**Errores para simular:**

```json
{ "title": "No autenticado", "status": 401, "detail": "Se requiere iniciar sesion para acceder a este recurso", "instance": "/pedidos", "code": "NO_AUTENTICADO" }
```

```json
{ "title": "Solicitud invalida", "status": 400, "detail": "Solo pedidos nuevos pueden confirmarse", "instance": "/pedidos/15/confirmar", "code": "VALIDATION_ERROR" }
```

```json
{ "title": "Producto Comercial en uso", "status": 409, "detail": "Producto Comercial 1 no puede desactivarse: es componente de al menos un Combo Comercial activo", "instance": "/admin/comercial/productos/1/desactivar", "code": "PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO" }
```

```json
{ "title": "Producto Comercial inactivo", "status": 409, "detail": "Producto Comercial inactivo: id=4", "instance": "/pedidos", "code": "PRODUCTO_COMERCIAL_INACTIVO" }
```

### Qué probar en cada pantalla

| Pantalla | Estados de interfaz |
|---|---|
| Login | Inicial; enviando; credenciales inválidas (`401`); token CSRF vencido (`403`, reintento transparente); error de red |
| Arranque | Consultando sesión; con sesión; sin sesión; API caída |
| Listado de productos / combos | Cargando; con datos; vacío; vacío por filtro; varias páginas; error; `401` |
| Formulario de producto | Alta; edición con datos precargados; `400` (nombre, precio); guardando; `404` al editar uno inexistente |
| Formulario de combo | Sin productos activos para elegir; producto repetido; `409` por componente inactivo; `404` por componente inexistente; sin componentes |
| Activar / desactivar | Éxito; `409` producto en uso; `409` combo con componente inactivo |
| Listado de pedidos | Cargando; vacío; un estado; varios estados; paginación; actualización periódica; `401` durante la actualización |
| Detalle de pedido | Cada estado con sus acciones; `DELIVERY` con dirección; `TAKEAWAY` con `direccion: null`; línea con y sin observación; `404` |
| Acciones de estado | Éxito (respuesta vacía → recarga); `400` porque el pedido ya cambió; `404`; `403` CSRF |
| Catálogo público | Cargando; con datos; vacío (`[]`); producto y combo con el mismo `id`; sin imagen; sin descripción; error |
| Carrito | Vacío; una línea; 20 líneas (tope); 50 unidades (tope) |
| Checkout | `DELIVERY` sin dirección; campos al límite de largo; enviando (botón deshabilitado); `409` elemento inactivo; `404` elemento inexistente; `400`; error de red |
| Confirmación | Total del servidor distinto del estimado en el carrito |

### Límites de trabajar con mocks

- **CORS y cookies no se prueban con mocks.** Los problemas más probables de la integración real son de origen, `credentials` y `Secure`/`SameSite`. Probar contra una API real lo antes posible, aunque sea solo el login.
- El mock no valida como el servidor: una petición aceptada por el mock puede ser rechazada por la API (enteros estrictos, valores exactos de los enums, líneas repetidas).
- El mock no reproduce la concurrencia ni la expiración de sesión salvo que se programe.
- Los textos de `detail` pueden cambiar; los `code` no.
- Los ids del mock son ficticios: no fijarlos en el código.

## 6. Reglas de negocio: qué no duplicar

| Regla | Dónde vive | Qué hace el frontend |
|---|---|---|
| Precio de cada elemento y total del pedido | Backend | Muestra una estimación en el carrito; muestra como definitivo el `total` de la respuesta |
| Qué se puede comprar | Backend (`activo`) | Muestra lo que trae `GET /catalogo`; maneja `404` / `409` en el checkout |
| Estado inicial y canal de un pedido | Backend | No los envía |
| Transiciones de estado permitidas | Backend | Usa la tabla de acciones como ayuda visual; maneja el rechazo |
| Límites de cantidad, líneas y textos | Backend | Puede replicarlos como validación de UX |
| Obligatoriedad de la dirección | Backend | Puede replicarla como validación de UX |
| Si un producto puede desactivarse | Backend | Intenta y maneja el `409` |
| Autorización | Backend | Oculta lo que no corresponde, sin considerarlo protección |

## 7. Lista de verificación al conectar con la API real

1. `GET /auth/session` responde `200` desde el origen del frontend, sin errores de CORS en la consola.
2. `GET /auth/csrf` devuelve token y el navegador guarda `ALACAN_SESSION`.
3. `POST /auth/login` como formulario devuelve `200` y la cookie cambia.
4. Una lectura del panel responde `200`; una escritura con el token nuevo, también.
5. Una escritura sin token responde `403 CSRF_INVALIDO` y el cliente se recupera solo.
6. Tras reiniciar la API, la siguiente llamada responde `401` y la aplicación vuelve al login.
7. `POST /pedidos` desde la web pública funciona en una ventana sin sesión.
8. Las transiciones de pedido no producen errores de análisis de JSON.
