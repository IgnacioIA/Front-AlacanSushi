// src/components/Recipes/services/productService.js
//
// Catálogo mock liviano (sólo referencia) para el select "Producto
// asociado" de RecipeForm. No es el módulo Productos real.

import mockProducts from "../mocks/mockProducts";

async function getProducts() {

    return [...mockProducts];

}

export default {
    getProducts
};
