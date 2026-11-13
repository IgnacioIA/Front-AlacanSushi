// src/components/Comercial/ProductosComerciales/components/ProductoComercialCard/ProductoComercialCard.jsx

import Card from "../../../../Card/Card";
import DropdownMenu from "../../../../DropdownMenu/DropdownMenu";

import "./ProductoComercialCard.css";

export default function ProductoComercialCard({

    producto,

    onOpenDetails,

    onEdit,

    onToggleActive

}) {

    const menuItems = [

        { id: "edit", label: "Editar", onClick: () => onEdit(producto) },

        producto.active
            ? { id: "deactivate", label: "Desactivar", variant: "danger", onClick: () => onToggleActive(producto) }
            : { id: "activate", label: "Activar", onClick: () => onToggleActive(producto) }

    ];

    return (

        <Card className="ProductoComercialCard" onClick={() => onOpenDetails(producto)}>

            {producto.image && (

                <div className="ProductoComercialCard-Image">
                    <img src={producto.image} alt="" />
                </div>

            )}

            <header className="ProductoComercialCard-Header">

                <h3 className="ProductoComercialCard-Name">{producto.name}</h3>

                <DropdownMenu items={menuItems} />

            </header>

            <p className="ProductoComercialCard-Price">
                ${producto.price?.toLocaleString()}
            </p>

            <span className={`ProductoComercialCard-Badge ${producto.active ? "active" : "inactive"}`}>
                {producto.active ? "Activo" : "Inactivo"}
            </span>

        </Card>

    );

}
