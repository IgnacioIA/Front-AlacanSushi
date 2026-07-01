// src/components/OrderPanel/hooks/useOrderForm.js

import { useMemo, useState } from "react";

const DEFAULT_ORDER_TYPE = "PICKUP";

function buildInitialItems(initialData) {

    return initialData?.items
        ? initialData.items.map(item => ({ ...item }))
        : [];

}

// Nota: este hook asume que el componente que lo usa se remonta (vía `key`)
// cada vez que cambia el pedido en edición, en lugar de resetear el estado
// con un efecto — evita renders en cascada y sigue el patrón recomendado
// por React para "resetear estado cuando cambia una prop".
export default function useOrderForm(initialData) {

    const [orderType, setOrderType] = useState(initialData?.orderType ?? DEFAULT_ORDER_TYPE);

    const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod ?? "");

    const [customerName, setCustomerName] = useState(initialData?.customer?.name ?? "");

    const [items, setItems] = useState(() => buildInitialItems(initialData));

    function addItem(product) {

        setItems(current => {

            const existing = current.find(item => item.id === product.id);

            if (existing) {

                return current.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );

            }

            return [
                ...current,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                }
            ];

        });

    }

    function removeItem(itemId) {

        setItems(current => current.filter(item => item.id !== itemId));

    }

    function updateItemQuantity(itemId, quantity) {

        if (quantity < 1) return;

        setItems(current => current.map(item =>
            item.id === itemId
                ? { ...item, quantity }
                : item
        ));

    }

    const total = useMemo(
        () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items]
    );

    const isValid = items.length > 0 && paymentMethod.trim().length > 0;

    function buildOrderPayload() {

        return {

            orderType,

            paymentMethod,

            customer: customerName.trim()
                ? { name: customerName.trim() }
                : null,

            items,

            total

        };

    }

    return {

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

    };

}
