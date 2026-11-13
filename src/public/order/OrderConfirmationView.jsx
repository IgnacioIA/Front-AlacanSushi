// src/public/order/OrderConfirmationView.jsx
//
// Vista presentacional de la confirmación. Abrir WhatsApp es la única
// acción con efecto de lado (window.open) — vive acá porque es una
// consecuencia directa de "ver la confirmación", no una regla de negocio
// (V1-SCOPE.md §4.6: la API ya persistió el pedido antes de este paso,
// independientemente de si el mensaje se envía).

import Button from "../components/Button/Button";
import StateMessage from "../components/StateMessage/StateMessage";
import { formatPrice } from "../utils/formatPrice";
import { buildWhatsappUrl } from "./whatsappMessageBuilder";

import "./OrderConfirmationView.css";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

export default function OrderConfirmationView({

    pedido,

    loading,

    error,

    onGoToCatalog

}) {

    if (loading) {

        return <StateMessage title="Buscando tu pedido..." />;

    }

    if (error || !pedido) {

        return (

            <StateMessage
                title="No pudimos mostrar este pedido"
                description={error ?? "Pedido no encontrado."}
                action={<Button variant="secondary" onClick={onGoToCatalog}>Volver al catálogo</Button>}
            />

        );

    }

    function handleSendWhatsapp() {

        const url = buildWhatsappUrl(pedido, WHATSAPP_NUMBER);

        window.open(url, "_blank", "noopener,noreferrer");

    }

    return (

        <div className="OrderConfirmationView">

            <StateMessage
                title={`¡Pedido #${pedido.id} recibido!`}
                description="Guardamos tu pedido. Enviánoslo por WhatsApp para que lo confirmemos."
            />

            <div className="OrderConfirmationView-Items">

                {pedido.items.map((item, index) => (

                    <div className="OrderConfirmationView-Item" key={index}>
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span>{formatPrice(item.subtotal)}</span>
                    </div>

                ))}

            </div>

            <div className="OrderConfirmationView-Total">
                <span>Total</span>
                <strong>{formatPrice(pedido.total)}</strong>
            </div>

            <Button onClick={handleSendWhatsapp}>Enviar por WhatsApp</Button>

            <Button variant="secondary" onClick={onGoToCatalog}>Volver al catálogo</Button>

        </div>

    );

}
