// src/components/Ingredients/components/IngredientDetails/IngredientDetails.jsx
//
// Vista de sólo lectura, pensada para renderizarse dentro del Modal
// compartido. No expande la tarjeta ni cambia el tamaño de la grilla.

import StockIndicator from "../../../StockIndicator/StockIndicator";

import "./IngredientDetails.css";

export default function IngredientDetails({ ingredient }) {

    return (

        <div className="IngredientDetails">

            <div className="IngredientDetails-Row">

                <span className="IngredientDetails-Label">Cantidad</span>

                <span className="IngredientDetails-Value">
                    {ingredient.quantity} {ingredient.unit}
                </span>

            </div>

            <div className="IngredientDetails-Row">

                <span className="IngredientDetails-Label">Stock mínimo</span>

                <span className="IngredientDetails-Value">
                    {ingredient.minStock} {ingredient.unit}
                </span>

            </div>

            <StockIndicator level={ingredient.stockLevel} />

            {ingredient.description && (

                <div className="IngredientDetails-Description">

                    <span className="IngredientDetails-Label">Descripción</span>

                    <p>{ingredient.description}</p>

                </div>

            )}

        </div>

    );

}
