// src/components/Recipes/hooks/useRecipes.js
//
// Carga productos (referencia liviana) junto con las recetas: `products`
// vive en estado (no en un ref) porque `cards` lo necesita durante el
// render. `recentlyUpdatedCount` compara contra "ahora", que se captura
// una única vez con el inicializador perezoso de useState — evita llamar
// a `Date.now()` (función impura) en cada render dentro de un useMemo.

import { useEffect, useMemo, useState } from "react";

import recipeService from "../services/recipeService";
import productService from "../services/productService";
import { mapRecipeToCard } from "../model/recipeMapper";

const RECENTLY_UPDATED_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export default function useRecipes() {

    const [recipes, setRecipes] = useState([]);

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [loadedAt] = useState(() => Date.now());

    useEffect(() => {

        async function loadRecipes() {

            try {

                const productsData = await productService.getProducts();

                setProducts(productsData);

                const data = await recipeService.getRecipes();

                setRecipes(data);

                setError(null);

            } catch {

                setError("No se pudieron cargar las recetas.");

            } finally {

                setLoading(false);

            }

        }

        loadRecipes();

        const unsubscribe = recipeService.subscribeRecipes(setRecipes);

        return unsubscribe;

    }, []);

    const cards = useMemo(
        () => recipes.map(recipe => mapRecipeToCard(recipe, products)),
        [recipes, products]
    );

    const stats = useMemo(() => ({

        total: recipes.length,

        recentlyUpdatedCount: recipes.filter(
            recipe => loadedAt - new Date(recipe.updatedAt).getTime() <= RECENTLY_UPDATED_WINDOW_MS
        ).length

    }), [recipes, loadedAt]);

    async function createRecipe(data) {

        try {

            await recipeService.createRecipe(data);

            setError(null);

        } catch {

            setError("No se pudo crear la receta.");

        }

    }

    async function updateRecipe(recipeId, updates) {

        try {

            await recipeService.updateRecipe(recipeId, updates);

            setError(null);

        } catch {

            setError("No se pudo actualizar la receta.");

        }

    }

    async function deleteRecipe(recipeId) {

        try {

            await recipeService.deleteRecipe(recipeId);

            setError(null);

        } catch {

            setError("No se pudo eliminar la receta.");

        }

    }

    return {

        loading,

        error,

        recipes: cards,

        stats,

        createRecipe,

        updateRecipe,

        deleteRecipe

    };

}
