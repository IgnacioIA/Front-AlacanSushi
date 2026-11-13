// src/components/Comercial/CombosComerciales/hooks/useCombosComerciales.js
//
// NOTA DE VERIFICACIÓN (28-8-2026, probado contra el backend real): igual
// que useProductosComerciales.js — la respuesta real usa
// { content, totalElements, totalPages, ... }, no
// { contenido, totalElementos, totalPaginas } como documenta
// consultar-combos-comerciales.md.

import { useEffect, useMemo, useState } from "react";

import comboComercialService from "../services/comboComercialService";
import { mapComboComercialToCard } from "../model/comboComercialMapper";

const SEARCH_DEBOUNCE_MS = 350;

export default function useCombosComerciales({ searchTerm, estadoFilter, page, pageSize }) {

    const [combos, setCombos] = useState([]);

    const [totalElementos, setTotalElementos] = useState(0);

    const [totalPaginas, setTotalPaginas] = useState(0);

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

        async function loadCombos() {

            try {

                const data = await comboComercialService.getCombosComerciales({

                    page,

                    size: pageSize,

                    search: debouncedSearch,

                    estado: estadoFilter === "ALL" ? undefined : estadoFilter

                });

                if (cancelled) return;

                setCombos(data.content);

                setTotalElementos(data.totalElements);

                setTotalPaginas(data.totalPages);

                setError(null);

            } catch {

                if (!cancelled) setError("No se pudieron cargar los combos comerciales.");

            } finally {

                if (!cancelled) setLoading(false);

            }

        }

        loadCombos();

        return () => { cancelled = true; };

    }, [debouncedSearch, estadoFilter, page, pageSize, refreshToken]);

    const cards = useMemo(
        () => combos.map(mapComboComercialToCard),
        [combos]
    );

    const stats = useMemo(() => ({

        total: totalElementos

    }), [totalElementos]);

    function refetch() {

        setRefreshToken(token => token + 1);

    }

    async function createCombo(data) {

        await comboComercialService.createComboComercial(data);

        refetch();

    }

    async function updateCombo(comboId, updates) {

        await comboComercialService.updateComboComercial(comboId, updates);

        refetch();

    }

    async function activarCombo(comboId) {

        await comboComercialService.activarComboComercial(comboId);

        refetch();

    }

    async function desactivarCombo(comboId) {

        await comboComercialService.desactivarComboComercial(comboId);

        refetch();

    }

    return {

        loading,

        error,

        combos: cards,

        stats,

        totalPaginas,

        createCombo,

        updateCombo,

        activarCombo,

        desactivarCombo

    };

}
