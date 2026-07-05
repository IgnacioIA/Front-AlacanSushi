// src/components/Recipes/components/RecipesHeader/RecipesHeader.jsx
//
// `stats` llega ya calculado desde useRecipes; el header sólo lo muestra.
// Misma estructura que IngredientsHeader/ProductsHeader.

import "./RecipesHeader.css";

export default function RecipesHeader({

    stats,

    onCreateRecipe

}) {

    return (

        <header className="RecipesHeader">

            <div className="RecipesHeader-Title">

                <h1>Recetas</h1>

                <div className="RecipesHeader-Stats">

                    <span className="RecipesHeader-Stat">
                        {stats.total} en total
                    </span>

                    <span className="RecipesHeader-Stat RecipesHeader-Stat-Recent">
                        {stats.recentlyUpdatedCount} actualizadas esta semana
                    </span>

                </div>

            </div>

            <button
                type="button"
                className="RecipesHeader-CreateButton"
                onClick={onCreateRecipe}
            >
                + Agregar
            </button>

        </header>

    );

}
