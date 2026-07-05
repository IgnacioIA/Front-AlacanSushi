// src/components/Toolbar/Toolbar.jsx
//
// Contenedor de layout genérico para barras de herramientas (buscador,
// filtros, ordenamiento, acciones). No conoce el contenido que recibe.

import "./Toolbar.css";

export default function Toolbar({ children }) {

    return (

        <div className="Toolbar">

            {children}

        </div>

    );

}
