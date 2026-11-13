// src/router/routes/publicRoutes.jsx
//
// Rutas del frontend público (cliente final) — independiente de
// adminRoutes.jsx, montadas bajo PublicLayout + CartProvider en
// AppRouter.jsx. Producto/Carrito se implementan como páginas completas por
// ahora (ver src/public/product/ProductView.jsx, src/public/cart/CartView.jsx)
// — la doc deja abierto si más adelante pasan a ser drawers/overlays; ese
// cambio sólo tocaría estos wrappers de ruta, no las vistas ni la lógica.

import Catalogo from "../../pages/public/Catalogo"
import Producto from "../../pages/public/Producto"
import Carrito from "../../pages/public/Carrito"
import Checkout from "../../pages/public/Checkout"
import ConfirmacionPedido from "../../pages/public/ConfirmacionPedido"

const publicRoutes = [
  {
    path: "",
    element: <Catalogo />,
    title: "Catálogo",
  },
  {
    path: "producto/:itemId",
    element: <Producto />,
    title: "Producto",
  },
  {
    path: "carrito",
    element: <Carrito />,
    title: "Carrito",
  },
  {
    path: "checkout",
    element: <Checkout />,
    title: "Checkout",
  },
  {
    path: "pedido/:pedidoId/confirmacion",
    element: <ConfirmacionPedido />,
    title: "Confirmación de pedido",
  },
]

export default publicRoutes
