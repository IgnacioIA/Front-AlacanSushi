// src/public/checkout/CheckoutForm.jsx
//
// Formulario de datos del comprador previo a confirmar el pedido. No arma el
// pedido ni llama a la API — sólo valida formato y entrega el payload a
// través de `onSubmit` (la orquestación real vive en
// src/pages/public/Checkout.jsx + order/hooks/useCreatePedido.js).

import useCheckoutForm from "./hooks/useCheckoutForm";
import Button from "../components/Button/Button";
import { formatPrice } from "../utils/formatPrice";
import useCart from "../cart/useCart";

import "./CheckoutForm.css";

const TIPO_PEDIDO_LABEL = {

    SALON: "Comer en el local",

    DELIVERY: "Delivery",

    TAKEAWAY: "Retiro en el local"

};

export default function CheckoutForm({ submitError, submitting, onSubmit }) {

    const cart = useCart();

    const { fields, setField, errors, validateForm, buildPayload, tiposPedido } = useCheckoutForm();

    function handleSubmit(event) {

        event.preventDefault();

        const nextErrors = validateForm();

        if (Object.keys(nextErrors).length > 0) return;

        onSubmit(buildPayload());

    }

    return (

        <form className="CheckoutForm" onSubmit={handleSubmit} noValidate>

            {submitError && (
                <p className="CheckoutForm-SubmitError">{submitError}</p>
            )}

            <div className="CheckoutForm-Summary">

                <span>{cart.itemCount} producto{cart.itemCount === 1 ? "" : "s"}</span>

                <strong>{formatPrice(cart.total)}</strong>

            </div>

            <label className="CheckoutForm-Field">

                <span>Nombre</span>

                <input
                    type="text"
                    value={fields.nombreCliente}
                    onChange={event => setField("nombreCliente", event.target.value)}
                    className={errors.nombreCliente ? "invalid" : ""}
                    placeholder="Tu nombre"
                />

                {errors.nombreCliente && (
                    <small className="CheckoutForm-Error">{errors.nombreCliente}</small>
                )}

            </label>

            <label className="CheckoutForm-Field">

                <span>Teléfono</span>

                <input
                    type="tel"
                    value={fields.telefonoCliente}
                    onChange={event => setField("telefonoCliente", event.target.value)}
                    className={errors.telefonoCliente ? "invalid" : ""}
                    placeholder="Ej: 11 2233-4455"
                />

                {errors.telefonoCliente && (
                    <small className="CheckoutForm-Error">{errors.telefonoCliente}</small>
                )}

            </label>

            <label className="CheckoutForm-Field">

                <span>Tipo de pedido</span>

                <select
                    value={fields.tipoPedido}
                    onChange={event => setField("tipoPedido", event.target.value)}
                >
                    {tiposPedido.map(tipo => (
                        <option key={tipo} value={tipo}>{TIPO_PEDIDO_LABEL[tipo]}</option>
                    ))}
                </select>

            </label>

            {fields.tipoPedido === "DELIVERY" && (

                <label className="CheckoutForm-Field">

                    <span>Dirección de entrega</span>

                    <input
                        type="text"
                        value={fields.direccion}
                        onChange={event => setField("direccion", event.target.value)}
                        className={errors.direccion ? "invalid" : ""}
                        placeholder="Calle, número, piso/depto"
                    />

                    {errors.direccion && (
                        <small className="CheckoutForm-Error">{errors.direccion}</small>
                    )}

                </label>

            )}

            <Button type="submit" disabled={submitting}>
                {submitting ? "Enviando pedido..." : "Confirmar pedido"}
            </Button>

        </form>

    );

}
