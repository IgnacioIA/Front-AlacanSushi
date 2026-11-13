// src/public/catalog/CatalogView.jsx
//
// Vista presentacional del catálogo. Contempla los 4 estados que pide el
// prompt de esta etapa (loading → success → empty → error) — una lista
// vacía es una respuesta válida de la API (catalogo-publico.md), no un error.

import CatalogItemCard from "./components/CatalogItemCard/CatalogItemCard";
import StateMessage from "../components/StateMessage/StateMessage";
import Button from "../components/Button/Button";
import useCart from "../cart/useCart";

import "./CatalogView.css";

export default function CatalogView({

    items,

    loading,

    error,

    onRetry

}) {

    const cart = useCart();

    function handleAdd(item) {

        cart.addItem({

            tipo: item.tipo,

            id: item.id,

            name: item.name,

            price: item.price,

            image: item.image,

            quantity: 1,

            observacion: ""

        });

    }

    if (loading) {

        return <StateMessage title="Cargando el menú..." />;

    }

    if (error) {

        return (

            <StateMessage
                title="No pudimos cargar el catálogo"
                description={error}
                action={<Button variant="secondary" onClick={onRetry}>Reintentar</Button>}
            />

        );

    }

    if (items.length === 0) {

        return (

            <StateMessage
                title="Todavía no hay nada publicado"
                description="El restaurante no cargó productos en el catálogo por ahora."
            />

        );

    }

    return (

        <div className="CatalogView">

            {items.map(item => (

                <CatalogItemCard
                    key={`${item.tipo}-${item.id}`}
                    item={item}
                    onAdd={handleAdd}
                />

            ))}

        </div>

    );

}
