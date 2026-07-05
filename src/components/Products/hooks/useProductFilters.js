// src/components/Products/hooks/useProductFilters.js
//
// Búsqueda, filtro por nivel de stock y orden: mismo concern de
// presentación que Ingredients/hooks/useIngredientFilters.js, duplicado
// deliberadamente en lugar de compartido (ver decisión en
// .knowledge/decisions.md sobre hooks de dominio por módulo).

import { useMemo, useState } from "react";

export const SORT_OPTIONS = {

    NAME: "NAME",

    QUANTITY: "QUANTITY"

};

export default function useProductFilters(products) {

    const [searchTerm, setSearchTerm] = useState("");

    const [stockFilter, setStockFilter] = useState("ALL");

    const [sortBy, setSortBy] = useState(SORT_OPTIONS.NAME);

    const filteredProducts = useMemo(() => {

        const term = searchTerm.trim().toLowerCase();

        return products

            .filter(product =>
                !term || product.name.toLowerCase().includes(term))

            .filter(product =>
                stockFilter === "ALL" || product.stockLevel === stockFilter)

            .sort((a, b) => {

                if (sortBy === SORT_OPTIONS.QUANTITY) return b.quantity - a.quantity;

                return a.name.localeCompare(b.name);

            });

    }, [products, searchTerm, stockFilter, sortBy]);

    return {

        searchTerm,

        setSearchTerm,

        stockFilter,

        setStockFilter,

        sortBy,

        setSortBy,

        filteredProducts

    };

}
