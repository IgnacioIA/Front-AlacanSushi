// src/components/Comercial/ProductosComerciales/components/ProductosComercialesToolbar/ProductosComercialesToolbar.jsx

import Toolbar from "../../../../Toolbar/Toolbar";
import SearchBar from "../../../../SearchBar/SearchBar";

import "./ProductosComercialesToolbar.css";

export default function ProductosComercialesToolbar({

    searchTerm,

    onSearchChange,

    estadoFilter,

    onEstadoFilterChange,

    onCreateProducto

}) {

    return (

        <Toolbar>

            <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar producto comercial..."
            />

            <div className="ProductosComercialesToolbar-Controls">

                <select
                    className="ProductosComercialesToolbar-Select"
                    value={estadoFilter}
                    onChange={event => onEstadoFilterChange(event.target.value)}
                    aria-label="Filtrar por estado"
                >
                    <option value="ALL">Todos los estados</option>
                    <option value="ACTIVO">Activos</option>
                    <option value="INACTIVO">Inactivos</option>
                </select>

                <button
                    type="button"
                    className="ProductosComercialesToolbar-CreateButton"
                    onClick={onCreateProducto}
                >
                    + Nuevo producto
                </button>

            </div>

        </Toolbar>

    );

}
