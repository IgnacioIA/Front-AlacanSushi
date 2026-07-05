// src/components/Recipes/components/RecipeIngredientList/RecipeIngredientList.jsx
//
// Mismo patrón que OrderPanel/components/OrderItemList.jsx (+/-, quitar),
// con el agregado de un select de unidad (mock) por renglón.

import { UNITS } from "../../constants/units";

import "./RecipeIngredientList.css";

export default function RecipeIngredientList({

    ingredients,

    onUpdateQuantity,

    onUpdateUnit,

    onRemoveIngredient

}) {

    if (ingredients.length === 0) {

        return (

            <p className="RecipeIngredientList-Empty">
                Aún no agregaste ingredientes.
            </p>

        );

    }

    return (

        <ul className="RecipeIngredientList">

            {ingredients.map(ingredient => (

                <li key={ingredient.ingredientId} className="RecipeIngredientList-Row">

                    <span className="RecipeIngredientList-Name">{ingredient.name}</span>

                    <div className="RecipeIngredientList-Quantity">

                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(ingredient.ingredientId, ingredient.quantity - 1)}
                            aria-label={`Restar cantidad de ${ingredient.name}`}
                        >
                            −
                        </button>

                        <span>{ingredient.quantity}</span>

                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(ingredient.ingredientId, ingredient.quantity + 1)}
                            aria-label={`Sumar cantidad de ${ingredient.name}`}
                        >
                            +
                        </button>

                    </div>

                    <select
                        value={ingredient.unit}
                        onChange={event => onUpdateUnit(ingredient.ingredientId, event.target.value)}
                        aria-label={`Unidad de ${ingredient.name}`}
                    >
                        {UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="RecipeIngredientList-Remove"
                        onClick={() => onRemoveIngredient(ingredient.ingredientId)}
                        aria-label={`Quitar ${ingredient.name}`}
                    >
                        ✕
                    </button>

                </li>

            ))}

        </ul>

    );

}
