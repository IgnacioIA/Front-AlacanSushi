// src/components/Products/services/productService.js
//
// Mock del catálogo de productos. La lógica de stock (niveles, alertas,
// recálculo) y la ejecución real de una producción pertenecen a la API;
// este servicio sólo simula persistencia en memoria hasta que exista el
// endpoint real (ver .contracts/dto-catalog.md).

import mockProducts from "../mocks/mockProducts";

let products = [...mockProducts];

const subscribers = [];

function notifySubscribers() {

    subscribers.forEach(cb => cb([...products]));

}

async function getProducts() {

    return [...products];

}

async function createProduct(data) {

    const newId = products.length
        ? Math.max(...products.map(product => product.id)) + 1
        : 1;

    const newProduct = {
        id: newId,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        minStock: data.minStock,
        // Placeholder hasta que la API calcule el nivel real de stock
        // (mismo criterio que ingredientService.createIngredient).
        stockLevel: "MEDIUM",
        description: data.description,
        activeRecipeId: data.activeRecipeId
    };

    products = [...products, newProduct];

    notifySubscribers();

    return getProducts();

}

async function updateProduct(productId, updates) {

    products = products.map(product => {

        if (product.id !== productId) return product;

        return {
            ...product,
            name: updates.name,
            quantity: updates.quantity,
            unit: updates.unit,
            minStock: updates.minStock,
            description: updates.description,
            activeRecipeId: updates.activeRecipeId
        };

    });

    notifySubscribers();

    return getProducts();

}

async function deleteProduct(productId) {

    products = products.filter(product => product.id !== productId);

    notifySubscribers();

    return getProducts();

}

// Mock: sólo simula el envío de la solicitud de producción. La ejecución
// real (descuento de ingredientes, actualización de stock) pertenece a la
// API — el frontend no modifica stock localmente ni aquí ni en el hook.
async function produceProduct(productId, produceData) {

    return { productId, ...produceData };

}

function subscribeProducts(cb) {

    subscribers.push(cb);

    return () => {
        const i = subscribers.indexOf(cb);
        if (i >= 0) subscribers.splice(i, 1);
    };

}

export default {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    produceProduct,
    subscribeProducts
};
