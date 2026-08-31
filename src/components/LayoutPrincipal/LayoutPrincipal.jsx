import "./LayoutPrincipal.css";

import Navbar from "../Navbar/Navbar.jsx";
import Sidebar from "../Sidebar/Sidebar.jsx";

function LayoutPrincipal() {
  const usuarioGuardado = sessionStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  return (
    <div className="app-container">

      {/* NAVBAR FIJO ARRIBA */}
      <Navbar usuario={usuario} />

      {/* TODO LO QUE VA DEBAJO */}
      <div className="app-body">

        <Sidebar usuario={usuario} />

        <main className="contenido-principal">
          <h1>Bienvenido, {usuario?.nombre}</h1>
          <p>Rol: {usuario?.rol}</p>
        </main>

      </div>

    </div>
  );
}

export default LayoutPrincipal;