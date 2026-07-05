// src/components/Ingredients/components/IngredientCard/IngredientCard.jsx
//
// Compone Card + StockIndicator + DropdownMenu (componentes compartidos).
// Cualquier ProductCard/RecetaCard futura debería reutilizar exactamente
// estos mismos componentes, no este archivo.

import Card from "../../../Card/Card";
import StockIndicator from "../../../StockIndicator/StockIndicator";
import DropdownMenu from "../../../DropdownMenu/DropdownMenu";

import "./IngredientCard.css";

export default function IngredientCard({

    ingredient,

    onOpenDetails,

    onEdit,

    onDelete

}) {

    const menuItems = [

        { id: "edit", label: "Editar", onClick: () => onEdit(ingredient) },

        { id: "delete", label: "Eliminar", variant: "danger", onClick: () => onDelete(ingredient) }

    ];

    return (

        <Card className="IngredientCard" onClick={() => onOpenDetails(ingredient)}>

            <header className="IngredientCard-Header">

                <h3 className="IngredientCard-Name">{ingredient.name}</h3>

                <DropdownMenu items={menuItems} />

            </header>

            <p className="IngredientCard-Quantity">
                {ingredient.quantity} {ingredient.unit}
            </p>

            <StockIndicator level={ingredient.stockLevel} />

        </Card>

    );

}
