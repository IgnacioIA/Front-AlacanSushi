import "./HeaderCss.css"

function Header({ toggleSidebar }) {
  return (
    <div className="header">
      <button className="menu-btn" onClick={toggleSidebar}>☰</button>

      <div className="logo">Mi Empresa</div>

      <div className="user">
        <img src="/user.png" alt="user" />
      </div>
    </div>
  )
}

export default Header