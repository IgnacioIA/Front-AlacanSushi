// src/components/Recipes/components/RecipeDetails/RecipeDetails.jsx
//
// Vista de sólo lectura, pensada para renderizarse dentro del Modal
// compartido. Muestra toda la información disponible de la receta,
// incluida la lista completa de ingredientes (la tarjeta sólo muestra la
// cantidad). No expande la tarjeta ni cambia el tamaño de la grilla.

import "./RecipeDetails.css";

export default function RecipeDetails({ recipe }) {

    return (

        <div className="RecipeDetails">

            <div className="RecipeDetails-Row">

                <span className="RecipeDetails-Label">Producto asociado</span>

                <span className="RecipeDetails-Value">{recipe.productName}</span>

            </div>

            <div className="RecipeDetails-Row">

                <span className="RecipeDetails-Label">Última modificación</span>

                <span className="RecipeDetails-Value">
                    {new Date(recipe.updatedAt).toLocaleDateString()}
                </span>

            </div>

            <div className="RecipeDetails-Ingredients">

                <span className="RecipeDetails-Label">Ingredientes</span>

                <ul>

                    {recipe.ingredients.map(ingredient => (

                        <li key={ingredient.ingredientId}>

                            <span>{ingredient.name}</span>

                            <span>{ingredient.quantity} {ingredient.unit}</span>

                        </li>

                    ))}

                </ul>

            </div>

            {recipe.description && (

                <div className="RecipeDetails-Description">

                    <span className="RecipeDetails-Label">Observaciones</span>

                    <p>{recipe.description}</p>

                </div>

            )}

        </div>

    );

}
