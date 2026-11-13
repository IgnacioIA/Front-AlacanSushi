// src/public/catalog/services/catalogoPublicoService.js
//
// Único punto de HTTP para el catálogo público. Contrato fuente:
// docs/frontend/integration 27-8-2026/catalogo-publico.md — GET /catalogo,
// sin parámetros, sin auth, siempre 200 (lista vacía es una respuesta
// válida, no un error).

import httpClient from "../../../services/httpClient";

async function getCatalogo() {

    const { data } = await httpClient.get("/catalogo");

    return data;

}

export default { getCatalogo };
