// src/public/order/model/pedidoMapper.js
//
// Frontera entre el frontend público y los DTOs de Pedido. `canal` se fija
// acá en "WEB", nunca lo elige el usuario (docs/frontend/integration
// 27-8-2026/V1-SCOPE.md §4.6: "el primer canal público de la V1 será Web").

const CANAL_WEB = "WEB";

// UI → DTO: body de POST /pedidos.
export function mapCheckoutFormToCreateRequest(formPayload) {

    const request = {

        tipoPedido: formPayload.tipoPedido,

        canal: CANAL_WEB,

        nombreCliente: formPayload.nombreCliente,

        telefonoCliente: formPayload.telefonoCliente

    };

    if (formPayload.tipoPedido === "DELIVERY") {

        request.direccion = formPayload.direccion;

    }

    return request;

}

// UI → DTO: body de POST /pedidos/{id}/productos o /combos, según
// line.tipo. El precio nunca viaja acá — lo resuelve la API (pedido.md,
// "snapshot, no referencia viva").
export function mapCartLineToAgregarRequest(line) {

    const request = {

        cantidad: line.quantity

    };

    if (line.observacion) request.observacion = line.observacion;

    if (line.tipo === "PRODUCTO") {

        request.productoId = line.id;

    } else {

        request.comboId = line.id;

    }

    return request;

}

// DTO → UI: respuesta de GET /pedidos/{id}, ya con precio/subtotal/total
// resueltos por el backend.
export function mapPedidoDtoToView(dto) {

    return {

        id: dto.id,

        estado: dto.estado,

        tipoPedido: dto.tipoPedido,

        canal: dto.canal,

        nombreCliente: dto.nombreCliente,

        telefonoCliente: dto.telefonoCliente,

        direccion: dto.direccion ?? null,

        items: (dto.items ?? []).map(item => ({

            nombre: item.nombre,

            precioUnitario: item.precioUnitario,

            cantidad: item.cantidad,

            subtotal: item.subtotal

        })),

        total: dto.total

    };

}
