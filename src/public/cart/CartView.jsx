// src/public/cart/CartView.jsx
//
// Vista presentacional del carrito. `onCheckout` navega a /checkout — la
// decisión de navegación vive en la página (src/pages/public/Carrito.jsx),
// no acá, para que esta vista se pueda reutilizar como drawer más adelante
// sin acoplarse a una ruta concreta.

import CartLineItem from "./components/CartLineItem/CartLineItem";
import StateMessage from "../components/StateMessage/StateMessage";
import Button from "../components/Button/Button";
import { formatPrice } from "../utils/formatPrice";
import useCart from "./useCart";

import "./CartView.css";

export default function CartView({ onCheckout, onGoToCatalog }) {

    const cart = useCart();

    if (cart.items.length === 0) {

        return (

            <StateMessage
                title="Tu carrito está vacío"
                description="Agregá productos del catálogo para armar tu pedido."
                action={<Button variant="secondary" onClick={onGoToCatalog}>Ver catálogo</Button>}
            />

        );

    }

    return (

        <div className="CartView">

            <div className="CartView-Lines">

                {cart.items.map(line => (

                    <CartLineItem
                        key={line.key}
                        line={line}
                        onIncrease={() => cart.setQuantity(line.key, line.quantity + 1)}
                        onDecrease={() => cart.setQuantity(line.key, line.quantity - 1)}
                        onRemove={() => cart.removeItem(line.key)}
                    />

                ))}

            </div>

            <div className="CartView-Footer">

                <div className="CartView-Total">
                    <span>Total</span>
                    <strong>{formatPrice(cart.total)}</strong>
                </div>

                <Button onClick={onCheckout}>Continuar</Button>

            </div>

        </div>

    );

}
