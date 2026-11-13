# Caso de Uso: Consultar Movimientos de un Producto

## Objetivo

Mostrar el historial completo y paginado de movimientos de inventario de un producto (altas, compras, pérdidas, correcciones, consumos por producción), del más reciente al más antiguo.

## Flujo del Usuario

1. El usuario abre el detalle de un producto en la pantalla de Gestión de Inventario y accede a su historial de movimientos.
2. El sistema devuelve los movimientos paginados, ordenados del más reciente al más antiguo.

## Endpoint

`/products/{id}/movimientos`

## Método HTTP

`GET`

## Path Variables

| Variable | Tipo | Notas |
|---|---|---|
| `id` | number | Id del artículo (producto) |

## Query Params

| Parámetro | Tipo | Requerido | Default | Notas |
|---|---|---|---|---|
| `page` | number | No | `0` | Base cero |
| `size` | number | No | `15` | |

No hay `search`, `sort` ni filtros — mismo criterio que Ingredientes: el orden es siempre cronológico descendente.

## Request JSON

No aplica (GET sin body).

## Response JSON

`200 OK`

```json
{
  "content": [
    {
      "id": 23,
      "tipoMovimiento": { "id": 3, "nombre": "AJUSTE" },
      "sentido": "SALIDA",
      "cantidad": 25,
      "momento": "2026-07-17T11:29:17.819553"
    },
    {
      "id": 21,
      "tipoMovimiento": { "id": 4, "nombre": "DESPERDICIO" },
      "sentido": "SALIDA",
      "cantidad": 20,
      "momento": "2026-07-17T11:29:17.411779"
    }
  ],
  "page": 0,
  "size": 15,
  "totalElements": 4,
  "totalPages": 1,
  "first": true,
  "last": true,
  "empty": false
}
```

## Códigos HTTP

| Código | Cuándo |
|---|---|
| `200 OK` | Historial obtenido (puede venir vacío si el producto nunca tuvo movimientos) |
| `404 Not Found` | El `id` no corresponde a ningún artículo |

## Errores posibles

| `code` | status | Causa |
|---|---|---|
| `ARTICLE_NOT_FOUND` | 404 | El `id` no existe |

## Reglas que el Frontend puede asumir

- El orden es siempre `momento` descendente, con `id` descendente como desempate — nunca hay que reordenar del lado del Frontend.

## Responsabilidades exclusivas del Backend

- Resolver el orden cronológico correcto, incluyendo el desempate cuando dos movimientos comparten el mismo instante.

## Notas

- **Reutilización total, sin ninguna clase nueva:** este endpoint invoca exactamente el mismo bean `ListarMovimientosService` (con su overload paginado) y `MovimientoMapper` que usa `/ingredients/{id}/movimientos` — `MovimientoRepository.buscarPorArticuloId` nunca tuvo dependencia de `TipoArticulo`, por lo que no hizo falta ningún cambio para soportar Productos.
- Con este caso de uso se completan los 8 casos de uso de la pantalla de Gestión de Inventario de Productos, con la misma cobertura que Ingredientes.
- Validado con 4 tests automatizados (`ListarMovimientosProductoApiTest`: historial con varias operaciones y orden correcto, paginación, producto sin movimientos, artículo inexistente) y en vivo contra MySQL.

## Consumido por

Pantalla de Gestión de Inventario de Productos → detalle de un producto → historial de movimientos.
