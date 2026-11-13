---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Crear Combo Comercial

Realiza: [UC-COM-005](../../../04-use-cases/use-cases/UC-COM-005-crear-combo-comercial.md).

## Endpoint

`/admin/comercial/combos`

## HTTP Method

`POST`

## Authentication

Ninguna.

## Request

```json
{
  "nombre": "Combo familiar",
  "descripcion": "2 hamburguesas + 2 papas + 2 bebidas",
  "precio": 15000,
  "imagen": "https://cdn.ejemplo.com/combo-familiar.jpg",
  "componentes": [
    { "productoComercialId": 42, "cantidad": 2 },
    { "productoComercialId": 43, "cantidad": 2 },
    { "productoComercialId": 44, "cantidad": 2 }
  ]
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `nombre` | string | Sí | No vacío (`INV-COM-003`) |
| `descripcion` | string | No | — |
| `precio` | number | Sí | > 0 (`INV-COM-004`). **No se calcula a partir de `componentes`** |
| `imagen` | string (URL) | No | — |
| `componentes` | array | Sí, mínimo 1 elemento | `INV-COM-005` |
| `componentes[].productoComercialId` | number | Sí | Debe existir un Producto Comercial con ese id |
| `componentes[].cantidad` | number | Sí | > 0 (`INV-COM-006`) |

**Nunca se recibe:** `id`, `activo` (se fuerza a `true`), ningún `comboId` dentro de `componentes` (`INV-COM-007` — un componente nunca es otro Combo).

## Response

`201 Created`

```json
{
  "id": 7,
  "nombre": "Combo familiar",
  "descripcion": "2 hamburguesas + 2 papas + 2 bebidas",
  "precio": 15000,
  "imagen": "https://cdn.ejemplo.com/combo-familiar.jpg",
  "activo": true,
  "componentes": [
    { "productoComercialId": 42, "nombre": "Hamburguesa completa", "cantidad": 2 },
    { "productoComercialId": 43, "nombre": "Papas fritas", "cantidad": 2 },
    { "productoComercialId": 44, "nombre": "Gaseosa 500ml", "cantidad": 2 }
  ]
}
```

Header `Location: /admin/comercial/combos/{id}`.

## Status Codes

| Código | Cuándo |
|---|---|
| `201 Created` | Combo creado |
| `400 Bad Request` | `nombre`/`precio` inválidos, `componentes` vacío o con `cantidad` ≤ 0 |
| `404 Not Found` | algún `productoComercialId` no existe |

## Validation

`INV-COM-003` a `INV-COM-007` (`02-domain/combo-comercial.md`).

## Errors

RFC 7807. Códigos: `VALIDATION_ERROR` (400), `PRODUCTO_COMERCIAL_NOT_FOUND` (404).

## Pagination / Filtering

No aplica.

## Idempotency

No idempotente — cada solicitud crea un Combo nuevo.

## Compatibility

Primera versión.
