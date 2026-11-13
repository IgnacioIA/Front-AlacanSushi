# Modelo Comercial y Catálogo V1

## Metadata

Versión: 1.0
Estado: `DRAFT` — análisis y recomendación de diseño, pendiente de aprobación humana antes de traducirse a Requirement/Domain Spec/Use Case/Contrato e implementarse.
Tipo: documento de diseño conceptual cross-módulo. No es una Domain Spec de `02-domain/` (no hay código todavía que documentar como `APPROVED`), no es un ADR (no se está adoptando una decisión arquitectónica irreversible, ver sección 19), no reemplaza a `V1-DOMAIN-MODEL.md` ni a `V1-SCOPE.md` — los desarrolla en el punto exacto donde ambos dejaron pendiente "la forma concreta del modelo Comercial".
Fuente: propuesta inicial del usuario (sección 3 de la consigna), auditada críticamente contra código y documentación existente. La propuesta inicial **no se adoptó tal cual** — ver sección 4 en adelante para las diferencias y su justificación.

Convención de clasificación usada en todo el documento (heredada de `V1-SCOPE.md`): `DECIDIDO` / `EXISTENTE` / `ESPECIFICADO` / `PENDIENTE` / `FUERA DE ALCANCE` / `ETAPA 2` / `DEUDA TÉCNICA`. Se agrega acá `RECOMENDADO` para distinguir una propuesta de diseño de este documento (no una decisión de negocio) de algo ya `DECIDIDO` por el usuario en sesiones previas.

---

## 1. Objetivo

Definir el modelo Comercial mínimo necesario para que el frontend público pueda mostrar qué ofrece el restaurante y, más adelante, construir un carrito y generar un Pedido — sin necesitar conocer cómo se produce nada. Auditar críticamente la propuesta inicial del usuario (sección 3) contra el código y la documentación existente, y recomendar un modelo, con su justificación.

Exclusivamente análisis y diseño documental — no se creó código, entidades, endpoints ni se modificó ningún documento existente.

---

## 2. Contexto

Este documento se ubica en el punto que `V1-SCOPE.md` dejó explícitamente pendiente: "si el Modelo Comercial de Etapa 1 se construye evolucionando `Catalogo` o como módulo nuevo" (decisión pendiente 1) y "diseño concreto de ofertas/promociones e imágenes — no existe ningún antecedente en código" (decisión pendiente 5). Ninguna de las dos se resuelve todavía en términos de "qué módulo de código" — este documento resuelve la pregunta anterior y más importante: **qué forma conceptual debe tener el modelo**, independientemente de dónde termine viviendo el código.

Recordatorio de fronteras ya `DECIDIDO` en `V1-DOMAIN-MODEL.md` (sección 6), sin cambios: Comercial responde "qué ofrecemos" y no debe decidir "cómo se produce"; Producción responde "cómo producimos" y no debe decidir "qué se vende". El frontend público no necesita — y no debe recibir — ingredientes, recetas, movimientos de stock, costos internos ni disponibilidad productiva.

---

## 3. Conceptos del modelo

Cuatro conceptos distintos, con responsabilidades separadas:

| Concepto | Rol |
|---|---|
| **Producto Comercial** | Un elemento individual vendible (nombre, precio, descripción, imagen) |
| **Combo Comercial** | Una composición de Productos Comerciales, vendida a un precio propio |
| **Oferta** | Una condición de precio promocional sobre un Producto Comercial (ver sección 8 — recomendación acotada) |
| **Catálogo** | La representación pública, en un momento dado, de qué elementos están publicados — no una entidad con vida propia (ver sección 4) |

Se recomienda explícitamente **no usar el nombre "Unidad"** para el primer concepto (como proponía la sección 3 de la consigna) — ver justificación de nombre en sección 6.

---

## 4. ¿Qué representa Catálogo?

Pregunta central de la consigna: ¿el restaurante administra un objeto llamado Catálogo, o el catálogo es la representación pública de la oferta comercial vigente?

**Análisis:** no hay evidencia — ni en el negocio descrito en esta tarea, ni en el código, ni en ninguna documentación auditada — de que el restaurante necesite crear, nombrar o versionar un objeto "Catálogo" como tal. Lo que el administrador efectivamente gestiona son *Productos Comerciales*, *Combos* y (eventualmente) *Ofertas*, cada uno con su propio estado de publicación. "El catálogo" es, en el lenguaje de negocio de esta misma consigna ("el catálogo debe permitir presentar al usuario los elementos que el restaurante haya decidido publicar"), el resultado de consultar esos elementos filtrados por su estado de publicación — no algo que se cree o edite de forma independiente.

**Recomendación: Opción B — Catálogo es una proyección/consulta, no una entidad ni agregado persistente.** `RECOMENDADO`.

Por qué, y qué evita:

- Evita mantener un estado redundante: si `Catalogo` fuera una entidad separada, cada alta/baja/edición de un Producto Comercial o Combo tendría que sincronizarse manualmente con ella — una fuente de inconsistencia clásica sin ningún beneficio de negocio a cambio.
- Es consistente con cómo el propio `docs/02-domain/README.md` distingue Entity de una simple proyección de lectura, y con la regla de `.claude/CLAUDE.md` §11 de no introducir abstracciones "porque parecen más correctas" sin justificación.
- Es coherente con la propia consigna, sección 7: "GET catálogo público" ya se plantea como una consulta, no como la gestión de un recurso propio.

**Qué costo introduce esta recomendación:** ninguno funcional para V1. El único escenario donde "Catálogo" ganaría identidad propia es si el negocio necesitara **múltiples catálogos con curaduría propia** (ej. "menú de mediodía" vs. "menú de noche", o un catálogo distinto por canal/sucursal) — no hay evidencia de ese requerimiento hoy. `PENDIENTE` (futuro, no V1) si esa necesidad aparece — se documenta como punto de extensión, no se descarta.

**Consecuencia directa sobre la propuesta inicial:** el `Catalogo { id, TipoCatalogo, Descripcion, Imagen }` de la sección 3 de la consigna, como entidad padre con `Oferta`/`Combo`/`Unidad` como subtipos, no se recomienda. Ver sección 9 para el modelo alternativo.

---

## 5. ¿Qué representa Producto?

Auditoría de cada uso existente del término "Producto" en el proyecto — confirmado que **no son el mismo concepto**, extendiendo la disambiguación que `docs/GLOSSARY.md` ya hace entre "Ingrediente"/"Producto" (negocio) y `Articulo` (dominio):

| Dónde aparece | Qué es realmente | Tiene precio/dato comercial |
|---|---|---|
| `Produccion.Articulo` (tipo `PRODUCTO`) | Un `Articulo` producible mediante una `Receta` — concepto de **fabricación** | No — verificado, sin atributo de precio (`docs/02-domain/articulo.md`) |
| `Catalogo.Producto` | Mezcla datos de fabricación (lista embebida de `Receta`↔`Ingrediente`) con datos comerciales (`precioVenta`, `descripcionAlPublico`, `activo`) — ya señalado como el conflicto de fondo en `ADR §9` | Sí, pero mezclado con fabricación — exactamente el problema que motivó dejar `Catalogo` deprecado |
| `Pedido.ItemProducto` | **No es un Producto** — es una fotografía (`productoId`, `nombreProducto`, `precioVenta`, `cantidad`, `observacion`) tomada al momento de agregarse al pedido, ver `Pedido.java` línea ~88 | Sí, snapshot, no vivo |

**Respuesta a la pregunta de la sección 5 de la consigna:** el Producto que necesita Comercial debe ser **Opción 2 — un Producto Comercial independiente**, `RECOMENDADO`, no el mismo `Articulo` de Producción (violaría la frontera de la sección 2/`V1-DOMAIN-MODEL.md` §6: Producción no decide qué se vende ni a qué precio) y no una copia de `Catalogo.Producto` (hereda su defecto de fondo: mezcla fabricación con venta).

**Cómo dejar abierta la integración futura sin resolverla ahora** (instrucción explícita de la consigna, sección 5 y 15): el Producto Comercial debe diseñarse con identidad **propia e independiente** de `Articulo`, y un **punto de extensión explícito y opcional** — conceptualmente, un dato "a qué Artículo producible corresponde este Producto Comercial, si corresponde" que hoy no se completa ni se valida contra nada. No se especifica acá si eso es una columna nullable, una tabla de mapeo aparte, o una resolución en tiempo de aplicación — es una decisión de diseño técnico de Etapa 2, no de este documento. Lo único que este documento fija es el principio: **la existencia de un Producto Comercial nunca debe requerir que exista un Articulo de Producción correspondiente**, ni viceversa.

**Recomendación de nomenclatura, para evitar seguir sumando sentidos a una palabra ya sobrecargada** (mismo criterio que `GLOSSARY.md` ya aplica a "Producción"): toda documentación SDD futura de este concepto debe llamarlo **"Producto Comercial"**, nunca "Producto" a secas.

---

## 6. Unidad (recomendación: renombrar a "Producto Comercial")

**Problema con el nombre "Unidad" de la propuesta inicial:** el proyecto ya usa "Unidad de Medida" (`UnidadMedida`) como término de dominio establecido en Producción (`docs/GLOSSARY.md`). Introducir un "Unidad" con un significado completamente distinto (un ítem individual vendible) en el mismo espacio de documentación es exactamente el tipo de colisión de vocabulario que `GLOSSARY.md` ya advierte evitar. `RECOMENDADO`: usar "Producto Comercial" (sección 5).

**Qué información necesita realmente** (auditado contra lo que el frontend público necesita, sección 2/10 de la consigna, y contra lo que `Pedido.ItemProducto` ya consume como snapshot):

- Identificador.
- Nombre.
- Descripción.
- Precio.
- Imagen (referencia, ver sección 17).
- Estado de publicación (ver sección 15).

No se agrega nada más — costo, margen, receta o cualquier dato de fabricación quedan explícitamente fuera (sección 2, frontera Comercial/Producción).

---

## 7. Combo

**Auditoría del `Combo`/`OpcionCombo` existentes en `Catalogo`** (hallazgo relevante, no reportado en documentos previos): `OpcionCombo` modela un "slot" del combo con un `productoBase` y una lista de `reemplazos` (productos sustitutos) — pero **no tiene ningún campo de cantidad**. Es decir, el modelo actual no puede representar el propio ejemplo de la consigna ("2 hamburguesas, 2 papas, 2 bebidas") porque no captura cuántas unidades de cada componente lleva el combo. Esto no es una opinión — es una lectura literal de los campos de `OpcionCombo.java`.

**Recomendación para V1** (más simple que lo existente, no una extensión de `OpcionCombo`):

- Un Combo Comercial se compone de una lista de **(Producto Comercial, cantidad)** — sin el concepto de "reemplazos"/sustitutos de `OpcionCombo`, que agrega una capacidad (sustitución en el momento de la compra) sin ninguna evidencia de que se necesite para el primer flujo. `RECOMENDADO`.
- **Los componentes de un Combo deben ser Productos Comerciales**, no Artículos de Producción ni entidades de otro tipo — consistente con que Comercial no conoce Producción (sección 2).
- **Un Combo no debe poder contener otro Combo en V1.** No es una decisión arbitraria: permitirlo introduce recursión real (cálculo de precio, snapshot al agregarse a un Pedido, prevención de ciclos) sin que exista ningún caso de negocio presentado que lo requiera. `RECOMENDADO` excluir, marcado explícitamente como **`FUERA DE ALCANCE`**, no como pendiente abierta — a diferencia de otros puntos de este documento, acá sí hay base suficiente (ausencia total de necesidad + costo de complejidad claro) para recomendar con confianza, sin que eso constituya inventar una regla de negocio: es una restricción de diseño, no una regla de negocio.
- El precio del Combo es su **propio precio**, no la suma de sus componentes — así lo plantea la propuesta inicial y el ejemplo de la consigna ("Precio total"), y es coherente con `Catalogo.Combo` existente (que ya tiene su propio campo `precio`, independiente de sus opciones).

**Deuda observada en el modelo actual, no en el recomendado:** `Catalogo.Combo` tampoco tiene ningún campo `activo`/publicación — a diferencia de `Catalogo.Producto`. Otra razón más para no extender el código existente y modelar limpio (sección 21).

---

## 8. Oferta

**Análisis de la propuesta inicial** (`Oferta { id, Precio, Producto }`): estructuralmente, tal como está propuesta, es indistinguible de "Producto Comercial" — ambos son "un id, un precio, un producto". La única diferencia real entre "Unidad" y "Oferta" en el lenguaje de negocio de la consigna es que una Oferta implica una condición **promocional/temporal** de precio — pero la estructura propuesta no captura eso en absoluto (sin precio original, sin vigencia).

**Recomendación: Oferta no debe ser un tercer tipo de elemento del catálogo, paralelo a Producto Comercial y Combo — debe ser un modificador de precio aplicado sobre un Producto Comercial existente.** `RECOMENDADO`.

Por qué: modelarla como sibling de Producto Comercial/Combo (como en la propuesta inicial) obliga a duplicar en Oferta toda la información que ya tiene el Producto Comercial que se está promocionando (nombre, descripción, imagen) o a dejarla incompleta — ninguna de las dos es limpia. Modelarla como una condición de precio evita la duplicación y refleja mejor el lenguaje de negocio ("Hamburguesa + bebida — precio promocional" describe una condición sobre algo que ya existe, no un elemento nuevo del catálogo).

**Forma mínima recomendada, si se adopta** (no se decide acá si se adopta para el primer slice — ver Pendientes): referencia al Producto Comercial que promociona, precio promocional, vigencia (al menos fecha de inicio/fin). El **precio original no necesita duplicarse** — se obtiene del propio Producto Comercial referenciado, evitando otra fuente de inconsistencia (el mismo razonamiento que evitó duplicar Precio en el `Catalogo` padre de la propuesta inicial).

**¿Puede aplicarse a Combos también?** `PENDIENTE` — no hay evidencia de necesidad para el primer flujo. Recomendación acotada: si se necesita, empezar solo sobre Producto Comercial (un Combo ya es, conceptualmente, una forma de oferta compuesta por definición — agregar promociones sobre combos es una segunda capa de complejidad sin caso de negocio presentado todavía).

**¿Es necesaria Oferta para el primer flujo operativo de Etapa 1?** `PENDIENTE` — decisión de priorización de negocio, no de diseño. El criterio de finalización de Etapa 1 ya fijado en `V1-SCOPE.md` §15 no exige promociones para dar el circuito por completo. Este documento dimensiona correctamente Oferta para cuando se decida incorporarla, sin bloquear el resto del modelo si se decide postergarla.

---

## 9. Relaciones entre conceptos

```text
Producto Comercial
    │
    │ 0..1 aplica sobre
    ▼
Oferta (opcional, ver sección 8)


Producto Comercial (N, con cantidad)
    │
    │ compone
    ▼
Combo Comercial


Producto Comercial + Combo Comercial + Oferta
    │
    │ se listan juntos, filtrados por publicación
    ▼
Catálogo (proyección de lectura, sección 4 — no una entidad)


Catálogo
    │
    │ el usuario selecciona un elemento
    ▼
Carrito (responsabilidad 100% del frontend, sección 11)
    │
    │ checkout
    ▼
Pedido (API) — referencia por id + tipo (sección 13)
```

**Tipos de relación** (mismo criterio explícito que `V1-DOMAIN-MODEL.md` sección 5/7): ninguna de estas flechas implica automáticamente una FK, un `@ManyToOne` ni un endpoint. "Producto Comercial compone Combo Comercial" es una relación de **persistencia** real (el Combo necesita saber qué Productos Comerciales y en qué cantidad). "Catálogo lista Producto Comercial + Combo Comercial + Oferta" es una relación de **proyección de lectura/API**, no de persistencia — no existe una tabla `catalogo` que las una.

**Sobre herencia/polimorfismo, pregunta explícita de la consigna:** el proyecto **sí** tiene precedente de usar herencia JPA (`ItemPedido`, `SINGLE_TABLE`, con `ItemProducto`/`ItemCombo` como subtipos) — no es una técnica ajena al código actual. Pero la razón por la que funciona ahí no aplica acá: `Pedido` necesita una colección polimórfica **de escritura**, propia de un único agregado, con comportamiento compartido real (`calcularSubtotal()`). Comercial no tiene ese caso — no hay un agregado que "posea" una lista heterogénea de Producto Comercial/Combo/Oferta con comportamiento común; lo único que los une es que se listan juntos para lectura pública. **Recomendación: entidades independientes, unificadas solo en la proyección de lectura del catálogo (una unión a nivel de DTO/respuesta, no de persistencia).** `RECOMENDADO`, explícitamente sin herencia.

**Necesidad real de un `TipoCatalogo`:** no como entidad de clasificación abierta (a diferencia de `TipoArticulo`/`TipoMovimiento` en Producción, que sí tienen esa naturaleza documentada — ADR §8, extensibilidad por dato). Acá no hay evidencia de que el negocio necesite *agregar nuevos tipos de elemento comercial como dato en tiempo de ejecución* — son 2 o 3 tipos conocidos y estables (Producto Comercial, Combo, opcionalmente Oferta). Es más parecido al caso ya documentado de `Sentido` (`ENTRADA`/`SALIDA`) en `GLOSSARY.md`: "concepto cerrado". `RECOMENDADO`: un discriminador simple del lado de la proyección de lectura, no una entidad de clasificación persistente.

---

## 10. Información necesaria para el frontend público

Por tipo de elemento, mínimo necesario (sin definir todavía el contrato de API concreto, instrucción explícita de la consigna):

- **Producto Comercial**: id, nombre, descripción, precio, imagen.
- **Combo Comercial**: id, nombre, descripción, precio, imagen, y — si el frontend necesita mostrar el detalle del combo, no solo su tarjeta — los Productos Comerciales que lo componen (id, nombre, cantidad; sin volver a exponer precio individual salvo que el negocio quiera mostrarlo desglosado, lo cual no está confirmado — `PENDIENTE`).
- **Oferta** (si se adopta): referencia al Producto Comercial promocionado, precio promocional, y probablemente el precio original para mostrar el descuento — a definir cuando se decida adoptar Oferta (sección 8).
- Todos: un **tipo** (`PRODUCTO` / `COMBO` / `OFERTA`) para que el frontend pueda diferenciarlos en una lista unificada, tal como plantea el ejemplo de la sección 7 de la consigna.

---

## 11. Modelo interno vs. representación pública

Deben ser explícitamente distintos, `RECOMENDADO`:

| Pertenece solo al modelo interno | Se expone en la representación pública |
|---|---|
| Fecha de creación/auditoría, ids de referencias internas (ej. futuro link a `Articulo` de Producción, sección 5) | id, tipo, nombre, descripción, precio, imagen |
| Estado de publicación como tal (el filtro se aplica antes de responder — el cliente público no necesita saber que existen elementos no publicados) | — |
| Elementos no publicados/inactivos | Solo elementos publicados/activos |

El frontend no debe depender de la estructura de persistencia — esto es una separación de responsabilidad estándar (proyección de lectura pública ≠ entidad de administración), no una decisión nueva de este proyecto.

---

## 12. Administración vs. consulta pública

Confirmado que deben ser dos superficies distintas, `RECOMENDADO`, sin diseñar contratos concretos (instrucción explícita, sección 5/11 de la consigna):

- **Administración** necesita: crear, modificar, activar/desactivar, configurar precio, configurar información (nombre/descripción/imagen), configurar composición de combos — sobre *todos* los elementos, publicados o no.
- **Público** necesita: consultar únicamente elementos publicados, con la información de la sección 10 — sin capacidad de escritura.

Esto ya es coherente con un hallazgo de `SDD-PANEL-API-ROADMAP.md` (sección 5): el único endpoint hoy parecido a esto, `GET /products` de Producción, es administrativo y no debería reutilizarse tal cual para consulta pública — el mismo razonamiento aplica acá con más fuerza porque Comercial ni siquiera existe todavía, así que no hay riesgo de arrastrar ese problema si se diseña bien desde el principio.

---

## 13. Relación con Pedido

Flujo conceptual confirmado, sin rediseñar `Pedido` (instrucción explícita de la consigna):

```text
Catálogo → usuario selecciona elemento → carrito almacena referencia → checkout → API recibe items → API crea Pedido
```

**Qué identificador debe viajar hacia Pedido:** el id del Producto Comercial o Combo Comercial seleccionado, más su **tipo** — exactamente el mismo patrón que `PedidoController` ya implementa hoy (`POST /pedidos/{id}/productos` vs. `POST /pedidos/{id}/combos`, cada uno resolviendo contra un repositorio distinto). **No hace falta ningún cambio de diseño en Pedido para que esto funcione** — el patrón ya existente ya separa por tipo a nivel de operación/endpoint, no necesita un id "universal" ni un tipo explícito en el payload. Verificado contra `AgregarProductoAlPedido`/`AgregarComboAlPedido`.

**Camino de migración, dato relevante para sección 23:** hoy esos dos servicios resuelven contra `Catalogo.ProductoRepository`/`ComboRepository`. Migrarlos a resolver contra un futuro repositorio de Producto Comercial/Combo Comercial es un cambio mecánico y acotado — dos clases de aplicación, no el agregado `Pedido` en sí — **siempre que** el nuevo modelo exponga accesores equivalentes (nombre, precio) a los que `Pedido.agregarProducto`/`agregarCombo` ya consumen hoy.

---

## 14. Relación futura con Producción

Confirmado, sin diseñarlo (instrucción explícita, sección 15 de la consigna): **no existe ninguna dependencia obligatoria Comercial → Producción para que Etapa 1 funcione.** El punto de extensión queda documentado en sección 5: un Producto Comercial puede, en el futuro, referenciar opcionalmente al `Articulo` producible que representa — sin que su existencia dependa de ello.

```text
Oferta Comercial / Producto Comercial
    │ (Etapa 2, no diseñado acá)
    ▼
Producto producible (Articulo)
    │
    ▼
Receta → Ingredientes → Stock
```

Esta cadena es exactamente la de `V1-DOMAIN-MODEL.md` sección 12 — este documento no la modifica, solo confirma que el modelo Comercial recomendado acá no la bloquea ni la anticipa de forma incorrecta.

---

## 15. Estados de publicación

**Análisis:** la consigna pide evaluar si hace falta diferenciar Existente/Activo/Publicado o si alcanza un único estado. El único antecedente de código (`Catalogo.Producto.activo`, booleano único) no distingue "activo" de "publicado" — y no hay ningún caso de negocio presentado en esta tarea que requiera esa distinción (ej. "preparar un producto antes de su lanzamiento público" no aparece mencionado). **Recomendación: un único estado booleano para V1** (activo = publicado), consistente con "no introducir estados innecesarios" (instrucción explícita de la consigna). `RECOMENDADO`.

`PENDIENTE`, no descartado: si en el futuro el negocio necesita preparar contenido sin publicarlo inmediatamente, la distinción Activo/Publicado se vuelve necesaria — se documenta como extensión posible, no se construye ahora.

---

## 16. Precio

Para V1, Comercial solo necesita representar **precio actual** — un único valor por Producto Comercial/Combo, sin historial. `RECOMENDADO`, consistente con instrucción explícita de la consigna.

Explícitamente diferenciado y **fuera de alcance** de Comercial en V1: historial de precios, costos, margen, precio de producción (esto vive, si existe, del lado de Producción — y hoy `Articulo` no tiene ningún atributo de precio, confirmado en sección 5), precios por canal, reglas complejas de promociones (más allá de la Oferta simple de sección 8).

---

## 17. Imágenes

Alcanza con almacenar una referencia (URL/path) por Producto Comercial/Combo — no se diseña almacenamiento de archivos, coherente con instrucción explícita de la consigna. La responsabilidad de renderizar la imagen es 100% del frontend. `RECOMENDADO`, sin alternativas a evaluar — no hay ninguna evidencia ni necesidad planteada que justifique más complejidad acá.

---

## 18. Decisiones confirmadas

- Comercial es conceptualmente independiente de Producción — ya `DECIDIDO` en `V1-DOMAIN-MODEL.md`, reafirmado.
- No forzar relación Comercial→Producción en Etapa 1 — ya `DECIDIDO` en `V1-SCOPE.md`, reafirmado.
- El frontend público no recibe ingredientes, recetas, stock, costos ni disponibilidad productiva — `DECIDIDO`, instrucción explícita de esta tarea.
- Administración y consulta pública son superficies distintas — `DECIDIDO`, instrucción explícita de esta tarea.
- No modificar `Pedido` para que este modelo funcione — verificado que no hace falta (sección 13).

Recomendaciones de diseño de este documento (`RECOMENDADO`, no `DECIDIDO` — requieren aprobación humana antes de implementarse):

- Catálogo = proyección de lectura, no entidad (sección 4).
- Producto Comercial como entidad independiente, nunca el mismo `Articulo` de Producción ni una copia de `Catalogo.Producto` (sección 5).
- Renombrar "Unidad" → "Producto Comercial" (sección 6).
- Combo compuesto por (Producto Comercial, cantidad), sin sustitutos, sin combos anidados (sección 7).
- Oferta como modificador de precio sobre Producto Comercial, no como tercer tipo paralelo (sección 8).
- Sin herencia/polimorfismo de persistencia entre Producto Comercial/Combo/Oferta (sección 9).
- Sin `TipoCatalogo` como entidad de clasificación abierta — discriminador cerrado en la proyección de lectura (sección 9).
- Un único estado de publicación para V1 (sección 15).

---

## 19. Decisiones pendientes

1. Si el modelo se implementa evolucionando `Catalogo` o como módulo nuevo — heredada de `V1-SCOPE.md`, no resuelta acá tampoco (este documento define la forma, no dónde vive el código).
2. Si Oferta se incluye en el primer slice de Etapa 1 o se pospone (sección 8).
3. Si Oferta debe poder aplicarse también a Combos (sección 8).
4. Si el detalle de un Combo debe exponer el precio individual de cada componente al frontend público (sección 10).
5. Si la distinción Activo/Publicado se necesita más adelante (sección 15).
6. Mecanismo técnico concreto del punto de extensión hacia `Articulo` de Producción (sección 5/14) — explícitamente de Etapa 2, no se diseña acá.
7. Contratos concretos de API (endpoints, forma exacta de request/response) — explícitamente fuera de esta tarea (sección 5/7/11 de la consigna).

Ninguna se resuelve en este documento — decisión humana pendiente en todos los casos.

---

## 20. Elementos fuera de alcance

`FUERA DE ALCANCE` de este documento y de la V1 (salvo lo ya marcado como `ETAPA 2`/`PENDIENTE` arriba, que no es lo mismo — no se colapsan las categorías):

- Combos anidados (sección 7 — exclusión con recomendación firme, no una decisión pendiente).
- Sustitución de componentes dentro de un combo (`reemplazos`, heredado de `Catalogo.OpcionCombo` — sin evidencia de necesidad).
- Historial de precios, costos, margen, precios por canal (sección 16).
- Almacenamiento de archivos de imagen — solo referencia (sección 17).
- Toda integración real con Producción (Etapa 2, sección 14).
- Contratos de API concretos (Etapa siguiente de especificación, no de este documento).
- Implementación de cualquier cosa — esta tarea es exclusivamente de diseño documental.

---

## 21. Estado actual de implementación

Nada de lo recomendado en este documento existe en código. Lo único que existe hoy, relacionado pero no reutilizable tal cual:

| Elemento existente | Relación con lo recomendado | Estado |
|---|---|---|
| `Catalogo.Producto` | Precedente conceptual parcial de Producto Comercial (nombre/precio/descripción/activo) — pero mezclado con datos de fabricación (receta embebida) | `EXISTENTE`, deprecado, no reutilizable sin reescritura |
| `Catalogo.Combo`/`OpcionCombo` | Precedente conceptual parcial de Combo — pero sin campo de cantidad por componente, sin campo de publicación, con concepto de sustitutos no requerido | `EXISTENTE`, deprecado, no reutilizable sin reescritura |
| `Catalogo.Ingrediente`/`Receta` (de Catalogo) | Sin relación con Comercial — pertenecen al problema ya señalado en `ADR §9` (mezcla fabricación/venta) | `EXISTENTE`, deprecado, irrelevante para este modelo |
| Concepto de Oferta | No existe ningún antecedente en ningún módulo | — |
| `Pedido.ItemProducto`/`ItemCombo` | Ya implementan correctamente el patrón de snapshot que Comercial debe soportar (sección 13) — no requieren cambios | `EXISTENTE`, `IMPLEMENTED` |

---

## 22. Deudas técnicas relevantes

Nuevas, encontradas en esta auditoría:

- `Catalogo.OpcionCombo` no tiene campo de cantidad — no puede representar combos reales con múltiples unidades por componente (sección 7).
- `Catalogo.Combo` no tiene campo de publicación/activación, a diferencia de `Catalogo.Producto` — inconsistencia menor dentro del propio módulo deprecado.
- Ningún antecedente de "Oferta"/promoción en ningún módulo — el concepto se especifica en este documento por primera vez.

Heredadas, sin cambios (`V1-SCOPE.md` §12, `V1-DOMAIN-MODEL.md` §13): `Catalogo` deprecado sin tests/API/SDD, `Pedido` sin tests/SDD/RFC 7807, ausencia de modelo `Cliente`, ausencia de estado `RECHAZAR` distinguible de `CANCELAR`. Ninguna de estas se resuelve acá — este documento no las bloquea ni las agrava.

---

## 23. Consideraciones para implementación futura

- **Orden sugerido de construcción** (no un compromiso de fechas, solo dependencia lógica): Producto Comercial primero (es la unidad mínima que todo lo demás necesita) → Combo Comercial (depende de que existan Productos Comerciales) → Oferta, si/cuando se decida adoptarla (sección 8, depende de Producto Comercial).
- **El camino de integración con `Pedido` es angosto y ya identificado** (sección 13): solo `AgregarProductoAlPedido`/`AgregarComboAlPedido` necesitan apuntar a los nuevos repositorios — el agregado `Pedido` en sí no requiere ningún cambio.
- **No construir el modelo dentro de `Catalogo` por defecto.** Dado que `Catalogo` está deprecado, no tiene tests, y mezcla responsabilidades que este documento explícitamente separa (sección 5), extenderlo perpetuaría el problema que motivó su deprecación (`ADR §9`). La decisión de si el código nuevo vive en un paquete `Catalogo` renovado o en uno nuevo (`Comercial`) sigue pendiente (sección 19, punto 1) — pero técnicamente, este documento inclina la evidencia hacia "módulo nuevo, sin heredar código de `Catalogo`", sin cerrarlo como decisión.
- **Antes de implementar**, seguir el proceso ya establecido: Requirement → Domain Spec → Use Case → (BDD si aporta valor) → Contrato de API → Implementación → Tests → Trazabilidad (`.claude/CLAUDE.md` sección 9, `docs/SDD-DEVELOPMENT.md`) — este documento es el insumo conceptual de entrada a ese proceso, no un sustituto de ninguno de sus pasos.

---

## Confirmación

No se modificó código ni documentación existente (`PROJECT.md`, `V1-DOMAIN-MODEL.md`, `V1-SCOPE.md`, `SDD-PANEL-API-ROADMAP.md`, `ADR 0001` ni ningún otro documento). La única modificación realizada fue la creación de `docs/V1-COMMERCIAL-CATALOG.md`.
