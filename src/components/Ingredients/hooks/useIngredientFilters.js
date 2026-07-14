// src/components/Ingredients/hooks/useIngredientFilters.js
//
// Antes filtraba/ordenaba en cliente sobre la lista completa ya cargada.
// Desde la Etapa 1, búsqueda/filtro/orden/página son parámetros reales de
// GET /ingredients (ver docs/frontend/integration/ingredients.md) — este
// hook sólo posee el estado de UI; quien lo consume (useIngredients) los usa
// para pedir la página correspondiente al servidor. Cambiar cualquier
// criterio vuelve a la página 0 (evita quedar "perdido" en una página que
// dejó de existir con el nuevo resultado).

import { useState } from "react";

export const SORT_OPTIONS = {

    NAME: "NAME",

    QUANTITY: "QUANTITY"

};

export const DEFAULT_PAGE_SIZE = 15;

export default function useIngredientFilters() {

    const [searchTerm, setSearchTerm] = useState("");

    const [stockFilter, setStockFilter] = useState("ALL");

    const [sortBy, setSortBy] = useState(SORT_OPTIONS.NAME);

    const [page, setPage] = useState(0);

    function updateSearchTerm(value) {

        setSearchTerm(value);

        setPage(0);

    }

    function updateStockFilter(value) {

        setStockFilter(value);

        setPage(0);

    }

    function updateSortBy(value) {

        setSortBy(value);

        setPage(0);

    }

    return {

        searchTerm,

        setSearchTerm: updateSearchTerm,

        stockFilter,

        setStockFilter: updateStockFilter,

        sortBy,

        setSortBy: updateSortBy,

        page,

        setPage,

        pageSize: DEFAULT_PAGE_SIZE

    };

}
