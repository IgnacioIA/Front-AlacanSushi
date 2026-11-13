// src/public/cart/cartLogic.js
//
// Funciones puras sobre el arreglo de líneas del carrito — sin JSX, sin
// HTTP, sin conocer React. El carrito es 100% responsabilidad del frontend,
// no existe ningún endpoint de "carrito" en la API (ver
// docs/frontend/integration 27-8-2026/FRONTEND-READINESS.md, sección A).
//
// Cada línea: { key, tipo: "PRODUCTO"|"COMBO", id, name, price, image,
// quantity, observacion }. `price`/`name` son una fotografía tomada al
// agregar (igual que hace el propio backend con ItemProducto/ItemCombo) —
// sólo para mostrar en el carrito; el precio real que se cobra siempre lo
// resuelve la API al confirmar el pedido (ver pedido.md, "snapshot, no
// referencia viva"), nunca este valor local.

export function keyFor(tipo, id) {

    return `${tipo}-${id}`;

}

export function addItem(items, item) {

    const key = keyFor(item.tipo, item.id);

    const existing = items.find(line => line.key === key);

    if (existing) {

        return items.map(line =>
            line.key === key
                ? { ...line, quantity: line.quantity + item.quantity }
                : line
        );

    }

    return [...items, { ...item, key }];

}

export function removeItem(items, key) {

    return items.filter(line => line.key !== key);

}

export function setQuantity(items, key, quantity) {

    if (quantity <= 0) return removeItem(items, key);

    return items.map(line =>
        line.key === key ? { ...line, quantity } : line
    );

}

export function setObservacion(items, key, observacion) {

    return items.map(line =>
        line.key === key ? { ...line, observacion } : line
    );

}

export function getTotal(items) {

    return items.reduce((sum, line) => sum + line.price * line.quantity, 0);

}

export function getItemCount(items) {

    return items.reduce((sum, line) => sum + line.quantity, 0);

}
