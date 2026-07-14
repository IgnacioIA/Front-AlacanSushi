# Convenciones de Integración Frontend ↔ API

Reglas generales, válidas para todos los módulos. Los flujos puntuales de cada módulo se documentan aparte (ej. `docs/frontend/integration/ingredients.md`).

Contraparte de este documento del lado del backend: `frontend/.claude/INTEGRATION_GUIDE.md`.

---

## Infraestructura HTTP

- Cliente único: `src/services/httpClient.js`. Toda llamada HTTP del proyecto pasa por esta instancia de Axios — nunca `fetch`, nunca una instancia de Axios creada ad-hoc en otro archivo.
- `baseURL` sale de una variable de entorno (`VITE_API_BASE_URL`), nunca hardcodeada en el cliente ni en ningún service.
- Cualquier necesidad futura (headers comunes, interceptor de autenticación, retry) se agrega en `httpClient.js`, en un único lugar para todo el proyecto.

## Manejo de errores

- El backend responde errores en formato RFC 7807 (`ProblemDetail`) con una propiedad adicional `code` — ver `INTEGRATION_GUIDE.md`.
- `src/services/apiError.js` normaliza cualquier error de Axios (de red o de respuesta) a una forma consistente: `{ status, code, title, detail }`.
- Esta normalización ocurre en un interceptor de respuesta de `httpClient.js` — ningún service individual parsea el error a mano.
- Los services y hooks del proyecto propagan `{ status, code, title, detail }`, nunca el error crudo de Axios ni un string fijo inventado.
- Las decisiones de UI se toman por `code` (estable), nunca por `detail` (texto humano, puede cambiar sin aviso).
- Un `code` sin manejo especial documentado se trata con un mensaje genérico — no es necesario prever cada código de cada módulo por adelantado.

## Variables de entorno

- `VITE_API_BASE_URL`: URL base de la API (ej. `http://localhost:8080` en desarrollo, sin context-path).
- Se documentan en `.env.example` (versionado); el `.env` real de cada desarrollador no se versiona.
- Ninguna URL, puerto ni credencial se hardcodea en código fuente.

## Organización de services

- Cada módulo de dominio (`Ingredients/`, `Products/`, `Recipes/`, ...) mantiene su propio `services/xxxService.js`, responsable exclusivo de llamar a `httpClient` para los endpoints de ese módulo.
- Ningún componente ni hook fuera de un `service` hace HTTP directamente.
- Un service expone funciones con nombre de intención (`getIngredients`, `createIngredient`, `deactivateIngredient`...), nunca un método genérico tipo `request(method, url)` — refleja el mismo principio que ya sigue la API ("la API representa casos de uso, no CRUD genérico").

## Organización de catálogos compartidos

- Un catálogo de referencia (sin mutaciones, consumido por más de un módulo de dominio) vive en `src/services/catalogs/`, fuera de cualquier módulo — nunca dentro de `Ingredients/services/` ni de ningún otro módulo, aunque hoy sólo lo consuma uno.
- Ejemplo vigente: `src/services/catalogs/measurementUnitService.js` (`GET /measurement-units`).
- Catálogos previstos a futuro, mismo tratamiento: Tipos de Artículo, Tipos de Movimiento.
- Un catálogo que el propio contrato documenta como "no cambia en runtime" (carga por seed) se resuelve **una única vez por sesión** (memoizado en el service) — no se refetchea en cada apertura de formulario. Un catálogo que sí puede cambiar en runtime (ej. un listado de productos que un usuario puede crear) se trata como cualquier otro fetch normal, sin memoizar.

## Mappers

- Cada módulo mantiene su `model/xxxMapper.js`, la única frontera entre el DTO del backend y el modelo que consume la UI. Ningún componente conoce la forma real de un DTO.
- El mapper es **bidireccional**:
  - DTO → UI (`mapXToCard`, o equivalente): adapta la respuesta del backend al modelo de presentación, y calcula ahí toda información exclusivamente visual que la API nunca envía (ejemplo: `stockLevel` en Ingredients — la API entrega `cantidadActual`/`stockMinimo`/`necesitaReposicion`; el mapper decide el nivel a mostrar).
  - UI → DTO (`mapFormToCreateRequest`, `mapFormToUpdateRequest`, o equivalente): adapta el payload del formulario al body que espera el endpoint. Ningún componente arma un request a mano.
- Toda lógica de UX (labels, niveles, agrupaciones visuales) vive exclusivamente en el mapper del frontend — la API nunca entrega ese tipo de información, ni el frontend se la pide.

## Responsabilidades por capa (resumen)

| Capa | Responsabilidad | No hace |
|---|---|---|
| Componente | Renderizar, capturar eventos del usuario | HTTP, mapeo de DTOs, reglas de negocio |
| Hook | Orquestar estado de UI + llamar al service | HTTP directo, conocer la forma del DTO |
| Service (módulo) | Único punto de HTTP para su módulo | Lógica visual, mapeo de presentación |
| Service (catálogo compartido) | Único punto de HTTP para un catálogo transversal | Conocer detalles de un módulo de dominio particular |
| Mapper | Traducir DTO ↔ modelo de UI, calcular lo puramente visual | Llamar a la API, decidir reglas de negocio |
| `httpClient` / `apiError` | Transporte HTTP y normalización de errores, para todo el proyecto | Conocer endpoints ni dominios específicos |

## Componentes durante una integración

- No se rediseña un componente visual para integrar un módulo. Sólo se modifica cuando es estrictamente necesario para la integración misma (ejemplos ya aplicados: agregar un selector real donde había texto libre, cambiar el copy de una acción cuyo significado cambió, agregar un control mínimo que antes no existía como paginación).
- Cualquier mejora de UX que no sea consecuencia directa de conectar el contrato real queda para una etapa posterior, fuera del alcance de la integración.

## Documentación por módulo

- Cada módulo integrado tiene su propio documento en `docs/frontend/integration/<módulo>.md`, con el mismo formato: alcance de la ronda, decisiones tomadas, convenciones específicas si las hay, y un flujo completo (Pantalla → Componente → Hook → Service → Endpoint → Respuesta esperada → Actualización de la UI) por cada acción de usuario, implementada o documentada para el futuro.
- Este documento (`CONVENTIONS.md`) contiene sólo las reglas transversales; no se duplican aquí.
