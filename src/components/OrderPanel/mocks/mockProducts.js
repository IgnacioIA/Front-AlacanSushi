// src/components/OrderPanel/mocks/mockProducts.js
//
// Estructura provisional: el catálogo real será definido por la API.
// El frontend no modela el dominio del catálogo, sólo consume estos campos.
// Ver integration-contract.md (GET /products) para el contrato pendiente de confirmación.

const mockProducts = [

    {
        id: 1,
        name: "Pizza Napolitana",
        price: 8500
    },

    {
        id: 2,
        name: "Coca Cola 2.25L",
        price: 4000
    },

    {
        id: 3,
        name: "Empanada de Carne",
        price: 1200
    },

    {
        id: 4,
        name: "Milanesa con Papas",
        price: 9500
    },

    {
        id: 5,
        name: "Agua Mineral 500ml",
        price: 1500
    }

];

export default mockProducts;
