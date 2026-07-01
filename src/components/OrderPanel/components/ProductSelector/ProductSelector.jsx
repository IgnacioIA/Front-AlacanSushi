// src/components/OrderPanel/components/ProductSelector/ProductSelector.jsx

import { useEffect, useState } from "react";

import "./ProductSelector.css";

import productService from "../../services/productService";

export default function ProductSelector({ onSelectProduct }) {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        async function loadProducts() {

            const data = await productService.getProducts();

            setProducts(data);

        }

        loadProducts();

    }, []);

    return (

        <div className="ProductSelector">

            <h3 className="ProductSelector-Title">Agregar producto</h3>

            <div className="ProductSelector-List">

                {products.map(product => (

                    <button
                        key={product.id}
                        type="button"
                        className="ProductSelector-Item"
                        onClick={() => onSelectProduct(product)}
                    >

                        <span className="ProductSelector-Name">{product.name}</span>

                        <span className="ProductSelector-Price">
                            ${product.price.toLocaleString()}
                        </span>

                    </button>

                ))}

            </div>

        </div>

    );

}
