import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"

import AdminLayout from "../layouts/AdminLayout"
import PublicLayout from "../public/layout/PublicLayout"
import { CartProvider } from "../public/cart/CartContext"
import { AuthProvider } from "../features/auth/AuthContext"
import RequireAdmin from "../features/auth/RequireAdmin"
import { ADMIN_HOME } from "../features/auth/model/authRoutes"
import Login from "../pages/private/Login"
import { adminRoutes, publicRoutes } from "./routes"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AuthProvider envuelve sólo /admin: la web pública no consulta la sesión.
            /admin/login queda fuera de la guarda; todo lo demás pasa por RequireAdmin. */}
        <Route
          path="/admin"
          element={(
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          )}
        >
          <Route path="login" element={<Login />} />

          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to={ADMIN_HOME} replace />} />

              {adminRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}

              <Route path="*" element={<Navigate to={ADMIN_HOME} replace />} />
            </Route>
          </Route>
        </Route>

        <Route
          path="/"
          element={(
            <CartProvider>
              <PublicLayout />
            </CartProvider>
          )}
        >
          {publicRoutes.map((route) =>
            route.path === "" ? (
              <Route key="index" index element={route.element} />
            ) : (
              <Route key={route.path} path={route.path} element={route.element} />
            )
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter