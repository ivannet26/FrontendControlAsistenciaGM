import { Navigate, Outlet, useLocation } from "react-router-dom";

function RutaProtegida({ roles }) {

  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length) {
    let usuario;
    try {
      usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      usuario = null;
    }

    if (!roles.includes(usuario?.rol)) {
      return <Navigate to="/app/rastreador" replace />;
    }
  }

  return <Outlet />;
}

export default RutaProtegida;