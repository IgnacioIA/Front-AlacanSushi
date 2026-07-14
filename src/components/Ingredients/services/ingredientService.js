// src/components/Ingredients/services/ingredientService.js
//
// getIngredients (Etapa 1), createIngredient/updateIngredient (Etapa 3) y
// deactivateIngredient (Etapa 4) consumen la API real — ver
// docs/frontend/integration/ingredients.md. Con esto, el módulo terminó de
// migrar por completo: ya no queda ningún mock ni estado en memoria acá.

import httpClient from "../../../services/httpClient";
import { mapFormToCreateRequest, mapFormToUpdateRequest } from "../model/ingredientMapper";

// Traduce la clave interna de orden (ver hooks/useIngredientFilters.js) al
// valor real que espera `sort` en GET /ingredients.
const SORT_PARAM = {

    NAME: "nombre,asc",

    QUANTITY: "cantidadActual,desc"

};

async function getIngredients({ page = 0, size = 15, search, sort, inventario } = {}) {

    const { data } = await httpClient.get("/ingredients", {

        params: {

            page,

            size,

            search: search || undefined,

            sort: SORT_PARAM[sort] ?? undefined,

            inventario: inventario || undefined

        }

    });

    return data;

}

async function createIngredient(payload) {

    const { data } = await httpClient.post("/ingredients", mapFormToCreateRequest(payload));

    return data;

}

async function updateIngredient(ingredientId, payload) {

    const { data } = await httpClient.put(`/ingredients/${ingredientId}`, mapFormToUpdateRequest(payload));

    return data;

}

// Baja lógica: nunca elimina físicamente. La respuesta trae, además del
// ingrediente actualizado, cuántas recetas activas lo referencian — es
// puramente informativo, nunca bloquea la operación (ver
// docs/frontend/integration/ingredients.md).
async function deactivateIngredient(ingredientId) {

    const { data } = await httpClient.post(`/ingredients/${ingredientId}/desactivar`);

    return data;

}

export default {
    getIngredients,
    createIngredient,
    updateIngredient,
    deactivateIngredient
};
