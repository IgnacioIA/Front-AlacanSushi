// src/public/product/hooks/useProductoPublico.js
//
// No existe un GET /catalogo/{id} (catalogo-publico.md sólo documenta el
// listado completo) — el detalle de un producto/combo se resuelve buscando
// dentro del mismo GET /catalogo ya traído por useCatalogo. `itemId` llega
// como "<tipo>-<id>" (ver CatalogItemCard, ruta /producto/:itemId) para
// distinguir un Producto Comercial y un Combo Comercial que podrían
// compartir el mismo id numérico (son dos entidades distintas, sin id
// unificado en el contrato).

import { useMemo } from "react";

import useCatalogo from "../../catalog/hooks/useCatalogo";

function parseItemId(itemId) {

    const [tipoSlug, ...idParts] = (itemId ?? "").split("-");

    return {

        tipo: (tipoSlug ?? "").toUpperCase(),

        id: idParts.join("-")

    };

}

export default function useProductoPublico(itemId) {

    const { items, loading, error, refetch } = useCatalogo();

    const { tipo, id } = parseItemId(itemId);

    const item = useMemo(

        () => items.find(candidate => candidate.tipo === tipo && String(candidate.id) === id) ?? null,

        [items, tipo, id]

    );

    return {

        item,

        loading,

        error,

        notFound: !loading && !error && !item,

        retry: refetch

    };

}
