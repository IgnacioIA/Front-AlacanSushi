// src/components/Products/model/productMapper.js
//
// Adapta el producto tal como lo entrega el servicio (hoy mock, luego
// la API) al modelo que consume la UI. La UI nunca debe leer directamente
// la forma interna del mock/API.

export function mapProductToCard(product) {

    return {

        id: product.id,

        name: product.name,

        quantity: product.quantity,

        unit: product.unit,

        minStock: product.minStock,

        stockLevel: product.stockLevel,

        description: product.description,

        activeRecipeId: product.activeRecipeId

    };

}
