// src/components/OrderPanel/components/OrderItemList/OrderItemList.jsx

import "./OrderItemList.css";

export default function OrderItemList({

    items,

    onUpdateQuantity,

    onRemoveItem

}) {

    if (items.length === 0) {

        return (

            <p className="OrderItemList-Empty">
                Aún no agregaste productos.
            </p>

        );

    }

    return (

        <ul className="OrderItemList">

            {items.map(item => (

                <li key={item.id} className="OrderItemList-Row">

                    <span className="OrderItemList-Name">{item.name}</span>

                    <div className="OrderItemList-Quantity">

                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Restar unidad de ${item.name}`}
                        >
                            −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Sumar unidad de ${item.name}`}
                        >
                            +
                        </button>

                    </div>

                    <span className="OrderItemList-Subtotal">
                        ${(item.price * item.quantity).toLocaleString()}
                    </span>

                    <button
                        type="button"
                        className="OrderItemList-Remove"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Quitar ${item.name}`}
                    >
                        ✕
                    </button>

                </li>

            ))}

        </ul>

    );

}
