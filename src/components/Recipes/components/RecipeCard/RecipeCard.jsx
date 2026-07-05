// src/components/Recipes/components/RecipeCard/RecipeCard.jsx
//
// Compone Card + DropdownMenu (compartidos) — mismo patrón de
// IngredientCard/ProductCard, pero sin StockIndicator: una receta no
// tiene stock, es una ficha técnica (producto + cantidad de ingredientes
// + última actualización). Responde únicamente "¿qué receta es?".

import Card from "../../../Card/Card";
import DropdownMenu from "../../../DropdownMenu/DropdownMenu";

import "./RecipeCard.css";

function formatRelativeDate(isoDate) {

    const diffMs = Date.now() - new Date(isoDate).getTime();

    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays <= 0) return "Actualizada hoy";

    if (diffDays === 1) return "Actualizada hace 1 día";

    return `Actualizada hace ${diffDays} días`;

}

export default function RecipeCard({

    recipe,

    onOpenDetails,

    onEdit,

    onDelete

}) {

    const menuItems = [

        { id: "edit", label: "Editar", onClick: () => onEdit(recipe) },

        { id: "delete", label: "Eliminar", variant: "danger", onClick: () => onDelete(recipe) }

    ];

    return (

        <Card className="RecipeCard" onClick={() => onOpenDetails(recipe)}>

            <header className="RecipeCard-Header">

                <p className="RecipeCard-Product">
                    <span aria-hidden="true">🍽️</span> {recipe.productName}
                </p>

                <DropdownMenu items={menuItems} />

            </header>

            <h3 className="RecipeCard-Name">{recipe.name}</h3>

            <p className="RecipeCard-IngredientsCount">
                <span aria-hidden="true">🥣</span> {recipe.ingredientsCount} ingredientes
            </p>

            <p className="RecipeCard-UpdatedAt">
                {formatRelativeDate(recipe.updatedAt)}
            </p>

        </Card>

    );

}
