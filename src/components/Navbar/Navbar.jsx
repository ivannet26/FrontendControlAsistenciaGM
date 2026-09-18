import "./Navbar.css";
import logoGM from "../../assets/logo-mg.png";
import { useState, useRef, useEffect } from "react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";

function Navbar({ usuario }) {

  const [profileOpen, setProfileOpen] = useState(false);
  const refPerfil = useRef(null);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const cerrar = (e) => {
      if (refPerfil.current && !refPerfil.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  // Iniciales del usuario (MAYÚSCULA)
  const iniciales = (
    (usuario?.nombre?.charAt(0) || "?") +
    (usuario?.apellido?.charAt(0) || "")
  ).toUpperCase();

  return (
    <header className="navbar-principal">

      <div className="navbar-logo">
        <img src={logoGM} alt="GM Ingenieros y Consultores" />
      </div>

      <div className="navbar-info">

        <span>{usuario?.nombre}</span>

        <div className="profile-container" ref={refPerfil}>

          <button
            className="navbar-avatar"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {iniciales}
          </button>

          {profileOpen && (
            <ProfileMenu usuario={usuario} />
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;