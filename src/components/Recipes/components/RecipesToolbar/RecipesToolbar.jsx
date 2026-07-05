// src/components/Recipes/components/RecipesToolbar/RecipesToolbar.jsx
//
// Compone Toolbar + SearchBar (compartidos) — misma estructura que
// IngredientsToolbar/ProductsToolbar. En lugar de filtro por stock,
// agrega el selector de agrupación propio de este módulo.

import Toolbar from "../../../Toolbar/Toolbar";
import SearchBar from "../../../SearchBar/SearchBar";
import { GROUP_BY } from "../../constants/groupBy";
import { SORT_OPTIONS } from "../../hooks/useRecipeFilters";

import "./RecipesToolbar.css";

export default function RecipesToolbar({

    searchTerm,

    onSearchChange,

    sortBy,

    onSortChange,

    groupBy,

    onGroupByChange,

    onCreateRecipe

}) {

    return (

        <Toolbar>

            <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar receta..."
            />

            <div className="RecipesToolbar-Controls">

                <select
                    className="RecipesToolbar-Select"
                    value={groupBy}
                    onChange={event => onGroupByChange(event.target.value)}
                    aria-label="Agrupar por"
                >
                    <option value={GROUP_BY.NONE}>Sin agrupar</option>
                    <option value={GROUP_BY.PRODUCT}>Agrupar por Producto</option>
                    <option value={GROUP_BY.INGREDIENT}>Agrupar por Ingrediente</option>
                </select>

                <select
                    className="RecipesToolbar-Select"
                    value={sortBy}
                    onChange={event => onSortChange(event.target.value)}
                    aria-label="Ordenar por"
                >
                    <option value={SORT_OPTIONS.NAME}>Nombre (A-Z)</option>
                    <option value={SORT_OPTIONS.UPDATED_AT}>Última actualización</option>
                </select>

                <button
                    type="button"
                    className="RecipesToolbar-CreateButton"
                    onClick={onCreateRecipe}
                >
                    + Agregar
                </button>

            </div>

        </Toolbar>

    );

}
