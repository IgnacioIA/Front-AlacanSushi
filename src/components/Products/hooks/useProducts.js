// src/components/Products/hooks/useProducts.js

import { useEffect, useMemo, useState } from "react";

import productService from "../services/productService";
import { mapProductToCard } from "../model/productMapper";

export default function useProducts() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {

        async function loadProducts() {

            try {

                const data = await productService.getProducts();

                setProducts(data);

                setError(null);

            } catch {

                setError("No se pudieron cargar los productos.");

            } finally {

                setLoading(false);

            }

        }

        loadProducts();

        const unsubscribe = productService.subscribeProducts(setProducts);

        return unsubscribe;

    }, []);

    const cards = useMemo(
        () => products.map(mapProductToCard),
        [products]
    );

    const stats = useMemo(() => ({

        total: products.length,

        lowStockCount: products.filter(product => product.stockLevel === "LOW").length

    }), [products]);

    async function createProduct(data) {

        try {

            await productService.createProduct(data);

            setError(null);

        } catch {

            setError("No se pudo crear el producto.");

        }

    }

    async function updateProduct(productId, updates) {

        try {

            await productService.updateProduct(productId, updates);

            setError(null);

        } catch {

            setError("No se pudo actualizar el producto.");

        }

    }

    async function deleteProduct(productId) {

        try {

            await productService.deleteProduct(productId);

            setError(null);

        } catch {

            setError("No se pudo eliminar el producto.");

        }

    }

    async function produceProduct(productId, produceData) {

        try {

            await productService.produceProduct(productId, produceData);

            setError(null);

        } catch {

            setError("No se pudo iniciar la producción.");

        }

    }

    return {

        loading,

        error,

        products: cards,

        stats,

        createProduct,

        updateProduct,

        deleteProduct,

        produceProduct

    };

}
