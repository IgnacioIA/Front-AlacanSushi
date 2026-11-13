# Caso de Uso: Listar Productos

## Objetivo

Obtener el listado paginado de productos para la pantalla de Gestión de Inventario, combinando identidad del artículo (nombre, unidad, descripción, estado) y su inventario (stock actual, disponible, mínimo, si necesita reposición) en una sola vista, con búsqueda, filtros y ordenamiento resueltos en el Backend.

## Flujo del Usuario

1. El usuario entra a la pantalla de Gestión de Inventario de Productos.
2. El sistema obtiene la primera página de productos activos, ordenados por nombre.
3. El usuario puede buscar por texto, aplicar filtros (estado, inventario, unidad de medida) y cambiar el ordenamiento — cada acción dispara una nueva consulta al mismo endpoint con distintos parámetros.

## Endpoint

`/products`

## Método HTTP

`GET`

## Path Variables

Ninguno.

## Query Params

| Parámetro | Tipo | Requerido | Default | Notas |
|---|---|---|---|---|
| `page` | number | No | `0` | Base cero |
| `size` | number | No | `15` | |
| `search` | string | No | — | Búsqueda por `nombre`, contiene, no sensible a mayúsculas |
| `sort` | string | No | `nombre,asc` | Formato `campo,direccion`. Campos válidos: `nombre`, `cantidadActual`, `cantidadDisponible`, `stockMinimo`, `necesitaReposicion`. Direcciones: `asc`, `desc` |
| `estado` | string | No | `ACTIVO` (implícito) | `ACTIVO` \| `INACTIVO`. Si se omite, solo se listan productos activos — mismo criterio que Ingredientes (ADR 0001, sección 15) |
| `inventario` | string | No | — | `SIN_STOCK` \| `NECESITA_REPOSICION` \| `CON_STOCK`. Partición sin solapamiento: `SIN_STOCK` = cantidadActual = 0; `NECESITA_REPOSICION` = 0 < cantidadActual < stockMinimo; `CON_STOCK` = cantidadActual ≥ stockMinimo |
| `unidadMedidaId` | number | No | — | Filtra por una unidad de medida puntual |

Los tres filtros (`estado`, `inventario`, `unidadMedidaId`) son independientes y combinables entre sí (AND).

Ejemplo: `GET /products?page=0&size=15&search=pan&sort=nombre,asc&inventario=NECESITA_REPOSICION`

## Request JSON

No aplica (GET sin body).

## Response JSON

`200 OK`

```json
{
  "content": [
    {
      "id": 13,
      "nombre": "Pan casero",
      "unidadMedida": { "id": 5, "nombre": "UNIDAD", "abreviatura": "u" },
      "descripcion": "Pan elaborado en el local",
      "activo": true,
      "stock": {
        "cantidadActual": 10,
        "cantidadDisponible": 10,
        "cantidadReservada": 0,
        "stockMinimo": 3,
        "necesitaReposicion": false
      }
    }
  ],
  "page": 0,
  "size": 15,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "empty": false
}
```

Cada elemento es una vista de gestión (no la entidad `Articulo`/`Stock` tal cual): combina campos de ambos agregados en una sola fila, pensada para la grilla de la pantalla.

## Códigos HTTP

| Código | Cuándo |
|---|---|
| `200 OK` | Listado obtenido (puede venir vacío) |
| `400 Bad Request` | `sort`, `estado` o `inventario` con un valor no reconocido |

## Errores posibles

| `code` | status | Causa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Formato de `sort` inválido, o valor de `estado`/`inventario` fuera de los permitidos |

## Reglas que el Frontend puede asumir

- La paginación, el filtrado y el ordenamiento siempre se resuelven en el Backend, a nivel de base de datos — el Frontend nunca pagina ni ordena en memoria.
- Si no se envía `estado`, la respuesta nunca incluye productos inactivos.
- `inventario=SIN_STOCK`, `inventario=NECESITA_REPOSICION` e `inventario=CON_STOCK` son mutuamente excluyentes: cualquier producto cae en exactamente una de las tres categorías.

## Responsabilidades exclusivas del Backend

- Resolver `TipoArticulo=PRODUCTO` internamente: el endpoint nunca recibe ni expone ese filtro como parámetro — es implícito al recurso `/products`.
- Calcular `cantidadDisponible` y `necesitaReposicion`; el Frontend nunca los deriva del lado cliente.
- Aplicar el default `estado=ACTIVO` cuando no se especifica.

## Casos límite relevantes

- `necesitaReposicion` en la respuesta es el resultado de `Stock.necesitaReposicion()` (`cantidadActual < stockMinimo`), que también es verdadero para artículos sin stock (`cantidadActual = 0`). Es distinto del filtro `inventario=NECESITA_REPOSICION`, que excluye explícitamente los que están en `SIN_STOCK`.
- `search` vacío o ausente no filtra (devuelve todos los productos que cumplan el resto de los filtros).

## Notas

- **Reutilización con Ingredientes:** este caso de uso reutiliza sin ningún cambio `ArticuloRepository.buscarConStockPaginado` (recibe `TipoArticulo=PRODUCTO` como parámetro, mismo método que usa Ingredientes) y las clases de dominio `FiltroListaArticulos`, `FiltroInventario`, `OrdenIngrediente`/`CampoOrdenIngrediente`, `Paginacion` y `ResultadoPaginado` — ninguna de estas requirió tocarse para dar soporte a Productos (ver ADR 0001, sección 19). `ListarProductosService`, `ProductoListItemResponse`, la lógica de paginación de `ProductoMapper` y el parseo de query params en `ProductController` son código propio del recurso, con el mismo diseño que sus equivalentes de Ingredientes por decisión consciente (ver Notas de `create-product.md`).
- Validado con 7 tests automatizados (`ListarProductosApiTest`) y en vivo contra MySQL.

## Consumido por

Pantalla de Gestión de Inventario de Productos → grilla principal, buscador, filtros y encabezados ordenables.
