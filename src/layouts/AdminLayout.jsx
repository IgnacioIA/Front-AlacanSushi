import { useState } from "react"
import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import useAuth from "../features/auth/useAuth"
import useLogout from "../features/auth/hooks/useLogout"

function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const { username } = useAuth()
  const logout = useLogout()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      <Header
        toggleSidebar={toggleSidebar}
        username={username}
        onLogout={logout.requestLogout}
        loggingOut={logout.loggingOut}
        logoutError={logout.error}
        onDismissLogoutError={logout.clearError}
      />

      <div style={{ display: "flex" }}>
        <Sidebar isOpen={isOpen} />

        <div style={{ padding: "20px", width: "100%" }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
