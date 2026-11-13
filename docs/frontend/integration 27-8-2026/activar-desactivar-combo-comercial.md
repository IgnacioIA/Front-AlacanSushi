---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Activar/Desactivar Combo Comercial

Realiza: [UC-COM-007](../../../04-use-cases/use-cases/UC-COM-007-activar-desactivar-combo-comercial.md).

## Endpoint

`/admin/comercial/combos/{id}/activar` y `/admin/comercial/combos/{id}/desactivar`.

## HTTP Method

`POST`

## Authentication

Ninguna.

## Request

Sin body.

## Response

`200 OK` — el Combo Comercial con su nuevo `activo`.

## Status Codes

| Código | Cuándo |
|---|---|
| `200 OK` | Transición aplicada |
| `404 Not Found` | id inexistente |

## Validation

Ninguna más allá de la existencia del recurso — sin restricción por el estado de sus componentes (`GAP-COM-001`, `PENDIENTE`).

## Errors

RFC 7807. Código: `COMBO_COMERCIAL_NOT_FOUND` (404).

## Pagination / Filtering

No aplica.

## Idempotency

Idempotente — repetir la misma transición no produce error ni cambia el resultado.

## Compatibility

Primera versión.
