// src/public/cart/CartContext.jsx
//
// Estado del carrito: local al frontend público, persistido en
// localStorage (para sobrevivir a un refresh de página en mobile — no
// existe ningún endpoint de carrito en la API). Envuelve sólo las rutas
// públicas (ver AppRouter.jsx) — el panel admin nunca lo monta.
//
// El objeto Context vive en cartContextObject.js y el hook de consumo en
// useCart.js — este archivo sólo exporta el componente Provider (ver nota
// de ESLint react-refresh/only-export-components).

import { useEffect, useMemo, useReducer } from "react";

import CartContext from "./cartContextObject";
import { addItem, getItemCount, getTotal, removeItem, setObservacion, setQuantity } from "./cartLogic";

const STORAGE_KEY = "alacan.public.cart";

function reducer(state, action) {

    switch (action.type) {

        case "ADD_ITEM":
            return addItem(state, action.item);

        case "REMOVE_ITEM":
            return removeItem(state, action.key);

        case "SET_QUANTITY":
            return setQuantity(state, action.key, action.quantity);

        case "SET_OBSERVACION":
            return setObservacion(state, action.key, action.observacion);

        case "CLEAR":
            return [];

        case "HYDRATE":
            return action.items;

        default:
            return state;

    }

}

function loadInitialState() {

    try {

        const raw = window.localStorage.getItem(STORAGE_KEY);

        return raw ? JSON.parse(raw) : [];

    } catch {

        return [];

    }

}

export function CartProvider({ children }) {

    const [items, dispatch] = useReducer(reducer, undefined, loadInitialState);

    useEffect(() => {

        try {

            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

        } catch {

            // localStorage puede no estar disponible (modo privado, cuota
            // llena) — el carrito sigue funcionando en memoria esa sesión.
        }

    }, [items]);

    const value = useMemo(() => ({

        items,

        total: getTotal(items),

        itemCount: getItemCount(items),

        addItem: item => dispatch({ type: "ADD_ITEM", item }),

        removeItem: key => dispatch({ type: "REMOVE_ITEM", key }),

        setQuantity: (key, quantity) => dispatch({ type: "SET_QUANTITY", key, quantity }),

        setObservacion: (key, observacion) => dispatch({ type: "SET_OBSERVACION", key, observacion }),

        clear: () => dispatch({ type: "CLEAR" })

    }), [items]);

    return (

        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>

    );

}
