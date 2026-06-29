// src/components/OrderCard/ui/OrderDetails/OrderDetails.jsx

import "../../styles/OrderDetails.css";

export default function OrderDetails({

    items,

    expanded

}) {

    return (

        <section
            className={`OrderDetails ${expanded ? "expanded" : ""}`}
        >

            <div className="OrderDetails-Content">

                {items.map(item => (

                    <div
                        key={item.id}
                        className="OrderDetails-Item"
                    >

                        <span
                            className="OrderDetails-Name"
                        >

                            {item.quantity}x {item.name}

                        </span>

                        <span
                            className="OrderDetails-Price"
                        >

                            ${item.price.toLocaleString()}

                        </span>

                    </div>

                ))}

            </div>

        </section>

    );

}