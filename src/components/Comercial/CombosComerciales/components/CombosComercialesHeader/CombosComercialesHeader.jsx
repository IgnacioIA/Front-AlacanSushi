// src/components/Comercial/CombosComerciales/components/CombosComercialesHeader/CombosComercialesHeader.jsx

import "./CombosComercialesHeader.css";

export default function CombosComercialesHeader({

    stats,

    onCreateCombo

}) {

    return (

        <header className="CombosComercialesHeader">

            <div className="CombosComercialesHeader-Title">

                <h1>Combos comerciales</h1>

                <div className="CombosComercialesHeader-Stats">

                    <span className="CombosComercialesHeader-Stat">
                        {stats.total} en total
                    </span>

                </div>

            </div>

            <button
                type="button"
                className="CombosComercialesHeader-CreateButton"
                onClick={onCreateCombo}
            >
                + Nuevo combo
            </button>

        </header>

    );

}
