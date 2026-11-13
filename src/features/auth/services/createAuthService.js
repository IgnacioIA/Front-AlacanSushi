// src/features/auth/services/createAuthService.js
//
// Operaciones de AUTH-02/03/04 (autenticacion.md). Recibe el cliente HTTP y
// el gestor CSRF para poder probarse sin red; la instancia real se arma en
// authService.js.
//
// - Login: formulario `application/x-www-form-urlencoded` con `username` y
//   `password` — un JSON no se interpreta y responde 401. El token CSRF se
//   descarta antes (se pide uno fresco) y después (el login lo cambia).
// - Logout: el token se descarta sólo si el servidor respondió 204. Si lo
//   rechazó, la sesión sigue abierta y el token se conserva.
// - Nada de esto guarda credenciales ni ids de sesión: la cookie es HttpOnly
//   y la maneja el navegador.

import { mapSession } from "../model/sessionMapper.js";

export function createAuthService({ http, csrf }) {

    async function getSession() {

        const { data } = await http.get("/auth/session");

        return mapSession(data);

    }

    async function login(username, password) {

        csrf.invalidate();

        const { data } = await http.post(
            "/auth/login",
            new URLSearchParams({ username, password }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        csrf.invalidate();

        return mapSession(data);

    }

    async function logout() {

        await http.post("/auth/logout");

        csrf.invalidate();

    }

    return { getSession, login, logout };

}
