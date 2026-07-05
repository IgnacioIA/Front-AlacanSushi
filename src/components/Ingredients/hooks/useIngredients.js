// src/components/Ingredients/hooks/useIngredients.js

import { useEffect, useMemo, useState } from "react";

import ingredientService from "../services/ingredientService";
import { mapIngredientToCard } from "../model/ingredientMapper";

export default function useIngredients() {

    const [ingredients, setIngredients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {

        async function loadIngredients() {

            try {

                const data = await ingredientService.getIngredients();

                setIngredients(data);

                setError(null);

            } catch {

                setError("No se pudieron cargar los ingredientes.");

            } finally {

                setLoading(false);

            }

        }

        loadIngredients();

        const unsubscribe = ingredientService.subscribeIngredients(setIngredients);

        return unsubscribe;

    }, []);

    const cards = useMemo(
        () => ingredients.map(mapIngredientToCard),
        [ingredients]
    );

    const stats = useMemo(() => ({

        total: ingredients.length,

        lowStockCount: ingredients.filter(ingredient => ingredient.stockLevel === "LOW").length

    }), [ingredients]);

    async function createIngredient(data) {

        try {

            await ingredientService.createIngredient(data);

            setError(null);

        } catch {

            setError("No se pudo crear el ingrediente.");

        }

    }

    async function updateIngredient(ingredientId, updates) {

        try {

            await ingredientService.updateIngredient(ingredientId, updates);

            setError(null);

        } catch {

            setError("No se pudo actualizar el ingrediente.");

        }

    }

    async function deleteIngredient(ingredientId) {

        try {

            await ingredientService.deleteIngredient(ingredientId);

            setError(null);

        } catch {

            setError("No se pudo eliminar el ingrediente.");

        }

    }

    return {

        loading,

        error,

        ingredients: cards,

        stats,

        createIngredient,

        updateIngredient,

        deleteIngredient

    };

}
