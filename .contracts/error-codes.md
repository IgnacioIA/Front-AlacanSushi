# Error Codes

Catálogo oficial de errores compartidos entre el Frontend y la API.

Este documento define el comportamiento esperado cuando una operación no puede completarse correctamente.

Los mensajes presentados al usuario son responsabilidad exclusiva del Frontend.

La lógica de la aplicación debe basarse en códigos de error y códigos HTTP, nunca en el contenido textual de las respuestas.

---

# Principios

## La API comunica errores

La API informa qué ocurrió mediante códigos HTTP y, cuando corresponda, mediante un código de error funcional.

No es responsabilidad de la API definir cómo debe mostrarse el error al usuario.

---

## El Frontend interpreta errores

El Frontend decide:

* Qué mensaje mostrar.
* Si debe mostrar un toast.
* Si debe redirigir al usuario.
* Si permite reintentar la operación.
* Cómo representar visualmente el error.

---

## Mensajes

Los mensajes devueltos por la API deben utilizarse únicamente con fines informativos o de diagnóstico.

El Frontend no debe depender del contenido textual para ejecutar lógica de negocio.

---

# Errores HTTP

---

## 200 OK

La operación se completó correctamente.

No requiere tratamiento especial.

---

## 400 Bad Request

La solicitud enviada no es válida.

Ejemplos:

* Payload inválido.
* Acción no permitida para el estado actual.
* Datos inconsistentes.

### Comportamiento esperado

El Frontend informa el error al usuario y permite corregir los datos.

---

## 401 Unauthorized

El usuario no se encuentra autenticado.

### Comportamiento esperado

El Frontend debe solicitar nuevamente la autenticación o redirigir al inicio de sesión.

---

## 403 Forbidden

El usuario está autenticado pero no posee permisos suficientes para realizar la operación.

### Comportamiento esperado

El Frontend informa que la acción no está permitida.

---

## 404 Not Found

El recurso solicitado no existe.

Ejemplos:

* Pedido inexistente.
* Producto inexistente.

### Comportamiento esperado

El Frontend informa que el recurso ya no está disponible.

---

## 409 Conflict

El estado del recurso cambió antes de completar la operación.

Ejemplos:

* Otro usuario modificó el pedido.
* El pedido dejó de ser editable.
* El pedido cambió de estado mientras estaba abierto.

### Comportamiento esperado

El Frontend debe descartar la información obsoleta y volver a sincronizar el recurso con la API.

---

## 422 Unprocessable Entity

La estructura del request es correcta, pero viola una regla de negocio.

Ejemplos:

* Pedido sin productos.
* Cantidad inválida.
* Estado incompatible.

### Comportamiento esperado

El Frontend informa el problema y permite corregir los datos.

---

## 500 Internal Server Error

Se produjo un error inesperado en el servidor.

### Comportamiento esperado

El Frontend informa que la operación no pudo completarse y permite reintentar posteriormente.

---

# Errores utilizados actualmente

Las siguientes operaciones utilizan actualmente estos códigos de respuesta.

| Endpoint                  | Errores esperados |
| ------------------------- | ----------------- |
| GET /orders               | 401, 500          |
| POST /orders/{id}/actions | 400, 404, 409     |
| PATCH /orders/{id}        | 400, 404, 409     |
| GET /products             | 401, 500          |

---

# Sincronización concurrente

El código HTTP `409 Conflict` representa conflictos de concurrencia entre el Frontend y la API.

Ejemplos:

* El pedido cambió de estado.
* El pedido fue modificado por otro operador.
* El recurso dejó de cumplir las condiciones necesarias para completar la operación.

Siempre que sea posible, el Frontend deberá volver a sincronizar la información antes de permitir una nueva acción.

---

# Evolución del contrato

Cuando la API incorpore códigos de error funcionales (por ejemplo `ORDER_NOT_EDITABLE` o `INVALID_ORDER_STATUS`), deberán documentarse en este archivo.

Todo nuevo error compartido entre Frontend y API deberá quedar registrado antes de utilizarse en producción.
