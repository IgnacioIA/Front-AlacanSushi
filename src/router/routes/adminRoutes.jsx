// src/router/routes/adminRoutes.js

import Ingredientes from "../../pages/private/Ingredientes"
import Productos from "../../pages/private/Productos"
import Recetas from "../../pages/private/Recetas"
import Pedidos from "../../pages/private/Pedidos"
import PanelPedidos from "../../pages/private/PanelPedidos"
import ComercialProductos from "../../pages/private/ComercialProductos"
import ComercialCombos from "../../pages/private/ComercialCombos"

const adminRoutes = [
  {
    path: "ingredientes",
    element: <Ingredientes />,
    title: "Ingredientes",
  },
  {
    path: "productos",
    element: <Productos />,
    title: "Productos",
  },
  {
    path: "recetas",
    element: <Recetas />,
    title: "Recetas",
  },
  {
    path: "pedidos",
    element: <Pedidos />,
    title: "Pedidos",
  },
  {
    path: "PanelPedidos",
    element: <PanelPedidos />,
    title: "Panel de Pedidos",
  },
  {
    path: "comercial/productos",
    element: <ComercialProductos />,
    title: "Productos Comerciales",
  },
  {
    path: "comercial/combos",
    element: <ComercialCombos />,
    title: "Combos Comerciales",
  },

]

export default adminRoutes