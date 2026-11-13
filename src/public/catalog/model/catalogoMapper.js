// src/public/catalog/model/catalogoMapper.js
//
// Frontera entre el DTO de GET /catalogo y el modelo que consume la UI
// pública. Nota de contrato: acá el componente de un combo usa la clave
// `productoId` — en la administración de Combos Comerciales
// (POST/PUT /admin/comercial/combos) el mismo dato viaja como
// `productoComercialId`. Son dos contratos distintos (uno de lectura
// pública, otro administrativo) — no se asume que compartan nombre de campo.

export function mapCatalogoItem(dto) {

    return {

        id: dto.id,

        tipo: dto.tipo, // "PRODUCTO" | "COMBO" — discriminador de la proyección de lectura

        name: dto.nombre,

        description: dto.descripcion ?? "",

        price: dto.precio,

        image: dto.imagen ?? null,

        componentes: (dto.componentes ?? []).map(componente => ({

            productoId: componente.productoId,

            name: componente.nombre,

            quantity: componente.cantidad

        }))

    };

}
