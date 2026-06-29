import "./SidebarCss.css"
import { NavLink } from "react-router-dom"
import { adminMenu } from "../config/menu"

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        
        {/* Header interno */}
        <div className="sidebar-header">
          <span className="sidebar-title">Administración</span>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        {/* Menú */}
        <nav className="menu">
          {adminMenu.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar