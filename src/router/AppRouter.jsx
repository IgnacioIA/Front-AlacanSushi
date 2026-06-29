import { BrowserRouter, Routes, Route } from "react-router-dom"

import AdminLayout from "../layouts/AdminLayout"
import { adminRoutes } from "./routes"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          {adminRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter