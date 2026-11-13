// src/components/Comercial/ProductosComerciales/hooks/useProductosComerciales.js
//
// Datos reales de GET /admin/comercial/productos (paginado server-side) +
// mutaciones. `loading` sólo representa la primera carga, igual que
// useIngredients.js.
//
// NOTA DE VERIFICACIÓN (28-8-2026, probado contra el backend real): el
// contrato consultar-productos-comerciales.md documenta la respuesta como
// { contenido, totalElementos, totalPaginas, paginaActual } — el backend
// real responde con el mismo envelope que Ingredients/Producción:
// { content, totalElements, totalPages, page, size, first, last, empty }.
// Se sigue lo verificado contra el backend, no la documentación.

import { useEffect, useMemo, useState } from "react";

import productoComercialService from "../services/productoComercialService";
import { mapProductoComercialToCard } from "../model/productoComercialMapper";

const SEARCH_DEBOUNCE_MS = 350;

export default function useProductosComerciales({ searchTerm, estadoFilter, page, pageSize }) {

    const [productos, setProductos] = useState([]);

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

        async function loadProductos() {

            try {

                const data = await productoComercialService.getProductosComerciales({

                    page,

                    size: pageSize,

                    search: debouncedSearch,

                    estado: estadoFilter === "ALL" ? undefined : estadoFilter

                });

                if (cancelled) return;

                setProductos(data.content);

                setTotalElementos(data.totalElements);

                setTotalPaginas(data.totalPages);

                setError(null);

            } catch {

                if (!cancelled) setError("No se pudieron cargar los productos comerciales.");

            } finally {

                if (!cancelled) setLoading(false);

            }

        }

        loadProductos();

        return () => { cancelled = true; };

    }, [debouncedSearch, estadoFilter, page, pageSize, refreshToken]);

    const cards = useMemo(
        () => productos.map(mapProductoComercialToCard),
        [productos]
    );

    const stats = useMemo(() => ({

        total: totalElementos

    }), [totalElementos]);

    function refetch() {

        setRefreshToken(token => token + 1);

    }

    async function createProducto(data) {

        await productoComercialService.createProductoComercial(data);

        refetch();

    }

    async function updateProducto(productoId, updates) {

        await productoComercialService.updateProductoComercial(productoId, updates);

        refetch();

    }

    // A diferencia de Ingredients.deactivateIngredient, acá el endpoint puede
    // fallar de verdad (409 PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO) — se
    // deja pasar el error normalizado para que la página lo muestre de forma
    // distinguible, en vez de atraparlo acá.
    async function activarProducto(productoId) {

        await productoComercialService.activarProductoComercial(productoId);

        refetch();

    }

    async function desactivarProducto(productoId) {

        await productoComercialService.desactivarProductoComercial(productoId);

        refetch();

    }

    return {

        loading,

        error,

        productos: cards,

        stats,

        totalPaginas,

        createProducto,

        updateProducto,

        activarProducto,

        desactivarProducto

    };

}
