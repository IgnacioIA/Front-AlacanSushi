# Engineering Decisions

## Objetivo

Registrar las decisiones técnicas y arquitectónicas que puedan afectar la evolución del proyecto.

Este archivo no busca documentar todos los cambios realizados, sino únicamente aquellas decisiones cuyo contexto podría olvidarse con el tiempo.

Debe responder preguntas como:

- ¿Por qué elegimos esta arquitectura?
- ¿Por qué descartamos otra alternativa?
- ¿Qué consecuencias tiene esta decisión?

---

# ¿Cuándo registrar una decisión?

Registrar únicamente cuando exista una decisión relevante, por ejemplo:

- Arquitectura.
- Organización del dominio.
- Patrones de diseño.
- Integraciones importantes.
- Tecnologías adoptadas.
- Cambios importantes en la estructura del proyecto.
- Contratos relevantes.

No registrar:

- Refactors menores.
- Corrección de bugs.
- Renombrado de clases.
- Cambios de formato.
- Pequeñas mejoras de implementación.

---

# Plantilla

---

## Fecha

AAAA-MM-DD

---

## Decisión

Describir la decisión.

---

## Contexto

¿Qué problema existía?

---

## Alternativas consideradas

-

-

-

---

## Decisión tomada

¿Qué se eligió?

---

## Justificación

¿Por qué se eligió?

---

## Consecuencias

¿Qué beneficios y compromisos implica esta decisión?

---

# Historial

Agregar nuevas decisiones respetando el orden cronológico.

---

## Fecha

2026-07-04

---

## Decisión

Extraer un conjunto de componentes visuales compartidos a `src/components/` (Card, Modal, ConfirmDialog, StockIndicator, SearchBar, Toolbar, EmptyStateCard, DropdownMenu) en lugar de construirlos únicamente dentro del módulo Ingredientes.

---

## Contexto

Ingredientes fue el primer módulo con tarjetas, modal, confirmación y menú contextual construido de forma desacoplada; OrderPanel/OrderCard ya tenían piezas equivalentes (`OrderFormModal`, `ActionButton`) pero acopladas a ese dominio y no reutilizables por otros módulos sin importar cruzado entre carpetas de features.

---

## Alternativas consideradas

- Construir los componentes de Ingredientes como parte del propio módulo, sin extraerlos.
- Reutilizar directamente `OrderFormModal`/`ActionButton` desde `Ingredients`, importando entre carpetas de módulos.
- Extraer piezas compartidas a `src/components/` y componerlas por responsabilidad (elegida).

---

## Decisión tomada

Se creó cada componente compartido en su propia carpeta bajo `src/components/`, con nombres que describen comportamiento visual (no el dominio). `Ingredients/components/*` los componen internamente (ej. `IngredientCard` usa `Card` + `StockIndicator` + `DropdownMenu`); no se tocó `OrderPanel`/`OrderCard`.

---

## Justificación

Regla de reutilización por responsabilidad, no por nombre: un futuro `ProductCard` debe poder componer los mismos compartidos que usa `IngredientCard`, sin depender de `Ingredients` ni de `OrderPanel`. Mantiene los módulos de dominio desacoplados entre sí.

---

## Consecuencias

Cualquier ajuste visual a Card/Modal/ConfirmDialog/etc. afecta a todos los módulos que los usen — deben tratarse como una superficie estable. `OrderFormModal` y `ActionButton` quedan como implementaciones previas no migradas a los compartidos; migrarlas es una tarea aparte, no incluida en este cambio.

---

## Fecha

2026-07-04

---

## Decisión

El nivel de stock (`stockLevel: HIGH/MEDIUM/LOW`) de un ingrediente nunca se calcula en el frontend: viaja ya resuelto en los datos (mock hoy, API después).

---

## Contexto

El objetivo del módulo explícitamente prohíbe calcular estados de stock en el frontend, pero el mock necesita algún valor para ingredientes creados manualmente antes de que exista el endpoint real.

---

## Alternativas consideradas

- Calcular `stockLevel` en el frontend comparando `quantity` contra `minStock`.
- Asignar un valor placeholder fijo al crear un ingrediente en el mock, documentado como temporal.
- Dejar `stockLevel` sin definir hasta tener la API.

---

## Decisión tomada

`ingredientService.createIngredient` asigna `stockLevel: "MEDIUM"` como placeholder al crear, con comentario explícito de que es un comportamiento de mock, no una regla de negocio del frontend.

---

## Justificación

Evita introducir una fórmula de negocio en la UI (violaría el principio central del módulo) mientras conserva una UI funcional de punta a punta con datos mock.

---

## Consecuencias

Cuando exista `POST /ingredients`, la API devolverá el `stockLevel` real y este placeholder deja de usarse; no requiere cambios en los componentes de presentación, sólo en `ingredientService.js`.