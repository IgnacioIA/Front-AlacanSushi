// src/features/auth/AuthContext.jsx
//
// Estado de la sesión del panel: checking | authenticated | anonymous | error.
// Envuelve sólo las rutas /admin (ver AppRouter.jsx) — la web pública nunca
// consulta la sesión.
//
// - `error` es "no se pudo averiguar" (API caída, error de red), no
//   "sin sesión": la guarda ofrece reintentar en vez de mandar al login.
// - `versionRef` ordena las operaciones asincrónicas: cada consulta, login,
//   logout o 401 toma un número nuevo, y una respuesta sólo se aplica si
//   sigue siendo la última. Así una consulta de sesión lenta no pisa el
//   resultado de un login o logout posterior (ni la doble ejecución de
//   efectos de StrictMode).
// - Un 401 NO_AUTENTICADO en cualquier llamada (ver createHttpClient.js)
//   pasa a `anonymous`; `sessionExpired` permite avisar en el login.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AuthContext from "./authContextObject";
import authService from "./services/authService";
import { setUnauthorizedHandler } from "../../services/httpClient";

const CHECKING = { status: "checking", username: null, error: null, sessionExpired: false };

function fromSession(session) {

    return {

        status: session.authenticated ? "authenticated" : "anonymous",

        username: session.authenticated ? session.username : null,

        error: null,

        sessionExpired: false

    };

}

export function AuthProvider({ children }) {

    const [state, setState] = useState(CHECKING);

    const [checkToken, setCheckToken] = useState(0);

    const versionRef = useRef(0);

    // Mismo patrón que useCatalogo.js: la consulta vive dentro del efecto y
    // `checkToken` la vuelve a disparar desde "Reintentar".
    useEffect(() => {

        const version = ++versionRef.current;

        async function checkSession() {

            try {

                const session = await authService.getSession();

                if (version === versionRef.current) setState(fromSession(session));

            } catch (error) {

                if (version === versionRef.current) {

                    setState({ status: "error", username: null, error, sessionExpired: false });

                }

            }

        }

        checkSession();

    }, [checkToken]);

    useEffect(() => setUnauthorizedHandler(() => {

        versionRef.current += 1;

        setState(current => ({

            status: "anonymous",

            username: null,

            error: null,

            sessionExpired: current.status === "authenticated" || current.sessionExpired

        }));

    }), []);

    const retry = useCallback(() => {

        setState(CHECKING);

        setCheckToken(token => token + 1);

    }, []);

    // Los errores (credenciales inválidas, red) se propagan al formulario; el
    // estado sólo cambia si el servidor aceptó el login.
    const login = useCallback(async (username, password) => {

        const version = ++versionRef.current;

        const session = await authService.login(username, password);

        if (version === versionRef.current) setState(fromSession(session));

        return session;

    }, []);

    // Si el servidor rechaza el logout, el error se propaga y la sesión se
    // sigue considerando abierta (autenticacion.md, AUTH-04).
    const logout = useCallback(async () => {

        const version = ++versionRef.current;

        await authService.logout();

        if (version === versionRef.current) {

            setState({ status: "anonymous", username: null, error: null, sessionExpired: false });

        }

    }, []);

    const value = useMemo(() => ({

        ...state,

        retry,

        login,

        logout

    }), [state, retry, login, logout]);

    return (

        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>

    );

}
