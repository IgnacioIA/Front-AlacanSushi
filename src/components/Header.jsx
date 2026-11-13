import "./HeaderCss.css"

function Header({
  toggleSidebar,
  username,
  onLogout,
  loggingOut,
  logoutError,
  onDismissLogoutError
}) {
  return (
    <>
      <div className="header">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Abrir menú">☰</button>

        <div className="logo">Mi Empresa</div>

        <div className="user">
          {username && <span className="user-name">{username}</span>}

          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>
      </div>

      {logoutError && (
        <div className="header-alert" role="alert">
          <span>{logoutError}</span>

          <button
            type="button"
            className="header-alert-close"
            onClick={onDismissLogoutError}
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}

export default Header
