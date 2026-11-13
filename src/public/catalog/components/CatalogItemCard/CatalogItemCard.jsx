// src/public/catalog/components/CatalogItemCard/CatalogItemCard.jsx
//
// Presentacional: recibe el item ya mapeado y una función `onAdd` (agregar
// 1 unidad directo desde la grilla, sin pasar por el detalle). Navegar al
// detalle es responsabilidad del padre via react-router — esta tarjeta no
// decide si el detalle es una página, un drawer o un modal (ver
// docs/frontend/integration 27-8-2026/V1-COMMERCIAL-CATALOG.md, la doc deja
// esto abierto a la etapa de diseño visual).

import { Link } from "react-router-dom";

import { formatPrice } from "../../../utils/formatPrice";

import "./CatalogItemCard.css";

export default function CatalogItemCard({

    item,

    onAdd

}) {

    return (

        <article className="CatalogItemCard">

            <Link to={`/producto/${item.tipo.toLowerCase()}-${item.id}`} className="CatalogItemCard-Link">

                <div className="CatalogItemCard-Image">
                    {item.image && <img src={item.image} alt="" />}
                    {item.tipo === "COMBO" && (
                        <span className="CatalogItemCard-Badge">Combo</span>
                    )}
                </div>

                <div className="CatalogItemCard-Info">

                    <h3 className="CatalogItemCard-Name">{item.name}</h3>

                    {item.description && (
                        <p className="CatalogItemCard-Description">{item.description}</p>
                    )}

                    <p className="CatalogItemCard-Price">{formatPrice(item.price)}</p>

                </div>

            </Link>

            <button
                type="button"
                className="CatalogItemCard-AddButton"
                onClick={() => onAdd(item)}
                aria-label={`Agregar ${item.name} al carrito`}
            >
                +
            </button>

        </article>

    );

}
