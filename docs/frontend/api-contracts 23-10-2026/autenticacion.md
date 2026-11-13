# Autenticación y sesión

Fuente: `Seguridad/api/config/SecurityConfig.java`, `Seguridad/api/controller/AuthController.java`, `Seguridad/api/security/RespuestasDeSeguridad.java`, `application.properties`, tests del paquete `Seguridad`.

Contratos SDD de origen: [`../05-contracts/api/auth/`](../05-contracts/api/auth/).

**La API usa sesión HTTP con cookie. No hay JWT ni cabecera `Authorization`.** Un login exitoso no devuelve ningún token de acceso: devuelve una cookie que el navegador reenvía solo.

## Cookie de sesión

| Atributo | Valor | De dónde sale |
|---|---|---|
| Nombre | `ALACAN_SESSION` | `server.servlet.session.cookie.name` |
| `HttpOnly` | Siempre | Configuración fija. JavaScript no puede leerla |
| `Secure` | `true` por defecto; `false` en el perfil `dev` | `ALACAN_SESSION_COOKIE_SECURE` |
| `SameSite` | `Lax` por defecto | `ALACAN_SESSION_COOKIE_SAME_SITE` |
| Expiración | 8 horas **de inactividad** por defecto | `ALACAN_SESSION_TIMEOUT` |
| Transporte | Solo cookie, nunca en la URL | Configuración fija |

- La cookie no tiene fecha de expiración propia: es una cookie de sesión del navegador. Lo que vence es la sesión en el servidor.
- El frontend **no puede ni necesita** leer la cookie. Para saber si hay sesión se consulta `GET /auth/session`.
- Con `Secure` activo el navegador no envía la cookie por HTTP: fuera de desarrollo la API debe servirse por HTTPS.
- Las sesiones viven en memoria del proceso: reiniciar la API las cierra todas.

`PENDIENTE_DE_CONFIRMAR`: `Path` y `Domain` de la cookie. No están configurados explícitamente; valen los valores por defecto del servidor. Evidencia faltante: la cabecera `Set-Cookie` de una ejecución real.

## Reglas comunes

- Todas las peticiones del panel, y las cuatro de `/auth`, deben **enviar cookies**: `credentials: "include"` en `fetch`, `withCredentials: true` en Axios.
- Toda escritura lleva la cabecera `X-CSRF-TOKEN`, salvo `POST /pedidos`.
- El token CSRF **cambia al iniciar y al cerrar sesión**.

---

## AUTH-01 — Obtener el token CSRF

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /auth/csrf` |
| Autenticación | Ninguna |
| CSRF | No aplica |
| Cabeceras requeridas | Ninguna. Debe enviar cookies |
| Parámetros / cuerpo | Ninguno |

**Finalidad.** Entregar el token que el cliente reenvía en cada escritura.

**Respuesta `200 OK`**, con `Cache-Control: no-store`:

```json
{
  "headerName": "X-CSRF-TOKEN",
  "token": "kQ3n...valor-opaco...9aZ"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `headerName` | string | Nombre de la cabecera donde reenviar el token. Hoy siempre `X-CSRF-TOKEN` |
| `token` | string | Opaco. Su largo y formato no son parte del contrato |

**Errores.** Ninguno propio.

**Reglas para el frontend.**

- La primera llamada abre una sesión anónima y devuelve la cookie `ALACAN_SESSION`. El token solo vale junto con esa cookie.
- Guardar el token en memoria (estado de la aplicación), no en `localStorage`.
- Volver a pedirlo después de cada login, de cada logout y ante un `403 CSRF_INVALIDO`.

**Depende de.** Nada. **Lo consumen.** Login, logout y todas las escrituras del panel.

---

## AUTH-02 — Iniciar sesión

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /auth/login` |
| Autenticación | Ninguna: es el punto de entrada |
| CSRF | **Requerido** |
| `Content-Type` | `application/x-www-form-urlencoded` — **no JSON** |
| Cabeceras requeridas | `X-CSRF-TOKEN`. Debe enviar cookies |

**Finalidad.** Autenticar al administrador y abrir su sesión. Lo procesa el filtro de login de Spring Security, no un controlador: por eso el cuerpo es un formulario.

**Cuerpo:**

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `username` | string | Sí | Nombre exacto del parámetro |
| `password` | string | Sí | Nombre exacto del parámetro |

```text
POST /auth/login
Content-Type: application/x-www-form-urlencoded
X-CSRF-TOKEN: kQ3n...9aZ
Cookie: ALACAN_SESSION=...

username=administrador&password=una-contrasena-de-ejemplo
```

Un cuerpo JSON `{"username": "...", "password": "..."}` **no** se interpreta: el servidor no encuentra los parámetros y responde `401 CREDENCIALES_INVALIDAS`.

**Respuesta `200 OK`** (`application/json`):

```json
{
  "autenticado": true,
  "username": "administrador",
  "rol": "ADMIN"
}
```

Incluye `Set-Cookie: ALACAN_SESSION=...` con un **identificador nuevo**: la sesión anónima no se reutiliza.

**Errores:**

| Status | `code` | Cuándo |
|---|---|---|
| 401 | `CREDENCIALES_INVALIDAS` | Usuario inexistente, contraseña incorrecta, campos faltantes o usuario inactivo. El mensaje es el mismo en todos los casos |
| 403 | `CSRF_INVALIDO` | Falta `X-CSRF-TOKEN`, o no corresponde a la sesión de las cookies enviadas |

```json
{
  "title": "Credenciales invalidas",
  "status": 401,
  "detail": "Usuario o contrasena incorrectos",
  "instance": "/auth/login",
  "code": "CREDENCIALES_INVALIDAS"
}
```

**Reglas para el frontend.**

- Después de un login exitoso, **pedir un token CSRF nuevo** antes de la primera escritura.
- No mostrar mensajes distintos para "usuario inexistente" y "contraseña incorrecta": la API no los distingue.
- No hay bloqueo por intentos, ni "recordarme", ni recuperación de contraseña.
- Iniciar sesión estando ya autenticado es válido: la sesión recibe un identificador nuevo.

**Depende de.** AUTH-01. **Lo consume.** Pantalla de login.

---

## AUTH-03 — Consultar la sesión actual

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /auth/session` |
| Autenticación | Ninguna. Es público a propósito |
| CSRF | No aplica |
| Cabeceras requeridas | Ninguna. Debe enviar cookies |
| Parámetros / cuerpo | Ninguno |

**Finalidad.** Saber si hay una sesión de administrador sin provocar un `401`.

**Respuesta `200 OK`, siempre**, con `Cache-Control: no-store`.

Con sesión:

```json
{
  "autenticado": true,
  "username": "administrador",
  "rol": "ADMIN"
}
```

Sin sesión, o con una sesión vencida o cerrada:

```json
{
  "autenticado": false,
  "username": null,
  "rol": null
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `autenticado` | boolean | — |
| `username` | string \| null | — |
| `rol` | string \| null | `ADMIN` es el único valor posible hoy |

Nunca incluye el identificador de sesión, la contraseña ni su hash. No hay más datos del usuario (nombre, email, avatar): no existen en el modelo.

**Errores.** Ninguno propio.

**Reglas para el frontend.**

- Llamarlo al cargar la aplicación para decidir entre mostrar el login o el panel.
- No es un sustituto de la autorización: que responda `autenticado: true` no garantiza que la sesión siga viva en la siguiente petición. Cualquier llamada puede devolver `401 NO_AUTENTICADO`.

**Lo consumen.** Arranque de la aplicación, guardas de rutas, encabezado del panel.

---

## AUTH-04 — Cerrar sesión

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `POST /auth/logout` |
| Autenticación | No exige estar autenticado |
| CSRF | **Requerido** |
| Cabeceras requeridas | `X-CSRF-TOKEN`. Debe enviar cookies |
| Cuerpo | Ninguno |

**Respuesta `204 No Content`**, sin cuerpo. El servidor invalida la sesión y ordena borrar la cookie.

**Errores:**

| Status | `code` | Cuándo |
|---|---|---|
| 403 | `CSRF_INVALIDO` | Token ausente o inválido. **La sesión no se cierra** |

**Reglas para el frontend.**

- Si el logout responde `403 CSRF_INVALIDO`, pedir un token nuevo y reintentar; no dar la sesión por cerrada.
- Después de un logout exitoso el token CSRF anterior deja de servir.
- Es idempotente: cerrar una sesión ya cerrada responde `204`, con un token válido para la sesión actual.

**Depende de.** AUTH-01. **Lo consume.** Menú del panel.

---

## Operaciones que no existen

Estado `PENDIENTE` — fuera del MVP. No tienen ruta; no deben simularse como disponibles.

| Operación | Observación |
|---|---|
| Registro de usuarios | El administrador se crea al arrancar la API, por variables de entorno |
| Cambio de contraseña | Requiere intervenir en la base |
| Recuperación de contraseña | — |
| Gestión de usuarios o roles | Hay un solo usuario y un solo rol |
| Renovación explícita de sesión | La sesión se renueva sola con cada petición |

## Secuencia de integración

```text
Arranque de la aplicación
  1. GET  /auth/session                  -> autenticado: true | false
     false -> mostrar login
     true  -> 2

Login
  a. GET  /auth/csrf                     -> token T1 (abre sesión anónima)
  b. POST /auth/login   X-CSRF-TOKEN: T1 -> 200 + cookie nueva
  c. GET  /auth/csrf                     -> token T2 (T1 ya no sirve)

Uso del panel
  2. GET  /auth/csrf (si no se tiene)    -> token vigente
  3. Lecturas:   GET ...                 (solo cookies)
  4. Escrituras: POST|PUT|PATCH|DELETE   X-CSRF-TOKEN: token vigente

Logout
  5. POST /auth/logout  X-CSRF-TOKEN     -> 204
  6. Descartar el token y el estado del panel
```

Manejo de errores de sesión en cualquier llamada del panel:

| Respuesta | Qué hacer |
|---|---|
| `401 NO_AUTENTICADO` | La sesión venció o la API se reinició. Limpiar el estado y llevar al login |
| `403 CSRF_INVALIDO` | Pedir un token nuevo con `GET /auth/csrf` y reintentar **una vez**. Si vuelve a fallar, tratarlo como sesión perdida |
| `403 ACCESO_DENEGADO` | Mostrar "sin permiso". No ocurre hoy con un único rol |

Ejemplo de cliente y recomendaciones para React: [`frontend-integration.md`](frontend-integration.md).
