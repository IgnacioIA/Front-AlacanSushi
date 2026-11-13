// src/public/cart/components/CartLineItem/CartLineItem.jsx
//
// Presentacional puro: recibe una línea del carrito y callbacks. No conoce
// CartContext directamente (lo maneja CartView) para que sea fácil de
// probar/reutilizar en otro contexto (ej. un resumen dentro del checkout).

import QuantityStepper from "../../../components/QuantityStepper/QuantityStepper";
import { formatPrice } from "../../../utils/formatPrice";

import "./CartLineItem.css";

export default function CartLineItem({

    line,

    onIncrease,

    onDecrease,

    onRemove

}) {

    return (

        <div className="CartLineItem">

            <div className="CartLineItem-Image">
                {line.image && <img src={line.image} alt="" />}
            </div>

            <div className="CartLineItem-Info">

                <p className="CartLineItem-Name">{line.name}</p>

                <p className="CartLineItem-Price">{formatPrice(line.price)}</p>

                <QuantityStepper
                    quantity={line.quantity}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                />

            </div>

            <button
                type="button"
                className="CartLineItem-Remove"
                onClick={onRemove}
                aria-label={`Quitar ${line.name} del carrito`}
            >
                ✕
            </button>

        </div>

    );

}
