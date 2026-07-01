import mockOrders from "../mocks/mockOrders";

import { getAvailableActions, getNextStatus } from "./orderWorkflow";

import { ORDER_ACTION_META } from "./orderActionsMeta";

import { ORDER_EDIT_ALLOWED_STATUSES } from "../constants/orderEditAllowedStatuses";

let orders = [...mockOrders];

const subscribers = [];

function buildAvailableActions(order) {

    return getAvailableActions(order).map(({ id }) => ({

        id,

        label: ORDER_ACTION_META[id].label,

        variant: ORDER_ACTION_META[id].variant

    }));

}

function isEditable(order) {

    return ORDER_EDIT_ALLOWED_STATUSES.includes(order.status);

}

function notifySubscribers() {

    const mapped = orders.map(order => ({
        ...order,
        availableActions: buildAvailableActions(order),
        canEdit: isEditable(order)
    }));

    subscribers.forEach(cb => cb(mapped));

}

async function getOrders() {

    return orders.map(order => ({

        ...order,

        availableActions: buildAvailableActions(order),

        canEdit: isEditable(order)

    }));

}

async function createOrder(orderData) {

    const newId = orders.length
        ? Math.max(...orders.map(order => order.id)) + 1
        : 1;

    const newOrder = {
        id: newId,
        status: "NEW_ORDER",
        orderType: orderData.orderType,
        paymentMethod: orderData.paymentMethod,
        customer: orderData.customer,
        total: orderData.total,
        items: orderData.items
    };

    orders = [...orders, newOrder];

    notifySubscribers();

    return getOrders();
}

async function updateOrder(orderId, updates) {

    orders = orders.map(order => {

        if (order.id !== orderId) return order;

        return {
            ...order,
            orderType: updates.orderType,
            paymentMethod: updates.paymentMethod,
            customer: updates.customer,
            items: updates.items,
            total: updates.total
        };

    });

    notifySubscribers();

    return getOrders();
}

async function dispatchOrderAction(orderId, actionId) {

    orders = orders.map(order => {

        if (order.id !== orderId) return order;

        const nextStatus = getNextStatus(order.status, actionId);

        if (!nextStatus) return order;

        return {
            ...order,
            status: nextStatus
        };

    });

    notifySubscribers();

    return getOrders();
}

function subscribeOrders(cb) {

    subscribers.push(cb);

    return () => {
        const i = subscribers.indexOf(cb);
        if (i >= 0) subscribers.splice(i, 1);
    };

}

export default {
    getOrders,
    createOrder,
    updateOrder,
    dispatchOrderAction,
    subscribeOrders
};