// src/components/Ingredients/components/IngredientsToolbar/IngredientsToolbar.jsx
//
// Compone Toolbar + SearchBar (compartidos). Filtro y orden quedan
// funcionales pero simples: son un concern de presentación, no de negocio.

import Toolbar from "../../../Toolbar/Toolbar";
import SearchBar from "../../../SearchBar/SearchBar";
import { STOCK_LEVEL_META } from "../../../StockIndicator/stockLevelMeta";
import { SORT_OPTIONS } from "../../hooks/useIngredientFilters";

import "./IngredientsToolbar.css";

export default function IngredientsToolbar({

    searchTerm,

    onSearchChange,

    stockFilter,

    onStockFilterChange,

    sortBy,

    onSortChange,

    onCreateIngredient

}) {

    return (

        <Toolbar>

            <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar ingrediente..."
            />

            <div className="IngredientsToolbar-Controls">

                <select
                    className="IngredientsToolbar-Select"
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
                    className="IngredientsToolbar-Select"
                    value={sortBy}
                    onChange={event => onSortChange(event.target.value)}
                    aria-label="Ordenar por"
                >
                    <option value={SORT_OPTIONS.NAME}>Nombre (A-Z)</option>
                    <option value={SORT_OPTIONS.QUANTITY}>Cantidad (mayor a menor)</option>
                </select>

                <button
                    type="button"
                    className="IngredientsToolbar-CreateButton"
                    onClick={onCreateIngredient}
                >
                    + Agregar
                </button>

            </div>

        </Toolbar>

    );

}
