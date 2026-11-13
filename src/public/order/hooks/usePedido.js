// src/public/order/hooks/usePedido.js
//
// Trae un Pedido por id vía GET /pedidos/{id} — usado por la página de
// confirmación (src/pages/public/ConfirmacionPedido.jsx) leyendo el id de
// la URL, en vez de depender de location.state. Así la pantalla de
// confirmación sigue funcionando ante un refresh de página (importante en
// mobile) y no sólo justo después de crear el pedido.

import { useEffect, useState } from "react";

import pedidoService from "../services/pedidoService";
import { mapPedidoDtoToView } from "../model/pedidoMapper";

export default function usePedido(pedidoId) {

    const [pedido, setPedido] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {

        let cancelled = false;

        async function loadPedido() {

            try {

                setLoading(true);

                const dto = await pedidoService.getPedido(pedidoId);

                if (!cancelled) setPedido(mapPedidoDtoToView(dto));

                if (!cancelled) setError(null);

            } catch {

                if (!cancelled) setError("No pudimos encontrar este pedido.");

            } finally {

                if (!cancelled) setLoading(false);

            }

        }

        if (pedidoId) loadPedido();

        return () => { cancelled = true; };

    }, [pedidoId]);

    return { pedido, loading, error };

}
