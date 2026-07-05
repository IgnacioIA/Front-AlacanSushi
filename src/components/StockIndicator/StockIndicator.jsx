// src/components/StockIndicator/StockIndicator.jsx
//
// Representa visualmente un nivel de stock ya calculado (HIGH/MEDIUM/LOW).
// No calcula porcentajes ni decide el nivel: eso pertenece a la API.

import { STOCK_LEVEL_META } from "./stockLevelMeta";

import "./StockIndicator.css";

export default function StockIndicator({ level }) {

    const meta = STOCK_LEVEL_META[level];

    if (!meta) return null;

    return (

        <div className={`StockIndicator StockIndicator-${level}`}>

            <div className="StockIndicator-Bar">

                <div
                    className="StockIndicator-Fill"
                    style={{ width: `${meta.fill}%` }}
                />

            </div>

            <span className="StockIndicator-Label">{meta.label}</span>

        </div>

    );

}
