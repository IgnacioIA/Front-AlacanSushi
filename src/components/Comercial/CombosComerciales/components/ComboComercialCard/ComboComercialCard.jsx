// src/components/Comercial/CombosComerciales/components/ComboComercialCard/ComboComercialCard.jsx

import Card from "../../../../Card/Card";
import DropdownMenu from "../../../../DropdownMenu/DropdownMenu";

import "./ComboComercialCard.css";

export default function ComboComercialCard({

    combo,

    onOpenDetails,

    onEdit,

    onToggleActive

}) {

    const menuItems = [

        { id: "edit", label: "Editar", onClick: () => onEdit(combo) },

        combo.active
            ? { id: "deactivate", label: "Desactivar", variant: "danger", onClick: () => onToggleActive(combo) }
            : { id: "activate", label: "Activar", onClick: () => onToggleActive(combo) }

    ];

    return (

        <Card className="ComboComercialCard" onClick={() => onOpenDetails(combo)}>

            {combo.image && (

                <div className="ComboComercialCard-Image">
                    <img src={combo.image} alt="" />
                </div>

            )}

            <header className="ComboComercialCard-Header">

                <h3 className="ComboComercialCard-Name">{combo.name}</h3>

                <DropdownMenu items={menuItems} />

            </header>

            <p className="ComboComercialCard-Price">
                ${combo.price?.toLocaleString()}
            </p>

            <p className="ComboComercialCard-Componentes">
                {combo.componentes.length} producto{combo.componentes.length === 1 ? "" : "s"}
            </p>

            <span className={`ComboComercialCard-Badge ${combo.active ? "active" : "inactive"}`}>
                {combo.active ? "Activo" : "Inactivo"}
            </span>

        </Card>

    );

}
