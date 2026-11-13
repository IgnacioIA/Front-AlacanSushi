// src/components/Comercial/ProductosComerciales/model/productoComercialMapper.js
//
// Frontera entre el DTO de Producto Comercial (nombre, descripcion, precio,
// imagen, activo) y el modelo que consume la UI del panel. Bidireccional,
// mismo criterio que Ingredients/model/ingredientMapper.js.

export function mapProductoComercialToCard(dto) {

    return {

        id: dto.id,

        name: dto.nombre,

        description: dto.descripcion ?? "",

        price: dto.precio,

        image: dto.imagen ?? null,

        active: dto.activo

    };

}

// UI → DTO: arma el body de POST /admin/comercial/productos.
export function mapFormToCreateRequest(payload) {

    return {

        nombre: payload.name,

        descripcion: payload.description || null,

        precio: payload.price,

        imagen: payload.image || null

    };

}

// UI → DTO: arma el body de PUT /admin/comercial/productos/{id}. Mismo shape
// que la creación — el contrato es un reemplazo completo, no un PATCH.
export function mapFormToUpdateRequest(payload) {

    return mapFormToCreateRequest(payload);

}
