---
type: api-contract
spec_status: DRAFT
version: "1.0"
---

# Contrato — Catálogo Público

Realiza: [UC-COM-009](../../../04-use-cases/use-cases/UC-COM-009-consultar-catalogo-publico.md).

**Frontera explícita respecto de los contratos administrativos** (`docs/V1-COMMERCIAL-CATALOG.md` §11/§12): esta es la única representación que el frontend público debe consumir. No expone `activo` (todo lo devuelto ya está implícitamente activo — filtrado del lado del servidor, no del cliente), no expone campos de auditoría, no expone ninguna referencia interna de Producción.

## Endpoint

`/catalogo`

## HTTP Method

`GET`

## Authentication

Ninguna — acceso público por diseño.

## Request

Sin parámetros obligatorios. `PENDIENTE` (no se diseña acá, `docs/V1-COMMERCIAL-CATALOG.md` §19 punto 7): si hace falta paginación/filtro para el catálogo público en V1 — no hay evidencia de volumen que lo requiera todavía.

## Response

`200 OK`

```json
[
  {
    "id": 42,
    "tipo": "PRODUCTO",
    "nombre": "Hamburguesa completa",
    "descripcion": "Con papas y bebida a elección",
    "precio": 8500,
    "imagen": "https://cdn.ejemplo.com/hamburguesa.jpg"
  },
  {
    "id": 7,
    "tipo": "COMBO",
    "nombre": "Combo familiar",
    "descripcion": "2 hamburguesas + 2 papas + 2 bebidas",
    "precio": 15000,
    "imagen": "https://cdn.ejemplo.com/combo-familiar.jpg",
    "componentes": [
      { "productoId": 42, "nombre": "Hamburguesa completa", "cantidad": 2 },
      { "productoId": 43, "nombre": "Papas fritas", "cantidad": 2 },
      { "productoId": 44, "nombre": "Gaseosa 500ml", "cantidad": 2 }
    ]
  }
]
```

`tipo` es un discriminador de la **proyección de lectura**, no una entidad de clasificación persistente (`docs/V1-COMMERCIAL-CATALOG.md` §9). `componentes[].nombre`/`cantidad` se incluyen porque el ejemplo de negocio de esta tarea requiere poder representar el combo; **`PENDIENTE`** si además debe exponerse el precio individual de cada componente (`docs/V1-COMMERCIAL-CATALOG.md` §19, punto 4) — no incluido en este ejemplo hasta que se decida.

## Status Codes

| Código | Cuándo |
|---|---|
| `200 OK` | Siempre — una lista vacía es una respuesta válida, no un error |

## Validation

No aplica — sin parámetros de entrada en esta versión.

## Errors

Sin errores de negocio esperables — solo fallas técnicas genéricas (formato RFC 7807 igual que el resto de la API, sin código de negocio propio).

## Pagination

`PENDIENTE`, ver Request.

## Filtering

Ninguno del lado del cliente — el filtrado por `activo` ocurre siempre del lado del servidor, nunca se expone como parámetro (evita que el frontend público pueda pedir elementos inactivos).

## Idempotency

No aplica — `GET`.

## Compatibility

Primera versión. Cambiar la forma de este contrato impacta directamente al frontend público (consumidor externo, repositorio separado) — cualquier cambio de campos debe tratarse como *breaking change* explícito, no una evolución silenciosa.
