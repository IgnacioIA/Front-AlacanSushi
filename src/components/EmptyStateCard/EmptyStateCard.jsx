// src/components/EmptyStateCard/EmptyStateCard.jsx
//
// Tarjeta vacía tipo Notion para disparar la creación de un nuevo elemento
// dentro de una grilla. Compone Card; el orden de imports (Card antes que
// el propio CSS) asegura que EmptyStateCard.css se cargue después de
// Card.css y pueda sobrescribir su sombra/fondo por defecto.
import Card from "../Card/Card";

import "./EmptyStateCard.css";

export default function EmptyStateCard({

    icon = "+",

    label,

    onClick

}) {

    return (

        <Card className="EmptyStateCard" onClick={onClick}>

            <span className="EmptyStateCard-Icon">{icon}</span>

            <span className="EmptyStateCard-Label">{label}</span>

        </Card>

    );

}
