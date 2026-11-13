// src/components/Comercial/CombosComerciales/hooks/useComboComercialFilters.js

import { useState } from "react";

export const DEFAULT_PAGE_SIZE = 15;

export default function useComboComercialFilters() {

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
