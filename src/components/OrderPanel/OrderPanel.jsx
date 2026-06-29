import "./OrderPanel.css";

import PanelHeader from "./components/PanelHeader/PanelHeader";
import OrderColumn from "./components/OrderColumn/OrderColumn";

import useOrders from "./hooks/useOrders";
import { PANEL_COLUMNS } from "./constants/panelColumns";

export default function OrderPanel() {

    const {

        loading,

        columns,

        dispatchOrderAction

    } = useOrders();

    if (loading) {

        return (

            <section className="OrderPanel">

                <p>Cargando pedidos...</p>

            </section>

        );

    }

    return (

        <section className="OrderPanel">

            <PanelHeader />

            <div className="OrderPanel-Columns">

                {PANEL_COLUMNS.map(column => (

                    <OrderColumn

                        key={column.id}

                        title={column.title}

                        orders={columns[column.id]}

                        onAction={dispatchOrderAction}

                    />

                ))}

            </div>

        </section>

    );

}