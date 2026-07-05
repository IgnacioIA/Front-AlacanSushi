// src/components/Products/components/ProductGrid/ProductGrid.jsx

import ProductCard from "../ProductCard/ProductCard";
import EmptyStateCard from "../../../EmptyStateCard/EmptyStateCard";

import "./ProductGrid.css";

export default function ProductGrid({

    products,

    onAddNew,

    onOpenDetails,

    onEdit,

    onDelete,

    onProduce

}) {

    return (

        <div className="ProductGrid">

            <EmptyStateCard
                label="Agregar producto"
                onClick={onAddNew}
            />

            {products.map(product => (

                <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={onOpenDetails}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onProduce={onProduce}
                />

            ))}

        </div>

    );

}
