// src/components/Comercial/CombosComerciales/model/comboComercialMapper.js
//
// Frontera entre el DTO de Combo Comercial y el modelo que consume la UI.
// Nota de contrato importante: acá el componente usa la clave
// `productoComercialId` (ver crear-combo-comercial.md) — en el catálogo
// público (`/catalogo`) el mismo dato viaja como `productoId`. Son dos
// contratos distintos, no se asume que compartan nombre de campo.

export function mapComboComercialToCard(dto) {

    return {

        id: dto.id,

        name: dto.nombre,

        description: dto.descripcion ?? "",

        price: dto.precio,

        image: dto.imagen ?? null,

        active: dto.activo,

        componentes: (dto.componentes ?? []).map(componente => ({

            productoComercialId: componente.productoComercialId,

            name: componente.nombre,

            quantity: componente.cantidad

        }))

    };

}

// UI → DTO: arma el body de POST /admin/comercial/combos. `componentes` sale
// ya con la forma { productoComercialId, cantidad } (ver
// useComboComercialForm.buildPayload).
export function mapFormToCreateRequest(payload) {

    return {

        nombre: payload.name,

        descripcion: payload.description || null,

        precio: payload.price,

        imagen: payload.image || null,

        componentes: payload.componentes.map(componente => ({

            productoComercialId: componente.productoComercialId,

            cantidad: componente.quantity

        }))

    };

}

export function mapFormToUpdateRequest(payload) {

    return mapFormToCreateRequest(payload);

}
