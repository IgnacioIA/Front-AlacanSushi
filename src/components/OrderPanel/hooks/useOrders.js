// src/components/OrderPanel/hooks/useOrders.js

import { useEffect, useMemo, useState } from "react";

import { ORDER_COLUMNS } from "../constants/orderColumns";

import orderService from "../services/orderService";

export default function useOrders() {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {

        async function loadOrders() {

            try {

                const data = await orderService.getOrders();

                setOrders(data);

                setError(null);

            } catch {

                setError("No se pudieron cargar los pedidos.");

            } finally {

                setLoading(false);

            }

        }

        loadOrders();

        const unsubscribe = orderService.subscribeOrders(setOrders);

        return unsubscribe;

    }, []);

    const columns = useMemo(() => {

        const grouped = {};

        ORDER_COLUMNS.forEach(column => {

            grouped[column.id] = [];

        });

        orders.forEach(order => {

            if (grouped[order.status]) {

                grouped[order.status].push(order);

            }

        });

        return grouped;

    }, [orders]);

    async function dispatchOrderAction(orderId, actionId) {

        try {

            await orderService.dispatchOrderAction(

                orderId,

                actionId

            );

            setError(null);

        } catch {

            setError("No se pudo actualizar el pedido.");

        }

    }

    async function createOrder(orderData) {

        try {

            await orderService.createOrder(orderData);

            setError(null);

        } catch {

            setError("No se pudo crear el pedido.");

        }

    }

    async function updateOrder(orderId, updates) {

        try {

            await orderService.updateOrder(orderId, updates);

            setError(null);

        } catch {

            setError("No se pudo actualizar el pedido.");

        }

    }

    return {

        loading,

        error,

        columns,

        dispatchOrderAction,

        createOrder,

        updateOrder

    };

}
