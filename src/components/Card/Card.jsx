// src/components/Card/Card.jsx

import "./Card.css";

export default function Card({

    onClick,

    className = "",

    children

}) {

    function handleKeyDown(event) {

        if (!onClick) return;

        if (event.key === "Enter" || event.key === " ") {

            event.preventDefault();

            onClick(event);

        }

    }

    return (

        <div
            className={`Card ${onClick ? "Card-interactive" : ""} ${className}`.trim()}
            onClick={onClick}
            onKeyDown={onClick ? handleKeyDown : undefined}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >

            {children}

        </div>

    );

}
