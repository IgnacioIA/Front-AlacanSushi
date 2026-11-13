---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Crear Producto Comercial

Realiza: [UC-COM-001](../../../04-use-cases/use-cases/UC-COM-001-crear-producto-comercial.md). `implementation_status` de la capacidad: ver ese Use Case (`NOT_STARTED`) — no se duplica acá.

## Endpoint

`/admin/comercial/productos`

## HTTP Method

`POST`

## Authentication

Ninguna — Spring Security está solo planificado, sin dependencia en `pom.xml` (`docs/PROJECT.md` §6). Documentado explícitamente, no omitido.

## Request

```json
{
  "nombre": "Hamburguesa completa",
  "descripcion": "Con papas y bebida a elección",
  "precio": 8500,
  "imagen": "https://cdn.ejemplo.com/hamburguesa.jpg"
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `nombre` | string | Sí | No vacío (`INV-COM-001`) |
| `descripcion` | string | No | — |
| `precio` | number | Sí | > 0 (`INV-COM-002`) |
| `imagen` | string (URL) | No | Solo referencia, sin subida de archivo en este contrato |

**Nunca se recibe:** `id`, `activo` (se fuerza a `true`), ningún dato de Producción/Stock/receta.

## Response

`201 Created`

```json
{
  "id": 42,
  "nombre": "Hamburguesa completa",
  "descripcion": "Con papas y bebida a elección",
  "precio": 8500,
  "imagen": "https://cdn.ejemplo.com/hamburguesa.jpg",
  "activo": true
}
```

Header `Location: /admin/comercial/productos/{id}`.

## Status Codes

| Código | Cuándo |
|---|---|
| `201 Created` | Producto Comercial creado |
| `400 Bad Request` | `nombre` vacío o `precio` inválido |

## Validation

`INV-COM-001`, `INV-COM-002` (`02-domain/producto-comercial.md`).

## Errors

Formato RFC 7807 (`ProblemDetail`), mismo mecanismo ya usado por `Produccion.GlobalExceptionHandler` — `title`, `detail`, `status`, y una propiedad `code` estable para que el Frontend no dependa del texto de `detail`:

```json
{
  "type": "about:blank",
  "title": "Solicitud inválida",
  "status": 400,
  "detail": "Nombre requerido",
  "code": "VALIDATION_ERROR"
}
```

## Pagination

No aplica.

## Filtering

No aplica.

## Idempotency

No idempotente — cada solicitud crea un Producto Comercial nuevo (mismo criterio que `POST /ingredients` en Producción). Sin mecanismo de deduplicación en esta especificación — no se identificó un riesgo de negocio distinto al ya conocido y no resuelto para operaciones `POST` similares (ver `05-contracts/README.md`, nota de idempotencia).

## Compatibility

Primera versión — sin compromisos de retrocompatibilidad todavía.
