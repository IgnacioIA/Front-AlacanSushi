// src/components/OrderPanel/services/productService.js
//
// Capa de acceso al catálogo de productos. Hoy resuelve contra mock;
// al integrar la API, sólo cambia la implementación interna de getProducts().
// El frontend no agrega lógica de negocio sobre el catálogo: únicamente
// expone lo que la fuente de datos (mock o API) entrega.

import mockProducts from "../mocks/mockProducts";

async function getProducts() {

    return [...mockProducts];

}

export default {
    getProducts
};
