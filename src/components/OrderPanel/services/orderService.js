import mockOrders from "../mocks/mockOrders";

import { getAvailableActions, getNextStatus } from "./orderWorkflow";

import { ORDER_ACTIONS } from "./orderActions";

let orders = [...mockOrders];

const subscribers = [];

function buildAvailableActions(order) {

    return getAvailableActions(order).map(({ id }) => ({

        id,

        label: ORDER_ACTIONS[id].label,

        variant: ORDER_ACTIONS[id].variant

    }));

}

function notifySubscribers() {

    const mapped = orders.map(order => ({
        ...order,
        availableActions: buildAvailableActions(order)
    }));

    subscribers.forEach(cb => cb(mapped));

}

async function getOrders() {

    return orders.map(order => ({

        ...order,

        availableActions: buildAvailableActions(order)

    }));

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
    dispatchOrderAction,
    subscribeOrders
};