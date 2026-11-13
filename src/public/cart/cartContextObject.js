// src/public/cart/cartContextObject.js
//
// El objeto Context vive en su propio archivo (no en CartContext.jsx) para
// que ese archivo sólo exporte el componente `CartProvider` y useCart.js
// sólo exporte el hook — ESLint (react-refresh/only-export-components) pide
// que un archivo de componente no mezcle otro tipo de export.

import { createContext } from "react";

const CartContext = createContext(null);

export default CartContext;
