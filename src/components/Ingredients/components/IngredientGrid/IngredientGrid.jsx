// src/components/Ingredients/components/IngredientGrid/IngredientGrid.jsx

import IngredientCard from "../IngredientCard/IngredientCard";
import EmptyStateCard from "../../../EmptyStateCard/EmptyStateCard";

import "./IngredientGrid.css";

export default function IngredientGrid({

    ingredients,

    onAddNew,

    onOpenDetails,

    onEdit,

    onDelete

}) {

    return (

        <div className="IngredientGrid">

            <EmptyStateCard
                label="Agregar ingrediente"
                onClick={onAddNew}
            />

            {ingredients.map(ingredient => (

                <IngredientCard
                    key={ingredient.id}
                    ingredient={ingredient}
                    onOpenDetails={onOpenDetails}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />

            ))}

        </div>

    );

}
