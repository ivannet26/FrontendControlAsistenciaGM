// src/components/ProfileMenu/ProfileMenu.jsx
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Mail, Shield } from "lucide-react";
import "./ProfileMenu.css";

function ProfileMenu({ usuario }) {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.clear();
    navigate("/login");
  };

  const iniciales = (
    (usuario?.nombre?.charAt(0) || "?") +
    (usuario?.apellido?.charAt(0) || "")
  ).toUpperCase();

  return (
    <div className="profile-menu">

      {/* Cabecera */}
      <div className="profile-menu-header">
        <div className="profile-menu-avatar">
          {iniciales}
        </div>
        <div className="profile-menu-info">
          <strong>
            {usuario?.nombre} {usuario?.apellido}
          </strong>
          <span>{usuario?.email || "Sin email"}</span>
        </div>
      </div>

      {/* Rol */}
      {usuario?.rol && (
        <div className="profile-menu-rol">
          <Shield size={13} />
          <span>{usuario.rol}</span>
        </div>
      )}

      <div className="profile-menu-divider"></div>

      {/* Opciones */}
      <button className="profile-menu-item">
        <User size={15} />
        <span>Mi perfil</span>
      </button>

      {/*<button className="profile-menu-item">
        <Mail size={15} />
        <span>Cambiar correo</span>
      </button>

      <button className="profile-menu-item">
        <Settings size={15} />
        <span>Configuración</span>
      </button>*/}

      <div className="profile-menu-divider"></div>

      {/* Cerrar sesión */}
      <button
        className="profile-menu-item profile-menu-danger"
        onClick={handleCerrarSesion}
      >
        <LogOut size={15} />
        <span>Cerrar sesión</span>
      </button>

    </div>
  );
}

export default ProfileMenu;