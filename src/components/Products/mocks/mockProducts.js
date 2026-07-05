// src/components/Products/mocks/mockProducts.js
//
// Estructura provisional: el nivel de stock (stockLevel) será calculado
// por la API, igual que en Ingredientes (ver mocks/mockIngredients.js).
// `activeRecipeId` referencia una receta mock de este mismo módulo
// (mockRecipes.js) — no es el módulo Recetas real, que aún no existe.

const mockProducts = [

    {
        id: 1,
        name: "Pizza Muzzarella",
        quantity: 18,
        unit: "unidades",
        minStock: 10,
        stockLevel: "HIGH",
        description: "Pizza clásica de muzzarella, lista para servir.",
        activeRecipeId: 1
    },

    {
        id: 2,
        name: "Empanada de Carne",
        quantity: 40,
        unit: "unidades",
        minStock: 50,
        stockLevel: "LOW",
        description: "Empanadas horneadas de carne cortada a cuchillo.",
        activeRecipeId: 2
    },

    {
        id: 3,
        name: "Milanesa con Papas",
        quantity: 12,
        unit: "porciones",
        minStock: 15,
        stockLevel: "MEDIUM",
        description: "Milanesa de ternera con guarnición de papas fritas.",
        activeRecipeId: 3
    },

    {
        id: 4,
        name: "Pan Casero",
        quantity: 25,
        unit: "unidades",
        minStock: 20,
        stockLevel: "MEDIUM",
        description: "Pan casero horneado para acompañamiento.",
        activeRecipeId: null
    },

    {
        id: 5,
        name: "Tarta de Verdura",
        quantity: 5,
        unit: "unidades",
        minStock: 8,
        stockLevel: "LOW",
        description: "Tarta de acelga y cebolla.",
        activeRecipeId: 4
    }

];

export default mockProducts;
