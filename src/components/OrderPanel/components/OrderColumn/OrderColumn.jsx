import "./OrderColumn.css";

import OrderCard from "../../../OrderCard";

export default function OrderColumn({

    title,

    orders,

    onAction,

    onEdit

}) {

    return (

        <section className="OrderColumn">

            <header className="OrderColumn-Header">

                <h2>{title}</h2>

                <span>{orders.length}</span>

            </header>

            <div className="OrderColumn-Content">

                {

                    orders.map(order => (

                        <OrderCard

                            key={order.id}

                            order={order}

                            onAction={onAction}

                            onEdit={onEdit}

                        />

                    ))

                }

            </div>

        </section>

    );

}