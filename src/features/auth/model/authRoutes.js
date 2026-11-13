// src/features/auth/model/authRoutes.js
//
// Rutas del panel que conoce la autenticación y la regla para decidir a
// dónde volver después del login. Sólo se acepta un destino dentro de
// /admin y distinto del propio login: evita bucles de redirección y que un
// `state` arbitrario lleve fuera del panel.

export const ADMIN_HOME = "/admin/comercial/productos";

export const LOGIN_PATH = "/admin/login";

function toPath(from) {

    if (typeof from === "string") return from;

    if (from && typeof from.pathname === "string") {

        return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;

    }

    return null;

}

export function resolveAdminDestination(from) {

    const path = toPath(from);

    if (!path) return ADMIN_HOME;

    const pathname = path.split(/[?#]/)[0];

    const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

    const isLogin = pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);

    return isAdmin && !isLogin ? path : ADMIN_HOME;

}
