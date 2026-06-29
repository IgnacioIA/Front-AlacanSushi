import { useState } from "react"
import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"

function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      <Header toggleSidebar={toggleSidebar} />
      
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