// src/components/Ingredients/model/ingredientMapper.js
//
// Adapta el ingrediente tal como lo entrega el servicio (hoy mock, luego
// la API) al modelo que consume la UI. La UI nunca debe leer directamente
// la forma interna del mock/API.

export function mapIngredientToCard(ingredient) {

    return {

        id: ingredient.id,

        name: ingredient.name,

        quantity: ingredient.quantity,

        unit: ingredient.unit,

        minStock: ingredient.minStock,

        stockLevel: ingredient.stockLevel,

        description: ingredient.description

    };

}
