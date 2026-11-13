---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Activar/Desactivar Producto Comercial

Realiza: [UC-COM-003](../../../04-use-cases/use-cases/UC-COM-003-activar-desactivar-producto-comercial.md).

## Endpoint

`/admin/comercial/productos/{id}/activar` y `/admin/comercial/productos/{id}/desactivar` — dos operaciones simétricas, sin body.

## HTTP Method

`POST`

## Authentication

Ninguna.

## Request

Sin body.

## Response

`200 OK` — el Producto Comercial con su nuevo `activo`.

```json
{
  "id": 42,
  "nombre": "Hamburguesa completa",
  "descripcion": "Con papas y bebida a elección",
  "precio": 8500,
  "imagen": "https://cdn.ejemplo.com/hamburguesa.jpg",
  "activo": false
}
```

## Status Codes

| Código | Cuándo |
|---|---|
| `200 OK` | Transición aplicada |
| `404 Not Found` | id inexistente |

## Validation

Ninguna más allá de la existencia del recurso — sin regla de negocio que bloquee la transición en esta especificación (`GAP-COM-001`, `PENDIENTE`).

## Errors

RFC 7807. Código: `PRODUCTO_COMERCIAL_NOT_FOUND` (404).

## Pagination / Filtering

No aplica.

## Idempotency

Idempotente en el sentido de que repetir `desactivar` sobre un Producto Comercial ya inactivo no produce error ni cambia el resultado — mismo criterio ya establecido para `Articulo.desactivar()` en Producción (`docs/02-domain/articulo.md`).

## Compatibility

Primera versión.
