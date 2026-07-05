// src/components/Ingredients/components/IngredientsHeader/IngredientsHeader.jsx
//
// `stats` llega ya calculado desde useIngredients (hoy sobre el mock,
// luego sobre la respuesta de la API); el header sólo lo muestra.

import "./IngredientsHeader.css";

export default function IngredientsHeader({

    stats,

    onCreateIngredient

}) {

    return (

        <header className="IngredientsHeader">

            <div className="IngredientsHeader-Title">

                <h1>Ingredientes</h1>

                <div className="IngredientsHeader-Stats">

                    <span className="IngredientsHeader-Stat">
                        {stats.total} en total
                    </span>

                    <span className="IngredientsHeader-Stat IngredientsHeader-Stat-Low">
                        {stats.lowStockCount} con stock bajo
                    </span>

                </div>

            </div>

            <button
                type="button"
                className="IngredientsHeader-CreateButton"
                onClick={onCreateIngredient}
            >
                + Agregar
            </button>

        </header>

    );

}
