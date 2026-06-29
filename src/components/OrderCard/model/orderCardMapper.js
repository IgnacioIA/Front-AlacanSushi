export function mapOrderToCard(order) {

    return {

        id: order.id,

        title: `Pedido #${order.id}`,

        orderType: order.orderType,

        paymentMethod: order.paymentMethod,

        customer: order.customer,

        total: order.total,

        items: order.items,

        actions: order.availableActions

    };

}