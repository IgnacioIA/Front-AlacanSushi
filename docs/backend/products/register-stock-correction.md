# Caso de Uso: Registrar Corrección de Stock

## Objetivo

Reconciliar el stock del sistema contra un recuento físico real, en cualquier dirección (hacia arriba o hacia abajo), dejando trazabilidad completa del ajuste.

## Flujo del Usuario

1. El usuario cuenta físicamente el stock de un producto y encuentra una diferencia contra lo que el sistema tiene registrado.
2. Selecciona "Registrar corrección" e ingresa la cantidad real que contó (no cuánto quiere sumar o restar).
3. El sistema calcula la diferencia contra el stock actual y ajusta en la dirección correspondiente. Si no hay diferencia, no se genera ningún cambio.

## Endpoint

`/products/{id}/correcciones`

## Método HTTP

`POST`

## Path Variables

| Variable | Tipo | Notas |
|---|---|---|
| `id` | number | Id del artículo (producto) |

## Query Params

Ninguno.

## Request JSON

```json
{
  "cantidadReal": 15
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `cantidadReal` | number | Sí | La cantidad física contada. Debe ser `>= 0` |

**Diseño deliberado:** igual que en Ingredientes, la corrección es bidireccional — el contrato pide la cantidad real contada, no un valor con signo ni un `sentido`; la dirección la calcula el Backend comparando contra `Stock.cantidadActual`.

**Nunca enviar desde el Frontend:** el tipo de movimiento (`AJUSTE`, fijado por el Backend), el sentido (calculado), la fecha/hora.

## Response JSON

`200 OK` — misma forma que el resto de las respuestas de producto.

## Códigos HTTP

| Código | Cuándo |
|---|---|
| `200 OK` | Corrección registrada (o sin cambios, si la cantidad real coincide con la actual) |
| `400 Bad Request` | `cantidadReal` negativa |
| `404 Not Found` | El `id` no corresponde a ningún artículo |
| `409 Conflict` | El artículo está desactivado |

## Errores posibles

| `code` | status | Causa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | `cantidadReal` negativa |
| `ARTICLE_NOT_FOUND` | 404 | El `id` no existe |
| `ARTICULO_INACTIVO` | 409 | El artículo está desactivado |

## Reglas que el Frontend puede asumir

- Si `cantidadReal` coincide exactamente con el stock actual, la respuesta es `200 OK` pero no se genera ningún `Movimiento` nuevo — el historial no crece con "correcciones" que no corrigieron nada.

## Responsabilidades exclusivas del Backend

- Calcular la diferencia y el `Sentido` del ajuste — el Frontend nunca informa si el sistema tiene de más o de menos.
- Fijar `TipoMovimiento=AJUSTE`.

## Notas

- **Reutilización total, sin ninguna clase nueva:** este endpoint invoca exactamente el mismo bean `RegistrarCorreccionStockService` que usa `/ingredients/{id}/correcciones`.
- Validado con 6 tests automatizados (`RegistrarCorreccionStockProductoApiTest`: corrección hacia arriba, hacia abajo, sin cambios, cantidad negativa, artículo desactivado, artículo inexistente) y en vivo contra MySQL (las tres direcciones).

## Consumido por

Pantalla de Gestión de Inventario de Productos → acción "Registrar corrección" sobre un producto existente.
