// src/components/Comercial/ProductosComerciales/services/productoComercialService.js
//
// Único punto de HTTP para Producto Comercial. Contrato fuente:
// docs/frontend/integration 27-8-2026/{crear,actualizar,activar-desactivar,
// consultar}-producto-comercial.md. Sin auth todavía (documentado así en los
// propios contratos) — cuando exista, se agrega en httpClient.js, no acá.

import httpClient from "../../../../services/httpClient";
import { mapFormToCreateRequest, mapFormToUpdateRequest } from "../model/productoComercialMapper";

async function getProductosComerciales({ page = 0, size = 15, search, estado } = {}) {

    const { data } = await httpClient.get("/admin/comercial/productos", {

        params: {

            page,

            size,

            search: search || undefined,

            estado: estado || undefined

        }

    });

    return data;

}

async function getProductoComercial(productoId) {

    const { data } = await httpClient.get(`/admin/comercial/productos/${productoId}`);

    return data;

}

async function createProductoComercial(payload) {

    const { data } = await httpClient.post("/admin/comercial/productos", mapFormToCreateRequest(payload));

    return data;

}

async function updateProductoComercial(productoId, payload) {

    const { data } = await httpClient.put(`/admin/comercial/productos/${productoId}`, mapFormToUpdateRequest(payload));

    return data;

}

async function activarProductoComercial(productoId) {

    const { data } = await httpClient.post(`/admin/comercial/productos/${productoId}/activar`);

    return data;

}

// Puede devolver 409 PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO — a diferencia
// de Ingredients.deactivateIngredient, acá el contrato documenta esto como un
// caso que el Panel debe mostrar explícitamente, no una desactivación que
// siempre resuelve con éxito. El error se propaga tal cual lo normaliza
// apiError.js; quien llama decide el mensaje según `code`.
async function desactivarProductoComercial(productoId) {

    const { data } = await httpClient.post(`/admin/comercial/productos/${productoId}/desactivar`);

    return data;

}

export default {
    getProductosComerciales,
    getProductoComercial,
    createProductoComercial,
    updateProductoComercial,
    activarProductoComercial,
    desactivarProductoComercial
};
