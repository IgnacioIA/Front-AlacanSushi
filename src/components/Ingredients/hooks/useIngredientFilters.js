// src/components/Ingredients/hooks/useIngredientFilters.js
//
// Búsqueda, filtro por nivel de stock y orden: concerns de presentación
// sobre datos ya resueltos, sin recalcular ningún estado de dominio.

import { useMemo, useState } from "react";

export const SORT_OPTIONS = {

    NAME: "NAME",

    QUANTITY: "QUANTITY"

};

export default function useIngredientFilters(ingredients) {

    const [searchTerm, setSearchTerm] = useState("");

    const [stockFilter, setStockFilter] = useState("ALL");

    const [sortBy, setSortBy] = useState(SORT_OPTIONS.NAME);

    const filteredIngredients = useMemo(() => {

        const term = searchTerm.trim().toLowerCase();

        return ingredients

            .filter(ingredient =>
                !term || ingredient.name.toLowerCase().includes(term))

            .filter(ingredient =>
                stockFilter === "ALL" || ingredient.stockLevel === stockFilter)

            .sort((a, b) => {

                if (sortBy === SORT_OPTIONS.QUANTITY) return b.quantity - a.quantity;

                return a.name.localeCompare(b.name);

            });

    }, [ingredients, searchTerm, stockFilter, sortBy]);

    return {

        searchTerm,

        setSearchTerm,

        stockFilter,

        setStockFilter,

        sortBy,

        setSortBy,

        filteredIngredients

    };

}
