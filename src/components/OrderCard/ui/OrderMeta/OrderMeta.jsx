// src/components/OrderCard/ui/OrderMeta/OrderMeta.jsx

import "../../styles/OrderMeta.css";

export default function OrderMeta({

    orderType,

    paymentMethod,

    total,

    customer,

    productsCount

}) {

    return (

        <section className="OrderMeta">

            <div className="OrderMeta-Row">

                <span className="OrderMeta-Label">

                    {orderType === "DELIVERY"
                        ? "🚚 Delivery"
                        : "🏠 Retira"}

                </span>

                <span className="OrderMeta-Value">

                    {productsCount} productos

                </span>

            </div>

            <div className="OrderMeta-Row">

                <span className="OrderMeta-Label">

                    💳 {paymentMethod}

                </span>

                <span className="OrderMeta-Value">

                    {customer?.name}

                </span>

            </div>

            <div className="OrderMeta-Total">

                <span>Total</span>

                <strong>

                    ${total.toLocaleString()}

                </strong>

            </div>

        </section>

    );

}