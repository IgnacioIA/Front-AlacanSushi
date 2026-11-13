import { useNavigate, useParams } from "react-router-dom";

import OrderConfirmationView from "../../public/order/OrderConfirmationView";
import usePedido from "../../public/order/hooks/usePedido";

function ConfirmacionPedido() {

    const { pedidoId } = useParams();

    const navigate = useNavigate();

    const { pedido, loading, error } = usePedido(pedidoId);

    return (
        <OrderConfirmationView
            pedido={pedido}
            loading={loading}
            error={error}
            onGoToCatalog={() => navigate("/")}
        />
    );

}

export default ConfirmacionPedido;
