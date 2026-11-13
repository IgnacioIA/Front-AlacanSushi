import { useNavigate, useParams } from "react-router-dom";

import ProductView from "../../public/product/ProductView";
import useProductoPublico from "../../public/product/hooks/useProductoPublico";

function Producto() {

    const { itemId } = useParams();

    const navigate = useNavigate();

    const { item, loading, error, notFound, retry } = useProductoPublico(itemId);

    return (
        <ProductView
            item={item}
            loading={loading}
            error={error}
            notFound={notFound}
            onRetry={retry}
            onBack={() => navigate("/")}
        />
    );

}

export default Producto;
