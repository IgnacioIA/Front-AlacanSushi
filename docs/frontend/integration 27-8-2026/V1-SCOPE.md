# Alcance V1

## Metadata

Versión: 1.0
Estado: `DRAFT` — alcance y priorización confirmados por el usuario en esta sesión (2026-08-26); su traducción a Requirements/Use Cases/Contratos concretos de Etapa 1 es trabajo posterior.
Tipo: documento de alcance/priorización cross-módulo. No es una Domain Spec, no es un ADR, no reemplaza a `PROJECT.md` ni a `V1-DOMAIN-MODEL.md`.
Fuente: decisión explícita del usuario en esta sesión de dividir la V1 en Etapa 1 (MVP Comercial + Pedidos) y Etapa 2 (Producción + Stock + Disponibilidad). No reconstruye esta división desde código o documentación previa — la reconstrucción se usa para verificar consistencia, no como origen de la decisión.

Uso de clasificación (obligatorio en todo el documento, sección 23 de la consigna):

- **DECIDIDO** — confirmado explícitamente por el usuario (en esta sesión o en `ADR 0001`).
- **EXISTENTE** — hay código que lo implementa hoy (se indica si tiene tests/API/SDD o no).
- **ESPECIFICADO** — documentado (SDD o conceptual) pero sin evidencia de implementación.
- **PENDIENTE** — decisión o especificación todavía no tomada.
- **FUERA DE ALCANCE** — explícitamente excluido de la V1 completa (no solo de Etapa 1).
- **ETAPA 2** — dentro de la V1, pero pospuesto, no bloqueante de Etapa 1.
- **DEUDA TÉCNICA** — problema conocido, no resuelto acá.

---

## 1. Objetivo

Formalizar el alcance de la V1 y su división en dos etapas — **Etapa 1: MVP Comercial + Pedidos** y **Etapa 2: Producción + Stock + Disponibilidad** — como referencia estable para evitar redebatir esta priorización en cada sesión futura. `DECIDIDO`.

El objetivo de negocio de la V1 completa (ambas etapas, aunque Etapa 1 es la prioridad inmediata): que un administrador configure la oferta comercial; que un cliente la consulte, arme un carrito, complete sus datos y confirme un pedido; que la API lo persista; que el frontend genere un mensaje de WhatsApp prearmado; que el pedido llegue al Panel; y que recepción pueda visualizarlo, editarlo, confirmarlo o rechazarlo. `DECIDIDO`.

---

## 2. Criterio de éxito de V1

El criterio principal es que el circuito de la sección 1 pueda completarse de punta a punta. La sección 15 de este documento formaliza el criterio de finalización específico de **Etapa 1** (no de la V1 completa) — es el que aplica primero.

---

## 3. División de V1 en etapas

### 3.1 Etapa 1 — MVP Comercial + Pedidos

`DECIDIDO`, prioridad inmediata. Incluye: Modelo Comercial, Catálogo (público), administración del catálogo, Pedidos, Panel administrativo, Frontend público, carrito, checkout, comunicación iniciada vía WhatsApp con mensaje prearmado.

### 3.2 Etapa 2 — Producción + Stock

`DECIDIDO`, posterior. Incluye: Producción, Recetas, Ingredientes, Stock, Disponibilidad, cálculo de faltantes, evaluación de capacidad de producción, integración entre Pedido/Disponibilidad/Producción/Stock. **No bloquea ni forma parte del camino crítico de Etapa 1** — `DECIDIDO` explícitamente.

---

## 4. Alcance de Etapa 1

### 4.1 Modelo Comercial

**Pregunta:** qué vende el restaurante y cómo se presenta al público. Conceptualmente independiente del Modelo de Producción — ya `DECIDIDO` en `V1-DOMAIN-MODEL.md` sección 4.3, reafirmado acá.

**Estado real (`EXISTENTE`, parcial, con matices):**

| Concepto pedido en esta tarea | Estado |
|---|---|
| Productos comerciales (nombre, precio, descripción) | `EXISTENTE`, parcial — `Catalogo.Producto` tiene `nombreProducto`, `precioVenta`, `descripcionAlPublico`, `activo`. Sin API, sin tests, sin SDD, deprecado (`PROJECT.md` §4) |
| Combos | `EXISTENTE`, parcial — `Catalogo.Combo`/`OpcionCombo` (nombre, precio, opciones con reemplazos). Mismas carencias que arriba |
| Ofertas/promociones | **No existe** ningún concepto de oferta/promoción en ningún módulo revisado (`Produccion`, `Catalogo`, `Pedido`) — `PENDIENTE` de especificar por completo |
| Imágenes | **No existe** ningún atributo de imagen en ninguna entidad revisada — `PENDIENTE` |
| Activación/desactivación | `EXISTENTE` como booleano `activo` en `Catalogo.Producto`/implícito en combos (sin campo propio en `Combo`, a confirmar) |
| Publicación | No hay un concepto distinto de "publicado" separado de "activo" en el código actual — `PENDIENTE` si negocio los necesita como conceptos separados (ej. "activo pero no publicado todavía") |

**Importante, per instrucción explícita de esta tarea:** no se asume que las entidades comerciales de Etapa 1 deban ser las mismas de `Producción`, y no se fuerza la relación Comercial→Producción en esta etapa salvo que ya esté explícita y sea necesaria. Verificado: hoy esa relación **no existe** en ningún lado del código (`Catalogo` no referencia `Produccion`, confirmado en auditorías previas) — por lo tanto no hay nada que romper al mantenerlas separadas en Etapa 1. `DECIDIDO` (esta sesión) + `RECONSTRUCTED` (verificación de código).

**Pendiente, no resuelto acá:** si el Modelo Comercial de Etapa 1 se construye evolucionando el `Catalogo` existente (deprecado) o como módulo nuevo. `V1-DOMAIN-MODEL.md` ya registraba esta misma pregunta como decisión pendiente (sección 17.1, punto 1) — este documento no la cierra, la hereda. `PENDIENTE`.

### 4.2 Catálogo (público)

**Conceptual (`ESPECIFICADO` en esta tarea, no implementado):**

```text
Frontend público → API → Modelo Comercial → catálogo publicado
```

Debe presentar solo lo que el restaurante decidió publicar. **Explícitamente sin** disponibilidad basada en Stock/Producción, sin cálculo de faltantes, sin capacidad productiva — en Etapa 1, publicación comercial y disponibilidad operativa son conceptos separados. `DECIDIDO`.

**Estado real:** `PENDIENTE` de implementación completa — hoy no existe ningún endpoint de consulta pública de catálogo (el único `GET /products` existente es administrativo, sobre `Produccion.Articulo`, no sobre un catálogo comercial publicado — ya señalado en `SDD-PANEL-API-ROADMAP.md` sección 5).

### 4.3 Pedido

**Estado real (`EXISTENTE`, con matices importantes) — ya documentado en detalle en `V1-DOMAIN-MODEL.md` sección 4.4, verificado de nuevo acá:**

- Agregado `Pedido` con máquina de estados: `NUEVO → CONFIRMADO → EN_PREPARACION → LISTO → (ENVIADO) → ENTREGADO`, rama `CANCELADO`. `EXISTENTE`, `IMPLEMENTED`.
- `CanalPedido` (`TOTEM`, `APP_MOVIL`, `WEB`, `MOZO`) como atributo del pedido, no como jerarquía — ya alineado con el principio de independencia de canal. `EXISTENTE`.
- Ítems (`ItemProducto`/`ItemCombo`) ya capturan una fotografía de nombre/precio al momento de agregarse (no referencian el catálogo en vivo) — ya alineado con "registrar precios/datos del ítem al momento de la compra" (sección 7 de esta tarea). `EXISTENTE`.
- Endpoints ya implementados en `PedidoController`: crear, listar, obtener por id, agregar producto/combo, eliminar ítem, modificar cantidad, confirmar, cancelar, pasar a preparación, marcar listo, marcar entregado. `EXISTENTE`, `IMPLEMENTED (api)`, **sin tests, sin SDD, sin manejo RFC 7807** (`DEUDA TÉCNICA`, ya registrada en `SDD-PANEL-API-ROADMAP.md` sección 7).
- Fuente de datos de los ítems: `Catalogo.Producto`/`Catalogo.Combo` (deprecado, sin conexión a `Producción`) — sin cambios respecto de lo ya documentado en `V1-DOMAIN-MODEL.md`.

**No rediseñar estas invariantes** — instrucción explícita de esta tarea, respetada: este documento no propone ningún cambio a `EstadoPedido` ni a las transiciones existentes.

**Gaps encontrados en esta auditoría, relevantes para el flujo pedido en la sección 2 (nuevos, no registrados en documentos previos):**

1. **No existe ningún concepto de `Cliente`** en el código (`grep` sin resultados para una entidad `Cliente` en ningún módulo). `Pedido.clienteId` es un `Long` suelto, sin `@ManyToOne`/FK, sin validación contra ningún repositorio. El flujo pedido por esta tarea ("el cliente completa sus datos") no tiene hoy un lugar claro donde esos datos (nombre, teléfono, al menos) se capturen o persistan — `direccion` existe como campo propio de `Pedido` (obligatorio solo si `TipoPedido.DELIVERY`), pero nombre/teléfono del cliente no tienen ningún campo. `PENDIENTE` — no se asume una solución (¿nuevo `Cliente` como entidad? ¿datos inline en `Pedido`? ¿ninguno de los dos, si el flujo es anónimo salvo dirección?).
2. **No existe un estado ni una operación distinguible de "rechazar"** — `EstadoPedido` no tiene valor `RECHAZADO`; la única transición de salida negativa es `cancelar()` → `CANCELADO`, invocable desde cualquier estado salvo `ENTREGADO`. El flujo de esta tarea pide explícitamente que "recepción pueda rechazarlo" como acción propia. `PENDIENTE` si "rechazar" debe mapearse al `cancelar()` existente (sin rediseñar nada) o si es conceptualmente distinto y requiere una decisión de dominio antes de implementarse — no se decide acá, consistente con "no rediseñar las invariantes actuales".

### 4.4 Panel

`ESPECIFICADO` en esta tarea (conceptual, sin contratos concretos todavía — instrucción explícita, sección 5 de la consigna). Cubre Administración Comercial (productos, combos, ofertas, publicación) y Administración de Pedidos (listado, detalle, cliente, ítems, total, canal, edición, confirmación, rechazo, estado). No incorpora Producción/Recetas/Ingredientes/Stock/Disponibilidad en Etapa 1 — `DECIDIDO`.

Confirmado, consistente con `V1-DOMAIN-MODEL.md` sección 9: el Panel no es un modelo de dominio, es un consumidor administrativo de la API — sin cambios respecto de lo ya establecido.

### 4.5 Frontend público

`ESPECIFICADO`, sin contratos concretos. Cubre: consulta de catálogo, visualización de productos/combos/ofertas, carrito (agregar/modificar/eliminar/total), datos del cliente, confirmación del pedido, recepción de la respuesta de creación, generación/inicio del mensaje de WhatsApp. Sin reglas de negocio propias — `DECIDIDO`.

### 4.6 WhatsApp

`DECIDIDO`, con el mayor nivel de detalle de todo este documento (secciones 10-12 de la consigna, preservadas acá sin reinterpretación porque no hay evidencia de código que las contradiga — no existe ninguna integración de WhatsApp en el repositorio, `EXISTENTE: no`):

- WhatsApp **no** es una integración backend en Etapa 1. La API no envía el mensaje.
- Flujo: Frontend crea el pedido vía API → recibe confirmación y datos → construye el mensaje → abre/inicia WhatsApp → el usuario lo envía.
- La API es responsable de recibir, validar, persistir y devolver el pedido — nada más respecto de WhatsApp.
- El frontend es responsable de la experiencia, el carrito, el envío a la API, la construcción del mensaje y el inicio de WhatsApp.
- WhatsApp es únicamente canal de comunicación — **no es fuente de verdad del pedido**. La persistencia en la API/DB es la fuente de verdad, independiente de si el usuario efectivamente envía el mensaje.
- Explícitamente `FUERA DE ALCANCE` (de la V1 completa, no solo de Etapa 1, salvo reevaluación futura): WhatsApp Business API, webhooks, integración server-side, recepción automática de mensajes, sincronización de conversaciones, bots, automatización de respuestas, proveedores externos de mensajería.

---

## 5. Flujo principal de Etapa 1

```text
Cliente
  → consulta catálogo
  → arma carrito
  → completa sus datos
  → confirma pedido
  → frontend envía pedido a la API
  → API valida según las reglas correspondientes
  → API registra y persiste el pedido
  → API devuelve la respuesta correspondiente
  → frontend utiliza los datos del pedido creado
  → frontend genera un mensaje de WhatsApp prearmado
  → frontend abre WhatsApp para que el usuario lo envíe al restaurante
  → pedido queda disponible para recepción
  → recepción lo visualiza desde el Panel
  → recepción puede editarlo
  → recepción puede confirmarlo
  → recepción puede rechazarlo
```

`ESPECIFICADO` como objetivo; estado real tramo por tramo:

| Tramo | Estado |
|---|---|
| Consulta catálogo | `PENDIENTE` — no existe endpoint público de catálogo comercial (4.2) |
| Carrito / completar datos | `PENDIENTE` en backend — no hay modelo de `Cliente` (4.3, gap 1); el carrito es responsabilidad de frontend, no de la API |
| Confirma pedido → API valida/persiste/responde | `EXISTENTE` (`PedidoController`, `CrearPedidoService` + agregar ítems), sin tests/SDD |
| Frontend genera mensaje WhatsApp | `FUERA DE ALCANCE de la API` por diseño (4.6) — responsabilidad 100% frontend |
| Pedido visible en Panel | `PENDIENTE` — no hay Panel implementado en este repositorio (es un frontend externo, `UNKNOWN` su estado real, `.claude/CLAUDE.md` sección 14) |
| Recepción edita/confirma/rechaza | Editar y confirmar: `EXISTENTE` en la API (`agregarProducto`, `modificarCantidad`, `eliminarItem`, `confirmar`). Rechazar: `PENDIENTE` (gap 2 de 4.3) |

---

## 6. Responsabilidades de cada modelo

| Modelo | Define | Estado documental |
|---|---|---|
| **Comercial** | Qué vende el restaurante y cómo lo presenta | `ESPECIFICADO` (este documento + `V1-DOMAIN-MODEL.md` §4.3), `PENDIENTE` de implementar |
| **Pedido** | Qué pidió el cliente y el estado de ese pedido | `EXISTENTE`, parcial (4.3) |
| **Producción** | Cómo se producen los productos | `EXISTENTE`, `VERIFIED` en su mayoría — `ETAPA 2` para esta priorización |
| **Stock** | Qué existencias tiene el restaurante | `EXISTENTE` (dentro de Producción) — `ETAPA 2` |
| **Panel** | Interfaz administrativa que consume la API | No es dominio (`V1-DOMAIN-MODEL.md` §9), `UNKNOWN` su implementación real (frontend externo) |
| **Front público** | Interfaz pública que consume la API | No es dominio, `UNKNOWN` su implementación real (frontend externo) |
| **WhatsApp** | Canal de comunicación iniciado desde el frontend | No es dominio ni integración backend en Etapa 1 (4.6) |

Sin cambios respecto de las fronteras ya fijadas en `V1-DOMAIN-MODEL.md` sección 6 — este documento no redefine responsabilidades, solo prioriza en qué orden se construyen.

---

## 7. Dependencias entre modelos

`DECIDIDO` explícitamente en esta tarea:

```text
Frontend público → API → Comercial / Pedido
Panel            → API → Comercial / Pedido
```

**No** se crea como requisito de Etapa 1:

```text
Pedido → Producción   (no obligatoria para que el MVP funcione)
Pedido → Stock         (no obligatoria para que el MVP funcione)
```

La futura capacidad de disponibilidad (Etapa 2) coordinará `Pedido → Comercial → Producción → Stock` — pertenece a Etapa 2, no se construye ahora.

**Consistencia verificada contra código:** hoy `Pedido` no depende de `Producción` ni de `Stock` (confirmado en auditorías previas, `boundaries.md`) — mantener esa ausencia de dependencia en Etapa 1 no requiere ningún cambio de código, es simplemente no agregar la dependencia que hoy no existe. `RECONSTRUCTED`.

---

## 8. Fuera de alcance

`FUERA DE ALCANCE` de la V1 completa (no solo de Etapa 1), salvo reevaluación futura explícita:

- WhatsApp Business API, webhooks, integración server-side, bots, automatización de respuestas (sección 4.6).
- Optimizaciones de performance (heredado de `V1-DOMAIN-MODEL.md` §12).

`FUERA DE ALCANCE de Etapa 1` pero **dentro de la V1** (= `ETAPA 2`, ver sección 9) — no confundir ambas categorías:

- Disponibilidad basada en Stock/Producción, cálculo automático de faltantes, capacidad productiva (secciones 6, 17).
- Producción, Recetas, Ingredientes, Stock (sección 9).

---

## 9. Etapa 2

`DECIDIDO` — incluye Producción, Recetas, Ingredientes, Stock, Disponibilidad, cálculo de faltantes, evaluación de capacidad productiva, integración Pedido↔Disponibilidad↔Producción↔Stock.

**Estado real de lo que Etapa 2 retomará (ya auditado en `SDD-PANEL-API-ROADMAP.md`, sin cambios):** Producción (Ingrediente/Producto/Stock/Movimiento) `VERIFIED`; Receta/Disponibilidad/Ejecutar Producción `IMPLEMENTED` a nivel de dominio y aplicación, sin API (`SDD-PANEL-API-ROADMAP.md` secciones 1 y 3) — es decir, Etapa 2 no arranca de cero: el primer vertical slice que ese roadmap ya identificaba (exponer Receta + Disponibilidad de producción) sigue siendo el punto de partida correcto **cuando llegue el momento de Etapa 2** (ver sección 14).

Artículo, Ingrediente, Producto de Producción, Receta y los servicios de Producción **no se eliminan ni se tocan** — quedan como trabajo existente, sin bloquear ni introducir dependencias sobre Etapa 1. `DECIDIDO`.

---

## 10. Decisiones ya establecidas

- Separación de V1 en Etapa 1 (Comercial + Pedidos) y Etapa 2 (Producción + Stock), Etapa 2 no bloqueante — `DECIDIDO`, esta sesión.
- Confirmación en Etapa 1 = "recepción acepta el pedido", sin verificación automática de stock/disponibilidad/producción — `DECIDIDO`.
- WhatsApp como mensaje prearmado iniciado por el frontend, no integración backend; el pedido persiste independientemente de si el mensaje se envía — `DECIDIDO`.
- No forzar relación Comercial→Producción en Etapa 1 — `DECIDIDO`.
- No rediseñar estados/invariantes existentes de `Pedido` — `DECIDIDO`, respetado en este documento.
- Panel y Front público no son modelos de dominio — ya `DECIDIDO` en `V1-DOMAIN-MODEL.md` §9, reafirmado.
- ADR 0001 §9 (Catalogo deprecado-pero-funcional, Producción aislado) — sigue vigente, no reabierto por este documento.

---

## 11. Decisiones pendientes

1. Si el Modelo Comercial de Etapa 1 se construye evolucionando `Catalogo` o como módulo nuevo (4.1; ya pendiente en `V1-DOMAIN-MODEL.md` §17.1.1).
2. Cómo se capturan/persisten los datos del cliente en el flujo público — no existe ningún concepto de `Cliente` hoy (4.3, gap 1, **hallazgo nuevo de esta auditoría**).
3. Si "rechazar un pedido" es una operación distinta de "cancelar" (que ya existe) o el mismo concepto con otro nombre (4.3, gap 2, **hallazgo nuevo**).
4. Si "publicado" es un concepto comercial distinto de "activo" (4.1).
5. Diseño concreto de "ofertas/promociones" e "imágenes" — hoy no existe ningún antecedente en código (4.1).
6. Mecanismo técnico y momento de la futura relación Comercial↔Producción — pertenece a Etapa 2, ya registrada como pendiente en `V1-DOMAIN-MODEL.md` §17.1.2.
7. Contratos concretos de API para Comercial/Panel/Catálogo público — explícitamente no diseñados en esta tarea (sección 5 de la consigna).

Ninguna se resuelve en este documento.

---

## 12. Deudas técnicas relevantes

Heredadas sin cambios de auditorías previas (`SDD-PANEL-API-ROADMAP.md` §7, `V1-DOMAIN-MODEL.md` §13):

- `Pedido`: sin tests, sin documentación SDD, sin manejo RFC 7807, CORS hardcodeado con origen propio.
- `Catalogo`: deprecado, sin tests, sin API, `Ingrediente` sin repositorio (inalcanzable).
- `CalculadorConsumoIngredientes` desconectado (no instanciado como bean, no invocado) — relevante recién en Etapa 2, no bloquea Etapa 1.
- `GAP-PROD-002/003/004/005` — vigentes, sin relación directa con Etapa 1.

Nuevas, encontradas en esta auditoría (sección 4.3):

- Ausencia total de un concepto `Cliente` en el dominio — `clienteId` es un `Long` sin validar, sin relación JPA.
- Ausencia de un estado/operación `RECHAZAR` distinguible de `CANCELAR` en `EstadoPedido`.

Ninguna de estas deudas es bloqueante per se para *comenzar* Etapa 1 — algunas (la de `Cliente` en particular) sí necesitan resolverse **durante** Etapa 1, porque el flujo de la sección 5 no puede completarse sin decidirlas. Se registran como decisiones pendientes (sección 11), no como bloqueo de arranque.

---

## 13. Relación con V1-DOMAIN-MODEL.md

No se modificó. Auditado en su totalidad para este documento. Sin contradicciones — la relación es de **secuenciación**, no de contenido:

- El modelo conceptual de 4 capas (Producción/Stock/Comercial/Pedido), sus fronteras (§6) y sus principios (§14) siguen vigentes tal cual, sin cambios.
- `V1-DOMAIN-MODEL.md` §11 ("Alcance de V1") clasificaba "exponer Receta vía API" como parte de lo "necesario para el primer flujo" — ese documento no distinguía todavía Etapa 1 de Etapa 2 porque esa división no existía cuando se escribió. Este documento **no lo contradice** — lo refina: dentro de la V1 completa esa capacidad sigue siendo necesaria (sección 9), pero no para el *primer* flujo operativo priorizado ahora (Comercial+Pedido). Es una re-secuenciación explícita, `DECIDIDO` en esta sesión, no un error del documento anterior.
- `V1-DOMAIN-MODEL.md` §15.3 (el matiz "Pedido consume Catálogo" ≠ "Pedido depende del mismo modelo interno que Producción") sigue aplicando sin cambios: este documento refuerza que en Etapa 1 esa relación Comercial→Producción explícitamente no se fuerza (sección 4.1), consistente con dejarla como decisión de Etapa 2.
- No se detectó ninguna afirmación de `V1-DOMAIN-MODEL.md` que quede invalidada por este documento.

---

## 14. Relación con SDD-PANEL-API-ROADMAP.md

No se modificó. Auditado en su totalidad.

**Sigue siendo válido, sin cambios:** todos los hallazgos de código (inventario de endpoints existentes, servicios sin API, dependencia real Pedido→Catalogo, deudas técnicas) — son hechos verificados, no una priorización, y no los toca la nueva división en etapas.

**Queda desplazado por la nueva priorización, explícitamente:** la sección de ese roadmap que proponía como **paso 1 inmediato** "exponer Recetas + Disponibilidad vía API sobre Producción" y como **paso 2** resolver la migración Pedido↔Catalogo. Bajo la priorización de este documento, ninguno de los dos es el siguiente paso — el siguiente paso es Etapa 1 (Comercial + Pedido), y ambos pasos del roadmap anterior pasan a formar parte de **Etapa 2** (sección 9), conservando su validez técnica para cuando esa etapa arranque.

**No cubierto por el roadmap anterior, y por lo tanto no hay nada que reinterpretar:** ese informe auditó específicamente la API de Producción para uso del Panel — no analizó Comercial, Catálogo público, ni el flujo de Pedido/WhatsApp, porque `V1-DOMAIN-MODEL.md` (que introdujo el modelo Comercial) todavía no existía cuando se escribió.

---

## 15. Criterio de finalización de Etapa 1

Etapa 1 se considera funcionalmente completa cuando:

1. Un administrador puede configurar la oferta comercial.
2. El frontend público puede consultar esa oferta.
3. Un cliente puede armar un carrito.
4. El cliente puede completar sus datos.
5. El cliente puede enviar el pedido.
6. La API persiste correctamente el pedido.
7. El frontend recibe la confirmación de creación.
8. El frontend puede generar/iniciar un mensaje de WhatsApp con los datos del pedido.
9. El pedido aparece en el Panel.
10. Recepción puede consultar el pedido.
11. Recepción puede editarlo.
12. Recepción puede confirmarlo.
13. Recepción puede rechazarlo.
14. Los estados e invariantes existentes de `Pedido` se respetan.

`DECIDIDO`: no se exige Stock, Producción, Recetas ni Disponibilidad para dar por terminada esta etapa. Los ítems 4, 11 y 13 dependen de las decisiones pendientes 2 y 3 (sección 11) — no pueden darse por completos sin resolverlas primero.

---

## Confirmación

No se modificó código ni documentación existente (`V1-DOMAIN-MODEL.md`, `PROJECT.md`, `ADR 0001`, `SDD-PANEL-API-ROADMAP.md` ni ningún otro documento). La única modificación realizada fue la creación de `docs/V1-SCOPE.md`.
