---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Actualizar Combo Comercial

Realiza: [UC-COM-006](../../../04-use-cases/use-cases/UC-COM-006-modificar-combo-comercial.md).

## Endpoint

`/admin/comercial/combos/{id}`

## HTTP Method

`PUT`

## Authentication

Ninguna.

## Request

Misma forma que la creación (`nombre`, `descripcion`, `precio`, `imagen`, `componentes`) — reemplazo completo, incluyendo la lista de componentes.

## Response

`200 OK` — el Combo Comercial actualizado, misma forma que la respuesta de creación.

## Status Codes

| Código | Cuándo |
|---|---|
| `200 OK` | Actualizado |
| `400 Bad Request` | valores inválidos, `componentes` vacío |
| `404 Not Found` | id de Combo inexistente, o algún `productoComercialId` nuevo inexistente |

## Validation

`INV-COM-003` a `INV-COM-007`.

## Errors

RFC 7807. Códigos: `VALIDATION_ERROR`, `COMBO_COMERCIAL_NOT_FOUND`, `PRODUCTO_COMERCIAL_NOT_FOUND`.

## Pagination / Filtering

No aplica.

## Idempotency

`PUT` con reemplazo completo — naturalmente idempotente.

## Compatibility

Primera versión.
