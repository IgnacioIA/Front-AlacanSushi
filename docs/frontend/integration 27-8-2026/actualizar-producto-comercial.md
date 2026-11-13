---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Actualizar Producto Comercial

Realiza: [UC-COM-002](../../../04-use-cases/use-cases/UC-COM-002-modificar-producto-comercial.md).

## Endpoint

`/admin/comercial/productos/{id}`

## HTTP Method

`PUT`

## Authentication

Ninguna (ver nota en `crear-producto-comercial.md`).

## Request

```json
{
  "nombre": "Hamburguesa completa XL",
  "descripcion": "Con papas y bebida a elección",
  "precio": 9500,
  "imagen": "https://cdn.ejemplo.com/hamburguesa-xl.jpg"
}
```

Mismos campos que la creación (`nombre`, `descripcion`, `precio`, `imagen`) — reemplazo completo de los valores editables, no un `PATCH` parcial (consistente con el uso de `PUT`).

## Response

`200 OK` — el Producto Comercial actualizado, misma forma que la respuesta de creación.

## Status Codes

| Código | Cuándo |
|---|---|
| `200 OK` | Actualizado correctamente |
| `400 Bad Request` | `nombre`/`precio` inválidos |
| `404 Not Found` | id inexistente |

## Validation

`INV-COM-001`, `INV-COM-002`.

## Errors

RFC 7807, mismo formato que `crear-producto-comercial.md`. Código adicional: `PRODUCTO_COMERCIAL_NOT_FOUND` (404).

## Pagination / Filtering

No aplica.

## Idempotency

`PUT` con reemplazo completo del recurso — naturalmente idempotente (ejecutarlo N veces con el mismo body produce el mismo estado final).

## Compatibility

Primera versión.
