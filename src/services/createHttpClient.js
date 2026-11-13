// src/services/createHttpClient.js
//
// Arma la única instancia de Axios del proyecto con sesión y CSRF. Vive en
// una fábrica separada de httpClient.js para poder probarla con Node sin
// `import.meta.env` (los imports llevan extensión por el mismo motivo).
// Contratos: docs/frontend/api-contracts 23-10-2026/autenticacion.md y
// errores-y-seguridad.md.
//
// - `withCredentials` en todas las peticiones: el panel y /auth lo exigen, y
//   en las públicas no molesta (frontend-integration.md §1).
// - CSRF sólo en escrituras, salvo la excepción exacta `POST /pedidos`: la
//   web pública nunca pide token ni abre una sesión anónima.
// - `403 CSRF_INVALIDO`: token nuevo y un único reintento. Cualquier otro
//   error se propaga normalizado, sin reintento.
// - `401 NO_AUTENTICADO`: descarta el token y avisa al manejador registrado
//   (el panel vuelve al login). Un error de red NO es un 401.

import axios from "axios";

import { normalizeApiError } from "./apiError.js";
import { createCsrfManager } from "./csrf.js";

const CSRF_PATH = "/auth/csrf";

const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

const CSRF_EXEMPT = [{ method: "post", path: "/pedidos" }];

function pathOf(url = "") {

    const path = url.split(/[?#]/)[0];

    return path.startsWith("/") ? path : `/${path}`;

}

export function requiresCsrf(config) {

    const method = (config.method ?? "get").toLowerCase();

    if (!WRITE_METHODS.has(method)) return false;

    const path = pathOf(config.url);

    return !CSRF_EXEMPT.some(rule => rule.method === method && rule.path === path);

}

// Un error que ya pasó por normalizeApiError (ej. el de GET /auth/csrf dentro
// del interceptor de petición) no se vuelve a normalizar: se perdería su status.
function isNormalizedError(error) {

    return Boolean(error) && !error.isAxiosError && "status" in error && "code" in error && "title" in error;

}

export function createHttpClient({ baseURL }) {

    const http = axios.create({

        baseURL,

        withCredentials: true

    });

    const csrf = createCsrfManager(() => http.get(CSRF_PATH).then(({ data }) => data));

    let unauthorizedHandler = null;

    function setUnauthorizedHandler(handler) {

        unauthorizedHandler = handler;

        return () => {

            if (unauthorizedHandler === handler) unauthorizedHandler = null;

        };

    }

    http.interceptors.request.use(async config => {

        if (!requiresCsrf(config)) return config;

        const { headerName, token } = await csrf.getToken();

        config.headers.set(headerName, token);

        config.alacanCsrfToken = token;

        return config;

    });

    http.interceptors.response.use(

        response => response,

        error => {

            if (isNormalizedError(error)) return Promise.reject(error);

            const normalized = normalizeApiError(error);

            const config = error?.config;

            if (
                normalized.status === 403
                && normalized.code === "CSRF_INVALIDO"
                && config
                && requiresCsrf(config)
                && !config.alacanCsrfRetried
            ) {

                csrf.invalidateIfCurrent(config.alacanCsrfToken);

                config.alacanCsrfRetried = true;

                return http.request(config);

            }

            if (normalized.status === 401 && normalized.code === "NO_AUTENTICADO") {

                csrf.invalidate();

                unauthorizedHandler?.(normalized);

            }

            return Promise.reject(normalized);

        }

    );

    return { http, csrf, setUnauthorizedHandler };

}
