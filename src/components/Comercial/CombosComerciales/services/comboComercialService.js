// src/components/Comercial/CombosComerciales/services/comboComercialService.js
//
// Único punto de HTTP para Combo Comercial. Contrato fuente:
// docs/frontend/integration 27-8-2026/{crear,actualizar,activar-desactivar,
// consultar}-combo-comercial.md.

import httpClient from "../../../../services/httpClient";
import { mapFormToCreateRequest, mapFormToUpdateRequest } from "../model/comboComercialMapper";

async function getCombosComerciales({ page = 0, size = 15, search, estado } = {}) {

    const { data } = await httpClient.get("/admin/comercial/combos", {

        params: {

            page,

            size,

            search: search || undefined,

            estado: estado || undefined

        }

    });

    return data;

}

async function getComboComercial(comboId) {

    const { data } = await httpClient.get(`/admin/comercial/combos/${comboId}`);

    return data;

}

async function createComboComercial(payload) {

    const { data } = await httpClient.post("/admin/comercial/combos", mapFormToCreateRequest(payload));

    return data;

}

async function updateComboComercial(comboId, payload) {

    const { data } = await httpClient.put(`/admin/comercial/combos/${comboId}`, mapFormToUpdateRequest(payload));

    return data;

}

// Puede devolver 409 COMBO_COMERCIAL_COMPONENTE_INACTIVO si algún componente
// quedó inactivo mientras el combo estaba inactivo — se propaga tal cual.
async function activarComboComercial(comboId) {

    const { data } = await httpClient.post(`/admin/comercial/combos/${comboId}/activar`);

    return data;

}

async function desactivarComboComercial(comboId) {

    const { data } = await httpClient.post(`/admin/comercial/combos/${comboId}/desactivar`);

    return data;

}

export default {
    getCombosComerciales,
    getComboComercial,
    createComboComercial,
    updateComboComercial,
    activarComboComercial,
    desactivarComboComercial
};
