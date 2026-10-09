import { useNavigate } from "react-router-dom";
import { User, LogOut, Shield, Download } from "lucide-react";
import "./ProfileMenu.css";

const URL_DESCARGA =
  "https://github.com/ivannet26/ControlAsistenciaDesktopGM/releases/download/bckend/ControlAsistencia_Setup_v1.0.5.exe";

function ProfileMenu({ usuario }) {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleDescargar = () => {
    if (URL_DESCARGA && URL_DESCARGA !== "#") {
      window.open(URL_DESCARGA, "_blank", "noopener,noreferrer");
    }
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

      {/* Botón que ahora navega a la pantalla completa */}
      <button 
        className="profile-menu-item" 
        onClick={() => navigate("/app/perfil")}
      >
        <User size={15} />
        <span>Mi perfil</span>
      </button>

      <div className="profile-menu-divider"></div>

      <button className="profile-menu-item" onClick={handleDescargar}>
        <Download size={15} />
        <span>Descargar aplicación</span>
      </button>

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