import "./Register.css";
import { useState } from "react";
import logoGM from "../../assets/logo-mg.png";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
function Register() {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {

    e.preventDefault();


    if (
        !nombre ||
        !apellido ||
        !correo ||
        !password ||
        !confirmPassword
    ) {

        setError("Complete todos los campos.");

        return;

    }


    if (password !== confirmPassword) {

        setError("Las contraseñas no coinciden.");

        return;

    }


    if (password.length < 6) {

        setError("La contraseña debe tener mínimo 6 caracteres.");

        return;

    }


    const nuevoUsuario = {

        nombre,

        apellido,

        email: correo,

        password

    };


    try {


        const respuesta = await register(nuevoUsuario);


        console.log(
            "Usuario registrado:",
            respuesta
        );


        setError("");


        alert("Registro correcto");


        navigate("/login");


    } catch(error) {


        setError(error.message);


    }


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
                            Crea tu cuenta para acceder a la plataforma
                            de gestión de asistencia del personal.
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
                        Crear cuenta
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