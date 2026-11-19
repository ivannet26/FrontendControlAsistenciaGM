import "./Register.css";
import { useState } from "react";
import toast from "react-hot-toast";
import logoGM from "../../assets/logo-mg.png";
import { useNavigate } from "react-router-dom";

function Register() {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Registration is now admin-only; normal users cannot create accounts
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("El registro es exclusivo para el administrador. El admin creará tu cuenta manualmente.");
    };

    return (
        <div className="register-page">

            {/* contenedor izquierdo */}
            <div className="register-left">

                <div className="left-overlay">

                    <div className="left-content">

                        <p className="left-subtitle">
                            BIENVENIDO
                        </p>

                        <h1 className="left-title">
                            Sistema de Control de Asistencia
                        </h1>

                        <p className="left-description">
                            El administrador creará tus cuentas manualmente.
                            Por favor contacta al admin para acceder a la plataforma.
                        </p>

                    </div>

                </div>

            </div>


            {/* contenedor derecho */}
            <div className="register-right">

                <div className="register-box">


                    <img
                        src={logoGM}
                        alt="GM Ingenieros y Consultores"
                        className="company-logo"
                    />


                    <h2 className="login-title">
                        Registro temporalmente disabled
                    </h2>


                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >


                        <label>
                            Nombres
                        </label>

                        <input
                            type="text"
                            placeholder="Ingrese sus nombres"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />


                        <label>
                            Apellidos
                        </label>

                        <input
                            type="text"
                            placeholder="Ingrese sus apellidos"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                        />


                        <label>
                            Correo
                        </label>

                        <input
                            type="email"
                            placeholder="Ingrese su correo"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                        />


                        <label>
                            Contraseña
                        </label>

                        <input
                            type="password"
                            placeholder="Ingrese su contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />


                        <label>
                            Confirmar contraseña
                        </label>

                        <input
                            type="password"
                            placeholder="Confirme su contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />


                        {error && (
                            <p className="error-message">
                                {error}
                            </p>
                        )}


                        <button type="submit">
                            Registrarse
                        </button>


                        <p className="register-text">

                            ¿Ya tienes una cuenta?

                            <span onClick={() => navigate("/login")}>
                                Iniciar sesión
                            </span>

                        </p>


                    </form>


                </div>

            </div>


        </div>
    );
}

export default Register;