// src/components/Ingredients/services/ingredientService.js
//
// Mock del catálogo de ingredientes. La lógica de stock (niveles, alertas,
// recálculo) pertenece a la API; este servicio sólo simula persistencia en
// memoria hasta que exista el endpoint real (ver .contracts/dto-catalog.md).

import mockIngredients from "../mocks/mockIngredients";

let ingredients = [...mockIngredients];

const subscribers = [];

function notifySubscribers() {

    subscribers.forEach(cb => cb([...ingredients]));

}

async function getIngredients() {

    return [...ingredients];

}

async function createIngredient(data) {

    const newId = ingredients.length
        ? Math.max(...ingredients.map(ingredient => ingredient.id)) + 1
        : 1;

    const newIngredient = {
        id: newId,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        minStock: data.minStock,
        // Placeholder hasta que la API calcule el nivel real de stock.
        stockLevel: "MEDIUM",
        description: data.description
    };

    ingredients = [...ingredients, newIngredient];

    notifySubscribers();

    return getIngredients();

}

async function updateIngredient(ingredientId, updates) {

    ingredients = ingredients.map(ingredient => {

        if (ingredient.id !== ingredientId) return ingredient;

        return {
            ...ingredient,
            name: updates.name,
            quantity: updates.quantity,
            unit: updates.unit,
            minStock: updates.minStock,
            description: updates.description
        };

    });

    notifySubscribers();

    return getIngredients();

}

async function deleteIngredient(ingredientId) {

    ingredients = ingredients.filter(ingredient => ingredient.id !== ingredientId);

    notifySubscribers();

    return getIngredients();

}

function subscribeIngredients(cb) {

    subscribers.push(cb);

    return () => {
        const i = subscribers.indexOf(cb);
        if (i >= 0) subscribers.splice(i, 1);
    };

}

export default {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    subscribeIngredients
};
