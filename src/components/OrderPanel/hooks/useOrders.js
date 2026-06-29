// src/components/OrderPanel/hooks/useOrders.js

import { useEffect, useMemo, useState } from "react";

import { PANEL_COLUMNS } from "../constants/panelColumns";

import orderService from "../services/orderService";

export default function useOrders() {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadOrders() {

            const data = await orderService.getOrders();

            setOrders(data);

            setLoading(false);

        }

        loadOrders();

        const unsubscribe = orderService.subscribeOrders(setOrders);

        return unsubscribe;

    }, []);

    const columns = useMemo(() => {

        const grouped = {};

        PANEL_COLUMNS.forEach(column => {

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

        await orderService.dispatchOrderAction(

            orderId,

            actionId

        );

    }

    return {

        loading,

        columns,

        dispatchOrderAction

    };

}