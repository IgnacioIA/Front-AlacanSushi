// src/components/Ingredients/hooks/useIngredients.js
//
// Recibe los parámetros de useIngredientFilters y pide la página
// correspondiente a la API real (Etapa 1). `loading` sólo representa la
// primera carga (nunca se vuelve a poner en true en refetches posteriores,
// para no ocultar el Header/Toolbar en cada tecleo); el buscador se
// debounce para no disparar un GET por tecla.
//
// createIngredient/updateIngredient (Etapa 3) no atrapan el error acá — lo
// dejan propagar tal como lo normaliza apiError.js, para que IngredientsPage
// lo muestre de forma distinguible en el propio formulario en vez de en un
// banner genérico de la página. deactivateIngredient (Etapa 4) sí lo atrapa
// (el plan de esa etapa no exigía mostrarlo de forma distinguible). Los
// tres bumpean refreshToken al resolver con éxito, para refetchear la
// página actual — con esto, el módulo ya no depende de ningún mock.

import { useEffect, useMemo, useState } from "react";

import ingredientService from "../services/ingredientService";
import { mapIngredientToCard } from "../model/ingredientMapper";

const SEARCH_DEBOUNCE_MS = 350;

export default function useIngredients({ searchTerm, stockFilter, sortBy, page, pageSize }) {

    const [ingredients, setIngredients] = useState([]);

    const [totalElements, setTotalElements] = useState(0);

    const [totalPages, setTotalPages] = useState(0);

    const [lowStockCount, setLowStockCount] = useState(0);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    const [refreshToken, setRefreshToken] = useState(0);

    useEffect(() => {

        const timeoutId = setTimeout(() => setDebouncedSearch(searchTerm), SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);

    }, [searchTerm]);

    useEffect(() => {

        let cancelled = false;

        async function loadIngredients() {

            try {

                const data = await ingredientService.getIngredients({

                    page,

                    size: pageSize,

                    search: debouncedSearch,

                    sort: sortBy,

                    inventario: stockFilter === "ALL" ? undefined : stockFilter

                });

                if (cancelled) return;

                setIngredients(data.content);

                setTotalElements(data.totalElements);

                setTotalPages(data.totalPages);

                setError(null);

            } catch {

                if (!cancelled) setError("No se pudieron cargar los ingredientes.");

            } finally {

                if (!cancelled) setLoading(false);

            }

        }

        loadIngredients();

        return () => { cancelled = true; };

    }, [debouncedSearch, stockFilter, sortBy, page, pageSize, refreshToken]);

    // Estadística del header: cuenta el catálogo completo, independiente de
    // los filtros que el usuario aplique sobre la grilla — por eso se pide
    // una sola vez, no en cada cambio de searchTerm/stockFilter/sortBy/page.
    useEffect(() => {

        async function loadLowStockCount() {

            try {

                const data = await ingredientService.getIngredients({

                    page: 0,

                    size: 1,

                    inventario: "NECESITA_REPOSICION"

                });

                setLowStockCount(data.totalElements);

            } catch {

                // Estadística informativa: si falla, no bloquea el listado principal.

            }

        }

        loadLowStockCount();

    }, []);

    const cards = useMemo(
        () => ingredients.map(mapIngredientToCard),
        [ingredients]
    );

    const stats = useMemo(() => ({

        total: totalElements,

        lowStockCount

    }), [totalElements, lowStockCount]);

    async function createIngredient(data) {

        await ingredientService.createIngredient(data);

        setRefreshToken(token => token + 1);

    }

    async function updateIngredient(ingredientId, updates) {

        await ingredientService.updateIngredient(ingredientId, updates);

        setRefreshToken(token => token + 1);

    }

    // Devuelve { recetasActivasQueLoUtilizan } en éxito (para que la página
    // decida si muestra la advertencia informativa) o null si falló — no se
    // exige mostrar el error de forma distinguible acá (a diferencia de
    // crear/editar), el plan de esta etapa no lo pedía.
    async function deactivateIngredient(ingredientId) {

        try {

            const result = await ingredientService.deactivateIngredient(ingredientId);

            setError(null);

            setRefreshToken(token => token + 1);

            return result;

        } catch {

            setError("No se pudo desactivar el ingrediente.");

            return null;

        }

    }

    return {

        loading,

        error,

        ingredients: cards,

        stats,

        totalPages,

        createIngredient,

        updateIngredient,

        deactivateIngredient

    };

}
