// src/components/Products/components/ProductCard/ProductCard.jsx
//
// Compone Card + StockIndicator + DropdownMenu (componentes compartidos),
// igual que Ingredients/components/IngredientCard. A diferencia de esa
// tarjeta, agrega "Producir" como acción principal del negocio, con
// mayor jerarquía visual que Editar/Eliminar y sin ocultarla en el menú.

import Card from "../../../Card/Card";
import StockIndicator from "../../../StockIndicator/StockIndicator";
import DropdownMenu from "../../../DropdownMenu/DropdownMenu";

import "./ProductCard.css";

export default function ProductCard({

    product,

    onOpenDetails,

    onEdit,

    onDelete,

    onProduce

}) {

    const menuItems = [

        { id: "edit", label: "Editar", onClick: () => onEdit(product) },

        { id: "delete", label: "Eliminar", variant: "danger", onClick: () => onDelete(product) }

    ];

    function handleProduceClick(event) {

        event.stopPropagation();

        onProduce(product);

    }

    return (

        <Card className="ProductCard" onClick={() => onOpenDetails(product)}>

            <header className="ProductCard-Header">

                <h3 className="ProductCard-Name">{product.name}</h3>

                <DropdownMenu items={menuItems} />

            </header>

            <p className="ProductCard-Quantity">
                {product.quantity} {product.unit}
            </p>

            <StockIndicator level={product.stockLevel} />

            <button
                type="button"
                className="ProductCard-ProduceButton"
                onClick={handleProduceClick}
            >
                Producir
            </button>

        </Card>

    );

}
