// src/components/Products/services/recipeService.js
//
// Catálogo mock de recetas para poblar los selects de ProductForm y
// ProduceProductForm (mismo patrón que OrderPanel/services/productService.js
// para el selector de catálogo de OrderForm). No es el módulo Recetas real.

import mockRecipes from "../mocks/mockRecipes";

async function getRecipes() {

    return [...mockRecipes];

}

export default {
    getRecipes
};
