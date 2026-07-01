import "./OrderPanel.css";

import PanelHeader from "./components/PanelHeader/PanelHeader";
import OrderColumn from "./components/OrderColumn/OrderColumn";
import OrderFormModal from "./components/OrderFormModal/OrderFormModal";
import OrderForm from "./components/OrderForm/OrderForm";

import useOrders from "./hooks/useOrders";
import useOrderPanel from "./hooks/useOrderPanel";
import { ORDER_COLUMNS } from "./constants/orderColumns";

export default function OrderPanel() {

    const {

        loading,

        columns,

        dispatchOrderAction,

        createOrder,

        updateOrder

    } = useOrders();

    const {

        isModalOpen,

        editingOrder,

        formSessionId,

        openCreateModal,

        openEditModal,

        closeModal

    } = useOrderPanel();

    if (loading) {

        return (

            <section className="OrderPanel">

                <p>Cargando pedidos...</p>

            </section>

        );

    }

    async function handleSubmit(orderData) {

        if (editingOrder) {

            await updateOrder(editingOrder.id, orderData);

        } else {

            await createOrder(orderData);

        }

        closeModal();

    }

    return (

        <section className="OrderPanel">

            <PanelHeader onCreateOrder={openCreateModal} />

            <div className="OrderPanel-Columns">

                {ORDER_COLUMNS.map(column => (

                    <OrderColumn

                        key={column.id}

                        title={column.title}

                        orders={columns[column.id]}

                        onAction={dispatchOrderAction}

                        onEdit={openEditModal}

                    />

                ))}

            </div>

            <OrderFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingOrder ? `Editar pedido #${editingOrder.id}` : "Nuevo pedido"}
            >

                <OrderForm
                    key={formSessionId}
                    initialData={editingOrder}
                    onCancel={closeModal}
                    onSubmit={handleSubmit}
                />

            </OrderFormModal>

        </section>

    );

}
