// src/components/OrderPanel/components/OrderForm/OrderForm.jsx
//
// Formulario compartido entre alta manual y edición de pedidos,
// diferenciado únicamente por `initialData`. El submit siempre entrega
// el pedido completo (sin operaciones incrementales).

import "./OrderForm.css";

import useOrderForm from "../../hooks/useOrderForm";
import ProductSelector from "../ProductSelector/ProductSelector";
import OrderItemList from "../OrderItemList/OrderItemList";
import ActionButton from "../../../OrderCard/ui/ActionButton/ActionButton";

import { PAYMENT_METHODS } from "../../constants/paymentMethods";

export default function OrderForm({

    initialData,

    onCancel,

    onSubmit

}) {

    const {

        orderType,

        setOrderType,

        paymentMethod,

        setPaymentMethod,

        customerName,

        setCustomerName,

        items,

        addItem,

        removeItem,

        updateItemQuantity,

        total,

        isValid,

        buildOrderPayload

    } = useOrderForm(initialData);

    function handleSubmit(event) {

        event.preventDefault();

        if (!isValid) return;

        onSubmit(buildOrderPayload());

    }

    return (

        <form className="OrderForm" onSubmit={handleSubmit}>

            <div className="OrderForm-Row">

                <label className="OrderForm-Field">

                    <span>Tipo de pedido</span>

                    <select
                        value={orderType}
                        onChange={event => setOrderType(event.target.value)}
                    >
                        <option value="PICKUP">Retira en local</option>
                        <option value="DELIVERY">Delivery</option>
                    </select>

                </label>

                <label className="OrderForm-Field">

                    <span>Método de pago</span>

                    <select
                        value={paymentMethod}
                        onChange={event => setPaymentMethod(event.target.value)}
                    >
                        <option value="" disabled>Seleccionar...</option>
                        {PAYMENT_METHODS.map(method => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </select>

                </label>

            </div>

            <label className="OrderForm-Field">

                <span>Cliente (opcional)</span>

                <input
                    type="text"
                    value={customerName}
                    onChange={event => setCustomerName(event.target.value)}
                    placeholder="Nombre del cliente"
                />

            </label>

            <ProductSelector onSelectProduct={addItem} />

            <OrderItemList
                items={items}
                onUpdateQuantity={updateItemQuantity}
                onRemoveItem={removeItem}
            />

            <div className="OrderForm-Total">

                <span>Total</span>

                <strong>${total.toLocaleString()}</strong>

            </div>

            <div className="OrderForm-Footer">

                <ActionButton
                    label="Cancelar"
                    variant="secondary"
                    onClick={onCancel}
                />

                <button
                    type="submit"
                    className="ActionButton primary"
                    disabled={!isValid}
                >
                    Guardar
                </button>

            </div>

        </form>

    );

}
