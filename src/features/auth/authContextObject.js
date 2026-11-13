// src/features/auth/authContextObject.js
//
// Mismo criterio que src/public/cart/cartContextObject.js: el objeto Context
// vive aparte para que AuthContext.jsx sólo exporte el Provider (ESLint
// react-refresh/only-export-components).

import { createContext } from "react";

const AuthContext = createContext(null);

export default AuthContext;
