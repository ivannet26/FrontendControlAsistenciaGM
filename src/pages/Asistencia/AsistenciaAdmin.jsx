import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    CalendarBlank,
    ArrowClockwise,
    CheckCircle,
    Coffee,
    MagnifyingGlass,
    Users,
    XCircle,
} from "@phosphor-icons/react";
import {
    obtenerFechaLocal,
    obtenerResumenAdminHoy,
    obtenerResumenAdminPorFecha,
} from "../../services/asistenciaService";
import "./AsistenciaAdmin.css";

// ── Formateadores ─────────────────────────────────────
const formatearHora = (iso) => iso
    ? new Date(iso).toLocaleTimeString("es-PE", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    })
    : "—";

const formatearFechaCorta = (fechaIso) => {
    const [año, mes, dia] = fechaIso.split("-");
    return `${dia}/${mes}/${año}`;
};

const formatearDuracion = (segundos) => {
    if (segundos === null || segundos === undefined) return "—";
    const segs = Math.max(0, Math.floor(segundos));
    const h = Math.floor(segs / 3600);
    const m = Math.floor((segs % 3600) / 60);
    const s = segs % 60;
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const textoEstado = (estado) => ({
    SIN_ENTRADA: "Sin entrada",
    TRABAJANDO: "Trabajando",
    EN_BREAK: "En descanso",
    FINALIZADO: "Finalizado",
}[estado] || "Sin entrada");

const claseEstado = (estado) => ({
    SIN_ENTRADA: "sin-entrada",
    TRABAJANDO: "trabajando",
    EN_BREAK: "en-break",
    FINALIZADO: "finalizado",
}[estado] || "sin-entrada");

const normalizarRol = (rol) => {
    const r = (rol || "").toUpperCase();
    if (r.includes("ADMIN")) return "Administrador";
    if (r.includes("PRACTICANTE")) return "Practicante";
    return rol || "—";
};

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    return error.message || mensajePredeterminado;
};

// ── Componente principal ──────────────────────────────
const AsistenciaAdmin = () => {
    const [fecha, setFecha] = useState(() => obtenerFechaLocal());
    const [filas, setFilas] = useState([]);
    const [cargandoInicial, setCargandoInicial] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [relojActualizacion, setRelojActualizacion] = useState(() => Date.now());
    const consultarAhoraRef = useRef(null);

    // Filtros
    const [filtroUsuario, setFiltroUsuario] = useState("");
    const [filtroRol, setFiltroRol] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const hoy = obtenerFechaLocal();

    useEffect(() => {
        let cancelado = false;
        let consultaEnCurso = false;
        const esHoy = fecha === hoy;

        const consultar = async (tipo = "polling") => {
            if (cancelado || consultaEnCurso) return;
            if (tipo === "polling" && document.visibilityState !== "visible") return;

            consultaEnCurso = true;
            if (tipo === "inicial") setCargandoInicial(true);
            else setActualizando(true);

            try {
                const data = fecha === obtenerFechaLocal()
                    ? await obtenerResumenAdminHoy()
                    : await obtenerResumenAdminPorFecha(fecha);

                if (cancelado) return;
                const normalizadas = (Array.isArray(data) ? data : []).map((r) => ({
                    id: r.usuario_id,
                    nombre: (r.usuario_nombre || "").split(" ")[0] || "",
                    apellido: (r.usuario_nombre || "").split(" ").slice(1).join(" ") || "",
                    email: r.usuario_email || "",
                    rol: normalizarRol(r.rol),
                    estado: r.estado || "SIN_ENTRADA",
                    tieneEntrada: Boolean(r.tiene_entrada),
                    entrada: r.entrada,
                    breakInicio: r.break_inicio,
                    breakFin: r.break_fin,
                    duracion: formatearDuracion(r.duracion_break_segundos),
                    salida: r.salida,
                }));

                setFilas((actuales) => (
                    JSON.stringify(normalizadas) === JSON.stringify(actuales)
                        ? actuales
                        : normalizadas
                ));
                setUltimaActualizacion(new Date());
            } catch (error) {
                if (!cancelado && tipo !== "polling") {
                    toast.error(obtenerMensajeError(
                        error,
                        "No se pudo cargar el resumen de asistencia."
                    ));
                }
            } finally {
                consultaEnCurso = false;
                if (!cancelado) {
                    if (tipo === "inicial") setCargandoInicial(false);
                    else setActualizando(false);
                }
            }
        };

        consultarAhoraRef.current = () => consultar("manual");
        consultar("inicial");

        if (esHoy) {
            const intervalo = window.setInterval(() => consultar("polling"), 15000);
            const manejarVisibilidad = () => {
                if (document.visibilityState === "visible") consultar("polling");
            };
            document.addEventListener("visibilitychange", manejarVisibilidad);

            return () => {
                cancelado = true;
                window.clearInterval(intervalo);
                document.removeEventListener("visibilitychange", manejarVisibilidad);
                consultarAhoraRef.current = null;
            };
        }

        return () => {
            cancelado = true;
            consultarAhoraRef.current = null;
        };
    }, [fecha, hoy]);

    useEffect(() => {
        const intervalo = window.setInterval(() => setRelojActualizacion(Date.now()), 1000);
        return () => window.clearInterval(intervalo);
    }, []);

    // ── Filtrado ───────────────────────────────────────
    const filasFiltradas = useMemo(() => {
        return filas.filter((f) => {
            if (filtroUsuario && f.id !== Number(filtroUsuario)) return false;
            if (filtroRol && f.rol !== filtroRol) return false;
            if (filtroEstado && f.estado !== filtroEstado) return false;
            if (busqueda.trim()) {
                const q = busqueda.trim().toLowerCase();
                const matchNombre = `${f.nombre} ${f.apellido}`.toLowerCase().includes(q);
                const matchEmail = f.email.toLowerCase().includes(q);
                if (!matchNombre && !matchEmail) return false;
            }
            return true;
        });
    }, [filas, filtroUsuario, filtroRol, filtroEstado, busqueda]);

    // ── Resumen ────────────────────────────────────────
    const totalUsuarios = filas.length;
    const conEntrada = filas.filter((f) => f.tieneEntrada).length;
    const sinEntrada = totalUsuarios - conEntrada;
    const enDescanso = filas.filter((f) => f.estado === "EN_BREAK").length;
    const segundosDesdeActualizacion = ultimaActualizacion
        ? Math.max(0, Math.floor((relojActualizacion - ultimaActualizacion.getTime()) / 1000))
        : null;

    // ── Acciones ───────────────────────────────────────
    const abrirCalendario = () => {
        const input = document.getElementById("asistencia-admin-fecha");
        if (input?.showPicker) input.showPicker();
        else input?.click();
    };

    const limpiar = () => {
        setFiltroUsuario("");
        setFiltroRol("");
        setFiltroEstado("");
        setBusqueda("");
        setFecha(hoy);
    };

    return (
        <div className="admin-asistencia-container">
            {/* HEADER */}
            <header className="admin-asistencia-header">
                <div>
                    <p className="admin-asistencia-eyebrow">GESTIÓN DE PERSONAL</p>
                    <h1>Control de asistencia</h1>
                    <p className="admin-asistencia-sub">
                        Registro diario de entradas, descansos y salidas del equipo
                    </p>
                </div>
            </header>

            {/* PANELES RESUMEN */}
            <section className="admin-resumen">
                <div className="admin-resumen-card">
                    <div className="admin-resumen-icono">
                        <Users size={24} weight="duotone" />
                    </div>
                    <div className="admin-resumen-datos">
                        <span className="admin-resumen-label">Total usuarios</span>
                        <span className="admin-resumen-valor">{totalUsuarios}</span>
                    </div>
                </div>

                <div className="admin-resumen-card card-verde">
                    <div className="admin-resumen-icono">
                        <CheckCircle size={24} weight="duotone" />
                    </div>
                    <div className="admin-resumen-datos">
                        <span className="admin-resumen-label">Con entrada</span>
                        <span className="admin-resumen-valor">{conEntrada}</span>
                    </div>
                </div>

                <div className="admin-resumen-card card-rojo">
                    <div className="admin-resumen-icono">
                        <XCircle size={24} weight="duotone" />
                    </div>
                    <div className="admin-resumen-datos">
                        <span className="admin-resumen-label">Sin entrada</span>
                        <span className="admin-resumen-valor">{sinEntrada}</span>
                    </div>
                </div>

                <div className="admin-resumen-card card-amarillo">
                    <div className="admin-resumen-icono">
                        <Coffee size={24} weight="duotone" />
                    </div>
                    <div className="admin-resumen-datos">
                        <span className="admin-resumen-label">En descanso</span>
                        <span className="admin-resumen-valor">{enDescanso}</span>
                    </div>
                </div>
            </section>

            {/* FILTROS */}
            <section className="admin-filtros">
                <span className="admin-filtros-titulo">FILTRAR</span>

                <select value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)}>
                    <option value="">Usuario</option>
                    {filas.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.nombre} {f.apellido}
                        </option>
                    ))}
                </select>

                <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                    <option value="">Rol</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Practicante">Practicante</option>
                </select>

                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                    <option value="">Estado</option>
                    <option value="SIN_ENTRADA">Sin entrada</option>
                    <option value="TRABAJANDO">Trabajando</option>
                    <option value="EN_BREAK">En descanso</option>
                    <option value="FINALIZADO">Finalizado</option>
                </select>

                <div className="admin-filtro-fecha">
                    <CalendarBlank size={14} weight="bold" />
                    <input
                        id="asistencia-admin-fecha"
                        type="date"
                        value={fecha}
                        max={hoy}
                        onChange={(e) => setFecha(e.target.value)}
                        onClick={abrirCalendario}
                    />
                </div>

                <div className="admin-filtro-buscador">
                    <MagnifyingGlass size={14} weight="bold" />
                    <input
                        type="text"
                        placeholder="Buscar nombre o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <button className="admin-filtro-limpiar" onClick={limpiar}>
                    Limpiar
                </button>
            </section>

            {/* TABLA */}
            <section className="admin-tabla-container">
                <div className="admin-tabla-header">
                    <div className="admin-tabla-header-info">
                        <span>Asistencia del {formatearFechaCorta(fecha)}</span>
                        <span className="admin-tabla-count">
                            {filasFiltradas.length} {filasFiltradas.length === 1 ? "usuario" : "usuarios"}
                        </span>
                    </div>
                    {fecha === hoy && (
                        <div className="admin-actualizacion" aria-live="polite">
                            <span className={`admin-punto${actualizando || cargandoInicial ? " admin-punto-pulse" : ""}`} />
                            <span className="admin-actualizacion-texto">
                                {segundosDesdeActualizacion === null
                                    ? "Actualizando..."
                                    : ` ${segundosDesdeActualizacion}s`}
                            </span>
                            <button
                                type="button"
                                className="admin-actualizar-ahora"
                                onClick={() => consultarAhoraRef.current?.()}
                                disabled={actualizando || cargandoInicial}
                                aria-label="Actualizar ahora"
                                title="Actualizar ahora"
                            >
                                <ArrowClockwise size={16} weight="bold" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="admin-tabla-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Entrada</th>
                                <th>Inicio descanso</th>
                                <th>Fin descanso</th>
                                <th>Tiempo descanso</th>
                                <th>Salida</th>
                                <th>Estado</th>
                                <th className="col-check">Check</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargandoInicial ? (
                                <tr>
                                    <td colSpan="9" className="admin-tabla-vacia">
                                        Cargando registros...
                                    </td>
                                </tr>
                            ) : filasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="admin-tabla-vacia">
                                        No hay usuarios con esos filtros.
                                    </td>
                                </tr>
                            ) : filasFiltradas.map((f) => (
                                <tr className={!f.tieneEntrada ? "fila-sin-entrada" : ""} key={f.id}>
                                    <td>
                                        <div className="admin-usuario">
                                            <div className="admin-avatar">
                                                {(f.nombre[0] || "?").toUpperCase()}
                                                {(f.apellido[0] || "").toUpperCase()}
                                            </div>
                                            <div className="admin-usuario-info">
                                                <span className="admin-usuario-nombre">
                                                    {f.nombre} {f.apellido}
                                                </span>
                                                <span className="admin-usuario-email">{f.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`admin-rol rol-${f.rol === "Administrador" ? "administrador" : "practicante"}`}>
                                            {f.rol}
                                        </span>
                                    </td>
                                    <td className="admin-hora">{formatearHora(f.entrada)}</td>
                                    <td className="admin-hora">{formatearHora(f.breakInicio)}</td>
                                    <td className="admin-hora">{formatearHora(f.breakFin)}</td>
                                    <td className="admin-hora admin-duracion">{f.duracion}</td>
                                    <td className="admin-hora">{formatearHora(f.salida)}</td>
                                    <td>
                                        <span className={`admin-estado estado-${claseEstado(f.estado)}`}>
                                            {textoEstado(f.estado)}
                                        </span>
                                    </td>
                                    <td className="col-check">
                                        {f.tieneEntrada ? (
                                            <CheckCircle size={24} weight="fill" color="#10b981" />
                                        ) : (
                                            <XCircle size={24} weight="fill" color="#dc2626" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AsistenciaAdmin;