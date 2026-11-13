// src/features/auth/components/AuthStatus/AuthStatus.jsx
//
// Bloque de pantalla completa para "verificando sesión" y "no se pudo
// verificar". Presentacional: no decide cuándo mostrarse.

import "./AuthStatus.css";

export default function AuthStatus({

    title,

    description,

    actionLabel,

    onAction

}) {

    return (

        <div className="AuthStatus" role={onAction ? "alert" : "status"}>

            <p className="AuthStatus-Title">{title}</p>

            {description && (
                <p className="AuthStatus-Description">{description}</p>
            )}

            {onAction && (
                <button type="button" className="AuthStatus-Action" onClick={onAction}>
                    {actionLabel}
                </button>
            )}

        </div>

    );

}
