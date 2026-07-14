// src/services/catalogs/measurementUnitService.js
//
// Catálogo compartido, no específico de ningún módulo de dominio — ver
// docs/frontend/integration/CONVENTIONS.md. GET /measurement-units no se
// pagina y no cambia en runtime (carga por seed), por eso se cachea la
// promesa: un único fetch por sesión, incluso si dos componentes lo piden
// al mismo tiempo antes de que la primera respuesta llegue.

import httpClient from "../httpClient";

let cachedUnitsPromise = null;

async function getMeasurementUnits() {

    if (!cachedUnitsPromise) {

        cachedUnitsPromise = httpClient.get("/measurement-units").then(({ data }) => data);

    }

    return cachedUnitsPromise;

}

export default {
    getMeasurementUnits
};
