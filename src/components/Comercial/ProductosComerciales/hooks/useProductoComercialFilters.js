// src/components/Comercial/ProductosComerciales/hooks/useProductoComercialFilters.js
//
// Estado de UI de búsqueda/filtro/página. Los tres son parámetros reales de
// GET /admin/comercial/productos (search, estado, page/size) — mismo patrón
// que Ingredients/hooks/useIngredientFilters.js. Sin "sort": el contrato de
// este endpoint no lo documenta.

import { useState } from "react";

export const DEFAULT_PAGE_SIZE = 15;

export default function useProductoComercialFilters() {

    const [searchTerm, setSearchTerm] = useState("");

    const [estadoFilter, setEstadoFilter] = useState("ALL");

    const [page, setPage] = useState(0);

    function updateSearchTerm(value) {

        setSearchTerm(value);

        setPage(0);

    }

    function updateEstadoFilter(value) {

        setEstadoFilter(value);

        setPage(0);

    }

    return {

        searchTerm,

        setSearchTerm: updateSearchTerm,

        estadoFilter,

        setEstadoFilter: updateEstadoFilter,

        page,

        setPage,

        pageSize: DEFAULT_PAGE_SIZE

    };

}
