# Caso de Uso: Registrar Pérdida de Stock

## Objetivo

Registrar una salida de stock por pérdida (rotura, vencimiento, merma, etc.) sobre un producto existente, dejando trazabilidad completa del hecho.

## Flujo del Usuario

1. El usuario selecciona un producto y elige "Registrar pérdida".
2. Ingresa la cantidad perdida.
3. El sistema descuenta la cantidad del stock actual y registra el movimiento correspondiente. Si la cantidad supera el stock disponible, rechaza la operación sin modificar nada.

## Endpoint

`/products/{id}/perdidas`

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
  "cantidad": 20
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `cantidad` | number | Sí | Debe ser `> 0` y no puede superar el stock disponible |

**Nunca enviar desde el Frontend:** el tipo de movimiento (`DESPERDICIO`, fijado por el Backend), el sentido (`SALIDA`, implícito), la fecha/hora.

## Response JSON

`200 OK` — misma forma que el resto de las respuestas de producto (ver `create-product.md`).

## Códigos HTTP

| Código | Cuándo |
|---|---|
| `200 OK` | Pérdida registrada correctamente |
| `400 Bad Request` | Cantidad inválida (`<= 0`), o mayor al stock disponible |
| `404 Not Found` | El `id` no corresponde a ningún artículo |
| `409 Conflict` | El artículo está desactivado |

## Errores posibles

| `code` | status | Causa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Cantidad `<= 0`, o mayor al stock disponible actual |
| `ARTICLE_NOT_FOUND` | 404 | El `id` no existe |
| `ARTICULO_INACTIVO` | 409 | El artículo está desactivado |

## Reglas que el Frontend puede asumir

- El movimiento generado siempre es de tipo `DESPERDICIO`, sentido `SALIDA`.
- Nunca se permite que el stock quede negativo: una pérdida mayor al disponible se rechaza por completo, sin aplicar parcialmente.

## Responsabilidades exclusivas del Backend

- Fijar `TipoMovimiento=DESPERDICIO` y `Sentido=SALIDA`.
- Validar que la cantidad no supere el stock disponible antes de aplicar ningún cambio.

## Notas

- **Reutilización total, sin ninguna clase nueva:** este endpoint invoca exactamente el mismo bean `RegistrarPerdidaStockService` que usa `/ingredients/{id}/perdidas`.
- **Decisión sobre el código de error de stock insuficiente:** se usa `VALIDATION_ERROR` (400), mismo criterio que Ingredientes — ver `ingredients/register-stock-loss.md` para el razonamiento completo (no se introduce un tercer tipo de "stock insuficiente" en el sistema sin un beneficio claro).
- Validado con 5 tests automatizados (`RegistrarPerdidaStockProductoApiTest`) y en vivo contra MySQL.

## Consumido por

Pantalla de Gestión de Inventario de Productos → acción "Registrar pérdida" sobre un producto existente.
