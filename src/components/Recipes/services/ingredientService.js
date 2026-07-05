// src/components/Recipes/services/ingredientService.js
//
// Catálogo mock liviano (sólo referencia) para el selector de ingredientes
// de RecipeForm. No es el módulo Ingredientes real.

import mockIngredients from "../mocks/mockIngredients";

async function getIngredients() {

    return [...mockIngredients];

}

export default {
    getIngredients
};
