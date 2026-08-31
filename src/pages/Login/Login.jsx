import { useState } from "react";
import "./Login.css";
import logoGM from "../../assets/logo-mg.png";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const usuarioIngresado = usuario.trim();
    const passwordIngresado = password;

    // validaciones de campos vacios y longitud
    if (!usuarioIngresado || !passwordIngresado) {
      setError("Complete todos los campos.");
      return;
    }

    if (usuarioIngresado.length < 8 || usuarioIngresado.length > 12) {
      setError("El usuario debe tener entre 8 y 12 digitos.");
      return;
    }

    if (passwordIngresado.length < 6) {
      setError("La contrasena no es valida");
      return;
    }

    // dara cruda 
    const usuariosPrueba = [
      {
        usuario: "12345678",
        password: "Prueba123",
        nombre: "Juan Perez",
        rol: "PRACTICANTE",
      },
      {
        usuario: "99999999",
        password: "Admin123",
        nombre: "Administrador",
        rol: "ADMIN",
      },
    ];

    // buscar usuario con con find
    const usuarioEncontrado = usuariosPrueba.find(
      (item) =>
        item.usuario === usuarioIngresado &&
        item.password === passwordIngresado
    );

    if (!usuarioEncontrado) {
      setError("Usuario o contrasena incorrectos.");
      return;
    }

    // atutenticacion correcta
    setError("");

    console.log("Usuario autenticado:", usuarioEncontrado);

    alert(`Bienvenido ${usuarioEncontrado.nombre}`);
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

            <label htmlFor="usuario">
              Usuario
            </label>

            <input
              id="usuario"
              type="text"
              inputMode="numeric"
              maxLength={12}
              placeholder="Ingrese su usuario"
              value={usuario}
              onChange={(e) => {
                const soloNumeros = e.target.value.replace(/\D/g, "");

                setUsuario(soloNumeros);
                setError("");
              }}
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

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;