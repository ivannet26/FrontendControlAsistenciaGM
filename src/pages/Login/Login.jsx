import { useState } from "react";
import "./Login.css";
import logoGM from "../../assets/logo-mg.png";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!email || !password) {
      setError("Complete todos los campos.");
      return;
    }


    if (password.length < 6) {
      setError("La contraseña no es válida.");
      return;
    }


    try {
      const respuesta = await login(
        email,
        password
      );


      console.log(
        "Usuario autenticado:",
        respuesta
      );


      localStorage.setItem(
        "token",
        respuesta.access_token
      );


      sessionStorage.setItem(
        "usuario",
        JSON.stringify(respuesta.usuario)
      );


      setError("");

      navigate("/app");


    } catch (error) {


      setError(error.message);


    }


  };

  return (
    <div className="login-page">

      {/* contenedor izquierdo */}
      <div className="login-left">
        <div className="left-overlay">
          <div className="left-content">

            <p className="left-subtitle">
              BIENVENIDO
            </p>

            <h1 className="left-title">
              Sistema de Control de Asistencia
            </h1>

            <p className="left-description">
              Plataforma interna para el registro y gestion de asistencia
              del personal, con acceso seguro.
            </p>

          </div>
        </div>
      </div>

      {/* contenedor derecho */}
      <div className="login-right">

        <div className="login-box">

          <img
            src={logoGM}
            alt="GM Ingenieros y Consultores"
            className="company-logo"
          />

          <h2 className="login-title">
            Iniciar sesion
          </h2>

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >
            <label htmlFor="email">
              Correo
            </label>

            <input

              id="email"

              type="email"

              placeholder="Ingrese su correo"

              value={email}

              onChange={(e) => {

                setEmail(e.target.value);

                setError("");

              }}

              autoComplete="email"

            />

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            {/* mensaje de alerta de rror para el login */}
            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            <button type="submit">
              Ingresar
            </button>
            <p className="register-text">
              ¿No tienes una cuenta?
              <span onClick={() => navigate("/registro")}>
                Registrarse
              </span>
            </p>
          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;