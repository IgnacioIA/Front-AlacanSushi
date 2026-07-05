// src/components/Recipes/components/RecipeIngredientPicker/RecipeIngredientPicker.jsx
//
// Mismo patrón que OrderPanel/components/ProductSelector.jsx: lista el
// catálogo (acá, ingredientes de referencia) y agrega ítems a la receta
// en construcción. Único consumidor de ingredientService — no se separó
// en un hook aparte (no hay una segunda necesidad real todavía).

import { useEffect, useState } from "react";

import ingredientService from "../../services/ingredientService";

import "./RecipeIngredientPicker.css";

export default function RecipeIngredientPicker({ onSelectIngredient }) {

    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {

        async function loadIngredients() {

            const data = await ingredientService.getIngredients();

            setIngredients(data);

        }

        loadIngredients();

    }, []);

    return (

        <div className="RecipeIngredientPicker">

            <h3 className="RecipeIngredientPicker-Title">Agregar ingrediente</h3>

            <div className="RecipeIngredientPicker-List">

                {ingredients.map(ingredient => (

                    <button
                        key={ingredient.id}
                        type="button"
                        className="RecipeIngredientPicker-Item"
                        onClick={() => onSelectIngredient(ingredient)}
                    >

                        <span className="RecipeIngredientPicker-Name">{ingredient.name}</span>

                        <span className="RecipeIngredientPicker-Unit">{ingredient.unit}</span>

                    </button>

                ))}

            </div>

        </div>

    );

}
