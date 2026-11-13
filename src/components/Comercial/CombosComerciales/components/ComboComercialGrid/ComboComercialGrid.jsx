// src/components/Comercial/CombosComerciales/components/ComboComercialGrid/ComboComercialGrid.jsx

import ComboComercialCard from "../ComboComercialCard/ComboComercialCard";
import EmptyStateCard from "../../../../EmptyStateCard/EmptyStateCard";

import "./ComboComercialGrid.css";

export default function ComboComercialGrid({

    combos,

    onAddNew,

    onOpenDetails,

    onEdit,

    onToggleActive

}) {

    return (

        <div className="ComboComercialGrid">

            <EmptyStateCard
                label="Agregar combo"
                onClick={onAddNew}
            />

            {combos.map(combo => (

                <ComboComercialCard
                    key={combo.id}
                    combo={combo}
                    onOpenDetails={onOpenDetails}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                />

            ))}

        </div>

    );

}
