// src/components/Products/components/ProductsToolbar/ProductsToolbar.jsx
//
// Compone Toolbar + SearchBar (compartidos) — misma estructura que
// Ingredients/components/IngredientsToolbar. Filtro y orden reutilizan la
// metadata visual compartida de StockIndicator.

import Toolbar from "../../../Toolbar/Toolbar";
import SearchBar from "../../../SearchBar/SearchBar";
import { STOCK_LEVEL_META } from "../../../StockIndicator/stockLevelMeta";
import { SORT_OPTIONS } from "../../hooks/useProductFilters";

import "./ProductsToolbar.css";

export default function ProductsToolbar({

    searchTerm,

    onSearchChange,

    stockFilter,

    onStockFilterChange,

    sortBy,

    onSortChange,

    onCreateProduct

}) {

    return (

        <Toolbar>

            <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar producto..."
            />

            <div className="ProductsToolbar-Controls">

                <select
                    className="ProductsToolbar-Select"
                    value={stockFilter}
                    onChange={event => onStockFilterChange(event.target.value)}
                    aria-label="Filtrar por nivel de stock"
                >
                    <option value="ALL">Todos los niveles</option>
                    {Object.keys(STOCK_LEVEL_META).map(level => (
                        <option key={level} value={level}>
                            {STOCK_LEVEL_META[level].label}
                        </option>
                    ))}
                </select>

                <select
                    className="ProductsToolbar-Select"
                    value={sortBy}
                    onChange={event => onSortChange(event.target.value)}
                    aria-label="Ordenar por"
                >
                    <option value={SORT_OPTIONS.NAME}>Nombre (A-Z)</option>
                    <option value={SORT_OPTIONS.QUANTITY}>Cantidad (mayor a menor)</option>
                </select>

                <button
                    type="button"
                    className="ProductsToolbar-CreateButton"
                    onClick={onCreateProduct}
                >
                    + Agregar
                </button>

            </div>

        </Toolbar>

    );

}
