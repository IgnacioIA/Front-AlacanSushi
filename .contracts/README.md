# Contracts

Esta carpeta contiene el contrato de integración entre el Frontend y la API.

Su objetivo es mantener una comunicación clara, consistente y documentada entre ambos proyectos, permitiendo que evolucionen de forma independiente sin generar dependencias implícitas.

Cada modificación que afecte la comunicación entre ambos sistemas debe reflejarse primero en esta documentación y luego en la implementación.

---

# Estructura

| Archivo                   | Descripción                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `integration-contract.md` | Define las reglas generales de comunicación, responsabilidades y principios de integración entre el Frontend y la API. |
| `endpoints.md`            | Documenta los endpoints disponibles, su propósito y comportamiento esperado.                                           |
| `dto-catalog.md`          | Define los DTO compartidos entre ambos sistemas y las estructuras de datos intercambiadas.                             |
| `error-codes.md`          | Describe los códigos de error que puede devolver la API y el comportamiento esperado del Frontend frente a cada uno.   |
| `versioning.md`           | Establece las reglas para evolucionar el contrato sin romper la compatibilidad entre los sistemas.                     |

---

# Principios

La documentación de esta carpeta se basa en los siguientes principios:

* Un único lugar para definir el contrato entre Frontend y API.
* Separación clara de responsabilidades entre ambos sistemas.
* Evolución controlada del contrato.
* Documentación sincronizada con la implementación.
* Evitar conocimiento implícito entre proyectos.

---

# Flujo de actualización

Siempre que una funcionalidad modifique la integración entre el Frontend y la API, se recomienda seguir el siguiente flujo:

1. Actualizar la documentación correspondiente.
2. Revisar el impacto sobre el otro sistema.
3. Implementar los cambios necesarios.
4. Validar la integración.
5. Considerar la tarea finalizada únicamente cuando documentación e implementación estén sincronizadas.

---

# Alcance

Esta carpeta documenta exclusivamente el contrato de integración entre sistemas.

No reemplaza la documentación de arquitectura, reglas de negocio, decisiones técnicas o guías de desarrollo del proyecto.
