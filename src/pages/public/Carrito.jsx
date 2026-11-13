import { useNavigate } from "react-router-dom";

import CartView from "../../public/cart/CartView";

function Carrito() {

    const navigate = useNavigate();

    return (
        <CartView
            onCheckout={() => navigate("/checkout")}
            onGoToCatalog={() => navigate("/")}
        />
    );

}

export default Carrito;
