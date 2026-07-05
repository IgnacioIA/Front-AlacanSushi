# Versioning

Este documento define las reglas para evolucionar el contrato de integración entre el Frontend y la API.

Su objetivo es minimizar cambios incompatibles y establecer un proceso claro para introducir modificaciones en los contratos compartidos.

---

# Principios

## Compatibilidad hacia atrás

Siempre que sea posible, los cambios deben mantener compatibilidad con versiones anteriores.

Los consumidores existentes no deberían dejar de funcionar debido a una modificación menor del contrato.

---

## Fuente única de verdad

Todo cambio que afecte la comunicación entre Frontend y API debe actualizar previamente la documentación de esta carpeta.

La documentación representa el contrato oficial entre ambos sistemas.

---

## Evolución controlada

Antes de modificar un endpoint, un DTO o una regla compartida, debe evaluarse el impacto sobre el otro sistema.

Si el cambio rompe compatibilidad, deberá planificarse como un cambio mayor.

---

# Cambios compatibles

Los siguientes cambios pueden realizarse sin romper el contrato existente.

## DTOs

* Agregar nuevos campos opcionales.
* Agregar nuevos valores a un catálogo cuando el Frontend pueda ignorarlos.
* Incorporar nuevos DTO utilizados por nuevos endpoints.

---

## Endpoints

* Agregar nuevos endpoints.
* Agregar nuevos parámetros opcionales.
* Incorporar nuevos filtros opcionales.

---

## Errores

* Agregar nuevos códigos de error funcionales.
* Incorporar nuevos códigos HTTP cuando no modifiquen el comportamiento existente.

---

# Cambios incompatibles

Los siguientes cambios rompen el contrato y requieren coordinación entre Frontend y API.

## DTOs

* Eliminar un campo existente.
* Cambiar el nombre de un campo.
* Modificar el tipo de un campo.
* Convertir un campo opcional en obligatorio.
* Cambiar el significado de un campo existente.

---

## Endpoints

* Cambiar la URL de un endpoint.
* Cambiar el método HTTP.
* Eliminar un endpoint utilizado por el Frontend.
* Modificar el comportamiento esperado de una operación.

---

## Dominio

* Cambiar el significado de un estado.
* Eliminar estados existentes.
* Eliminar acciones del workflow.
* Modificar reglas funcionales ya documentadas.

---

# Procedimiento para cambios

Ante cualquier modificación del contrato se recomienda seguir el siguiente proceso:

1. Actualizar la documentación correspondiente.
2. Revisar el impacto sobre el otro sistema.
3. Implementar los cambios necesarios.
4. Validar la integración entre Frontend y API.
5. Publicar la nueva versión del contrato.

---

# Incorporación de nuevos endpoints

Todo nuevo endpoint deberá quedar documentado en:

* `endpoints.md`
* `dto-catalog.md` (si introduce nuevos DTO)
* `error-codes.md` (si incorpora nuevos errores)

---

# Incorporación de nuevos DTO

Todo nuevo DTO deberá:

* Tener un nombre descriptivo.
* Documentar claramente sus campos obligatorios y opcionales.
* Evitar reutilizar nombres con significados diferentes.
* Mantener consistencia con las convenciones definidas en `integration-contract.md`.

---

# Deprecación

Cuando un endpoint o DTO deje de utilizarse, deberá marcarse como **Deprecated** antes de ser eliminado.

La documentación deberá indicar:

* Elemento afectado.
* Motivo de la deprecación.
* Alternativa recomendada.
* Fecha estimada de eliminación.

Siempre que sea posible, un elemento deprecado deberá mantenerse disponible durante un período suficiente para permitir la migración del otro sistema.

---

# Historial de cambios

Se recomienda mantener un registro de las modificaciones relevantes del contrato.

| Versión | Fecha      | Descripción                   |
| ------- | ---------- | ----------------------------- |
| 1.0.0   | YYYY-MM-DD | Primera versión del contrato. |

El historial debe reflejar únicamente cambios que afecten la integración entre Frontend y API.
