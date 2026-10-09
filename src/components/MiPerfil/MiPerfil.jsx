import { useState, useEffect, useRef } from "react";
import {
    Pencil, User as UserIcon, Briefcase, Camera, Mail, Shield
} from "lucide-react";
import toast from "react-hot-toast";
import { actualizarPerfil, subirAvatar } from "../../services/perfilService";
import "./MiPerfil.css";

function MiPerfil({ usuario: propUsuario }) {
    const [usuario, setUsuario] = useState(null);
    const [subiendoAvatar, setSubiendoAvatar] = useState(false);
    const inputArchivoRef = useRef(null);

    const [seccion, setSeccion] = useState(null);
    const [dPersonal, setDPersonal] = useState({});
    const [dLaboral, setDLaboral] = useState({});
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (propUsuario) setUsuario(propUsuario);
        else {
            const g = localStorage.getItem("usuario");
            if (g) try { setUsuario(JSON.parse(g)); } catch {}
        }
    }, [propUsuario]);

    const abrirEdicion = (sec) => {
        if (!usuario || seccion !== null) return;
        if (sec === "personal") {
            setDPersonal({
                nombre: usuario.nombre || "",
                apellido: usuario.apellido || "",
                dni: usuario.dni || "",
                fecha_nacimiento: usuario.fecha_nacimiento || "",
                telefono: usuario.telefono || "",
                direccion: usuario.direccion || ""
            });
        } else if (sec === "laboral") {
            setDLaboral({ cargo: usuario.cargo || "", area: usuario.area || "" });
        }
        setSeccion(sec);
    };

    const cancelarEdicion = () => setSeccion(null);

    const guardarSeccion = async (sec) => {
        if (!usuario) return;
        let payload = {};

        if (sec === "personal") {
            if (!dPersonal.nombre?.trim() || !dPersonal.apellido?.trim())
                return toast.error("Nombre y apellido son obligatorios.");
            if (dPersonal.dni && !/^\d{8}$/.test(dPersonal.dni))
                return toast.error("El DNI debe tener 8 dígitos.");
            payload = {
                nombre: dPersonal.nombre.trim(),
                apellido: dPersonal.apellido.trim(),
                dni: dPersonal.dni || null,
                fecha_nacimiento: dPersonal.fecha_nacimiento || null,
                telefono: dPersonal.telefono || null,
                direccion: dPersonal.direccion || null
            };
        } else if (sec === "laboral") {
            payload = { cargo: dLaboral.cargo || null, area: dLaboral.area || null };
        }

        setGuardando(true);
        try {
            const actualizado = await actualizarPerfil(payload);
            const nuevo = { ...usuario, ...actualizado };
            localStorage.setItem("usuario", JSON.stringify(nuevo));
            setUsuario(nuevo);
            toast.success("Cambios guardados.");
            setSeccion(null);
        } catch (error) {
            toast.error(error.response?.data?.detail || "No se pudo guardar.");
        } finally {
            setGuardando(false);
        }
    };

    const handleSeleccionarImagen = () => inputArchivoRef.current?.click();

    const handleArchivoChange = async (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;
        if (!archivo.type.startsWith("image/")) return toast.error("Selecciona una imagen válida.");
        if (archivo.size > 2 * 1024 * 1024) return toast.error("La imagen no debe superar 2 MB.");
        setSubiendoAvatar(true);
        try {
            const r = await subirAvatar(archivo);
            const url = r.avatar_url || r.avatar || r.url;
            const n = { ...usuario, avatar: url };
            localStorage.setItem("usuario", JSON.stringify(n));
            setUsuario(n);
            toast.success("Foto actualizada.");
        } catch (error) {
            toast.error(error.response?.data?.detail || "No se pudo subir la imagen.");
        } finally {
            setSubiendoAvatar(false);
            if (inputArchivoRef.current) inputArchivoRef.current.value = "";
        }
    };

    if (!usuario) return <div className="perfil-pantalla"><p className="cargando">Cargando…</p></div>;

    const iniciales = ((usuario.nombre?.charAt(0) || "?") + (usuario.apellido?.charAt(0) || "")).toUpperCase();

    const BtnEditar = ({ sec }) => (
        <button className="btn-ico" onClick={() => abrirEdicion(sec)} disabled={seccion !== null} title="Editar">
            <Pencil size={11} />
        </button>
    );

    const Acciones = ({ sec }) => (
        <div className="edit-acciones">
            <button className="btn-accion cancelar" onClick={cancelarEdicion} disabled={guardando}>Cancelar</button>
            <button className="btn-accion guardar" onClick={() => guardarSeccion(sec)} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
            </button>
        </div>
    );

    return (
        <div className="perfil-pantalla">
            <div className="perfil-wrap">

                {/* ═══════ CABECERA ═══════ */}
                <header className="cabecera">
                    <div className="cabecera-avatar-wrap">
                        <div className="avatar-grande">
                            {usuario.avatar
                                ? <img src={usuario.avatar} alt="Avatar" />
                                : <span>{iniciales}</span>}
                        </div>
                        <button
                            type="button"
                            className="btn-camara"
                            onClick={handleSeleccionarImagen}
                            disabled={subiendoAvatar}
                            title="Cambiar foto"
                        >
                            {subiendoAvatar ? <span className="mini-spinner"></span> : <Camera size={12} />}
                        </button>
                        <input ref={inputArchivoRef} type="file" accept="image/*" onChange={handleArchivoChange} style={{ display: "none" }} />
                    </div>

                    <div className="cabecera-info">
                        <h1>{usuario.nombre} {usuario.apellido}</h1>
                        <div className="cabecera-meta">
                            <span className="meta-line"><Mail size={11} />{usuario.email || "—"}</span>
                            <span className="meta-sep">·</span>
                            <span className="meta-line"><Shield size={11} />{usuario.rol || "Usuario"}</span>
                            {usuario.cargo && (
                                <>
                                    <span className="meta-sep">·</span>
                                    <span className="meta-line"><Briefcase size={11} />{usuario.cargo}</span>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ═══════ GRID: PERSONAL + LABORAL ═══════ */}
                <div className="grid-dos">

                    {/* PERSONAL */}
                    <section className="bloque">
                        <div className="bloque-head">
                            <div className="bloque-titulo">
                                <UserIcon size={12} />
                                <span>Datos Personales</span>
                            </div>
                            {seccion !== "personal" && <BtnEditar sec="personal" />}
                        </div>
                        <div className="bloque-body">
                            {seccion !== "personal" ? (
                                <div className="grid-datos">
                                    <div className="dato">
                                        <span className="lbl">DNI</span>
                                        <span className="val">{usuario.dni || "—"}</span>
                                    </div>
                                    <div className="dato">
                                        <span className="lbl">F. Nacimiento</span>
                                        <span className="val">{usuario.fecha_nacimiento || "—"}</span>
                                    </div>
                                    <div className="dato">
                                        <span className="lbl">Teléfono</span>
                                        <span className="val">{usuario.telefono || "—"}</span>
                                    </div>
                                    <div className="dato">
                                        <span className="lbl">Dirección</span>
                                        <span className="val">{usuario.direccion || "—"}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="edit-inline">
                                    <div className="campos-grid">
                                        <div className="campo">
                                            <label>Nombre *</label>
                                            <input value={dPersonal.nombre} onChange={(e) => setDPersonal(p => ({...p, nombre: e.target.value}))} />
                                        </div>
                                        <div className="campo">
                                            <label>Apellido *</label>
                                            <input value={dPersonal.apellido} onChange={(e) => setDPersonal(p => ({...p, apellido: e.target.value}))} />
                                        </div>
                                        <div className="campo">
                                            <label>DNI</label>
                                            <input maxLength={8} value={dPersonal.dni} onChange={(e) => setDPersonal(p => ({...p, dni: e.target.value.replace(/\D/g, "")}))} />
                                        </div>
                                        <div className="campo">
                                            <label>F. Nacimiento</label>
                                            <input type="date" value={dPersonal.fecha_nacimiento} onChange={(e) => setDPersonal(p => ({...p, fecha_nacimiento: e.target.value}))} />
                                        </div>
                                        <div className="campo">
                                            <label>Teléfono</label>
                                            <input value={dPersonal.telefono} onChange={(e) => setDPersonal(p => ({...p, telefono: e.target.value}))} />
                                        </div>
                                        <div className="campo">
                                            <label>Dirección</label>
                                            <input value={dPersonal.direccion} onChange={(e) => setDPersonal(p => ({...p, direccion: e.target.value}))} />
                                        </div>
                                    </div>
                                    <Acciones sec="personal" />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* LABORAL */}
                    <section className="bloque">
                        <div className="bloque-head">
                            <div className="bloque-titulo">
                                <Briefcase size={12} />
                                <span>Datos Laborales</span>
                            </div>
                            {seccion !== "laboral" && <BtnEditar sec="laboral" />}
                        </div>
                        <div className="bloque-body">
                            {seccion !== "laboral" ? (
                                <div className="grid-datos">
                                    <div className="dato">
                                        <span className="lbl">Correo</span>
                                        <span className="val">{usuario.email || "—"}</span>
                                    </div>
                                    <div className="dato">
                                        <span className="lbl">Rol</span>
                                        <span className="val">{usuario.rol || "Usuario"}</span>
                                    </div>
                                    <div className="dato">
                                        <span className="lbl">Cargo</span>
                                        <span className="val">{usuario.cargo || "—"}</span>
                                    </div>
                                    <div className="dato">
                                        <span className="lbl">Área</span>
                                        <span className="val">{usuario.area || "—"}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="edit-inline">
                                    <div className="campos-grid">
                                        <div className="campo campo-full">
                                            <label>Correo (bloqueado)</label>
                                            <input value={usuario.email || ""} disabled />
                                        </div>
                                        <div className="campo">
                                            <label>Cargo</label>
                                            <input value={dLaboral.cargo} onChange={(e) => setDLaboral(p => ({...p, cargo: e.target.value}))} />
                                        </div>
                                        <div className="campo">
                                            <label>Área</label>
                                            <input value={dLaboral.area} onChange={(e) => setDLaboral(p => ({...p, area: e.target.value}))} />
                                        </div>
                                    </div>
                                    <Acciones sec="laboral" />
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
}

export default MiPerfil;