// src/pages/public/Catalogo.jsx
//
// Wrapper fino de ruta — mismo criterio que las páginas admin en
// src/pages/private/*.jsx: sólo conecta el hook de datos con la vista.

import CatalogView from "../../public/catalog/CatalogView";
import useCatalogo from "../../public/catalog/hooks/useCatalogo";

function Catalogo() {

    const { items, loading, error, refetch } = useCatalogo();

    return (
        <CatalogView
            items={items}
            loading={loading}
            error={error}
            onRetry={refetch}
        />
    );

}

export default Catalogo;
