// src/components/Ingredients/mocks/mockIngredients.js
//
// Estructura provisional: el nivel de stock (stockLevel) será calculado
// por la API. El frontend sólo lo representa, nunca lo calcula.
// Ver .contracts/dto-catalog.md para el estado de definición del contrato.

const mockIngredients = [

    {
        id: 1,
        name: "Harina 000",
        quantity: 125,
        unit: "kg",
        minStock: 20,
        stockLevel: "HIGH",
        description: "Harina de trigo para masas y panificados."
    },

    {
        id: 2,
        name: "Mozzarella",
        quantity: 18,
        unit: "kg",
        minStock: 15,
        stockLevel: "MEDIUM",
        description: "Queso para pizzas y calzones."
    },

    {
        id: 3,
        name: "Salsa de tomate",
        quantity: 6,
        unit: "L",
        minStock: 10,
        stockLevel: "LOW",
        description: "Salsa base para pizzas."
    },

    {
        id: 4,
        name: "Aceite de girasol",
        quantity: 40,
        unit: "L",
        minStock: 10,
        stockLevel: "HIGH",
        description: "Aceite para frituras."
    },

    {
        id: 5,
        name: "Levadura fresca",
        quantity: 3,
        unit: "kg",
        minStock: 5,
        stockLevel: "LOW",
        description: "Levadura para masas."
    }

];

export default mockIngredients;
