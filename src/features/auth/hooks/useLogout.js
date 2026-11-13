// src/features/auth/hooks/useLogout.js
//
// Cierre de sesión desde el panel. Si el servidor no confirma (red, 403),
// el error queda visible y la sesión no se da por cerrada: AuthContext sólo
// cambia de estado con un 204. Tras un logout correcto la guarda redirige
// sola al login (el estado pasa a `anonymous`).

import { useRef, useState } from "react";

import useAuth from "../useAuth";
import { logoutErrorMessage } from "../model/authErrorMessages";

export default function useLogout() {

    const { logout } = useAuth();

    const [loggingOut, setLoggingOut] = useState(false);

    const [error, setError] = useState(null);

    const loggingOutRef = useRef(false);

    async function requestLogout() {

        if (loggingOutRef.current) return;

        loggingOutRef.current = true;

        setLoggingOut(true);

        setError(null);

        try {

            await logout();

        } catch (logoutError) {

            setError(logoutErrorMessage(logoutError));

        } finally {

            loggingOutRef.current = false;

            setLoggingOut(false);

        }

    }

    return { loggingOut, error, clearError: () => setError(null), requestLogout };

}
