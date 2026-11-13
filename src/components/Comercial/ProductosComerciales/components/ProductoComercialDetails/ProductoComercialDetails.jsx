// src/components/Comercial/ProductosComerciales/components/ProductoComercialDetails/ProductoComercialDetails.jsx
//
// Vista de sólo lectura, pensada para renderizarse dentro del Modal
// compartido. Mismo criterio que Ingredients/components/IngredientDetails.

import "./ProductoComercialDetails.css";

export default function ProductoComercialDetails({ producto }) {

    return (

        <div className="ProductoComercialDetails">

            {producto.image && (

                <div className="ProductoComercialDetails-Image">
                    <img src={producto.image} alt="" />
                </div>

            )}

            <div className="ProductoComercialDetails-Row">

                <span className="ProductoComercialDetails-Label">Precio</span>

                <span className="ProductoComercialDetails-Value">
                    ${producto.price?.toLocaleString()}
                </span>

            </div>

            <div className="ProductoComercialDetails-Row">

                <span className="ProductoComercialDetails-Label">Estado</span>

                <span className="ProductoComercialDetails-Value">
                    {producto.active ? "Activo" : "Inactivo"}
                </span>

            </div>

            {producto.description && (

                <div className="ProductoComercialDetails-Description">

                    <span className="ProductoComercialDetails-Label">Descripción</span>

                    <p>{producto.description}</p>

                </div>

            )}

        </div>

    );

}
