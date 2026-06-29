// src/components/OrderCard/OrderCard.jsx

import { useState } from "react";

import "./styles/OrderCard.css";

import OrderHeader from "./ui/OrderHeader/OrderHeader";
import OrderMeta from "./ui/OrderMeta/OrderMeta";
import OrderDetails from "./ui/OrderDetails/OrderDetails";
import OrderActions from "./ui/OrderActions/OrderActions";
import useOrderCard from "./model/useOrderCard";
import { mapOrderToCard } from "./model/orderCardMapper";

export default function OrderCard({

    order,

    onAction

}) {


    function handleAction(actionId) {

        if (!onAction) return;

        onAction(order.id, actionId);

    }

    const {

        expanded,

        toggleExpanded

    } = useOrderCard();

    const card = mapOrderToCard(order);

    return (

        <article
            className={`OrderCard ${expanded ? "expanded" : ""}`}
        >

            <OrderHeader

                title={`Pedido #${order.id}`}

                expanded={expanded}

                onToggle={toggleExpanded}

            />
            <OrderMeta

                orderType={card.orderType}

                paymentMethod={card.paymentMethod}

                customer={card.customer}

                total={card.total}

                productsCount={card.items.length}

            />

            <OrderDetails

                items={card.items}

                expanded={expanded}

            />

            <OrderActions

                actions={card.actions}

                onAction={handleAction}

            />

        </article>

    );

}