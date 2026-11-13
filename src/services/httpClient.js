// src/services/httpClient.js
//
// Instancia única de Axios para todo el proyecto — ningún service crea su
// propia instancia ni usa fetch. baseURL sale de VITE_API_BASE_URL (ver
// .env.example; en desarrollo es el prefijo `/api` del proxy de Vite).
// Cookies, CSRF y manejo de 401 se configuran en createHttpClient.js, no en
// cada service. Ver docs/frontend/integration/CONVENTIONS.md.

import { createHttpClient } from "./createHttpClient";

const { http, csrf, setUnauthorizedHandler } = createHttpClient({

    baseURL: import.meta.env.VITE_API_BASE_URL

});

export { csrf as csrfTokens, setUnauthorizedHandler };

export default http;
