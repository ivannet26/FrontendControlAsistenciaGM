import "./Navbar.css";
import logoGM from "../../assets/logo-mg.png";
import { useState, useRef, useEffect } from "react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import HelpMenu from "../HelpMenu/HelpMenu";
import { construirUrlAvatar, useUsuarioActual } from "../../hooks/useUsuarioActual";

function Navbar() {
  const usuario = useUsuarioActual();

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
  const urlAvatar = construirUrlAvatar(
    usuario?.avatar_url || usuario?.avatar,
    usuario?._ts
  );

  return (
    <header className="navbar-principal">

      <div className="navbar-logo">
        <img src={logoGM} alt="GM Ingenieros y Consultores" />
      </div>

      <div className="navbar-info">

        <span>{usuario?.nombre}</span>

        {/* Ayuda */}
        <HelpMenu />

        <div className="profile-container" ref={refPerfil}>

          <button
            className="navbar-avatar"
            onClick={() => setProfileOpen(!profileOpen)}
            type="button"
            aria-label="Abrir menú de perfil"
          >
            {urlAvatar
              ? <img src={urlAvatar} alt="" />
              : iniciales}
          </button>

          {profileOpen && (
            /* Ya no recibe onAbrirPerfil */
            <ProfileMenu />
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;