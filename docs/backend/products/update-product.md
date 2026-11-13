# Caso de Uso: Actualizar Producto

## Objetivo

Modificar la identidad de un producto (nombre, descripción, unidad de medida) y su configuración de inventario (stock mínimo) en una única operación atómica, protegiendo la integridad de los datos ya registrados.

## Flujo del Usuario

1. El usuario abre un producto existente desde la pantalla de Gestión de Inventario y presiona "Editar".
2. El formulario se precarga con los valores actuales: nombre, descripción, unidad de medida, stock mínimo.
3. El usuario modifica los campos que necesite y confirma.
4. Si el producto ya tiene stock físico o movimientos registrados y el usuario intentó cambiar la unidad de medida, el sistema rechaza el cambio explicando el motivo — el resto de los campos sí se actualiza.

## Endpoint

`/products/{id}`

## Método HTTP

`PUT`

## Path Variables

| Variable | Tipo | Notas |
|---|---|---|
| `id` | number | Id del artículo (producto) a actualizar |

## Query Params

Ninguno.

## Request JSON

```json
{
  "nombre": "Alfajor de maicena",
  "descripcion": "Con dulce de leche artesanal",
  "unidadMedidaId": 5,
  "stockMinimo": 12
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `nombre` | string | Sí | No puede estar vacío |
| `descripcion` | string | No | `null` la deja vacía |
| `unidadMedidaId` | number | Sí | Debe existir. Si difiere de la unidad actual, se valida la regla de bloqueo (ver Notas) |
| `stockMinimo` | number | Sí | `>= 0` |

**Nunca enviar desde el Frontend:** `tipoArticulo`, `cantidadActual`, `cantidadReservada`, `movimientos`, `id`, `activo` (la desactivación es un caso de uso propio, no parte de esta actualización).

## Response JSON

`200 OK` — misma forma que la respuesta de "Crear Producto":

```json
{
  "id": 19,
  "nombre": "Alfajor de maicena",
  "tipoArticulo": { "id": 3, "nombre": "PRODUCTO" },
  "unidadMedida": { "id": 5, "nombre": "UNIDAD", "abreviatura": "u" },
  "descripcion": "Con dulce de leche artesanal",
  "activo": true,
  "stock": {
    "cantidadActual": 0,
    "cantidadReservada": 0,
    "cantidadDisponible": 0,
    "stockMinimo": 12,
    "necesitaReposicion": true
  }
}
```

## Códigos HTTP

| Código | Cuándo |
|---|---|
| `200 OK` | Producto actualizado correctamente |
| `400 Bad Request` | Nombre vacío, stock mínimo negativo |
| `404 Not Found` | El `id` del producto no existe, o `unidadMedidaId` no existe |
| `409 Conflict` | Se intentó cambiar la unidad de medida de un artículo que ya tiene stock físico o movimientos registrados |

## Errores posibles

| `code` | status | Causa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Nombre vacío o stock mínimo negativo |
| `ARTICLE_NOT_FOUND` | 404 | El `id` no corresponde a ningún artículo |
| `UNIDAD_MEDIDA_NOT_FOUND` | 404 | `unidadMedidaId` no existe |
| `UNIDAD_MEDIDA_BLOQUEADA` | 409 | El artículo ya tiene stock físico (`cantidadActual != 0`) o al menos un `Movimiento` registrado, y se intentó cambiar su unidad de medida |

## Reglas que el Frontend puede asumir

- Nombre, descripción y stock mínimo siempre son editables, incluso si el cambio de unidad fue rechazado — son operaciones independientes dentro de la misma transacción atómica.
- La regla de bloqueo de unidad solo se evalúa cuando `unidadMedidaId` difiere del valor actual; enviar el mismo `unidadMedidaId` nunca dispara el conflicto.
- Un producto desactivado puede seguir editándose por este endpoint (ver Responsabilidades del Backend).

## Responsabilidades exclusivas del Backend

- Validar la regla de bloqueo de unidad de medida (ADR 0001, sección 16): si el artículo tiene stock físico o movimientos, la unidad queda bloqueada de forma permanente — no hay conversión automática entre unidades.
- No exigir `Articulo.activo=true` para permitir la edición: se considera edición de catálogo, no una operación de inventario (a diferencia de altas/consumos de stock).

## Casos límite relevantes

- Cambiar solo el nombre o la descripción sin tocar `unidadMedidaId` (enviando el mismo id actual) nunca dispara la validación de bloqueo, incluso con stock físico presente.
- `stockMinimo: 0` es válido y no se interpreta como "omitido" (a diferencia de Crear Producto, acá siempre es requerido explícitamente).

## Notas

- **Duplicación consciente con Ingredientes:** `ActualizarProductoService` tiene el mismo cuerpo que `ActualizarIngredienteService` — no hay ninguna diferencia de negocio hoy entre actualizar un Producto y un Ingrediente. Por decisión explícita (ver `create-product.md`), no se extrajo un colaborador compartido: se prefirió esperar a que ambos módulos convivan y decidir con evidencia si esa duplicación amerita una extracción, en vez de anticiparla.
- Reutiliza sin cambios la regla de bloqueo de unidad de medida y `MovimientoRepository.buscarPorArticuloId` — misma infraestructura de dominio que Ingredientes.
- Validado con 6 tests automatizados (`ActualizarProductoApiTest`: actualización completa sin historial, bloqueo con stock físico, edición de otros campos con historial presente, nombre vacío, artículo inexistente, unidad inexistente) y en vivo contra MySQL.

## Consumido por

Pantalla de Gestión de Inventario de Productos → acción "Editar" sobre un producto existente.
