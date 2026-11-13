// src/public/order/hooks/useCreatePedido.js
//
// Orquesta el flujo completo: crear el Pedido → agregar cada línea del
// carrito (una petición por línea, mismo patrón que ya usa el backend real
// -- ver V1-COMMERCIAL-CATALOG.md §13) → traer el Pedido ya resuelto. Si
// falla a mitad de camino, conserva `pedidoId` y qué líneas ya se
// confirmaron, para que un reintento no duplique el pedido ni reenvíe una
// línea que ya se agregó.
//
// NOTA DE VERIFICACIÓN (28-8-2026, probado contra el backend real):
// POST /pedidos responde 200 (no 201) con el id como número plano en el
// body (ej. `1`), no un objeto { id, ... } como asumiría el resto de los
// contratos de esta misma API. Se lee `created?.id ?? created` para
// funcionar contra el comportamiento real y no romper si el backend se
// corrige después para devolver el objeto completo.

import { useState } from "react";

import pedidoService from "../services/pedidoService";
import { mapCartLineToAgregarRequest, mapCheckoutFormToCreateRequest, mapPedidoDtoToView } from "../model/pedidoMapper";

export default function useCreatePedido() {

    const [status, setStatus] = useState("idle"); // idle | submitting | success | error

    const [pedidoId, setPedidoId] = useState(null);

    const [confirmedKeys, setConfirmedKeys] = useState([]);

    const [pedido, setPedido] = useState(null);

    const [error, setError] = useState(null);

    async function submitOrder(cartItems, formPayload) {

        setStatus("submitting");

        setError(null);

        try {

            let currentPedidoId = pedidoId;

            if (!currentPedidoId) {

                const created = await pedidoService.crearPedido(mapCheckoutFormToCreateRequest(formPayload));

                currentPedidoId = created?.id ?? created;

                setPedidoId(currentPedidoId);

            }

            const confirmed = new Set(confirmedKeys);

            for (const line of cartItems) {

                if (confirmed.has(line.key)) continue;

                const request = mapCartLineToAgregarRequest(line);

                if (line.tipo === "PRODUCTO") {

                    await pedidoService.agregarProducto(currentPedidoId, request);

                } else {

                    await pedidoService.agregarCombo(currentPedidoId, request);

                }

                confirmed.add(line.key);

                setConfirmedKeys(Array.from(confirmed));

            }

            const dto = await pedidoService.getPedido(currentPedidoId);

            const view = mapPedidoDtoToView(dto);

            setPedido(view);

            setStatus("success");

            return view;

        } catch (submitError) {

            setStatus("error");

            setError(submitError);

            return null;

        }

    }

    return { status, pedidoId, pedido, error, submitOrder };

}
