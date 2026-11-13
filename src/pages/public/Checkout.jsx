// src/pages/public/Checkout.jsx
//
// Orquesta el checkout: toma el carrito, arma el Pedido vía
// useCreatePedido y, si sale bien, limpia el carrito y navega a la
// confirmación. Si el carrito está vacío (ej. se llegó acá por URL directa)
// no tiene sentido armar un pedido — se redirige al catálogo.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CheckoutForm from "../../public/checkout/CheckoutForm";
import useCart from "../../public/cart/useCart";
import useCreatePedido from "../../public/order/hooks/useCreatePedido";

function Checkout() {

    const cart = useCart();

    const navigate = useNavigate();

    const { status, error, submitOrder } = useCreatePedido();

    useEffect(() => {

        if (cart.items.length === 0) navigate("/", { replace: true });

    }, [cart.items.length, navigate]);

    if (cart.items.length === 0) return null;

    async function handleSubmit(formPayload) {

        const pedido = await submitOrder(cart.items, formPayload);

        if (pedido) {

            cart.clear();

            navigate(`/pedido/${pedido.id}/confirmacion`);

        }

    }

    return (
        <CheckoutForm
            submitError={status === "error" ? (error?.detail || error?.title) : null}
            submitting={status === "submitting"}
            onSubmit={handleSubmit}
        />
    );

}

export default Checkout;
