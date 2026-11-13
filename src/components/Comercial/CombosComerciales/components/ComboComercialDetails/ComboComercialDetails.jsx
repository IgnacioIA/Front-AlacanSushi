// src/components/Comercial/CombosComerciales/components/ComboComercialDetails/ComboComercialDetails.jsx

import "./ComboComercialDetails.css";

export default function ComboComercialDetails({ combo }) {

    return (

        <div className="ComboComercialDetails">

            {combo.image && (

                <div className="ComboComercialDetails-Image">
                    <img src={combo.image} alt="" />
                </div>

            )}

            <div className="ComboComercialDetails-Row">

                <span className="ComboComercialDetails-Label">Precio</span>

                <span className="ComboComercialDetails-Value">
                    ${combo.price?.toLocaleString()}
                </span>

            </div>

            <div className="ComboComercialDetails-Row">

                <span className="ComboComercialDetails-Label">Estado</span>

                <span className="ComboComercialDetails-Value">
                    {combo.active ? "Activo" : "Inactivo"}
                </span>

            </div>

            {combo.description && (

                <div className="ComboComercialDetails-Description">

                    <span className="ComboComercialDetails-Label">Descripción</span>

                    <p>{combo.description}</p>

                </div>

            )}

            <div className="ComboComercialDetails-Componentes">

                <span className="ComboComercialDetails-Label">Componentes</span>

                <ul>
                    {combo.componentes.map(componente => (
                        <li key={componente.productoComercialId}>
                            {componente.quantity}x {componente.name}
                        </li>
                    ))}
                </ul>

            </div>

        </div>

    );

}
