// src/components/Comercial/CombosComerciales/components/CombosComercialesToolbar/CombosComercialesToolbar.jsx

import Toolbar from "../../../../Toolbar/Toolbar";
import SearchBar from "../../../../SearchBar/SearchBar";

import "./CombosComercialesToolbar.css";

export default function CombosComercialesToolbar({

    searchTerm,

    onSearchChange,

    estadoFilter,

    onEstadoFilterChange,

    onCreateCombo

}) {

    return (

        <Toolbar>

            <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar combo comercial..."
            />

            <div className="CombosComercialesToolbar-Controls">

                <select
                    className="CombosComercialesToolbar-Select"
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
                    className="CombosComercialesToolbar-CreateButton"
                    onClick={onCreateCombo}
                >
                    + Nuevo combo
                </button>

            </div>

        </Toolbar>

    );

}
