// src/components/Recipes/mocks/mockRecipes.js
//
// Cada ingrediente de la receta guarda su propio `name`/`unit` (snapshot
// al momento de construir la receta), igual que OrderItemDTO guarda
// name/price del producto al momento del pedido — no es una referencia
// viva al catálogo de ingredientes.

const mockRecipes = [

    {
        id: 1,
        name: "Receta Tradicional",
        productId: 1,
        description: "Receta base de pizza muzzarella.",
        updatedAt: "2026-07-01T10:00:00.000Z",
        ingredients: [
            { ingredientId: 1, name: "Harina 000", unit: "kg", quantity: 2 },
            { ingredientId: 2, name: "Mozzarella", unit: "kg", quantity: 1 },
            { ingredientId: 3, name: "Salsa de tomate", unit: "L", quantity: 0.5 }
        ]
    },

    {
        id: 2,
        name: "Receta Clásica",
        productId: 2,
        description: "Empanadas de carne cortada a cuchillo.",
        updatedAt: "2026-06-28T10:00:00.000Z",
        ingredients: [
            { ingredientId: 1, name: "Harina 000", unit: "kg", quantity: 1.5 },
            { ingredientId: 4, name: "Aceite de girasol", unit: "L", quantity: 0.3 }
        ]
    },

    {
        id: 3,
        name: "Receta Casera",
        productId: 3,
        description: "Milanesa con guarnición de papas.",
        updatedAt: "2026-06-20T10:00:00.000Z",
        ingredients: [
            { ingredientId: 4, name: "Aceite de girasol", unit: "L", quantity: 1 }
        ]
    },

    {
        id: 4,
        name: "Receta de Estación",
        productId: 4,
        description: "Tarta de acelga y cebolla.",
        updatedAt: "2026-05-15T10:00:00.000Z",
        ingredients: [
            { ingredientId: 5, name: "Levadura fresca", unit: "kg", quantity: 0.1 },
            { ingredientId: 1, name: "Harina 000", unit: "kg", quantity: 0.8 }
        ]
    }

];

export default mockRecipes;
