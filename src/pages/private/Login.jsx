// src/pages/private/Login.jsx
//
// /admin/login. Con sesión válida redirige al destino pedido (o al inicio
// del panel); sin sesión muestra el formulario. Tras un login correcto el
// estado pasa a `authenticated` y este mismo componente redirige: no hace
// falta navegar a mano. Si la verificación inicial falló por red, el
// formulario se muestra igual (el login es la forma de reintentar).

import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../../features/auth/useAuth";
import LoginForm from "../../features/auth/components/LoginForm/LoginForm";
import AuthStatus from "../../features/auth/components/AuthStatus/AuthStatus";
import { resolveAdminDestination } from "../../features/auth/model/authRoutes";

function Login() {

    const auth = useAuth();

    const location = useLocation();

    if (auth.status === "checking") {

        return <AuthStatus title="Verificando sesión..." />;

    }

    if (auth.status === "authenticated") {

        return <Navigate to={resolveAdminDestination(location.state?.from)} replace />;

    }

    const notice = auth.sessionExpired
        ? "Tu sesión venció. Volvé a iniciar sesión."
        : auth.status === "error"
            ? "No pudimos verificar si ya tenías una sesión abierta."
            : null;

    return <LoginForm onLogin={auth.login} notice={notice} />;

}

export default Login;
