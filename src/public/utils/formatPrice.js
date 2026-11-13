// src/public/utils/formatPrice.js
//
// Mismo criterio de formato que ya usa el panel admin (OrderMeta.jsx,
// `$${total.toLocaleString()}`) — sin agregar una librería de formato de
// moneda ni decidir símbolo/localización distinta a la ya usada en el
// proyecto.

export function formatPrice(value) {

    if (value == null) return "";

    return `$${value.toLocaleString()}`;

}
