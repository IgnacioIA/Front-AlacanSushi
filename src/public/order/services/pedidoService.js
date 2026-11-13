// src/public/order/services/pedidoService.js
//
// Único punto de HTTP para Pedido desde el frontend público. Contrato
// fuente: docs/frontend/integration 27-8-2026/pedido.md +
// FRONTEND-READINESS.md sección A — sin un contrato JSON formal propio
// (deuda documental reconocida en el propio pedido.md), a diferencia de
// Comercial. La forma exacta del body/response puede necesitar ajuste
// cuando se valide contra el backend real; se aisló acá para que ese ajuste
// sea de un solo archivo.

import httpClient from "../../../services/httpClient";

async function crearPedido(payload) {

    const { data } = await httpClient.post("/pedidos", payload);

    return data;

}

// El endpoint distingue Producto Comercial de Combo Comercial por operación
// (no por un campo "tipo" en el body) — mismo patrón ya usado por
// PedidoController (ver V1-COMMERCIAL-CATALOG.md §13).
async function agregarProducto(pedidoId, payload) {

    const { data } = await httpClient.post(`/pedidos/${pedidoId}/productos`, payload);

    return data;

}

async function agregarCombo(pedidoId, payload) {

    const { data } = await httpClient.post(`/pedidos/${pedidoId}/combos`, payload);

    return data;

}

async function getPedido(pedidoId) {

    const { data } = await httpClient.get(`/pedidos/${pedidoId}`);

    return data;

}

export default {
    crearPedido,
    agregarProducto,
    agregarCombo,
    getPedido
};
