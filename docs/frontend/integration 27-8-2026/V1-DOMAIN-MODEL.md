# Modelo de Dominio V1

## Metadata

Versión: 1.0
Estado: `DRAFT` — modelo conceptual objetivo, confirmado por el usuario en esta sesión (2026-08-26) a nivel de *principios y fronteras*; su implementación concreta (qué entidades, qué módulos, qué API) permanece sin decidir salvo donde se indica explícitamente `CONFIRMED`.
Tipo: documento de referencia cross-módulo (no es una Domain Spec de `02-domain/`, no es un ADR, no es la ficha general de `PROJECT.md`) — ver sección 15 para su relación exacta con el resto de la documentación.
Fuente: este documento formaliza por escrito, por primera vez, un modelo conceptual que el usuario planteó explícitamente en esta sesión. No reconstruye una decisión de negocio ya tomada en otro lugar — la reconstrucción de evidencia de código/docs existentes se usa para verificar consistencia, no como origen del modelo.

---

## 1. Propósito del documento

Formalizar el modelo conceptual objetivo de la V1 del sistema, para que las responsabilidades de **Producción**, **Stock**, **Comercial/Catálogo** y **Pedido** no tengan que redebatirse en cada sesión de trabajo futura. A partir de este documento, cualquier Requirement, Use Case, Domain Spec, Contrato de API o implementación relacionada con estos cuatro modelos debe respetar las fronteras y principios definidos acá. Si una necesidad futura obliga a romper alguno de estos principios, esa ruptura debe documentarse explícitamente **antes** de implementarse (ver sección 16).

Este documento es exclusivamente conceptual. No modifica código, no modifica documentación existente, no resuelve deuda técnica, no implementa disponibilidad, no migra `Pedido`, no toca `Catalogo`.

---

## 2. Objetivo de la V1

La V1 no busca completar toda la funcionalidad administrativa posible. Busca un **primer flujo operativo completo y extensible**:

administración configura → Producción define cómo se produce → Stock informa qué hay → Comercial define qué se ofrece → el sistema determina disponibilidad → un frontend público consulta la oferta → un cliente arma un carrito y genera un pedido → el pedido registra su canal de origen → la recepción administrativa lo confirma o modifica → el sistema queda preparado para sumar otros canales de entrada sin rediseñarse.

Ninguno de estos pasos está completo hoy de punta a punta (ver sección 10).

---

## 3. Contexto del sistema

Evidencia auditada para este documento (detalle de hallazgos por archivo en sección 15 y en la confirmación final):

- `docs/PROJECT.md` — ficha general vigente. Confirma 4 módulos de código (`Producción`, `Catalogo`, `Pedido`, `Stock` vacío) y su estado real, sin describir todavía un modelo conceptual de 4 capas como el de este documento.
- `docs/adr/0001-diseno-modulo-produccion.md`, especialmente §9 — decisión vigente (`CONFIRMED`, Opción C): construir `Producción` aislado, dejar `Catalogo` deprecado-pero-funcional, y registrar como ítem de seguimiento explícito "migrar `Pedido` de `Catalogo` a `Producción` **+ nuevo concepto comercial**". Esta última frase — la conjunción de ambas cosas, no una sola — es el antecedente directo del modelo Comercial que este documento formaliza. Ver matiz importante en sección 4.4 y 15.
- `docs/03-architecture/boundaries.md` — verifica en código que `Pedido` depende hoy de `Catalogo`, nunca de `Producción`, y que `Producción` nunca depende de `Pedido`. Hecho de código vigente, no cuestionado por este documento.
- `docs/SDD-PANEL-API-ROADMAP.md` — auditoría previa de la API, preservada íntegra. Sus hallazgos de código siguen siendo válidos; una de sus conclusiones necesita reinterpretación bajo este modelo (sección 15.3).
- `docs/02-domain/*` — Domain Specs completas, pero **solo de `Producción`**. `Stock` (el conceptual) hoy vive documentado como agregado interno de `Producción` (`02-domain/stock.md`), no como modelo independiente — ver sección 4.2 para por qué eso no es una contradicción.
- `docs/GLOSSARY.md` — ya documenta que "Producción" tiene 3 sentidos distintos y que `Catalogo.Producto` mezcla datos de fabricación con datos comerciales, "exactamente lo que el ADR §9 identificó como el conflicto". Este documento no descubre ese conflicto — lo hereda ya señalado y lo usa como base.
- Código: `Produccion/domain/model/*`, `Catalogo/domain/model/*`, `Pedido/domain/model/*`, `Pedido/domain/service/CalculadorConsumoIngredientes.java`, paquete `Stock/` (vacío). Inspeccionado directamente para esta tarea, no solo vía documentación.

---

## 4. Modelos principales

### 4.1 Producción

**Pregunta:** ¿Cómo producimos?

**Responsabilidad conceptual:** artículos, ingredientes, productos producibles, recetas, composición de recetas, ejecución de producción, relación producto↔ingrediente.

**Estado actual (`RECONSTRUCTED`, evidencia directa):** el único de los cuatro modelos con especificación SDD completa. `Articulo` unifica "Ingrediente" y "Producto" (términos de negocio/UI) bajo un único concepto de dominio, diferenciado por `TipoArticulo` — decisión explícita (ADR §1) para no duplicar Stock/Movimiento. `Receta`+`RecetaDetalle` definen la composición. El proceso de producción (`EjecutarProduccionService`, `ConsultarDisponibilidadService`, `CalculadorRequerimientosProduccion`) no es una entidad persistente — orquesta `Receta`+`Stock`+`Movimiento`. Domain+aplicación `IMPLEMENTED` y `TESTED` para Ingrediente/Producto/Stock/Movimiento; `IMPLEMENTED` sin API para Receta/Disponibilidad/Ejecutar Producción (ver `SDD-PANEL-API-ROADMAP.md` secciones 1 y 3).

**Lo que Producción NO debe decidir:** qué se muestra al cliente, a qué precio, si está publicado comercialmente. `Articulo` no tiene ningún atributo de precio ni de visibilidad pública — verificado contra `docs/02-domain/articulo.md`.

### 4.2 Stock

**Pregunta:** ¿Qué tenemos?

**Responsabilidad conceptual:** existencias actuales, movimientos, reposición.

**Nota conceptual importante:** el prompt de esta tarea pide tratar Stock como uno de los cuatro modelos principales, al mismo nivel que Producción, Comercial y Pedido. Hoy, en el código, `Stock` **no es un módulo independiente** — es un agregado interno de `Produccion` (`Produccion.domain.model.Stock`, relación 1:1 con `Articulo`, sin FK bidireccional, ADR §19), documentado dentro de `02-domain/stock.md` como parte de la Domain Spec de Producción. Esto **no contradice** el modelo conceptual: el diagrama de la sección 7 es de negocio, no de paquetes Java — "Stock responde qué tenemos" es una pregunta conceptualmente distinta de "Producción responde cómo producimos", aunque hoy compartan bounded context por razones prácticas (evitar recalcular historial completo en cada consulta, razón de performance ya documentada). No se propone acá separarlos en módulos de código distintos — eso sería una decisión de arquitectura, fuera de alcance de este documento.

El paquete Java top-level `com.Alacan.demo.Stock` (vacío, sin ninguna clase) es un scaffold muerto, **no debe confundirse** con el modelo conceptual Stock descrito acá, que sí existe y está implementado dentro de `Produccion`.

**Lo que Stock NO debe decidir:** qué se vende, a quién, a qué precio. Stock informa cantidad; no decide oferta.

### 4.3 Comercial / Catálogo

**Pregunta:** ¿Qué ofrecemos, a qué precio, bajo qué condiciones?

**Responsabilidad conceptual:** oferta comercial — qué artículos producibles se exponen al público, nombre comercial, precio, descripción pública, condiciones de disponibilidad para venta.

**Estado actual (`RECONSTRUCTED`):** no existe hoy una implementación limpia de este modelo. Lo más cercano en código es el paquete `Catalogo` (deprecado pero funcional, `PROJECT.md` §4): `Producto` (con `precioVenta`, `descripcionAlPublico`, `activo`) y `Combo`/`OpcionCombo`. Pero — hallazgo ya documentado en `ADR §9` y en `GLOSSARY.md`, no nuevo de este análisis — `Catalogo.Producto` **mezcla** datos de fabricación (su propia lista embebida de `Receta`↔`Ingrediente`, con su propio `Ingrediente` sin repositorio, inalcanzable) con datos comerciales (precio, descripción pública). Es decir: `Catalogo` ocupa hoy el lugar conceptual de "Comercial", pero no es una implementación limpia de ese concepto — reimplementa (mal, sin tests, sin conexión real a stock) una porción de lo que `Producción` ya resuelve correctamente, en vez de simplemente consumirlo.

**Importante — esto NO es lo mismo que decir "Catalogo debe eliminarse" ni "Catalogo debe convertirse en el modelo Comercial tal cual está".** Ambas son decisiones de implementación no tomadas. Este documento solo establece que, conceptualmente, el modelo Comercial objetivo debe:

- responder "qué ofrecemos" sin decidir "cómo se produce" (eso lo determina Producción);
- ser la fuente de nombre público, precio y descripción — datos que hoy no existen en absoluto en `Producción.Articulo`;
- **consumir** información de qué es producible desde Producción (relación conceptual, no necesariamente FK — ver sección 7), no reimplementarla.

**Lo que Comercial/Catálogo NO debe decidir:** cómo se fabrica un producto, cuánto stock físico hay, cómo se ejecuta una producción.

### 4.4 Pedido

**Pregunta:** ¿Qué pidió el cliente y en qué estado está?

**Responsabilidad conceptual:** pedido, cliente, items, cantidades, precios (snapshot), canal de origen, estado, observaciones, confirmación, modificaciones posteriores.

**Estado actual (`RECONSTRUCTED`, evidencia de código) — hallazgo relevante de esta auditoría:** el agregado `Pedido` ya existe, con una máquina de estados razonablemente completa (`EstadoPedido`: `NUEVO → CONFIRMADO → EN_PREPARACION → LISTO → (ENVIADO) → ENTREGADO`, con rama `CANCELADO`) y **ya modela el canal como un atributo del pedido** (`CanalPedido`: `TOTEM`, `APP_MOVIL`, `WEB`, `MOZO`), no como una jerarquía de tipos por canal — esto ya es consistente con el Principio 5 (sección 14). Más aún: `ItemProducto`/`ItemCombo` **ya toman una fotografía** de nombre y precio al momento de agregarse al pedido (`new ItemProducto(producto.getId(), producto.getNombreProducto(), producto.getPrecioVenta(), cantidad, observacion)`), en vez de referenciar el catálogo en vivo — esto ya implementa el principio de preservar información comercial del momento del pedido (sección 8, "Catálogo vs Pedido"), sin que se le haya pedido hacerlo explícitamente hasta ahora.

**El problema real no es la forma del agregado `Pedido` — es de dónde saca los datos para esa fotografía.** Hoy los toma de `Catalogo.Producto`/`Catalogo.Combo` (confirmado por imports directos en `Pedido.domain.model.Pedido` y `Pedido.domain.service.CalculadorConsumoIngredientes`), que es el modelo deprecado y desconectado de `Producción`. Ver la distinción crítica en sección 15.3 — esto no es lo mismo que decir que `Pedido` debería depender de `Producción` directamente.

**Deuda encontrada (no resuelta acá):** `CalculadorConsumoIngredientes` calcula qué ingredientes consumiría un pedido recorriendo `Catalogo.Producto.getRecetas()`, pero no está conectado como bean de Spring ni invocado desde ningún servicio — hoy, cuando un `Pedido` avanza de estado, **no se consume stock real en ningún lado**. Ni siquiera se consumiría el (deprecado) stock de `Catalogo`, porque `Catalogo` no tiene ningún concepto de stock. Esto es consistente con Principio 9 (sección 14): no es un bloqueante para el primer flujo, pero es una pieza faltante real para cuando el flujo deba mover stock de verdad.

**Lo que Pedido NO debe decidir:** cómo se produce, cuánto stock hay disponible físicamente, qué se ofrece comercialmente. Pedido consume esas respuestas, no las calcula.

---

## 5. Disponibilidad

**Distinción crítica que este documento formaliza por primera vez:** el término "disponibilidad" ya tiene un significado implementado y documentado en `Producción` (`docs/02-domain/produccion-proceso.md`, `ConsultarDisponibilidadService`) — pero ese significado es **más angosto** que el que la V1 necesita para el flujo público.

| Sentido | Pregunta | Alcance | Estado |
|---|---|---|---|
| **Disponibilidad de producción** (existente) | ¿Alcanza el stock actual para producir N unidades de esta Receta? | Interno a Producción — solo Receta + Stock | `IMPLEMENTED`, sin API (`ConsultarDisponibilidadService`) |
| **Disponibilidad comercial** (objetivo V1, nueva) | ¿Podemos ofrecer/vender este producto ahora mismo al cliente? | Cruza Comercial (¿está publicado/activo comercialmente?) + Producción/Stock (¿hay insumos o el artículo en sí?) + posibles condiciones comerciales adicionales no especificadas todavía (horario, canal, etc. — **no se asume ninguna**, se deja como `UNKNOWN`) | No implementado. No especificado más allá de este documento |

```text
                 CATÁLOGO
                    │
             ¿está ofrecido?
                    │
                    ▼
                PRODUCTO
                    │
              PRODUCCIÓN
                    │
             ¿puede producirse?
                    │
                    ▼
                  STOCK
                    │
               ¿hay recursos?
                    │
                    ▼
              DISPONIBILIDAD (comercial)
```

Este documento **no define** las reglas concretas de disponibilidad comercial (qué combinación exacta de condiciones la determina) — eso es trabajo de especificación posterior (Requirement + Domain Spec + Use Case), no de este documento conceptual. Definirlas ahora sería inventar comportamiento sin evidencia (`.claude/CLAUDE.md` sección 5).

### Tipos de relación (aplica a toda la sección 7 también)

La flecha de arriba, y todas las de este documento, son **relaciones conceptuales de negocio** — no implican automáticamente:

- **dependencia de aplicación** (un servicio llamando a otro),
- **dependencia de persistencia** (una FK entre tablas), ni
- **dependencia de API** (un endpoint consumiendo a otro).

Cómo se resuelve técnicamente "Disponibilidad necesita saber si Producción puede producir X" (¿una consulta síncrona? ¿una proyección de lectura actualizada por evento? ¿una FK directa desde una tabla Comercial hacia `articulo_id`?) es una decisión de arquitectura/diseño técnico, no tomada acá, y que corresponde a `03-architecture/technical-design.md` o a un ADR cuando se decida.

---

## 6. Fronteras de responsabilidad

| Modelo | Pregunta | Responsabilidad | NO debe decidir |
|---|---|---|---|
| **Producción** | ¿Cómo producimos? | Artículos, ingredientes, recetas, composición, ejecución de producción | Qué mostrar al cliente, a qué precio, si está publicado |
| **Stock** | ¿Qué tenemos? | Existencias actuales y movimientos | Qué vender ni a quién |
| **Comercial/Catálogo** | ¿Qué ofrecemos? | Oferta comercial: nombre público, precio, descripción, condiciones | Cómo se produce, cuánto stock físico hay |
| **Pedido** | ¿Qué pidió el cliente? | El pedido y su ciclo de vida (items, cantidades, estado, canal) | Cómo se produce, qué stock hay, qué se ofrece comercialmente |

Estas cuatro filas son la referencia estable que este documento existe para fijar (sección 1).

---

## 7. Relaciones entre modelos

```text
Producción
    │
    │ productos producibles
    ▼
Comercial / Catálogo
    │
    │ oferta comercial
    ▼
Cliente
    │
    │ pedido
    ▼
Pedido


Producción
    │
    │ necesidades de producción
    ▼
Stock


Producción + Stock + Comercial
              │
              ▼
        Disponibilidad
```

**Auditoría de este modelo contra la evidencia real:** no se encontró una contradicción real que obligue a corregirlo — es consistente con `ADR §9` (que ya anticipaba un "concepto comercial nuevo" entre Producción y Pedido, no a Pedido dependiendo de Producción directamente) y con `boundaries.md` (que confirma que `Producción` nunca depende de `Pedido`, coherente con el sentido único de las flechas de arriba). Ver sección 15.3 para el matiz sobre cómo esto reinterpreta —sin invalidar— un hallazgo del roadmap anterior.

---

## 8. Canales de entrada

Web, WhatsApp y futuros canales son **medios de entrada/comunicación**, no el modelo de negocio del pedido:

```text
Web ──────────┐
WhatsApp ─────┼──► Pedido
Otros canales ┘
```

El mismo modelo de `Pedido` debe poder representar un pedido `WEB`, `WHATSAPP` u `OTRO_CANAL` sin cambiar su estructura. **Esto ya está parcialmente logrado en el código actual** — `CanalPedido` es un atributo del agregado (`TOTEM`, `APP_MOVIL`, `WEB`, `MOZO`), no una subclase ni un modelo separado por canal (ver sección 4.4). El primer canal público de la V1 será Web (consigna de esta tarea); el modelo no debe diseñarse de forma que agregar WhatsApp más adelante requiera tocar la estructura central de `Pedido`.

---

## 9. Rol del Panel

El Panel **no es un modelo de dominio** — es un consumidor administrativo de la API, exactamente igual en naturaleza que el front público (ambos son clientes HTTP externos al backend, ver `SDD-PANEL-API-ROADMAP.md` sección de aclaración arquitectónica).

```text
                    API
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    Panel           Web        otros canales
   interno        público
       │             │
       └──────► API ◄┘
```

El Panel puede proveer interfaces para administrar Producción, Stock, Comercial y Pedidos — pero "Panel" nunca debe convertirse en una frontera de dominio ni aparecer como concepto en `02-domain/`, `01-requirements/` o en las fronteras de la sección 6.

---

## 10. Flujo end-to-end objetivo

```text
                    PRODUCCIÓN
                         │
                  ¿Cómo producimos?
                         │
                         ▼
                       STOCK
                         │
                  ¿Qué tenemos?
                         │
                         ▼
                  DISPONIBILIDAD
                         ▲
                         │
                    CATÁLOGO
                         │
              ¿Qué ofrecemos?
                         │
                         ▼
                      CLIENTE
                         │
                   realiza pedido
                         │
                         ▼
                       PEDIDO
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          recepción             canal origen
              │
       confirma/modifica
              │
              ▼
          operación
```

Este es un modelo conceptual de negocio, no un diagrama de dependencias de clases/tablas/API (ver sección 5, "Tipos de relación"). Estado real de cada tramo, verificado contra código (no aspiracional):

| Tramo | Estado |
|---|---|
| Producción → Stock | `IMPLEMENTED`, `VERIFIED` (dentro de Producción) |
| Stock → Disponibilidad (sentido "de producción") | `IMPLEMENTED`, sin API |
| Catálogo → Disponibilidad (sentido comercial) | No existe — Comercial no existe todavía en forma limpia |
| Catálogo → Cliente (consulta pública de oferta) | No existe — no hay endpoint público de catálogo |
| Cliente → Pedido | `IMPLEMENTED` (creación, agregar ítems), pero sourceando datos del `Catalogo` deprecado, no de una oferta comercial real conectada a Producción |
| Pedido → canal origen | `IMPLEMENTED` (`CanalPedido`) |
| Pedido → recepción → confirma/modifica | `IMPLEMENTED` a nivel de API (`PedidoController`), sin tests, sin SDD |
| recepción → operación (consumo real de stock) | **No implementado** — `CalculadorConsumoIngredientes` existe pero está desconectado (sección 4.4) |

---

## 11. Alcance de V1

**Necesario para el primer flujo (sin esto, no hay flujo operativo):**

- Producción: Artículo, Receta, Stock — ya `VERIFIED` salvo Receta sin API (`SDD-PANEL-API-ROADMAP.md`, ya identificado como primer vertical slice recomendado, sigue vigente sin cambios).
- Comercial/Catálogo: alguna forma de "esto se ofrece, a este precio, y está conectado a lo que Producción puede producir" — hoy no existe en forma limpia. Es la pieza faltante más grande del flujo completo.
- Pedido: ya existe con forma adecuada (sección 4.4) — necesita apuntar a una fuente Comercial real, no a `Catalogo` deprecado.
- Canal Web.
- Recepción administrativa (confirmar/modificar pedido) — ya existe en `PedidoController`.

**Necesario más adelante dentro de la V1 (no bloquea el primer flujo, pero es parte del objetivo declarado en sección 3 de la consigna):**

- Disponibilidad comercial completa (hoy solo existe el sentido angosto "de producción").
- Consumo real de stock al confirmarse/operarse un pedido (hoy `CalculadorConsumoIngredientes` está desconectado).
- Tests y documentación SDD de `Pedido` (hoy inexistentes).

**Post-V1 (fuera del alcance inmediato, ver detalle en sección 12):** versionado de recetas, resolución definitiva de la baja lógica de ingredientes usados por recetas, reglas avanzadas de disponibilidad, canales más allá de Web, Combos/Menú como concepto propio, automatización avanzada, funcionalidades administrativas no esenciales al flujo principal.

---

## 12. Fuera de alcance

| Ítem | Clasificación |
|---|---|
| Versionado avanzado de recetas | Post-V1 — evaluado y explícitamente pospuesto como Alternativa 5 en `GAP-PROD-005` (`docs/02-domain/receta.md`) |
| Resolución definitiva de baja lógica de artículos usados por recetas | Post-V1 — `GAP-PROD-005`, `DEFERRED`, sin resolver acá tampoco |
| Reglas avanzadas de disponibilidad comercial | Post-V1 para las reglas *avanzadas*; una noción *básica* de disponibilidad comercial es "necesario más adelante dentro de V1" (sección 11) — no son lo mismo, no se colapsan |
| Automatización completa de consumo de stock por Pedido | "Necesario más adelante dentro de V1" (sección 11), no Post-V1 puro — es parte del objetivo declarado del flujo, aunque no bloquea el primer flujo mínimo |
| Canales más allá de Web (WhatsApp, TOTEM, APP_MOVIL, MOZO) | Post-V1 — aunque `CanalPedido` ya los modela como valores, activarlos como flujo real no es parte del primer flujo |
| Combos/Menú como concepto propio | Post-V1 — `ADR §9` ya los documentó como pertenecientes a un futuro módulo comercial/menú, no tocado por este documento |
| Optimizaciones de performance | Post-V1 |
| Funcionalidades administrativas no esenciales al flujo principal | Post-V1 (ver `SDD-PANEL-API-ROADMAP.md` sección 6, "Post-MVP", que sigue vigente) |

---

## 13. Deudas técnicas relacionadas

Registradas, no resueltas:

- **`GAP-PROD-005`** — baja lógica de Artículo usado por Receta, sin cascada resuelta (`docs/02-domain/receta.md`, `DEFERRED` para MVP). Relevante acá porque cualquier noción futura de disponibilidad comercial hereda esta misma pregunta sin respuesta.
- **`GAP-PROD-002`/`GAP-PROD-003`/`GAP-PROD-004`** — vigentes, sin cambios, ver `docs/09-traceability/traceability.md`.
- **`CalculadorConsumoIngredientes` desconectado** — identificado en `SDD-PANEL-API-ROADMAP.md` sección 7, reforzado acá (sección 4.4/10): ni siquiera está conectado al modelo (deprecado) del que depende hoy.
- **Estado del paquete `Stock`** — vacío, dead scaffold, no confundir con el modelo conceptual Stock (sección 4.2).
- **Duplicación conceptual entre `Catalogo` y `Producción`** — matizada por este documento (sección 4.3): no es duplicación pura a eliminar sin más — `Catalogo` ocupa hoy el lugar conceptual de "Comercial" sin estar conectado a `Producción`. Resolverlo no es "borrar Catalogo", es una decisión de diseño no tomada (sección 15.3).
- **Inconsistencias en `Pedido`** — sin tests, sin documentación SDD, sin manejo de errores RFC 7807, CORS hardcodeado con origen propio distinto al de Producción (`SDD-PANEL-API-ROADMAP.md` sección 7).
- **Ausencia de tests/garantías donde corresponde** — `Pedido` y `Catalogo`: 0 tests verificados en ambos (`find src/test/java`, esta y la auditoría anterior coinciden).

Ninguna de estas deudas se convierte automáticamente en bloqueante de la V1 — su clasificación (necesario para el primer flujo / necesario más adelante / post-V1) está en las secciones 11 y 12.

---

## 14. Principios que deben preservarse

1. **Producción** responde cómo producimos.
2. **Stock** responde qué tenemos disponible física/operativamente.
3. **Comercial/Catálogo** responde qué ofrecemos al cliente y cómo lo presentamos.
4. **Pedido** responde qué pidió el cliente y cuál es el estado de ese pedido.
5. Los **canales de entrada** no deben definir el modelo de Pedido.
6. **Panel** es un consumidor administrativo de la API, no un modelo de dominio.
7. Un **producto producible** y una **oferta comercial** no son necesariamente el mismo concepto.
8. La **disponibilidad** es una capacidad derivada de información de distintos modelos y no debe reducirse automáticamente a `stock > 0`.
9. La V1 prioriza un **flujo operativo completo** sobre la resolución anticipada de todas las problemáticas futuras.
10. Las **decisiones todavía no resueltas** deben registrarse como deuda o decisión pendiente, no inventarse durante la implementación.

---

## 15. Relación con documentación existente

Este documento no reemplaza a ninguno de los siguientes — los complementa, en una capa conceptual más alta y cross-módulo que ninguno de ellos cubre hoy:

- **`docs/PROJECT.md`** — sigue siendo la ficha general vigente (qué es el proyecto, estado real por módulo, stack). Este documento no repite ese contenido; asume su sección 4 (mapa de módulos) como base de "estado actual" y construye el "estado objetivo" sobre ella. No hay contradicción — `PROJECT.md` no describe todavía un modelo conceptual de 4 capas, y no necesita hacerlo: es el rol de este documento nuevo.

- **`docs/adr/0001-diseno-modulo-produccion.md` §9** — decisión de fondo (`CONFIRMED`), no reabierta. Este documento formaliza y da nombre estable ("Comercial") a algo que el ADR ya mencionaba de pasada ("nuevo concepto comercial") sin desarrollarlo — es una extensión del mismo hilo de decisión, no una decisión distinta ni contraria.

- **`docs/02-domain/*`** — Domain Specs completas de `Producción`, siguen siendo la fuente de verdad de ESE módulo en el nivel de detalle de entidades/invariantes/comportamiento. Este documento opera un nivel más arriba (relaciones entre módulos, no invariantes dentro de uno) y no las reemplaza ni las contradice.

- **`docs/GLOSSARY.md`** — sus disambiguaciones existentes (Producción con 3 sentidos, Articulo unificando Ingrediente/Producto, Catalogo.Producto mezclando fabricación+comercial) son la base evidencial de este documento, no algo que este documento corrija. Este documento introduce un término nuevo ("Comercial") que el glosario todavía no cubre — no lo agrego acá porque está prohibido modificar otros documentos en esta tarea; queda señalado como pendiente para una fase posterior.

### 15.1 Qué del roadmap sigue siendo válido sin cambios

- Sección 1 (estado actual de la API) — hechos de código, verificados de nuevo en esta auditoría, sin contradicciones.
- Sección 2/3 (capacidades existentes/faltantes) — sin cambios.
- El **primer vertical slice recomendado** (exponer Receta + Disponibilidad de producción sobre `Producción`) — sigue siendo el paso correcto: es puramente interno a Producción, no toca `Pedido`/`Catalogo`/Comercial, y es un prerrequisito de cualquier interpretación de este modelo.

### 15.2 Qué del roadmap necesita reinterpretarse

La sección 11 del roadmap anterior planteaba la decisión pendiente como "migrar Pedido de Catalogo a Producción, o mantenerlo sobre Catalogo". Formulada así, esa alternativa es imprecisa bajo el modelo formalizado acá — ver 15.3.

### 15.3 El matiz central que este documento formaliza

> **"Pedido consume Catálogo"** y **"Pedido depende del mismo modelo interno que Producción"** no son la misma afirmación.

El hecho de código verificado (`Pedido` importa `Catalogo`, nunca `Producción`) sigue siendo exacto — no se cuestiona. Lo que se corrige es la interpretación de **qué arreglaría eso**: bajo el modelo de la sección 7, la dependencia conceptualmente correcta **nunca fue** "Pedido → Producción" directamente — Producción responde "cómo se produce", no "qué se vende ni a qué precio", y Pedido no necesita ni debe saber cómo se fabrica algo. La dependencia correcta es **Pedido → Comercial**, y **Comercial → Producción** (para saber qué es producible). El código actual tiene la dependencia en el lugar conceptual correcto (`Pedido` depende de "lo que ocupa el rol de Comercial") — el problema real es que lo que ocupa ese rol hoy (`Catalogo`) no está conectado a `Producción` y reimplementa mal parte de su responsabilidad (sección 4.3).

Consecuencia práctica: la futura decisión pendiente no debería plantearse como "¿migramos Pedido a depender de Producción?" — eso violaría el Principio 7 y la fila "NO debe decidir" de Pedido en la sección 6. Debería plantearse como "¿cómo construimos/evolucionamos un modelo Comercial real, conectado a Producción, y migramos Pedido para que dependa de **ese**?" — que es, leído con precisión, exactamente lo que `ADR §9` ya decía con "+ nuevo concepto comercial". No es una decisión nueva ni una contradicción del ADR — es una lectura más precisa del mismo ADR, motivada por la formalización de este documento.

Esto **no invalida** el hallazgo de código del roadmap (sigue siendo cierto y sigue siendo relevante) — invalida únicamente la forma binaria en que se había planteado la alternativa de solución.

---

## 16. Estado y evolución futura

Este documento queda en `DRAFT` — el modelo conceptual (secciones 4 a 9, 14) está confirmado por el usuario en esta sesión; su traducción a Requirements/Domain Specs/Use Cases/Contratos concretos es trabajo posterior, caso por caso, siguiendo el proceso ya establecido en `.claude/CLAUDE.md` sección 9 y `docs/SDD-DEVELOPMENT.md`.

Cuando una pieza de este modelo se implemente (por ejemplo, la API de Recetas del primer vertical slice, o un futuro modelo Comercial real), la especificación correspondiente debe crearse en su ubicación SDD normal (`01-requirements/`, `02-domain/`, `04-use-cases/`, `05-contracts/`) y enlazar hacia este documento como su marco de referencia — no duplicar acá el detalle de esas especificaciones futuras (regla de no duplicación, `docs/README.md` sección 11).

Si una implementación futura necesita romper alguno de los principios de la sección 14 (por ejemplo, si se decidiera que Pedido sí debe leer directamente de Producción por alguna razón no anticipada acá), esa ruptura debe documentarse explícitamente — actualizando este documento o registrando la excepción — **antes** de implementarse, no como una reconstrucción posterior.

---

## 17. Validación final

| Pregunta | Respuesta |
|---|---|
| ¿El documento contradice `PROJECT.md`? | No — lo complementa en una capa que `PROJECT.md` no cubre (sección 15) |
| ¿Contradice `ADR 0001`? | No — extiende con más detalle la mención de "nuevo concepto comercial" de `§9`, ya vigente |
| ¿Contradice decisiones SDD existentes (`GAP-PROD-002/003/004/005`)? | No — todas quedan registradas sin resolver (sección 13) |
| ¿Alguna conclusión de `SDD-PANEL-API-ROADMAP.md` queda obsoleta? | Ninguna queda obsoleta en sus hechos de código; una (sección 15.2/15.3) necesita reinterpretarse en su forma de presentar la alternativa de solución |
| ¿Se está confundiendo Producto con Producto Comercial? | No — diferenciados explícitamente en sección 4.1/4.3 |
| ¿Se está confundiendo Stock con Disponibilidad? | No — diferenciados explícitamente en sección 5, incluyendo dos sentidos distintos de "disponibilidad" |
| ¿Se está haciendo que Pedido dependa conceptualmente de Web? | No — sección 8, Principio 5 |
| ¿Se está convirtiendo Panel en un módulo de dominio? | No — sección 9, explícito |
| ¿Se está asumiendo que Catalogo debe desaparecer? | No — sección 4.3, explícitamente no asumido |
| ¿Se está asumiendo que Pedido debe migrar a Producción? | No — corregido explícitamente en sección 15.3: el objetivo es Pedido → Comercial, no Pedido → Producción |
| ¿Se están introduciendo decisiones que todavía no fueron tomadas? | Las de forma conceptual (4 modelos, principios, fronteras) están `CONFIRMED` por el usuario en esta sesión — es el propósito explícito de esta tarea. Las de implementación concreta (qué entidades, qué módulo de código, mecanismo técnico de las relaciones) quedan explícitamente sin decidir en todo el documento |

### 17.1 Contradicciones o decisiones pendientes

No se encontró ninguna contradicción que amerite un ADR nuevo (la instrucción de esta tarea reserva eso para contradicciones importantes; lo encontrado en sección 15.3 es una imprecisión de framing en un documento de análisis previo, no una decisión arquitectónica en conflicto). Quedan registradas, sin resolver, las siguientes decisiones pendientes — ninguna se cierra en este documento:

1. Forma concreta del modelo Comercial (¿evoluciona `Catalogo`? ¿es un módulo nuevo? ¿cómo referencia a `Producción`?).
2. Mecanismo técnico de la relación Comercial↔Producción (síncrono, proyección, FK — sección 5, "Tipos de relación").
3. Reglas concretas de disponibilidad comercial (más allá de "depende de Catálogo + Producción/Stock").
4. Momento y forma de migrar `Pedido` para depender del futuro modelo Comercial en vez de `Catalogo`.
5. Si/cuándo conectar `CalculadorConsumoIngredientes` (o su equivalente futuro) a un modelo real de stock.

---

## Confirmación

No se modificó código ni documentación existente. La única modificación realizada fue la creación de `docs/V1-DOMAIN-MODEL.md`.
