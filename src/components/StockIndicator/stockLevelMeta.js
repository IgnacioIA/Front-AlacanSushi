// src/components/StockIndicator/stockLevelMeta.js
//
// Metadata puramente visual (label + porcentaje de relleno) por nivel de
// stock. Separado de StockIndicator.jsx para no romper react-refresh
// (un archivo de componente no puede exportar también constantes).

export const STOCK_LEVEL_META = {

    HIGH: { label: "Stock Alto", fill: 100 },

    MEDIUM: { label: "Stock Medio", fill: 60 },

    LOW: { label: "Stock Bajo", fill: 25 }

};
