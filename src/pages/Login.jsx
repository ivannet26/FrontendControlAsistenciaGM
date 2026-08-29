import { useState } from "react";
import "./Login.css";
import logoGM from "../assets/logo-mg.png";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Usuario:", usuario);
    console.log("Password:", password);
  };

  return (
    <div className="login-page">
      {/* contenedor izquierdo */}
      <div className="login-left">
        <div className="left-overlay">
          <div className="left-content">
            <p className="left-subtitle">BIENVENIDO</p>
            <h1 className="left-title">Sistema de Control de Asistencia</h1>
            <p className="left-description">
              Plataforma interna para el registro y gestión de asistencia del
              personal, con acceso seguro.
            </p>
          </div>
        </div>
      </div>

      {/* contenedor derecho- login */}
      <div className="login-right">
        <div className="login-box">
          <img
            src={logoGM}
            alt="GM Ingenieros y Consultores"
            className="company-logo"
          />

          <h2 className="login-title">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              type="text"
              placeholder="Ingrese su usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />

            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Ingresar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;