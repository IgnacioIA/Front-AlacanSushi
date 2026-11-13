// src/public/order/whatsappMessageBuilder.js
//
// Función pura (sin JSX, sin window.*, testeable) que arma el texto
// prearmado del pedido. WhatsApp no es una integración de la API — es 100%
// responsabilidad del frontend (docs/frontend/integration 27-8-2026/
// V1-SCOPE.md §4.6): el pedido ya quedó persistido antes de este paso,
// independientemente de si el mensaje se llega a enviar.

import { formatPrice } from "../utils/formatPrice";

const TIPO_PEDIDO_LABEL = {

    SALON: "Comer en el local",

    DELIVERY: "Delivery",

    TAKEAWAY: "Retiro en el local"

};

export function buildWhatsappMessage(pedido) {

    const lines = [];

    lines.push(`Hola! Quiero confirmar mi pedido #${pedido.id}.`);

    lines.push(`Nombre: ${pedido.nombreCliente}`);

    lines.push(`Teléfono: ${pedido.telefonoCliente}`);

    lines.push(`Tipo: ${TIPO_PEDIDO_LABEL[pedido.tipoPedido] ?? pedido.tipoPedido}`);

    if (pedido.direccion) lines.push(`Dirección: ${pedido.direccion}`);

    lines.push("");

    lines.push("Items:");

    pedido.items.forEach(item => {

        lines.push(`- ${item.cantidad}x ${item.nombre} (${formatPrice(item.subtotal)})`);

    });

    lines.push("");

    lines.push(`Total: ${formatPrice(pedido.total)}`);

    return lines.join("\n");

}

// `phoneNumber` en formato internacional sin "+" (ver VITE_WHATSAPP_NUMBER,
// .env.example) — ningún contrato de la API lo define, es 100% dato de
// configuración del frontend.
export function buildWhatsappUrl(pedido, phoneNumber) {

    const message = buildWhatsappMessage(pedido);

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

}
