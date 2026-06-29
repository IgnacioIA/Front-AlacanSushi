// src/components/OrderCard/ui/OrderHeader/OrderHeader.jsx

import "../../styles/OrderHeader.css";

export default function OrderHeader({

    title,

    expanded,

    onToggle

}) {

    return (

        <header className="OrderHeader">

            <button
                type="button"
                className="OrderHeader-Toggle"
                onClick={onToggle}
                aria-expanded={expanded}
                aria-label={`Expandir ${title}`}
            >

                <span className="OrderHeader-Title">

                    {title}

                </span>

                <span
                    className={`OrderHeader-Arrow ${
                        expanded ? "expanded" : ""
                    }`}
                >

                    ▼

                </span>

            </button>

        </header>

    );

}