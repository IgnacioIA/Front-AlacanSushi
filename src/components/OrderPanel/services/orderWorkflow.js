// src/components/OrderPanel/services/orderWorkflow.js

export const ORDER_WORKFLOW = {

    NEW_ORDER: {

        ACCEPT: "CONFIRMED",

        REJECT: "REJECTED"

    },

    CONFIRMED: {

        PREPARE: "PREPARING",

        CANCEL: "CANCELLED"

    },

    PREPARING: {

        MARK_READY: "READY"

    },

    READY: {

        SEND: "SENT",

        DELIVER: "DELIVERED"

    },

    SENT: {

        DELIVER: "DELIVERED"

    },

    DELIVERED: {},

    CANCELLED: {},

    REJECTED: {}

};

export function getAvailableActions(order) {

    const workflow = ORDER_WORKFLOW[order.status];

    if (!workflow) {

        return [];

    }

    return Object.keys(workflow)

        .filter(action => {

            if (action === "SEND") {

                return order.orderType === "DELIVERY";

            }

            if (action === "DELIVER" && order.status === "READY") {

                return order.orderType === "PICKUP";

            }

            return true;

        })

        .map(action => ({

            id: action

        }));

}

export function getNextStatus(currentStatus, actionId) {

    const workflow = ORDER_WORKFLOW[currentStatus];

    if (!workflow) {

        return null;

    }

    return workflow[actionId] ?? null;

}