// src/components/Ingredients/constants/stockLevels.js
//
// Confirmado por el contrato real: son los 3 valores del query param
// `inventario` de GET /ingredients (ver
// docs/frontend/integration/ingredients.md). Se utiliza para poblar el
// filtro de la toolbar y como valor a enviar en la request — nunca HIGH/
// MEDIUM/LOW, que sólo existen hoy para el mock de Productos.

export const STOCK_LEVELS = ["SIN_STOCK", "NECESITA_REPOSICION", "CON_STOCK"];
