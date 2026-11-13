// src/public/components/QuantityStepper/QuantityStepper.jsx
//
// Control táctil +/- de cantidad, sin límite superior de negocio (esa regla
// no existe en ningún contrato — el mínimo es 1, quitar el ítem del carrito
// es una acción separada). Puramente presentacional: no conoce carrito ni
// catálogo.

import "./QuantityStepper.css";

export default function QuantityStepper({

    quantity,

    onIncrease,

    onDecrease,

    minQuantity = 1

}) {

    return (

        <div className="QuantityStepper">

            <button
                type="button"
                className="QuantityStepper-Button"
                onClick={onDecrease}
                disabled={quantity <= minQuantity}
                aria-label="Restar cantidad"
            >
                −
            </button>

            <span className="QuantityStepper-Value">{quantity}</span>

            <button
                type="button"
                className="QuantityStepper-Button"
                onClick={onIncrease}
                aria-label="Sumar cantidad"
            >
                +
            </button>

        </div>

    );

}
