# Errores y seguridad

Reglas transversales de la API. Fuente: `Seguridad/api/config/SecurityConfig.java`, `Seguridad/api/security/RespuestasDeSeguridad.java`, los tres `@RestControllerAdvice` (`Comercial`, `Pedido`, `Produccion`) y `application*.properties`.

Detalle de diseño y motivos: [`../03-architecture/security.md`](../03-architecture/security.md).

## Modelo de seguridad

- **Sesión HTTP del servidor con cookie.** No hay JWT, `Authorization: Bearer`, OAuth ni refresh tokens.
- **Un único rol**, `ADMIN`. No hay registro de usuarios ni permisos granulares.
- **Denegar por defecto.** Solo es público lo que figura en la matriz. Una ruta que no existe también responde `401` a quien no tiene sesión, no `404`.
- **CSRF activo** para toda escritura, con una única excepción exacta: `POST /pedidos`.

## Matriz de acceso

"Escritura" = `POST`, `PUT`, `PATCH`, `DELETE`. El token CSRF va en la cabecera `X-CSRF-TOKEN`.

| Método | Ruta | Sesión `ADMIN` | CSRF | Sin sesión responde |
|---|---|---|---|---|
| `GET` | `/catalogo` | No | No aplica | `200` |
| `POST` | `/pedidos` | No | **Exento** | `201` |
| `GET` | `/auth/session` | No | No aplica | `200` con `autenticado: false` |
| `GET` | `/auth/csrf` | No | No aplica | `200` |
| `POST` | `/auth/login` | No | Requerido | `200` o `401 CREDENCIALES_INVALIDAS`; sin token, `403 CSRF_INVALIDO` |
| `POST` | `/auth/logout` | No | Requerido | `204`; sin token, `403 CSRF_INVALIDO` |
| `GET` | `/pedidos`, `/pedidos/{id}` | Sí | No aplica | `401 NO_AUTENTICADO` |
| `POST` | `/pedidos/{id}/confirmar`, `/en-preparacion`, `/listo`, `/entregado`, `/cancelar`, `/rechazar` | Sí | Requerido | `401 NO_AUTENTICADO` |
| `POST` | `/pedidos/{id}/productos`, `/pedidos/{id}/combos` | Sí | Requerido | `401 NO_AUTENTICADO` |
| `DELETE` | `/pedidos/{id}/items/{itemId}` | Sí | Requerido | `401 NO_AUTENTICADO` |
| `PATCH` | `/pedidos/{id}/items/{itemId}/cantidad` | Sí | Requerido | `401 NO_AUTENTICADO` |
| `GET` | `/admin/comercial/productos`, `/admin/comercial/productos/{id}` | Sí | No aplica | `401 NO_AUTENTICADO` |
| `POST`, `PUT` | `/admin/comercial/productos/**` | Sí | Requerido | `401 NO_AUTENTICADO` |
| `GET` | `/admin/comercial/combos`, `/admin/comercial/combos/{id}` | Sí | No aplica | `401 NO_AUTENTICADO` |
| `POST`, `PUT` | `/admin/comercial/combos/**` | Sí | Requerido | `401 NO_AUTENTICADO` |
| `GET` | `/ingredients/**`, `/products/**`, `/measurement-units` | Sí | No aplica | `401 NO_AUTENTICADO` |
| `POST`, `PUT` | `/ingredients/**`, `/products/**` | Sí | Requerido | `401 NO_AUTENTICADO` |
| Cualquiera | Cualquier otra ruta, exista o no | Sí | Requerido si es escritura | `401 NO_AUTENTICADO` |

`POST /pedidos` y `GET /pedidos` comparten ruta pero no acceso: la regla distingue por método.

## Respuestas de la capa de seguridad

Las escribe `RespuestasDeSeguridad`, antes de llegar a un controlador. `Content-Type: application/problem+json`.

| Situación | Status | `code` |
|---|---|---|
| Sin sesión, sobre un recurso protegido | 401 | `NO_AUTENTICADO` |
| Usuario o contraseña incorrectos, faltantes, o usuario inactivo | 401 | `CREDENCIALES_INVALIDAS` |
| Con sesión, sin el rol necesario | 403 | `ACCESO_DENEGADO` |
| Con sesión, token CSRF ausente o inválido | 403 | `CSRF_INVALIDO` |
| Sin sesión, token CSRF ausente o inválido, sobre una ruta `/auth/...` | 403 | `CSRF_INVALIDO` |
| Sin sesión, token CSRF ausente o inválido, sobre cualquier otra ruta | 401 | `NO_AUTENTICADO` |

`ACCESO_DENEGADO` no puede ocurrir hoy en la práctica: el único rol que existe es `ADMIN`.

Nunca hay redirección a una página de login ni respuesta HTML.

```json
{
  "title": "No autenticado",
  "status": 401,
  "detail": "Se requiere iniciar sesion para acceder a este recurso",
  "instance": "/pedidos",
  "code": "NO_AUTENTICADO"
}
```

```json
{
  "title": "Token CSRF invalido",
  "status": 403,
  "detail": "Falta el token CSRF o no es valido. Obtenga uno nuevo en GET /auth/csrf",
  "instance": "/admin/comercial/productos",
  "code": "CSRF_INVALIDO"
}
```

## Formato de los errores

Los errores de la aplicación (secciones 1 y 2) comparten una misma forma; los que ningún manejador intercepta (sección 3) tienen otra. El frontend debe leer `status` y, si existe, `code`.

### 1. Errores de un controlador (la mayoría)

RFC 7807 con la propiedad adicional `code`. `Content-Type: application/problem+json`.

```json
{
  "title": "Pedido no encontrado",
  "status": 404,
  "detail": "Pedido no encontrado: id=999999",
  "instance": "/pedidos/999999",
  "code": "PEDIDO_NOT_FOUND"
}
```

### 2. Errores de la capa de seguridad

Misma forma y mismos campos (ver ejemplos de la sección anterior). Las escribe la aplicación a mano, no el framework.

**Sobre el campo `type` de RFC 7807** — `PENDIENTE_DE_CONFIRMAR`: los errores de seguridad nunca lo incluyen. En los de controlador, la versión del framework en uso (Spring 7.0.6) deja `type` sin valor por defecto, por lo que no se espera en la respuesta; sin embargo `../integration/INTEGRATION_GUIDE.md`, escrita con una versión anterior, lo muestra como `"about:blank"`. Evidencia faltante: un test que lo fije. **El frontend debe tratarlo como opcional y no usarlo.**

### 3. Errores que ningún manejador intercepta

Los genera Spring. **No tienen `code`** y su cuerpo no forma parte de ningún contrato. Estado: `IMPLEMENTADO_NO_VALIDADO` — no hay tests que fijen su forma.

| Caso | Dónde ocurre | Status esperado |
|---|---|---|
| JSON ilegible o con tipos incorrectos | `/admin/comercial/**`, `/ingredients/**`, `/products/**` | 400 |
| Parámetro de ruta o de query no numérico (`/admin/comercial/productos/abc`, `page=x`) | `/admin/comercial/**`, `/ingredients/**`, `/products/**` | 400 |
| Método no soportado en una ruta existente | Cualquiera, con sesión | 405 |
| `Content-Type` distinto de JSON en un endpoint con cuerpo | Cualquiera | 415 |
| Ruta inexistente, con sesión | Cualquiera | 404 |
| Error inesperado del servidor | Cualquiera | 500 |

En `/pedidos/**` los dos primeros casos **sí** están manejados y devuelven `400 VALIDATION_ERROR` (forma 1).

`PENDIENTE_DE_CONFIRMAR`: el cuerpo exacto de estas respuestas. Evidencia faltante: una ejecución real o un test de cada caso.

### Regla para el frontend

- Decidir siempre por `status` y `code`. **Nunca** por el texto de `title` o `detail`: son para personas y pueden cambiar.
- `detail` puede mostrarse como apoyo, pero está en español sin tildes en algunos casos y con tildes en otros; conviene que la interfaz tenga sus propios textos por `code`.
- Tratar la ausencia de `code` como error genérico.

## Catálogo de códigos de error

| `code` | Status | Origen | Significado |
|---|---|---|---|
| `NO_AUTENTICADO` | 401 | Seguridad | Falta sesión |
| `CREDENCIALES_INVALIDAS` | 401 | Seguridad | Login rechazado |
| `ACCESO_DENEGADO` | 403 | Seguridad | Sesión sin permiso |
| `CSRF_INVALIDO` | 403 | Seguridad | Token CSRF ausente o inválido |
| `VALIDATION_ERROR` | 400 | Todos los módulos | Dato faltante, inválido o fuera de límites. **También una transición de estado de pedido no permitida** |
| `PEDIDO_NOT_FOUND` | 404 | Pedido | El pedido no existe |
| `PRODUCTO_COMERCIAL_NOT_FOUND` | 404 | Comercial y Pedido | El producto comercial no existe |
| `COMBO_COMERCIAL_NOT_FOUND` | 404 | Comercial y Pedido | El combo comercial no existe |
| `PRODUCTO_COMERCIAL_INACTIVO` | 409 | Comercial y Pedido | Se intentó usar un producto inactivo (como componente de un combo o en un pedido) |
| `COMBO_COMERCIAL_INACTIVO` | 409 | Pedido | Se intentó pedir un combo inactivo |
| `PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO` | 409 | Comercial | No se puede desactivar: lo usa un combo activo |
| `COMBO_COMERCIAL_COMPONENTE_INACTIVO` | 409 | Comercial | No se puede activar el combo: tiene un componente inactivo |
| `ARTICLE_NOT_FOUND` | 404 | Producción | Ingrediente o producto de inventario inexistente |
| `UNIDAD_MEDIDA_NOT_FOUND` | 404 | Producción | Unidad de medida inexistente |
| `RECIPE_NOT_FOUND` | 404 | Producción | Definido en el manejador; ningún endpoint actual lo produce |
| `INSUFFICIENT_STOCK` | 409 | Producción | Stock insuficiente |
| `UNIDAD_MEDIDA_BLOQUEADA` | 409 | Producción | No se puede cambiar la unidad de medida |
| `ARTICULO_INACTIVO` | 409 | Producción | Operación sobre un artículo inactivo |
| `INTERNAL_CONFIGURATION_ERROR` | 500 | Producción | Falta un dato de referencia del sistema |

Particularidades que el frontend debe conocer:

- **`VALIDATION_ERROR` es un único código para muchas causas.** No hay un detalle por campo: la respuesta no dice qué campo falló de forma estructurada, solo en el texto de `detail`. Para marcar campos en un formulario, el frontend debe validar antes de enviar (validación de UX) y mostrar `detail` como mensaje general si el servidor rechaza.
- **Las transiciones de estado inválidas de un pedido responden `400 VALIDATION_ERROR`, no `409`.** Es una decisión registrada (`docs/MVP-ROADMAP.md`, G15).
- **"Item no encontrado"** dentro de un pedido también es `400 VALIDATION_ERROR`, no `404`.
- Solo se informa **el primer error** encontrado.

## CSRF

1. `GET /auth/csrf` con cookies devuelve `{ "headerName": "X-CSRF-TOKEN", "token": "..." }`.
2. Cada escritura envía esa cabecera.
3. **El token cambia al iniciar y al cerrar sesión.** Hay que volver a pedirlo después de cada login y de cada logout.
4. El token está ligado a la sesión: sin enviar cookies, el token recibido no sirve para la petición siguiente.

No se usa una cookie `XSRF-TOKEN`: los mecanismos automáticos de Axios o Angular basados en esa cookie **no funcionan**. El token se lee del cuerpo de `GET /auth/csrf`.

Secuencia completa: [`autenticacion.md`](autenticacion.md).

## CORS

| Aspecto | Valor |
|---|---|
| Orígenes permitidos | Lista exacta, variable `ALACAN_CORS_ALLOWED_ORIGINS`. Sin comodines |
| Valor por defecto en el perfil `dev` | `http://localhost:5173` y `http://192.168.1.38:5173` |
| Valor por defecto fuera de `dev` | Ninguno: no se concede acceso entre orígenes |
| Credenciales | Permitidas (`Access-Control-Allow-Credentials: true`) |
| Métodos | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| Cabeceras que el cliente puede enviar | `Content-Type`, `X-CSRF-TOKEN` |
| Cabeceras de respuesta legibles por JavaScript | `Location` |

Consecuencias para el frontend:

- Un origen es esquema + host + puerto. `http://localhost:5173` y `http://127.0.0.1:5173` son distintos: el segundo no está permitido por defecto.
- **No enviar otras cabeceras propias** (`Authorization`, `X-Requested-With`, `Accept-Language` personalizada, etc.) en peticiones entre orígenes: el preflight las rechaza.
- Si el servidor de desarrollo del frontend usa un proxy hacia la API, las peticiones son del mismo origen y CORS no interviene.

## Tipos de contenido

| Operación | `Content-Type` de la petición |
|---|---|
| `POST /auth/login` | `application/x-www-form-urlencoded` |
| `POST /auth/logout`, transiciones de pedido, activar y desactivar | Sin cuerpo |
| Todas las demás escrituras | `application/json` |

Respuestas exitosas: `application/json`. Errores: `application/problem+json`.

## Limitaciones conocidas

| Limitación | Efecto en el frontend |
|---|---|
| Sesiones en memoria del proceso | Un reinicio de la API cierra todas las sesiones: el panel debe manejar un `401` en cualquier momento |
| Sin límite de intentos de login | No hay respuesta de "cuenta bloqueada" que manejar |
| Sin límite de frecuencia en `POST /pedidos` | El frontend debe evitar el doble envío (deshabilitar el botón): cada envío crea un pedido |
| Sin control de concurrencia en pedidos | Dos acciones simultáneas sobre el mismo pedido: prevalece la última. Conviene recargar el pedido después de cada acción |
| Validación contra MySQL real parcial | El 2026-10-21 `EsquemaSobreMysqlRealTest` validó contra MySQL 8.0, sobre la base aislada `alacan_test`, los flujos que cubre (4 de 4 tests), entre ellos el login, `401` sin sesión y `403` sin token CSRF. El resto de la matriz de acceso, CSRF, CORS y los demás endpoints solo se verificaron con tests sobre H2 y siguen pendientes de validación contra MySQL (`../08-delivery/base-de-datos.md`) |
