import "./Navbar.css";
import logoGM from "../../assets/logo-mg.png";

function Navbar({ usuario }) {
  return (
    <header className="navbar-principal">

      <div className="navbar-logo">
        <img
          src={logoGM}
          alt="GM Ingenieros y Consultores"
        />
      </div>

      <div className="navbar-info">
        <span>{usuario?.nombre}</span>

        <div className="navbar-avatar">
          {usuario?.nombre?.charAt(0)}
        </div>
      </div>

    </header>
  );
}

export default Navbar;