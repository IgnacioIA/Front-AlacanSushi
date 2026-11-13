// src/features/auth/services/authService.js
//
// Único punto de HTTP para la autenticación del panel. Contrato fuente:
// docs/frontend/api-contracts 23-10-2026/autenticacion.md.

import httpClient, { csrfTokens } from "../../../services/httpClient";
import { createAuthService } from "./createAuthService";

const authService = createAuthService({ http: httpClient, csrf: csrfTokens });

export default authService;
