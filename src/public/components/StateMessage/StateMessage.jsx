// src/public/components/StateMessage/StateMessage.jsx
//
// Bloque genérico para los 4 estados que pide el prompt de esta etapa
// (loading → success → empty → error). Puramente presentacional — no decide
// cuándo mostrarse, sólo cómo se ve un estado dado. Sin animación propia
// todavía (instrucción explícita de no cerrar diseño visual en esta etapa).

import "./StateMessage.css";

export default function StateMessage({

    title,

    description,

    action

}) {

    return (

        <div className="StateMessage">

            <p className="StateMessage-Title">{title}</p>

            {description && (
                <p className="StateMessage-Description">{description}</p>
            )}

            {action}

        </div>

    );

}
