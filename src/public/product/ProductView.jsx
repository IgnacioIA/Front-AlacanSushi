// src/public/product/ProductView.jsx
//
// Vista presentacional del detalle de un Producto/Combo Comercial. Montada
// hoy como página completa (ver src/pages/public/Producto.jsx) — la doc deja
// abierto si en el futuro pasa a ser un drawer/modal sobre el catálogo; este
// componente no lo asume en ningún lado (no conoce routing, sólo recibe
// `item` y `onBack`).

import { useState } from "react";

import QuantityStepper from "../components/QuantityStepper/QuantityStepper";
import Button from "../components/Button/Button";
import StateMessage from "../components/StateMessage/StateMessage";
import { formatPrice } from "../utils/formatPrice";
import useCart from "../cart/useCart";

import "./ProductView.css";

export default function ProductView({

    item,

    loading,

    error,

    notFound,

    onRetry,

    onBack

}) {

    const cart = useCart();

    const [quantity, setQuantity] = useState(1);

    const [added, setAdded] = useState(false);

    if (loading) {

        return <StateMessage title="Cargando producto..." />;

    }

    if (error) {

        return (

            <StateMessage
                title="No pudimos cargar este producto"
                description={error}
                action={<Button variant="secondary" onClick={onRetry}>Reintentar</Button>}
            />

        );

    }

    if (notFound) {

        return (

            <StateMessage
                title="No encontramos este producto"
                description="Puede que ya no esté disponible en el catálogo."
                action={<Button variant="secondary" onClick={onBack}>Volver al catálogo</Button>}
            />

        );

    }

    function handleAddToCart() {

        cart.addItem({

            tipo: item.tipo,

            id: item.id,

            name: item.name,

            price: item.price,

            image: item.image,

            quantity,

            observacion: ""

        });

        setAdded(true);

    }

    return (

        <div className="ProductView">

            <div className="ProductView-Image">
                {item.image && <img src={item.image} alt="" />}
            </div>

            <div className="ProductView-Body">

                <h1 className="ProductView-Name">{item.name}</h1>

                <p className="ProductView-Price">{formatPrice(item.price)}</p>

                {item.description && (
                    <p className="ProductView-Description">{item.description}</p>
                )}

                {item.tipo === "COMBO" && item.componentes.length > 0 && (

                    <div className="ProductView-Componentes">

                        <h2>Incluye</h2>

                        <ul>
                            {item.componentes.map(componente => (
                                <li key={componente.productoId}>
                                    {componente.quantity}x {componente.name}
                                </li>
                            ))}
                        </ul>

                    </div>

                )}

            </div>

            <div className="ProductView-Footer">

                <QuantityStepper
                    quantity={quantity}
                    onIncrease={() => { setQuantity(current => current + 1); setAdded(false); }}
                    onDecrease={() => { setQuantity(current => Math.max(1, current - 1)); setAdded(false); }}
                />

                <Button onClick={handleAddToCart}>
                    {added ? "Agregado ✓" : `Agregar · ${formatPrice(item.price * quantity)}`}
                </Button>

            </div>

        </div>

    );

}
