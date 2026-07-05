// src/components/Recipes/model/recipeMapper.js
//
// Adapta la receta tal como la entrega el servicio (hoy mock, luego la
// API) al modelo que consume la UI, resolviendo `productName` a partir de
// la referencia liviana de productos. La UI nunca debe leer directamente
// la forma interna del mock/API ni cruzar productId contra el catálogo.

export function mapRecipeToCard(recipe, products) {

    const product = products.find(item => item.id === recipe.productId);

    return {

        id: recipe.id,

        name: recipe.name,

        productId: recipe.productId,

        productName: product?.name ?? "Producto sin asignar",

        description: recipe.description,

        updatedAt: recipe.updatedAt,

        ingredients: recipe.ingredients,

        ingredientsCount: recipe.ingredients.length

    };

}
