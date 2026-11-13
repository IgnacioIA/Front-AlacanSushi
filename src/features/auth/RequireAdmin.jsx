// src/features/auth/RequireAdmin.jsx
//
// Guarda de las rutas del panel (todo /admin salvo /admin/login). Mientras
// la sesión se verifica no renderiza nada protegido. Ocultar rutas es sólo
// experiencia de uso: la API autoriza cada llamada igual.

import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "./useAuth";
import AuthStatus from "./components/AuthStatus/AuthStatus";
import { LOGIN_PATH } from "./model/authRoutes";

export default function RequireAdmin() {

    const auth = useAuth();

    const location = useLocation();

    if (auth.status === "checking") {

        return <AuthStatus title="Verificando sesión..." />;

    }

    if (auth.status === "error") {

        return (

            <AuthStatus
                title="No pudimos verificar tu sesión"
                description="No se pudo conectar con el servidor. Revisá la conexión e intentá de nuevo."
                actionLabel="Reintentar"
                onAction={auth.retry}
            />

        );

    }

    if (auth.status === "anonymous") {

        return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;

    }

    return <Outlet />;

}
