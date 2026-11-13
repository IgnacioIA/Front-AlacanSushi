// src/components/Comercial/ProductosComerciales/hooks/useActiveProductosComerciales.js
//
// Único consumidor previsto: el picker de componentes de Combo Comercial
// (Combo se compone de Producto Comercial, ver
// docs/frontend/integration 27-8-2026/V1-COMMERCIAL-CATALOG.md §7) — no es un
// catálogo compartido entre módulos de dominio distintos (mismo criterio que
// useMeasurementUnits.js: se promueve a src/services/catalogs/ recién si un
// segundo módulo de dominio ajeno a Comercial lo necesitara).
//
// A diferencia del listado paginado de la página principal, un picker de
// combo necesita "todos los productos activos disponibles para elegir" en
// un único combo box — se pide con un `size` grande en vez de agregar
// paginación a un `<select>`. El contrato no ofrece "sin paginación": es una
// simplificación explícita de esta ronda (ver docs/frontend/integration
// 27-8-2026/consultar-productos-comerciales.md, sin flag "todos").
const PICKER_PAGE_SIZE = 200;

import { useEffect, useState } from "react";

import productoComercialService from "../services/productoComercialService";
import { mapProductoComercialToCard } from "../model/productoComercialMapper";

export default function useActiveProductosComerciales() {

    const [productos, setProductos] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        let cancelled = false;

        async function loadProductos() {

            try {

                const data = await productoComercialService.getProductosComerciales({

                    page: 0,

                    size: PICKER_PAGE_SIZE,

                    estado: "ACTIVO"

                });

                if (!cancelled) setProductos(data.content.map(mapProductoComercialToCard));

            } catch {

                if (!cancelled) setProductos([]);

            } finally {

                if (!cancelled) setLoading(false);

            }

        }

        loadProductos();

        return () => { cancelled = true; };

    }, []);

    return { productos, loading };

}
