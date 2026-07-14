// src/components/StockIndicator/stockLevelMeta.js
//
// Metadata puramente visual (label + porcentaje de relleno) por nivel de
// stock. Separado de StockIndicator.jsx para no romper react-refresh
// (un archivo de componente no puede exportar también constantes).

export const STOCK_LEVEL_META = {

    HIGH: { label: "Stock Alto", fill: 100 },

    MEDIUM: { label: "Stock Medio", fill: 60 },

    LOW: { label: "Stock Bajo", fill: 25 },

    // Vocabulario real de la API para Ingredients (ver GET /ingredients en
    // docs/frontend/integration/ingredients.md) — agregado de forma aditiva,
    // sin tocar HIGH/MEDIUM/LOW, que Productos sigue usando con su propio mock.
    CON_STOCK: { label: "Con stock", fill: 100 },

    NECESITA_REPOSICION: { label: "Necesita reposición", fill: 40 },

    SIN_STOCK: { label: "Sin stock", fill: 0 }

};
