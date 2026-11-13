// src/components/Comercial/ProductosComerciales/components/ProductoComercialGrid/ProductoComercialGrid.jsx

import ProductoComercialCard from "../ProductoComercialCard/ProductoComercialCard";
import EmptyStateCard from "../../../../EmptyStateCard/EmptyStateCard";

import "./ProductoComercialGrid.css";

export default function ProductoComercialGrid({

    productos,

    onAddNew,

    onOpenDetails,

    onEdit,

    onToggleActive

}) {

    return (

        <div className="ProductoComercialGrid">

            <EmptyStateCard
                label="Agregar producto"
                onClick={onAddNew}
            />

            {productos.map(producto => (

                <ProductoComercialCard
                    key={producto.id}
                    producto={producto}
                    onOpenDetails={onOpenDetails}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                />

            ))}

        </div>

    );

}
