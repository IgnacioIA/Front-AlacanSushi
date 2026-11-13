# Contratos de API para el frontend — Alacan MVP

Versión: 1.0 — 2026-10-09
Corresponde al backend en la rama `feature/mvp`, Slices 0 a 4.

Documentación de la API HTTP del backend, escrita para que el equipo de frontend pueda configurar su cliente, construir las pantallas con mocks y conectarlas sin leer el código Java.

## Alcance

El flujo del MVP:

```text
Administrador administra el catálogo
  → Cliente consulta el catálogo público
  → Cliente crea un pedido
  → Administrador recibe y gestiona el pedido
```

**Incluido:** autenticación del administrador, catálogo comercial (productos y combos), catálogo público, alta pública de pedidos, listado, detalle y cambios de estado de pedidos.

**No incluido en el MVP, y no disponible salvo que se indique:** stock operativo, consumo de ingredientes, producción, mesas y salón, pagos, promociones, estadísticas, seguimiento público de pedidos, contenido institucional administrable. Los endpoints de inventario existen, pero ninguna pantalla del MVP los usa.

## Lo esencial en un minuto

- **Sesión con cookie, no JWT.** Enviar cookies siempre (`credentials: "include"`). No hay cabecera `Authorization`.
- **CSRF en toda escritura**, salvo `POST /pedidos`. El token se pide en `GET /auth/csrf`, va en `X-CSRF-TOKEN` y **cambia después de cada login y logout**.
- **El login es un formulario**, no JSON.
- **Público:** `GET /catalogo` y `POST /pedidos`. Todo lo demás requiere sesión de administrador.
- **Errores:** JSON con `status` y `code`. Decidir por `code`, nunca por el texto.
- **Varias respuestas exitosas no tienen cuerpo** (transiciones de pedido, logout).
- **El backend decide** precios, totales, estados y qué se puede comprar.
- **Sin prefijo `/api` ni versión** en las rutas.

## Guía de lectura

| Si necesitás… | Leé |
|---|---|
| Empezar a integrar | [`frontend-integration.md`](frontend-integration.md) |
| Saber qué existe y qué falta | [`estado-de-api.md`](estado-de-api.md) |
| Implementar login y sesión | [`autenticacion.md`](autenticacion.md) |
| Entender errores, CSRF y CORS | [`errores-y-seguridad.md`](errores-y-seguridad.md) |
| Construir la web pública | [`catalogo-publico.md`](catalogo-publico.md) y [`pedidos.md`](pedidos.md) (PED-01) |
| Construir el panel de catálogo | [`catalogo-admin.md`](catalogo-admin.md) |
| Construir el panel de pedidos | [`pedidos.md`](pedidos.md) |
| Tipos, enums y formatos | [`modelos.md`](modelos.md) |
| Inventario (fuera del MVP) | [`recursos-auxiliares.md`](recursos-auxiliares.md) |
| Una especificación legible por herramientas | [`openapi.yaml`](openapi.yaml) |

Orden sugerido para quien llega por primera vez: este archivo, `frontend-integration.md`, `errores-y-seguridad.md`, `autenticacion.md`, y luego el documento del área en la que vaya a trabajar.

## Documentos

| Documento | Contenido |
|---|---|
| [`README.md`](README.md) | Índice, alcance y convenciones |
| [`autenticacion.md`](autenticacion.md) | Cookie de sesión, token CSRF, login, sesión actual, logout |
| [`catalogo-publico.md`](catalogo-publico.md) | Consulta pública del catálogo |
| [`catalogo-admin.md`](catalogo-admin.md) | Productos y combos comerciales: listar, crear, modificar, activar, desactivar |
| [`pedidos.md`](pedidos.md) | Alta pública, listado paginado, detalle, transiciones, edición de líneas |
| [`recursos-auxiliares.md`](recursos-auxiliares.md) | Ingredientes, productos de inventario y unidades de medida |
| [`modelos.md`](modelos.md) | Esquemas JSON, enums, formatos de fecha e importe, tipos TypeScript |
| [`errores-y-seguridad.md`](errores-y-seguridad.md) | Matriz de acceso, formato de errores, catálogo de códigos, CSRF, CORS |
| [`frontend-integration.md`](frontend-integration.md) | Cliente HTTP, autenticación en React, mapa de pantallas, mocks, matriz de preparación |
| [`estado-de-api.md`](estado-de-api.md) | Inventario de los 47 endpoints, brechas, decisiones abiertas, discrepancias |
| [`openapi.yaml`](openapi.yaml) | Especificación OpenAPI 3.0 de los endpoints del MVP |

## Convenciones de estos documentos

Cada endpoint tiene un identificador (`AUTH-01`, `CAT-01`, `COM-P-01`, `COM-C-01`, `PED-01`, `AUX-01`) y una ficha con: estado, método y ruta, acceso y CSRF, parámetros, cuerpo, respuesta, errores, reglas para el frontend, dependencias y limitaciones.

Estados usados:

| Estado | Significado |
|---|---|
| `IMPLEMENTADO` | Existe y está cubierto por tests automáticos |
| `IMPLEMENTADO_NO_VALIDADO` | Existe; el comportamiento se dedujo del código sin una prueba que lo confirme |
| `PARCIAL` | Existe, pero no cubre todo lo que una pantalla necesita |
| `PENDIENTE` | No implementado. No tiene ruta |
| `DECISIÓN_REQUERIDA` | Ambigüedad funcional sin resolver |
| `PENDIENTE_DE_CONFIRMAR` | Detalle que no pudo determinarse; se indica qué evidencia falta |

Los ejemplos usan un mismo juego de datos en todos los documentos (productos 1 a 4, combo 1, pedidos 15 y 16). Son ficticios: ningún id, nombre, teléfono o credencial es real.

## Relación con el resto de la documentación

Estos documentos son una **vista para el consumidor** de la API. No reemplazan a la especificación SDD del proyecto:

| Documentación | Ubicación | Papel |
|---|---|---|
| Contratos SDD por operación (autenticación, Comercial, Pedido) | [`../05-contracts/api/`](../05-contracts/api/) | Fuente contractual: decisiones, compatibilidad, trazabilidad con casos de uso |
| Contratos de inventario | [`../integration/`](../integration/) | Fuente contractual del módulo Producción |
| Diseño de seguridad | [`../03-architecture/security.md`](../03-architecture/security.md) | Motivos y configuración |
| Hoja de ruta del MVP | [`../MVP-ROADMAP.md`](../MVP-ROADMAP.md) | Alcance, decisiones y riesgos |
| Base de datos | [`../08-delivery/base-de-datos.md`](../08-delivery/base-de-datos.md) | Esquema y migraciones |

Si un documento de esta carpeta contradice al código, vale el código, y la contradicción es un defecto de documentación que hay que reportar. Las discrepancias detectadas al escribirlos están en [`estado-de-api.md`](estado-de-api.md#discrepancias-encontradas-durante-el-relevamiento).

## Cómo se elaboró

Relevando el código de los controladores, DTOs, mappers, servicios, entidades, enums, manejadores de excepciones y la configuración de seguridad, y usando los tests existentes como evidencia del comportamiento. **No se ejecutó la aplicación** ni se probó contra MySQL o un navegador; el nivel de validación de cada parte está en [`estado-de-api.md`](estado-de-api.md#nivel-de-validación).
