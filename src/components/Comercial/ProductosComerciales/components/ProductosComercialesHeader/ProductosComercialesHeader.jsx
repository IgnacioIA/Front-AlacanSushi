// src/components/Comercial/ProductosComerciales/components/ProductosComercialesHeader/ProductosComercialesHeader.jsx

import "./ProductosComercialesHeader.css";

export default function ProductosComercialesHeader({

    stats,

    onCreateProducto

}) {

    return (

        <header className="ProductosComercialesHeader">

            <div className="ProductosComercialesHeader-Title">

                <h1>Productos comerciales</h1>

                <div className="ProductosComercialesHeader-Stats">

                    <span className="ProductosComercialesHeader-Stat">
                        {stats.total} en total
                    </span>

                </div>

            </div>

            <button
                type="button"
                className="ProductosComercialesHeader-CreateButton"
                onClick={onCreateProducto}
            >
                + Nuevo producto
            </button>

        </header>

    );

}
