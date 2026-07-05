# Integration Contract

Documento oficial del contrato de integración entre el Frontend y la API.

Su objetivo es definir las reglas generales de comunicación entre ambos sistemas, estableciendo las responsabilidades de cada uno y las convenciones que deben respetarse durante toda la vida del proyecto.

Este documento describe únicamente las reglas de integración. La definición de endpoints, DTOs, errores y versionado se documenta en los archivos específicos de esta carpeta.

---

# Objetivo

El Frontend y la API son proyectos independientes que evolucionan por separado.

La integración entre ambos debe realizarse mediante contratos explícitos, evitando dependencias implícitas sobre implementaciones internas.

Cada cambio que afecte la comunicación entre ambos sistemas debe reflejarse primero en esta documentación y luego en el código.

---

# Alcance

Este documento define:

* Responsabilidades del Frontend.
* Responsabilidades de la API.
* Convenciones generales de comunicación.
* Reglas para la evolución del contrato.

No define:

* Endpoints específicos.
* Request/Response DTO.
* Códigos de error.
* Estrategias de versionado.

Estos temas poseen documentos propios.

---

# Documentación relacionada

| Documento      | Responsabilidad                                  |
| -------------- | ------------------------------------------------ |
| endpoints.md   | Endpoints disponibles y comportamiento esperado. |
| dto-catalog.md | Modelos compartidos entre Frontend y API.        |
| error-codes.md | Contrato de errores y respuestas excepcionales.  |
| versioning.md  | Evolución y compatibilidad del contrato.         |

---

# Responsabilidades

## Responsabilidad del Frontend

El Frontend es responsable de:

* Consumir únicamente contratos públicos de la API.
* No asumir detalles internos de implementación.
* Validar únicamente reglas necesarias para mejorar la experiencia del usuario.
* Considerar que toda validación de negocio pertenece a la API.
* Mantener sincronizada esta documentación cuando cambie el consumo de la API.

---

## Responsabilidad de la API

La API es responsable de:

* Validar todas las reglas de negocio.
* Mantener la consistencia de los datos.
* Garantizar el cumplimiento de los contratos publicados.
* Comunicar cambios mediante la actualización de la documentación correspondiente.
* No depender de comportamientos internos del Frontend.

---

# Principios de integración

## Separación de responsabilidades

El Frontend administra la experiencia de usuario.

La API administra las reglas de negocio.

Ninguno debe duplicar responsabilidades del otro.

---

## Contrato explícito

Toda comunicación entre ambos sistemas debe estar documentada.

No deben existir campos, endpoints o comportamientos "implícitos" conocidos únicamente por el código.

---

## Fuente única de verdad

La documentación representa el contrato oficial entre ambos sistemas.

Cuando exista una diferencia entre implementación y documentación, debe corregirse antes de considerar terminada la funcionalidad.

---

## Evolución controlada

Los cambios de contrato deben realizarse de manera compatible siempre que sea posible.

Cuando un cambio rompa compatibilidad deberá documentarse siguiendo las reglas definidas en `versioning.md`.

---

# Convenciones generales

## Formato de intercambio

* JSON UTF-8.
* Propiedades en camelCase.
* Objetos con estructura consistente.
* Campos opcionales claramente identificados en los DTO.

---

## Fechas y horas

Las fechas deberán utilizar un formato único definido por la API y documentado en los DTO correspondientes.

---

## Identificadores

Cada recurso deberá poseer un identificador único e inmutable.

El Frontend nunca deberá generar identificadores permanentes para entidades persistentes.

---

## Estados del dominio

Los estados oficiales del dominio pertenecen a la API.

El Frontend puede utilizarlos para construir la interfaz, pero no debe inventar nuevos estados ni modificar su significado.

La nomenclatura oficial de estados y acciones se documenta junto al dominio correspondiente en `dto-catalog.md`.

---

## Validaciones

El Frontend puede realizar validaciones para mejorar la experiencia del usuario.

La API debe volver a validar absolutamente toda la información recibida.

Ninguna validación realizada por el Frontend reemplaza una validación del servidor.

---

## Comunicación de errores

Toda respuesta de error debe seguir el contrato definido en `error-codes.md`.

El Frontend no debe depender de mensajes de texto para determinar comportamientos.

Las decisiones funcionales deberán basarse en códigos de error documentados.

---

## Tiempo real

Cuando exista sincronización en tiempo real (WebSocket, SSE u otra tecnología), deberá respetar exactamente los mismos contratos definidos para la comunicación HTTP.

La tecnología utilizada para transportar la información no modifica el contrato funcional entre ambos sistemas.

---

# Mantenimiento del contrato

Este documento debe actualizarse cuando cambien las reglas generales de comunicación entre Frontend y API.

Los cambios específicos de endpoints, DTOs, errores o versionado deberán realizarse únicamente en sus respectivos documentos para evitar duplicación de información.

El contrato debe evolucionar junto con ambos proyectos y representar siempre el estado real de la integración.
