// src/components/Recipes/services/recipeService.js
//
// Mock del catálogo de recetas. La relación Producto-Ingredientes que
// representa una receta es información, no lógica: este servicio sólo
// simula persistencia en memoria hasta que exista el endpoint real.

import mockRecipes from "../mocks/mockRecipes";

let recipes = [...mockRecipes];

const subscribers = [];

function notifySubscribers() {

    subscribers.forEach(cb => cb([...recipes]));

}

async function getRecipes() {

    return [...recipes];

}

async function createRecipe(data) {

    const newId = recipes.length
        ? Math.max(...recipes.map(recipe => recipe.id)) + 1
        : 1;

    const newRecipe = {
        id: newId,
        name: data.name,
        productId: data.productId,
        description: data.description,
        ingredients: data.ingredients,
        updatedAt: new Date().toISOString()
    };

    recipes = [...recipes, newRecipe];

    notifySubscribers();

    return getRecipes();

}

async function updateRecipe(recipeId, updates) {

    recipes = recipes.map(recipe => {

        if (recipe.id !== recipeId) return recipe;

        return {
            ...recipe,
            name: updates.name,
            productId: updates.productId,
            description: updates.description,
            ingredients: updates.ingredients,
            updatedAt: new Date().toISOString()
        };

    });

    notifySubscribers();

    return getRecipes();

}

async function deleteRecipe(recipeId) {

    recipes = recipes.filter(recipe => recipe.id !== recipeId);

    notifySubscribers();

    return getRecipes();

}

function subscribeRecipes(cb) {

    subscribers.push(cb);

    return () => {
        const i = subscribers.indexOf(cb);
        if (i >= 0) subscribers.splice(i, 1);
    };

}

export default {
    getRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    subscribeRecipes
};
