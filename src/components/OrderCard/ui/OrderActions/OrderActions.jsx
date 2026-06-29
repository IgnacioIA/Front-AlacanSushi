// src/components/OrderCard/ui/OrderActions/OrderActions.jsx

import "../../styles/OrderActions.css";

import ActionButton from "../ActionButton/ActionButton";

export default function OrderActions({

    actions,

    onAction

}) {

    return (

        <footer className="OrderActions">

            {actions.map(action => (

                <ActionButton

                    key={action.id}

                    label={action.label}

                    variant={action.variant}

                    onClick={() => onAction(action.id)}

                />

            ))}

        </footer>

    );

}