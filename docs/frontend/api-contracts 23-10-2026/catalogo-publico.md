# Catálogo público

Lo que consume la web pública, sin sesión: consultar el catálogo y crear un pedido.

Fuente: `Comercial/api/controller/CatalogoPublicoController.java`, `Comercial/api/mapper/CatalogoPublicoMapper.java`, `Comercial/application/ConsultarCatalogoPublicoService.java`, repositorios de `Comercial`, `ConsultarCatalogoPublicoApiTest`.

Contrato SDD de origen: [`../05-contracts/api/comercial-public/catalogo-publico.md`](../05-contracts/api/comercial-public/catalogo-publico.md).

## Operaciones públicas existentes

| Id | Operación | Ruta | Documento |
|---|---|---|---|
| CAT-01 | Consultar el catálogo | `GET /catalogo` | Este |
| PED-01 | Crear un pedido | `POST /pedidos` | [`pedidos.md`](pedidos.md#ped-01--crear-pedido-público) |

No hay ninguna otra operación pública de negocio. En particular, **no existen**: detalle público de un producto o combo, búsqueda, categorías, ni consulta pública del estado de un pedido.

---

## CAT-01 — Consultar el catálogo

| | |
|---|---|
| Estado | `IMPLEMENTADO` |
| Método y ruta | `GET /catalogo` |
| Autenticación | Ninguna |
| CSRF | No aplica |
| Cabeceras requeridas | Ninguna. No necesita cookies |
| Parámetros de ruta / query | **Ninguno.** No hay filtros, búsqueda, orden ni paginación |
| Cuerpo | Ninguno |

**Finalidad.** Entregar todo lo que se puede comprar: los productos comerciales activos y los combos comerciales activos, en una sola lista.

**Respuesta `200 OK`** — un **arreglo plano**, no un objeto paginado:

```json
[
  {
    "id": 3,
    "tipo": "PRODUCTO",
    "nombre": "Gaseosa 500 ml",
    "descripcion": "Línea cola, botella individual",
    "precio": 2000.00,
    "imagen": null,
    "componentes": null
  },
  {
    "id": 1,
    "tipo": "PRODUCTO",
    "nombre": "Hamburguesa clásica",
    "descripcion": "Carne vacuna, lechuga, tomate y queso",
    "precio": 8500.00,
    "imagen": "https://cdn.example/img/hamburguesa-clasica.jpg",
    "componentes": null
  },
  {
    "id": 2,
    "tipo": "PRODUCTO",
    "nombre": "Papas fritas",
    "descripcion": null,
    "precio": 3500.00,
    "imagen": null,
    "componentes": null
  },
  {
    "id": 1,
    "tipo": "COMBO",
    "nombre": "Combo clásico",
    "descripcion": "Hamburguesa, papas y gaseosa",
    "precio": 12500.00,
    "imagen": null,
    "componentes": [
      { "productoId": 1, "nombre": "Hamburguesa clásica", "cantidad": 1 },
      { "productoId": 2, "nombre": "Papas fritas", "cantidad": 1 },
      { "productoId": 3, "nombre": "Gaseosa 500 ml", "cantidad": 1 }
    ]
  }
]
```

Sin nada publicado, la respuesta es `200 OK` con `[]`.

**Elemento del catálogo** (`CatalogoPublicoItemResponse`):

| Campo | Tipo | Nulo | Notas |
|---|---|---|---|
| `id` | number (entero) | No | Id del producto o del combo. **No es único en la lista**: un producto y un combo pueden tener el mismo `id` |
| `tipo` | string | No | `PRODUCTO` o `COMBO` |
| `nombre` | string | No | — |
| `descripcion` | string | Sí | — |
| `precio` | number (decimal) | No | Mayor a cero. Ver [`modelos.md`](modelos.md#importes) |
| `imagen` | string | Sí | Texto libre cargado por el administrador. Ver "Decisiones pendientes" |
| `componentes` | array | Sí | `null` en un `PRODUCTO`. En un `COMBO`, al menos un elemento |

**Componente** (`ComponenteCatalogoPublicoResponse`):

| Campo | Tipo | Nulo | Notas |
|---|---|---|---|
| `productoId` | number (entero) | No | Id del producto comercial. **Se llama `productoId` acá y `productoComercialId` en la API administrativa** |
| `nombre` | string | No | Nombre actual del producto |
| `cantidad` | number (entero) | No | Mayor a cero |

**Errores.** Ninguno propio.

**Reglas que debe conocer el frontend.**

- **Visibilidad:** aparece solo lo que tiene `activo = true`. La respuesta no incluye el campo `activo`: todo lo que llega es comprable en ese momento.
- **Orden:** primero todos los productos, por `nombre` ascendente; después todos los combos, por `nombre` ascendente. El orden alfabético lo resuelve la base de datos.
- **Identidad:** la clave de un elemento es **`tipo` + `id`**. Usar esa pareja como `key` en React y como identidad de una línea del carrito.
- **El precio de un combo es propio**, no la suma de sus componentes. No calcularlo ni mostrar un "ahorro" derivado sin una decisión de producto.
- **Los componentes son informativos.** Un combo se pide como una unidad; sus componentes no se eligen ni se modifican.
- **El catálogo puede cambiar entre la carga y el checkout.** Si un producto se desactiva o cambia de precio, `POST /pedidos` usa el estado y el precio vigentes en el servidor, no los que el cliente vio.
- No hay stock: todo lo publicado se considera disponible.

**Depende de.** Nada. **Lo consumen.** Catálogo público, carrito, checkout.

**Limitaciones y decisiones pendientes.**

| Tema | Estado | Detalle |
|---|---|---|
| Sin paginación | `IMPLEMENTADO` así | La lista completa llega en una respuesta. Adecuado para un catálogo chico |
| Categorías o secciones | `PENDIENTE` | No existen en el modelo. El frontend solo puede separar por `tipo` |
| Semántica de `imagen` | `DECISIÓN_REQUERIDA` | Es un texto libre de hasta 255 caracteres sin validación. No hay endpoint para subir archivos. Falta definir si guarda una URL absoluta, una ruta relativa o un identificador |
| Texto con formato en `descripcion` | `PENDIENTE_DE_CONFIRMAR` | Es texto plano sin validación. Mostrarlo siempre como texto, nunca como HTML |
| Orden de `componentes` | `PENDIENTE_DE_CONFIRMAR` | El código no declara un orden para los componentes de un combo. El del ejemplo es ilustrativo. Evidencia faltante: una regla de orden en la entidad o un test |
| Caché | `PENDIENTE_DE_CONFIRMAR` | La respuesta no fija cabeceras de caché propias. Evidencia faltante: cabeceras de una ejecución real |
