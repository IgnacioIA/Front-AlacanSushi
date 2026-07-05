// src/components/Recipes/mocks/mockProducts.js
//
// Referencia liviana de catálogo (sólo id + name) para el select "Producto
// asociado" de RecipeForm. Deliberadamente separada de
// Products/mocks/mockProducts.js: los módulos de dominio no importan la
// forma interna del mock de otro módulo (mismo criterio ya documentado
// entre OrderPanel y Products/Ingredients — ver .knowledge/decisions.md).

const mockProducts = [

    { id: 1, name: "Pizza Muzzarella" },

    { id: 2, name: "Empanada de Carne" },

    { id: 3, name: "Milanesa con Papas" },

    { id: 4, name: "Tarta de Verdura" }

];

export default mockProducts;
