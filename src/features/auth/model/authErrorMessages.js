// src/features/auth/model/authErrorMessages.js
//
// Textos de la interfaz por `code` (errores-y-seguridad.md: decidir por
// `code`, nunca por `detail`). `NETWORK_ERROR` lo asigna apiError.js cuando
// no hubo respuesta: es "no hay conexión", no "credenciales inválidas".

const LOGIN_MESSAGES = {

    CREDENCIALES_INVALIDAS: "Usuario o contraseña incorrectos.",

    NETWORK_ERROR: "No se pudo conectar con el servidor. Revisá la conexión e intentá de nuevo.",

    CSRF_INVALIDO: "No se pudo validar el formulario. Recargá la página e intentá de nuevo."

};

const LOGOUT_MESSAGES = {

    NETWORK_ERROR: "No se pudo conectar con el servidor. Tu sesión sigue abierta.",

    CSRF_INVALIDO: "El servidor rechazó el cierre de sesión. Tu sesión sigue abierta; intentá de nuevo."

};

export function loginErrorMessage(error) {

    return LOGIN_MESSAGES[error?.code] ?? "No se pudo iniciar sesión. Intentá de nuevo.";

}

export function logoutErrorMessage(error) {

    return LOGOUT_MESSAGES[error?.code] ?? "No se pudo cerrar la sesión. Tu sesión sigue abierta; intentá de nuevo.";

}
