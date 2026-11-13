// src/public/catalog/hooks/useCatalogo.js
//
// GET /catalogo no pagina ni filtra (ver catalogo-publico.md) — trae todo de
// una vez. Sin caché entre pantallas todavía: cada página pública que
// necesita el catálogo (Catalogo, Producto) vuelve a pedirlo. Es una
// simplificación deliberada de esta ronda (el catálogo público no tiene hoy
// evidencia de volumen que justifique una capa de caché) — si eso cambia,
// el punto de extensión natural es este hook, no cada pantalla.

import { useEffect, useState } from "react";

import catalogoPublicoService from "../services/catalogoPublicoService";
import { mapCatalogoItem } from "../model/catalogoMapper";

export default function useCatalogo() {

    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [refreshToken, setRefreshToken] = useState(0);

    useEffect(() => {

        let cancelled = false;

        async function loadCatalogo() {

            try {

                setLoading(true);

                const data = await catalogoPublicoService.getCatalogo();

                if (cancelled) return;

                setItems(data.map(mapCatalogoItem));

                setError(null);

            } catch {

                if (!cancelled) setError("No pudimos cargar el catálogo. Probá de nuevo en un momento.");

            } finally {

                if (!cancelled) setLoading(false);

            }

        }

        loadCatalogo();

        return () => { cancelled = true; };

    }, [refreshToken]);

    function refetch() {

        setRefreshToken(token => token + 1);

    }

    return { items, loading, error, refetch };

}
