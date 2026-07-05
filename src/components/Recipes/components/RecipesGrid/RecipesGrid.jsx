// src/components/Recipes/components/RecipesGrid/RecipesGrid.jsx
//
// Sin agrupar: mismo comportamiento que IngredientGrid/ProductGrid
// (EmptyStateCard primero + tarjetas). Agrupado: cada grupo es una
// sección con su propia mini-grilla; el EmptyStateCard sólo se muestra
// sin agrupar (crear sigue disponible vía Header/Toolbar en cualquier
// modo). No se generalizó un "GroupedGrid" compartido: este es, por
// ahora, el único módulo que necesita agrupación.

import { GROUP_BY } from "../../constants/groupBy";
import RecipeCard from "../RecipeCard/RecipeCard";
import EmptyStateCard from "../../../EmptyStateCard/EmptyStateCard";

import "./RecipesGrid.css";

function renderCards(recipes, onOpenDetails, onEdit, onDelete) {

    return recipes.map(recipe => (

        <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onOpenDetails={onOpenDetails}
            onEdit={onEdit}
            onDelete={onDelete}
        />

    ));

}

export default function RecipesGrid({

    recipes,

    groupedRecipes,

    groupBy,

    onAddNew,

    onOpenDetails,

    onEdit,

    onDelete

}) {

    if (groupBy !== GROUP_BY.NONE && groupedRecipes) {

        return (

            <div className="RecipesGrid-Groups">

                {groupedRecipes.map(group => (

                    <section key={group.key} className="RecipesGrid-Group">

                        <h2 className="RecipesGrid-GroupTitle">{group.label}</h2>

                        <div className="RecipesGrid">

                            {renderCards(group.recipes, onOpenDetails, onEdit, onDelete)}

                        </div>

                    </section>

                ))}

            </div>

        );

    }

    return (

        <div className="RecipesGrid">

            <EmptyStateCard
                label="Agregar receta"
                onClick={onAddNew}
            />

            {renderCards(recipes, onOpenDetails, onEdit, onDelete)}

        </div>

    );

}
