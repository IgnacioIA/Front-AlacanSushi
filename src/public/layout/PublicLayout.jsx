// src/public/layout/PublicLayout.jsx
//
// Shell mobile-first del frontend público: header simple + acceso al
// carrito con badge. No es una adaptación de AdminLayout (sidebar de
// escritorio) — es su propio shell, pensado para pantallas angostas
// primero (ver prompt de esta etapa, sección "Mobile-first").

import { Outlet, Link } from "react-router-dom";

import useCart from "../cart/useCart";

import "./PublicLayout.css";

export default function PublicLayout() {

    const cart = useCart();

    return (

        <div className="PublicLayout">

            <header className="PublicLayout-Header">

                <Link to="/" className="PublicLayout-Brand">
                    Alacán
                </Link>

                <Link to="/carrito" className="PublicLayout-CartLink" aria-label="Ver carrito">

                    🛒

                    {cart.itemCount > 0 && (
                        <span className="PublicLayout-CartBadge">{cart.itemCount}</span>
                    )}

                </Link>

            </header>

            <main className="PublicLayout-Content">
                <Outlet />
            </main>

        </div>

    );

}
