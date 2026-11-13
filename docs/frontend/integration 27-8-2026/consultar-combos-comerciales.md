---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Consultar Combos Comerciales (administrativo)

Realiza: [UC-COM-008](../../../04-use-cases/use-cases/UC-COM-008-consultar-combos-comerciales.md). Cubre dos endpoints, mismo criterio que `consultar-productos-comerciales.md`.

## Endpoint 1 — Listado

`/admin/comercial/combos`

### HTTP Method

`GET`

### Request

Mismos query params que el listado de Productos Comerciales (`page`, `size`, `search`, `estado`).

### Response

`200 OK` — página de Combos Comerciales, cada uno con sus `componentes`.

### Pagination / Filtering

Igual que `consultar-productos-comerciales.md`.

## Endpoint 2 — Detalle

`/admin/comercial/combos/{id}`

### HTTP Method

`GET`

### Response

`200 OK` — el Combo Comercial completo, incluyendo `activo` y `componentes` (cada uno con `productoComercialId`, `nombre` y `cantidad`).

### Status Codes

| Código | Cuándo |
|---|---|
| `200 OK` | Encontrado |
| `404 Not Found` | id inexistente |

## Authentication

Ninguna.

## Errors

RFC 7807. Código: `COMBO_COMERCIAL_NOT_FOUND` (404, solo detalle).

## Idempotency

No aplica — `GET`.

## Compatibility

Primera versión.
