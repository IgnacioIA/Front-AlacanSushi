# Caso de Uso: Crear Producto

## Objetivo

Dar de alta un artículo de tipo Producto en el catálogo de Producción, con su stock inicial y stock mínimo opcionales, en una única operación atómica.

## Flujo del Usuario

1. El usuario entra a la pantalla Productos y presiona "Agregar producto".
2. Se abre un modal con: Nombre, Unidad de medida, Descripción (opcional).
3. Existe una sección opcional "Registrar stock inicial" con: Cantidad inicial, Stock mínimo (ambos independientes entre sí; el usuario puede cargar solo uno de los dos, ambos, o ninguno).
4. Al confirmar:
   - Se crea el Artículo (tipo `PRODUCTO`, fijado por el Backend).
   - Se crea el Stock asociado, con el `stockMinimo` informado (o 0 si no se informó).
   - Si se informó `cantidadInicial > 0`: se registra el ingreso de stock y un `Movimiento` de tipo `ALTA`.
   - Se muestra una notificación de éxito y el nuevo producto aparece en el listado.

## Endpoint

`/products`

## Método HTTP

`POST`

## Path Variables

Ninguno.

## Query Params

Ninguno.

## Request JSON

```json
{
  "nombre": "Pan casero",
  "unidadMedidaId": 5,
  "descripcion": "Pan elaborado en el local",
  "stockMinimo": 3,
  "stockInicial": {
    "cantidad": 10
  }
}
```

Si el usuario no registra stock inicial:

```json
{
  "nombre": "Pan casero",
  "unidadMedidaId": 5,
  "descripcion": "Pan elaborado en el local",
  "stockMinimo": 3
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `nombre` | string | Sí | No puede estar vacío |
| `unidadMedidaId` | number | Sí | Debe existir (ver `UnidadMedida`) |
| `descripcion` | string | No | — |
| `stockMinimo` | number | No | Default `0` si se omite |
| `stockInicial` | object | No | Si se omite, el artículo queda con stock en `0` |
| `stockInicial.cantidad` | number | Sí (dentro del bloque) | Debe ser `> 0` para que se registre movimiento |

**Nunca enviar desde el Frontend:** `TipoArticulo` (se fuerza a `PRODUCTO`), `id`, fechas, `cantidadReservada`, ni el tipo/sentido del `Movimiento` inicial.

## Response JSON

`201 Created`

```json
{
  "id": 13,
  "nombre": "Pan casero",
  "tipoArticulo": { "id": 3, "nombre": "PRODUCTO" },
  "unidadMedida": { "id": 5, "nombre": "UNIDAD", "abreviatura": "u" },
  "descripcion": "Pan elaborado en el local",
  "activo": true,
  "stock": {
    "cantidadActual": 10,
    "cantidadReservada": 0,
    "cantidadDisponible": 10,
    "stockMinimo": 3,
    "necesitaReposicion": false
  }
}
```

Header `Location: /products/{id}`.

## Códigos HTTP

| Código | Cuándo |
|---|---|
| `201 Created` | Producto creado correctamente |
| `400 Bad Request` | Datos inválidos (nombre vacío, cantidades negativas, etc.) |
| `404 Not Found` | `unidadMedidaId` no existe |
| `500 Internal Server Error` | Error de configuración interna (ver Notas) |

## Errores posibles

| `code` | status | Causa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Nombre vacío, cantidad negativa, stock mínimo negativo, etc. |
| `UNIDAD_MEDIDA_NOT_FOUND` | 404 | El `unidadMedidaId` enviado no existe |
| `INTERNAL_CONFIGURATION_ERROR` | 500 | Falta el seed de `TipoArticulo=PRODUCTO` o `TipoMovimiento=ALTA` — no debería ocurrir nunca en un ambiente correctamente inicializado |

Formato de error, ver `INTEGRATION_GUIDE.md` (RFC 7807 + `code`).

## Reglas que el Frontend puede asumir

- `unidadMedida` y `tipoArticulo` siempre viajan como objetos completos, nunca como strings o IDs sueltos.
- El artículo creado siempre queda `activo: true`.
- Si `stockInicial` se omite o `cantidadInicial` es `0`, no se genera ningún `Movimiento` — el stock queda en `0` sin historial.

## Responsabilidades exclusivas del Backend

- Resolver y fijar `TipoArticulo=PRODUCTO`: el Frontend nunca lo envía ni lo puede sobrescribir.
- Decidir el `TipoMovimiento` (`ALTA`) y el `Sentido` (`ENTRADA`) del movimiento inicial.
- Crear `Articulo` + `Stock` (+ `Movimiento`, si corresponde) en una única transacción atómica.

## Casos límite relevantes

- `stockInicial` presente pero `cantidad: 0` o negativa: se trata igual que "sin stock inicial" (no hay `hayStockInicial` porque exige `> 0`); no se genera `Movimiento`.
- `stockMinimo` omitido: default `0`, no `null`.
- Nombre duplicado entre un Producto y un Ingrediente ya existentes: permitido — el nombre no es una clave de negocio única a nivel `Articulo`.

## Notas

- **Reutilización con Ingredientes:** este caso de uso comparte el resultado interno `ArticuloConStockResultado` (Application layer) con `CrearIngredienteService`, y su mapper (`ProductoMapper`) reutiliza `UnidadMedidaMapper`. `CrearProductoService`, `CrearProductoRequest` y `ProductoResponse` son clases propias del recurso `/products`, con el mismo cuerpo que sus equivalentes de Ingredientes por diseño consciente: se evaluará con evidencia, una vez que ambos módulos convivan, si esa duplicación amerita una extracción adicional.
- Validado end-to-end vía HTTP real contra MySQL (perfil `dev`) y con tests automatizados (`CrearProductoApiTest`), incluyendo una verificación de regresión explícita sobre `/ingredients` tras el rename de `ArticuloConStockResultado`.

## Consumido por

Pantalla Productos → botón "Agregar producto" → modal de alta.

## Pantalla

Productos

## Componente React

A definir por el equipo de Frontend (proyecto externo a este repositorio). Este documento es el contrato estable contra el cual ese componente debe integrarse.
