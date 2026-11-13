---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Consultar Productos Comerciales (administrativo)

Realiza: [UC-COM-004](../../../04-use-cases/use-cases/UC-COM-004-consultar-productos-comerciales.md). Cubre dos endpoints relacionados — mismo criterio de consolidación que el Use Case.

## Endpoint 1 — Listado

`/admin/comercial/productos`

### HTTP Method

`GET`

### Authentication

Ninguna.

### Request

Query params, todos opcionales:

| Param | Tipo | Notas |
|---|---|---|
| `page` | number | default `0` |
| `size` | number | default `15` (mismo default que `Produccion`, `IngredienteController`) |
| `search` | string | filtro por `nombre` |
| `estado` | string | `ACTIVO` \| `INACTIVO` — sin valor = todos |

### Response

`200 OK`

```json
{
  "contenido": [
    { "id": 42, "nombre": "Hamburguesa completa", "precio": 8500, "activo": true }
  ],
  "totalElementos": 1,
  "totalPaginas": 1,
  "paginaActual": 0
}
```

### Pagination

Sí — mismo formato que `PaginaResponse` ya usado en `Produccion` (referencia de forma, no de código — no se reutiliza la clase Java).

### Filtering

`search` (nombre), `estado` (activo/inactivo).

## Endpoint 2 — Detalle

`/admin/comercial/productos/{id}`

### HTTP Method

`GET`

### Response

`200 OK` — el Producto Comercial completo, incluyendo `activo`.

### Status Codes

| Código | Cuándo |
|---|---|
| `200 OK` | Encontrado |
| `404 Not Found` | id inexistente |

## Errors

RFC 7807. Código: `PRODUCTO_COMERCIAL_NOT_FOUND` (404, solo endpoint de detalle).

## Idempotency

No aplica — `GET`, naturalmente idempotente, sin necesidad de documentarlo (`05-contracts/README.md`, regla explícita).

## Compatibility

Primera versión.
