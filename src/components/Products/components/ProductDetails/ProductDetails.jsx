// src/components/Products/components/ProductDetails/ProductDetails.jsx
//
// Vista de sólo lectura, pensada para renderizarse dentro del Modal
// compartido. No expande la tarjeta ni cambia el tamaño de la grilla.
// Misma estructura que Ingredients/components/IngredientDetails.

import StockIndicator from "../../../StockIndicator/StockIndicator";
import useRecipes from "../../hooks/useRecipes";

import "./ProductDetails.css";

function findRecipeName(recipes, recipeId) {

    const recipe = recipes.find(item => item.id === recipeId);

    return recipe?.name ?? "Sin receta activa";

}

export default function ProductDetails({ product }) {

    const recipes = useRecipes();

    return (

        <div className="ProductDetails">

            <div className="ProductDetails-Row">

                <span className="ProductDetails-Label">Cantidad</span>

                <span className="ProductDetails-Value">
                    {product.quantity} {product.unit}
                </span>

            </div>

            <div className="ProductDetails-Row">

                <span className="ProductDetails-Label">Stock mínimo</span>

                <span className="ProductDetails-Value">
                    {product.minStock} {product.unit}
                </span>

            </div>

            <div className="ProductDetails-Row">

                <span className="ProductDetails-Label">Receta activa</span>

                <span className="ProductDetails-Value">
                    {findRecipeName(recipes, product.activeRecipeId)}
                </span>

            </div>

            <StockIndicator level={product.stockLevel} />

            {product.description && (

                <div className="ProductDetails-Description">

                    <span className="ProductDetails-Label">Descripción</span>

                    <p>{product.description}</p>

                </div>

            )}

        </div>

    );

}
