// src/services/csrf.js
//
// Token CSRF en memoria (nunca en localStorage — autenticacion.md, AUTH-01).
// Recibe la función que hace `GET /auth/csrf` en vez de importar httpClient,
// para no crear una dependencia circular con el cliente que lo usa y para
// poder probarlo sin red.
//
// Reglas que resuelve:
// - Una sola petición en vuelo: varias escrituras simultáneas sin token
//   comparten la misma obtención.
// - `generation` descarta respuestas viejas: si el token se invalida (login,
//   logout, 401) mientras una obtención estaba en vuelo, esa respuesta ya no
//   se guarda y no pisa al token nuevo.
// - Una obtención fallida no queda cacheada: el siguiente pedido reintenta.

export function createCsrfManager(fetchToken) {

    let current = null;

    let inflight = null;

    let generation = 0;

    function getToken() {

        if (current) return Promise.resolve(current);

        if (inflight) return inflight;

        const requestGeneration = generation;

        const request = Promise.resolve()
            .then(fetchToken)
            .then(data => {

                if (!data?.headerName || !data?.token) {

                    throw new Error("Respuesta de GET /auth/csrf sin headerName o token.");

                }

                const token = { headerName: data.headerName, token: data.token };

                if (requestGeneration === generation) current = token;

                return token;

            })
            .finally(() => {

                if (inflight === request) inflight = null;

            });

        inflight = request;

        return request;

    }

    function invalidate() {

        generation += 1;

        current = null;

        inflight = null;

    }

    // Invalida sólo si `usedToken` sigue siendo el vigente: si otra petición
    // ya obtuvo uno nuevo, se reutiliza ese en vez de descartarlo.
    function invalidateIfCurrent(usedToken) {

        if (current && current.token === usedToken) invalidate();

    }

    return { getToken, invalidate, invalidateIfCurrent };

}
