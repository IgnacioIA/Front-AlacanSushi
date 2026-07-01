// src/components/OrderCard/ui/OrderHeader/OrderHeader.jsx

import "../../styles/OrderHeader.css";

export default function OrderHeader({

    title,

    expanded,

    onToggle,

    canEdit,

    onEdit

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

            {canEdit && (

                <button
                    type="button"
                    className="OrderHeader-Edit"
                    onClick={onEdit}
                    aria-label={`Editar ${title}`}
                >

                    ✎

                </button>

            )}

        </header>

    );

}