// src/public/components/Button/Button.jsx
//
// Botón mínimo propio del frontend público — no reutiliza los estilos de
// botón del panel admin (pensados para un shell de escritorio). `variant`
// sólo cambia la clase; la estética final queda para la etapa de diseño.

import "./Button.css";

export default function Button({

    variant = "primary",

    type = "button",

    disabled = false,

    onClick,

    children

}) {

    return (

        <button
            type={type}
            className={`PublicButton PublicButton-${variant}`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>

    );

}
