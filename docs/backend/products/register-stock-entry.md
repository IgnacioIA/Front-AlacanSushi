# Caso de Uso: Registrar Ingreso de Stock

## Objetivo

Registrar el ingreso de una cantidad de stock a un producto ya existente (por ejemplo, tras una producción externa o una compra), dejando trazabilidad completa del hecho — nunca escribiendo el stock directamente.

## Flujo del Usuario

1. El usuario selecciona un producto en la pantalla de Gestión de Inventario y elige "Registrar ingreso".
2. Ingresa la cantidad que ingresó.
3. El sistema suma la cantidad al stock actual y registra el movimiento correspondiente.

## Endpoint

`/products/{id}/ingresos`

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
  "cantidad": 50
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `cantidad` | number | Sí | Debe ser `> 0` |

**Nunca enviar desde el Frontend:** el tipo de movimiento (`COMPRA`, fijado por el Backend), el sentido (`ENTRADA`, implícito en la operación), la fecha/hora.

## Response JSON

`200 OK` — misma forma que el resto de las respuestas de producto:

```json
{
  "id": 22,
  "nombre": "Grisines",
  "tipoArticulo": { "id": 3, "nombre": "PRODUCTO" },
  "unidadMedida": { "id": 5, "nombre": "UNIDAD", "abreviatura": "u" },
  "descripcion": null,
  "activo": true,
  "stock": {
    "cantidadActual": 50,
    "cantidadReservada": 0,
    "cantidadDisponible": 50,
    "stockMinimo": 10,
    "necesitaReposicion": false
  }
}
```

## Códigos HTTP

| Código | Cuándo |
|---|---|
| `200 OK` | Ingreso registrado correctamente |
| `400 Bad Request` | Cantidad inválida (`<= 0`) |
| `404 Not Found` | El `id` no corresponde a ningún artículo |
| `409 Conflict` | El artículo está desactivado |

## Errores posibles

| `code` | status | Causa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Cantidad `<= 0` |
| `ARTICLE_NOT_FOUND` | 404 | El `id` no existe |
| `ARTICULO_INACTIVO` | 409 | El artículo está desactivado — no admite nuevas operaciones de inventario (ADR 0001, sección 15) |

## Reglas que el Frontend puede asumir

- El movimiento generado siempre es de tipo `COMPRA`, sentido `ENTRADA` — el Frontend nunca lo envía ni lo puede elegir.
- Ingresos sucesivos se acumulan sobre el stock actual, nunca lo reemplazan.

## Responsabilidades exclusivas del Backend

- Fijar `TipoMovimiento=COMPRA` y `Sentido=ENTRADA`.
- Rechazar la operación si el artículo está desactivado (`ArticuloInactivoException`).

## Casos límite relevantes

- `cantidad: 0` o negativa se rechaza antes de tocar el stock.

## Notas

- **Reutilización total, sin ninguna clase nueva:** este endpoint invoca exactamente el mismo bean `RegistrarIngresoStockService` que usa `/ingredients/{id}/ingresos` — no existe, ni existió nunca, una versión "de producto" de este servicio. Es el primer caso de uso de la integración de Productos que no requirió ninguna clase de Application layer nueva, solo el mapeo de la respuesta a `ProductoResponse` en el controller.
- Genera un `Movimiento` de tipo `COMPRA`, sentido `ENTRADA` — mismo tipo ya seedeado que usa Ingredientes.
- Es un caso de uso específico e independiente (ADR 0001, sección 17): no comparte servicio de aplicación con "pérdida" ni "corrección", aunque las tres reutilizan el mismo DTO de request (`{ "cantidad": ... }`).
- Valida `Articulo.activo` — igual que en Ingredientes, "Actualizar Producto" deliberadamente no lo hace, pero registrar movimientos de inventario sí (ADR 0001, sección 15).
- Validado con 4 tests automatizados (`RegistrarIngresoStockProductoApiTest`: ingreso simple, ingresos acumulativos, cantidad inválida, artículo desactivado, artículo inexistente) y en vivo contra MySQL.

## Consumido por

Pantalla de Gestión de Inventario de Productos → acción "Registrar ingreso" sobre un producto existente.
