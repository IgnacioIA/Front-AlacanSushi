// src/services/apiError.js
//
// Normaliza cualquier error de Axios (respuesta RFC 7807 del backend, o un
// error de red sin respuesta) a una forma consistente. Nada en el proyecto
// debería leer un AxiosError crudo — todo consume { status, code, title, detail }.

const NETWORK_ERROR = {

    status: null,

    code: "NETWORK_ERROR",

    title: "No se pudo conectar con el servidor.",

    detail: null

};

export function normalizeApiError(error) {

    const response = error?.response;

    if (!response) {

        return { ...NETWORK_ERROR, detail: error?.message ?? null };

    }

    const problem = response.data ?? {};

    return {

        status: response.status,

        code: problem.code ?? null,

        title: problem.title ?? "Error inesperado",

        detail: problem.detail ?? null

    };

}
