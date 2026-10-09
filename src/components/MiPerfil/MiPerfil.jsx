import { useState, useEffect, useRef } from "react";
import {
    Pencil, User as UserIcon, Briefcase, Camera, Mail, Shield, CalendarDays
} from "lucide-react";
import toast from "react-hot-toast";
import { actualizarPerfil, subirAvatar } from "../../services/perfilService";
import "./MiPerfil.css";

const CICLOS = Array.from({ length: 12 }, (_, i) => String(i + 1));

const Dato = ({ label, value, full }) => (
    <div className={`dato${full ? " dato-full" : ""}`}>
        <span className="lbl">{label}</span>
        <span className={`val${value ? "" : " vacio"}`} title={value || ""}>
            {value || "—"}
        </span>
    </div>
);

function MiPerfil({ usuario: propUsuario, onVerHorario }) {
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
                telefono: usuario.telefono || "",
                universidad: usuario.universidad || "",
                carrera: usuario.carrera || "",
                ciclo_actual: usuario.ciclo_actual ? String(usuario.ciclo_actual) : ""
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
                telefono: dPersonal.telefono || null,
                universidad: dPersonal.universidad?.trim() || null,
                carrera: dPersonal.carrera?.trim() || null,
                ciclo_actual: dPersonal.ciclo_actual ? Number(dPersonal.ciclo_actual) : null
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

    const handleVerHorario = () => {
        if (onVerHorario) onVerHorario(usuario);
        else toast("Horario de prácticas: pendiente de conectar.");
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
            <button className="btn-accion guardar" >
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
                            <span className="meta-line"><Mail size={12} />{usuario.email || "—"}</span>
                            <span className="meta-sep">·</span>
                            <span className="meta-line"><Shield size={12} />{usuario.rol || "Usuario"}</span>
                            {usuario.cargo && (
                                <>
                                    <span className="meta-sep">·</span>
                                    <span className="meta-line"><Briefcase size={12} />{usuario.cargo}</span>
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
                            {seccion !== "personal" && (
                                <div className="bloque-head-acciones">
                                    <BtnEditar sec="personal" />
                                </div>
                            )}
                        </div>
                        <div className="bloque-body">
                            {seccion !== "personal" ? (
                                <div className="grid-datos">
                                    <Dato label="DNI" value={usuario.dni} />
                                    <Dato label="Teléfono" value={usuario.telefono} />
                                    <Dato label="Correo" value={usuario.email} full />
                                    <Dato label="Universidad" value={usuario.universidad} full />
                                    <Dato label="Carrera" value={usuario.carrera} />
                                    <Dato label="Ciclo actual" value={usuario.ciclo_actual ? String(usuario.ciclo_actual) : ""} />
                                </div>
                            ) : (
                                <div className="edit-inline">
                                    <div className="campos-grid">
                                        <div className="campo">
                                            <label>Nombre *</label>
                                            <input value={dPersonal.nombre} onChange={(e) => setDPersonal(p => ({ ...p, nombre: e.target.value }))} />
                                        </div>
                                        <div className="campo">
                                            <label>Apellido *</label>
                                            <input value={dPersonal.apellido} onChange={(e) => setDPersonal(p => ({ ...p, apellido: e.target.value }))} />
                                        </div>
                                        <div className="campo">
                                            <label>DNI</label>
                                            <input maxLength={8} value={dPersonal.dni} onChange={(e) => setDPersonal(p => ({ ...p, dni: e.target.value.replace(/\D/g, "") }))} />
                                        </div>
                                        <div className="campo">
                                            <label>Teléfono</label>
                                            <input value={dPersonal.telefono} onChange={(e) => setDPersonal(p => ({ ...p, telefono: e.target.value }))} />
                                        </div>
                                        <div className="campo campo-full">
                                            <label>Universidad</label>
                                            <input value={dPersonal.universidad} onChange={(e) => setDPersonal(p => ({ ...p, universidad: e.target.value }))} />
                                        </div>
                                        <div className="campo">
                                            <label>Carrera</label>
                                            <input value={dPersonal.carrera} onChange={(e) => setDPersonal(p => ({ ...p, carrera: e.target.value }))} />
                                        </div>
                                        <div className="campo">
                                            <label>Ciclo actual</label>
                                            <select value={dPersonal.ciclo_actual} onChange={(e) => setDPersonal(p => ({ ...p, ciclo_actual: e.target.value }))}>
                                                <option value="">Seleccionar…</option>
                                                {CICLOS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
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
                            {seccion !== "laboral" && (
                                <div className="bloque-head-acciones">
                                    <button type="button" className="btn-horario" onClick={handleVerHorario}>
                                        <CalendarDays size={12} />
                                        Ver horario
                                    </button>
                                    <BtnEditar sec="laboral" />
                                </div>
                            )}
                        </div>
                        <div className="bloque-body">
                            {seccion !== "laboral" ? (
                                <div className="grid-datos">
                                    <Dato label="Rol" value={usuario.rol || "Usuario"} />
                                    <Dato label="Cargo" value={usuario.cargo} />
                                    <Dato label="Área" value={usuario.area} />
                                    <Dato label="Fecha de inicio" value={usuario.fecha_inicio} />
                                </div>
                            ) : (
                                <div className="edit-inline">
                                    <div className="campos-grid">
                                        <div className="campo">
                                            <label>Rol (bloqueado)</label>
                                            <input value={usuario.rol || ""} disabled />
                                        </div>
                                        <div className="campo">
                                            <label>Fecha de inicio (bloqueado)</label>
                                            <input value={usuario.fecha_inicio || ""} disabled />
                                        </div>
                                        <div className="campo">
                                            <label>Cargo</label>
                                            <input value={dLaboral.cargo} onChange={(e) => setDLaboral(p => ({ ...p, cargo: e.target.value }))} />
                                        </div>
                                        <div className="campo">
                                            <label>Área</label>
                                            <input value={dLaboral.area} onChange={(e) => setDLaboral(p => ({ ...p, area: e.target.value }))} />
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