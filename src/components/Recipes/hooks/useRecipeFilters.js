// src/components/Recipes/hooks/useRecipeFilters.js
//
// Búsqueda, orden y agrupación: concern de presentación sobre datos ya
// resueltos (igual que useIngredientFilters/useProductFilters), extendido
// con `groupBy` porque este módulo necesita mostrar las recetas agrupadas
// por producto o por ingrediente. La agrupación es reorganización visual
// de datos ya cargados, no una regla de negocio.

import { useMemo, useState } from "react";

import { GROUP_BY } from "../constants/groupBy";

export const SORT_OPTIONS = {

    NAME: "NAME",

    UPDATED_AT: "UPDATED_AT"

};

function sortRecipes(recipes, sortBy) {

    return [...recipes].sort((a, b) => {

        if (sortBy === SORT_OPTIONS.UPDATED_AT) {

            return new Date(b.updatedAt) - new Date(a.updatedAt);

        }

        return a.name.localeCompare(b.name);

    });

}

function groupByProduct(recipes) {

    const groups = new Map();

    recipes.forEach(recipe => {

        const key = String(recipe.productId);

        if (!groups.has(key)) groups.set(key, { key, label: recipe.productName, recipes: [] });

        groups.get(key).recipes.push(recipe);

    });

    return [...groups.values()];

}

function groupByIngredient(recipes) {

    const groups = new Map();

    recipes.forEach(recipe => {

        recipe.ingredients.forEach(ingredient => {

            const key = String(ingredient.ingredientId);

            if (!groups.has(key)) groups.set(key, { key, label: ingredient.name, recipes: [] });

            groups.get(key).recipes.push(recipe);

        });

    });

    return [...groups.values()];

}

export default function useRecipeFilters(recipes) {

    const [searchTerm, setSearchTerm] = useState("");

    const [sortBy, setSortBy] = useState(SORT_OPTIONS.NAME);

    const [groupBy, setGroupBy] = useState(GROUP_BY.NONE);

    const filteredRecipes = useMemo(() => {

        const term = searchTerm.trim().toLowerCase();

        const filtered = recipes.filter(recipe =>
            !term || recipe.name.toLowerCase().includes(term));

        return sortRecipes(filtered, sortBy);

    }, [recipes, searchTerm, sortBy]);

    const groupedRecipes = useMemo(() => {

        if (groupBy === GROUP_BY.PRODUCT) return groupByProduct(filteredRecipes);

        if (groupBy === GROUP_BY.INGREDIENT) return groupByIngredient(filteredRecipes);

        return null;

    }, [filteredRecipes, groupBy]);

    return {

        searchTerm,

        setSearchTerm,

        sortBy,

        setSortBy,

        groupBy,

        setGroupBy,

        filteredRecipes,

        groupedRecipes

    };

}
