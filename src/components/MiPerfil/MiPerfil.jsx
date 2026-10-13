import { useEffect, useRef, useState } from "react";
import {
    Briefcase,
    CalendarBlank,
    Camera,
    Check,
    EnvelopeSimple,
    IdentificationCard,
    MapPinLine,
    PencilSimple,
    Phone,
    User,
    X,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import {
    actualizarUsuarioActual,
    construirUrlAvatar,
} from "../../hooks/useUsuarioActual";
import {
    actualizarMiPerfil,
    obtenerMiPerfil,
    subirAvatar,
} from "../../services/perfilService";
import "./MiPerfil.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const PERFIL_VACIO = {
    nombre: "",
    apellido: "",
    email: "",
    rol: "",
    telefono: "",
    dni: "",
    direccion: "",
    fecha_nacimiento: "",
    puesto: "",
    avatar_url: "",
};

const normalizarPerfil = (respuesta = {}) => {
    const datos = {
        ...(respuesta.usuario || {}),
        ...(respuesta.perfil || {}),
        ...respuesta,
    };

    return {
        nombre: datos.nombre ?? datos.nombres ?? "",
        apellido: datos.apellido ?? datos.apellidos ?? "",
        email: datos.email ?? datos.correo ?? "",
        rol: datos.rol ?? "",
        telefono: datos.telefono ?? "",
        dni: datos.dni ?? "",
        direccion: datos.direccion ?? "",
        fecha_nacimiento: datos.fecha_nacimiento
            ? String(datos.fecha_nacimiento).slice(0, 10)
            : "",
        puesto: datos.puesto ?? datos.cargo ?? "",
        avatar_url: datos.avatar_url ?? datos.avatar ?? "",
    };
};

const validarDatos = (datos) => {
    const errores = {};
    const nombre = datos.nombre.trim();
    const apellido = datos.apellido.trim();
    const email = datos.email.trim();

    if (nombre.length < 2) errores.nombre = "Ingresa al menos 2 caracteres.";
    if (apellido.length < 2) errores.apellido = "Ingresa al menos 2 caracteres.";
    if (!email) errores.email = "El correo electrónico es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.email = "Ingresa un correo electrónico válido.";
    }

    if (datos.telefono && !/^\+?\d+$/.test(datos.telefono)) {
        errores.telefono = "Usa solo números y un signo + inicial.";
    }
    if (datos.dni && !/^\d{8}$/.test(datos.dni)) {
        errores.dni = "El DNI debe tener 8 dígitos.";
    }
    if (datos.fecha_nacimiento && datos.fecha_nacimiento > fechaLocalActual()) {
        errores.fecha_nacimiento = "La fecha no puede ser futura.";
    }

    return errores;
};

const fechaLocalActual = () => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
};

const obtenerMensajeError = (error, fallback) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(". ");
    return error.message || fallback;
};

const guardarRutaRelativaAvatar = (url) => (
    url.startsWith(API_BASE_URL) && API_BASE_URL
        ? url.slice(API_BASE_URL.length)
        : url
);

const MiPerfil = () => {
    const [datos, setDatos] = useState(PERFIL_VACIO);
    const [originales, setOriginales] = useState(PERFIL_VACIO);
    const [errores, setErrores] = useState({});
    const [editando, setEditando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [subiendoAvatar, setSubiendoAvatar] = useState(false);
    const [avatarVersion, setAvatarVersion] = useState(() => Date.now());
    const [avatarFallidoUrl, setAvatarFallidoUrl] = useState(null);
    const inputArchivoRef = useRef(null);

    useEffect(() => {
        let activo = true;

        const cargarPerfil = async () => {
            setCargando(true);
            try {
                const respuesta = normalizarPerfil(await obtenerMiPerfil());
                if (!activo) return;
                setDatos(respuesta);
                setOriginales(respuesta);
            } catch (error) {
                if (activo) {
                    toast.error(obtenerMensajeError(error, "No se pudo cargar el perfil."));
                }
            } finally {
                if (activo) setCargando(false);
            }
        };

        cargarPerfil();
        return () => {
            activo = false;
        };
    }, []);

    const cambiarCampo = (campo, valor) => {
        setDatos((actuales) => ({ ...actuales, [campo]: valor }));
        setErrores((actuales) => ({ ...actuales, [campo]: "" }));
    };

    const iniciarEdicion = () => {
        setDatos({ ...originales });
        setErrores({});
        setEditando(true);
    };

    const cancelarEdicion = () => {
        setDatos({ ...originales });
        setErrores({});
        setEditando(false);
    };

    const guardarCambios = async (evento) => {
        evento.preventDefault();
        const nuevosErrores = validarDatos(datos);
        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        const payload = {
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            email: datos.email.trim(),
            telefono: datos.telefono || null,
            dni: datos.dni || null,
            direccion: datos.direccion.trim() || null,
            fecha_nacimiento: datos.fecha_nacimiento || null,
            puesto: datos.puesto.trim() || null,
        };

        setGuardando(true);
        try {
            const respuesta = await actualizarMiPerfil(payload);
            const actualizado = normalizarPerfil({ ...datos, ...respuesta });
            setDatos(actualizado);
            setOriginales(actualizado);
            setEditando(false);

            actualizarUsuarioActual({
                nombre: actualizado.nombre,
                apellido: actualizado.apellido,
                email: actualizado.email,
                rol: actualizado.rol,
                avatar_url: actualizado.avatar_url,
            });

            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            const mensaje = obtenerMensajeError(error, "No se pudo actualizar el perfil.");
            if (error.response?.status === 409 || /correo|email/i.test(mensaje)) {
                setErrores((actuales) => ({ ...actuales, email: mensaje }));
            }
            toast.error(mensaje);
        } finally {
            setGuardando(false);
        }
    };

    const seleccionarFoto = () => inputArchivoRef.current?.click();

    const cambiarFoto = async (evento) => {
        const archivo = evento.target.files?.[0];
        if (!archivo) return;
        if (!archivo.type.startsWith("image/")) {
            toast.error("Selecciona un archivo de imagen válido.");
            evento.target.value = "";
            return;
        }
        if (archivo.size > 2 * 1024 * 1024) {
            toast.error("La imagen no debe superar 2 MB.");
            evento.target.value = "";
            return;
        }

        setSubiendoAvatar(true);
        try {
            const respuesta = await subirAvatar(archivo);
            const nuevoAvatarUrl = respuesta.avatar_url || respuesta.avatar || respuesta.url;
            if (typeof nuevoAvatarUrl !== "string" || !nuevoAvatarUrl.trim()) {
                throw new Error("El servidor no devolvió la URL de la nueva foto.");
            }

            const avatarUrlGuardada = guardarRutaRelativaAvatar(nuevoAvatarUrl.trim());
            setDatos((prev) => ({ ...prev, avatar_url: avatarUrlGuardada }));
            setOriginales((prev) => ({ ...prev, avatar_url: avatarUrlGuardada }));
            setAvatarVersion(Date.now());
            actualizarUsuarioActual({ avatar_url: avatarUrlGuardada });
            toast.success("Foto actualizada.");
        } catch (error) {
            toast.error(obtenerMensajeError(error, "No se pudo cambiar la foto."));
        } finally {
            setSubiendoAvatar(false);
            evento.target.value = "";
        }
    };

    const iniciales = `${datos.nombre.charAt(0) || "?"}${datos.apellido.charAt(0)}`.toUpperCase();
    const urlAvatar = construirUrlAvatar(
        datos.avatar_url,
        avatarVersion
    );

    if (cargando) {
        return (
            <main className="perfil-pantalla">
                <div className="perfil-wrap">
                    <p className="perfil-cargando">Cargando perfil...</p>
                </div>
            </main>
        );
    }

    const campo = (id, etiqueta, icono, tipo = "text", opciones = {}) => {
        const Icono = icono;
        return (
            <div className={`perfil-campo${opciones.completo ? " perfil-campo-completo" : ""}`}>
                <label htmlFor={`perfil-${id}`}>{etiqueta}</label>
                <div className={[
                    "perfil-input-wrap",
                    errores[id] && "perfil-input-error",
                    (!editando || guardando) && "perfil-input-deshabilitado",
                ].filter(Boolean).join(" ")}>
                    {Icono && <Icono size={16} weight="regular" aria-hidden="true" />}
                    <input
                        id={`perfil-${id}`}
                        type={tipo}
                        value={datos[id]}
                        disabled={!editando || guardando}
                        maxLength={opciones.maxLength}
                        onChange={(evento) => cambiarCampo(id, evento.target.value)}
                        autoComplete={opciones.autoComplete}
                    />
                </div>
                {errores[id] && <span className="perfil-error">{errores[id]}</span>}
            </div>
        );
    };

    return (
        <main className="perfil-pantalla">
            <div className="perfil-wrap">
                <header className="perfil-header">
                    <p className="perfil-eyebrow">CONTROL PERSONAL</p>
                    <h1>Mi perfil</h1>
                    <p>Consulta y actualiza tu información personal.</p>
                </header>

                <div className="perfil-layout">
                    <aside className="perfil-tarjeta perfil-identidad">
                        <div className="perfil-avatar-wrap">
                            <div className="perfil-avatar">
                                {urlAvatar && avatarFallidoUrl !== urlAvatar
                                    ? <img
                                        src={urlAvatar}
                                        alt={`Foto de ${datos.nombre}`}
                                        onError={() => setAvatarFallidoUrl(urlAvatar)}
                                    />
                                    : <span>{iniciales}</span>}
                            </div>
                            <span className="perfil-avatar-estado" title="En línea" aria-label="En línea" />
                        </div>
                        <h2>{datos.nombre} {datos.apellido}</h2>
                        <span className="perfil-rol">{datos.rol || "Usuario"}</span>
                        <span className="perfil-identidad-email">
                            <EnvelopeSimple size={15} aria-hidden="true" />
                            {datos.email || "—"}
                        </span>

                        <input
                            ref={inputArchivoRef}
                            className="perfil-archivo-oculto"
                            type="file"
                            accept="image/*"
                            onChange={cambiarFoto}
                            aria-label="Seleccionar foto de perfil"
                        />
                        <button
                            className="perfil-boton perfil-boton-secundario perfil-cambiar-foto"
                            type="button"
                            onClick={seleccionarFoto}
                            disabled={subiendoAvatar}
                        >
                            <Camera size={17} aria-hidden="true" />
                            {subiendoAvatar ? "Subiendo..." : "Cambiar foto"}
                        </button>
                        <button
                            className="perfil-boton perfil-boton-secundario perfil-horario"
                            type="button"
                            onClick={() => toast("Horario: próximamente.")}
                        >
                            <CalendarBlank size={17} aria-hidden="true" />
                            Horario
                        </button>
                    </aside>

                    <section className="perfil-tarjeta perfil-formulario-tarjeta">
                        <div className="perfil-tarjeta-header">
                            <div>
                                <h2>Datos personales</h2>
                                <p>Información asociada a tu cuenta.</p>
                            </div>
                            {!editando && (
                                <button
                                    className="perfil-boton perfil-boton-editar"
                                    type="button"
                                    onClick={iniciarEdicion}
                                >
                                    <PencilSimple size={16} aria-hidden="true" />
                                    Editar perfil
                                </button>
                            )}
                        </div>

                        <form className="perfil-formulario" onSubmit={guardarCambios} noValidate>
                            <div className="perfil-campos-grid">
                                {campo("nombre", "Nombres", User, "text", { autoComplete: "given-name", maxLength: 100 })}
                                {campo("apellido", "Apellidos", User, "text", { autoComplete: "family-name", maxLength: 100 })}
                                {campo("email", "Correo electrónico", EnvelopeSimple, "email", { autoComplete: "email", maxLength: 255, completo: true })}
                                {campo("telefono", "Teléfono", Phone, "tel", { autoComplete: "tel", maxLength: 30 })}
                                {campo("dni", "Documento / DNI", IdentificationCard, "text", { maxLength: 8 })}
                                {campo("direccion", "Dirección", MapPinLine, "text", { autoComplete: "street-address", maxLength: 255, completo: true })}
                                {campo("fecha_nacimiento", "Fecha de nacimiento", CalendarBlank, "date")}
                                {campo("puesto", "Carrera", Briefcase, "text", { maxLength: 100 })}
                            </div>

                            {editando && (
                                <div className="perfil-acciones">
                                    <button
                                        className="perfil-boton perfil-boton-secundario"
                                        type="button"
                                        onClick={cancelarEdicion}
                                        disabled={guardando}
                                    >
                                        <X size={17} aria-hidden="true" />
                                        Cancelar
                                    </button>
                                    <button
                                        className="perfil-boton perfil-boton-guardar"
                                        type="submit"
                                        disabled={guardando}
                                    >
                                        <Check size={17} aria-hidden="true" />
                                        {guardando ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default MiPerfil;
