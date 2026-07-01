// src/components/OrderPanel/mocks/mockOrders.js

const mockOrders = [

    {
        id: 1,

        status: "NEW_ORDER",

        orderType: "DELIVERY",

        paymentMethod: "Mercado Pago",

        customer: {

            id: 1,

            name: "Ignacio"

        },

        total: 12500,

        items: [

            {
                id: 1,
                quantity: 2,
                name: "Pizza Napolitana",
                price: 8500
            },

            {
                id: 2,
                quantity: 1,
                name: "Coca Cola 2.25L",
                price: 4000
            }

        ]

    },
    {
        id: 2,

        status: "NEW_ORDER",

        orderType: "PICKUP",

        paymentMethod: "Mercado Pago",

        customer: {

            id: 1,

            name: "Ignacio"

        },

        total: 12500,

        items: [

            {
                id: 1,
                quantity: 2,
                name: "Pizza Napolitana",
                price: 8500
            },

            {
                id: 2,
                quantity: 1,
                name: "Coca Cola 2.25L",
                price: 4000
            }

        ]

    },


];

export default mockOrders;