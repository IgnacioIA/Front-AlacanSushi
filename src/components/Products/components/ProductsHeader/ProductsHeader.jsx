// src/components/Products/components/ProductsHeader/ProductsHeader.jsx
//
// `stats` llega ya calculado desde useProducts (hoy sobre el mock, luego
// sobre la respuesta de la API); el header sólo lo muestra. Misma
// estructura que Ingredients/components/IngredientsHeader.

import "./ProductsHeader.css";

export default function ProductsHeader({

    stats,

    onCreateProduct

}) {

    return (

        <header className="ProductsHeader">

            <div className="ProductsHeader-Title">

                <h1>Productos</h1>

                <div className="ProductsHeader-Stats">

                    <span className="ProductsHeader-Stat">
                        {stats.total} en total
                    </span>

                    <span className="ProductsHeader-Stat ProductsHeader-Stat-Low">
                        {stats.lowStockCount} con stock bajo
                    </span>

                </div>

            </div>

            <button
                type="button"
                className="ProductsHeader-CreateButton"
                onClick={onCreateProduct}
            >
                + Agregar
            </button>

        </header>

    );

}
