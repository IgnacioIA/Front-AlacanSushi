// src/services/httpClient.js
//
// Instancia única de Axios para todo el proyecto — ningún service crea su
// propia instancia ni usa fetch. baseURL sale de VITE_API_BASE_URL (ver
// .env.example). Cualquier interceptor futuro (auth, retry) se agrega acá,
// no en cada service. Ver docs/frontend/integration/CONVENTIONS.md.

import axios from "axios";

import { normalizeApiError } from "./apiError";

const httpClient = axios.create({

    baseURL: import.meta.env.VITE_API_BASE_URL

});

httpClient.interceptors.response.use(

    response => response,

    error => Promise.reject(normalizeApiError(error))

);

export default httpClient;
