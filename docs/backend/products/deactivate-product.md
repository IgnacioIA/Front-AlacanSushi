# Caso de Uso: Desactivar Producto

## Objetivo

Dar de baja lógica un producto, preservando completamente su trazabilidad (stock, movimientos, recetas que lo referencian), y permitiendo al Frontend informar al usuario si el producto era fabricado por una receta activa al momento de desactivarlo.

## Flujo del Usuario

1. El usuario presiona "Desactivar" sobre un producto en la pantalla de Gestión de Inventario.
2. El sistema desactiva el producto sin excepción, tenga o no una receta activa que lo produzca.
3. Si el producto era el resultado de una receta activa, el Frontend puede mostrar una advertencia adicional junto a la confirmación (usando el dato que devuelve la respuesta) — el mensaje final es responsabilidad del Frontend, el Backend solo entrega el dato.
4. El producto deja de aparecer en el listado por defecto (que solo muestra activos) y pasa a aparecer únicamente cuando se filtra explícitamente por `estado=INACTIVO`.

## Endpoint

`/products/{id}/desactivar`

## Método HTTP

`POST`

## Path Variables

| Variable | Tipo | Notas |
|---|---|---|
| `id` | number | Id del artículo (producto) a desactivar |

## Query Params

Ninguno.

## Request JSON

No aplica (POST sin body).

## Response JSON

`200 OK`

```json
{
  "producto": {
    "id": 21,
    "nombre": "Pan de campo",
    "tipoArticulo": { "id": 3, "nombre": "PRODUCTO" },
    "unidadMedida": { "id": 5, "nombre": "UNIDAD", "abreviatura": "u" },
    "descripcion": null,
    "activo": false,
    "stock": {
      "cantidadActual": 0,
      "cantidadReservada": 0,
      "cantidadDisponible": 0,
      "stockMinimo": 3,
      "necesitaReposicion": true
    }
  },
  "tieneRecetaActivaQueLoProduce": true
}
```

`tieneRecetaActivaQueLoProduce` indica si existe una receta activa que fabrica este producto. Es puramente informativo — nunca bloquea la desactivación.

## Códigos HTTP

| Código | Cuándo |
|---|---|
| `200 OK` | Producto desactivado (siempre que exista, tenga o no una receta activa que lo produzca) |
| `404 Not Found` | El `id` no corresponde a ningún artículo |

## Errores posibles

| `code` | status | Causa |
|---|---|---|
| `ARTICLE_NOT_FOUND` | 404 | El `id` no corresponde a ningún artículo |

## Reglas que el Frontend puede asumir

- La desactivación nunca falla por referencias activas — solo informa.
- No existe eliminación física en ningún caso: `Movimiento`, `Stock` y `Receta`/`RecetaDetalle` que referencian este artículo permanecen intactos.
- Operación idempotente: desactivar un producto ya inactivo no falla, simplemente confirma el estado (y recalcula `tieneRecetaActivaQueLoProduce`).

## Responsabilidades exclusivas del Backend

- Determinar si existe una receta activa que produce este artículo (`RecetaRepository.buscarActivaPorArticuloProducido`) — el Frontend nunca calcula ni infiere esta relación.

## Casos límite relevantes

- Reactivación (volver `activo = true`) no está incluida en el alcance de este caso de uso, igual que en Ingredientes — se agregaría como extensión simétrica si se pide.

## Notas

- **Diferencia real respecto de Desactivar Ingrediente, no duplicación con otro nombre:** Ingrediente informa `recetasActivasQueLoUtilizan` (cuántas recetas activas lo usan como *insumo*, vía `RecetaRepository.contarActivasQueRequierenArticulo`). Producto informa `tieneRecetaActivaQueLoProduce` (si existe una receta activa que lo *fabrica*, vía `RecetaRepository.buscarActivaPorArticuloProducido`, ya existente en el repositorio). Son preguntas de negocio distintas porque la relación entre `Receta` y `Articulo` es direccional: un artículo puede ser insumo de muchas recetas, pero es producido por a lo sumo una receta activa a la vez. Este caso de uso fue el primero, dentro de la integración de Productos, donde una diferencia real de negocio emergió naturalmente al implementar — validando la decisión de no compartir código entre `DesactivarIngredienteService` y `DesactivarProductoService` de antemano (ver `create-product.md`).
- El resto del flujo (desactivación siempre exitosa, preservación de trazabilidad, integración con el filtro `estado` de Listar) es idéntico a Ingredientes.
- Validado con 4 tests automatizados (`DesactivarProductoApiTest`: sin referencias, con una receta activa que lo produce, idempotencia, artículo inexistente) y en vivo contra MySQL, incluyendo la integración con el filtro `estado` de "Listar Productos".

## Consumido por

Pantalla de Gestión de Inventario de Productos → acción "Desactivar" sobre un producto existente.
