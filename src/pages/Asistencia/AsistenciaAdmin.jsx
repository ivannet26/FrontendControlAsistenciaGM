import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    CalendarBlank,
    ArrowClockwise,
    MagnifyingGlass,
} from "@phosphor-icons/react";
import {
    obtenerFechaLocal,
    obtenerResumenAdminHoy,
    obtenerResumenAdminPorFecha,
} from "../../services/asistenciaService";
import { obtenerHorarioDeUsuario } from "../../services/horarioService";
import { construirUrlAvatar } from "../../hooks/useUsuarioActual";
import ModalVerHorarioAdmin from "../../components/ModalVerHorarioAdmin/ModalVerHorarioAdmin";
import ModalVerJustificacion from "../../components/ModalVerJustificacion/ModalVerJustificacion";
import Tabla from "../../components/Tabla/Tabla";
import { EVENTO_JUSTIFICACIONES_ACTUALIZADAS } from "../../services/justificacionesService";
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

const normalizarFecha = (fecha) => {
    const valor = String(fecha || "").trim();
    if (!valor) return "";

    if (valor.includes("/")) {
        const [dia, mes, anio] = valor.split(/[/-]/);
        return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }

    const fechaIso = valor.match(/^(\d{4}-\d{2}-\d{2})/);
    if (fechaIso) return fechaIso[1];

    const fechaParseada = new Date(valor);
    if (Number.isNaN(fechaParseada.getTime())) return "";
    const anio = fechaParseada.getFullYear();
    const mes = String(fechaParseada.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaParseada.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
};

// Fechas de la tabla (rastreo / prácticas): dd/mm/aaaa o "—" si no hay dato.
const formatearFechaTabla = (valor) => {
    const fecha = normalizarFecha(valor);
    return fecha ? formatearFechaCorta(fecha) : "—";
};

const formatearDuracion = (segundos) => {
    if (segundos === null || segundos === undefined) return "—";
    const segs = Math.max(0, Math.floor(segundos));
    const h = Math.floor(segs / 3600);
    const m = Math.floor((segs % 3600) / 60);
    const s = segs % 60;
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const formatearTiempoAcumulado = (horas) => {
    if (horas === null || horas === undefined || horas === "") return "—";
    const totalHoras = Number(horas);
    if (!Number.isFinite(totalHoras) || totalHoras < 0) return "—";

    let minutosRestantes = Math.round(totalHoras * 60);
    const minutosPorMes = 160 * 60;
    const minutosPorSemana = 40 * 60;
    const meses = Math.floor(minutosRestantes / minutosPorMes);
    minutosRestantes %= minutosPorMes;
    const semanas = Math.floor(minutosRestantes / minutosPorSemana);
    minutosRestantes %= minutosPorSemana;
    const horasRestantes = Math.floor(minutosRestantes / 60);
    const minutos = minutosRestantes % 60;
    const partes = [];

    if (meses) partes.push(`${meses} ${meses === 1 ? "Mes" : "Meses"}`);
    if (semanas) partes.push(`${semanas} Sem`);
    if (horasRestantes) partes.push(`${horasRestantes}h`);
    if (minutos) partes.push(`${minutos}m`);
    if (partes.length === 0) partes.push("0h");

    return partes.length > 1 && !meses && !semanas
        ? partes.join(" ")
        : partes.join(", ");
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
    const [filtroRol, setFiltroRol] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [modalHorarioAbierto, setModalHorarioAbierto] = useState(false);
    const [horarioUsuario, setHorarioUsuario] = useState(null);
    const [cargandoHorario, setCargandoHorario] = useState(false);
    const [justificacionVer, setJustificacionVer] = useState(null);

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
                const normalizadas = (Array.isArray(data) ? data : []).map((r) => {
                    // TEMPORAL: inspeccionar los campos reales que envía el backend.
                    if (tipo !== "polling") {
                        console.log("[AsistenciaAdmin] fila backend:", r);
                    }
                    return {
                        id: r.usuario_id,
                        nombre: (r.usuario_nombre || "").split(" ")[0] || "",
                        apellido: (r.usuario_nombre || "").split(" ").slice(1).join(" ") || "",
                        email: r.usuario_email || "",
                        rol: normalizarRol(r.rol),
                        horasAcumuladas: r.horas_acumuladas
                            ?? (r.horas_acumuladas_segundos != null
                                ? Number(r.horas_acumuladas_segundos) / 3600
                                : null),
                        avatar_url: r.avatar_url || null,   // ← NUEVO
                        avatarVersion: Date.now(),
                        estado: r.estado || "SIN_ENTRADA",
                        tieneEntrada: Boolean(r.tiene_entrada),
                        entrada: r.entrada,
                        breakInicio: r.break_inicio,
                        breakFin: r.break_fin,
                        duracion: formatearDuracion(r.duracion_break_segundos),
                        salida: r.salida,
                        inicioRastreo: r.fecha_inicio_rastreo ?? r.inicio_rastreo ?? null,
                        inicioPracticas: r.fecha_inicio_practicas
                            ?? r.usuario?.fecha_inicio_practicas
                            ?? r.inicio_practicas
                            ?? null,
                        justificacion_aceptada: r.justificacion_aceptada || null,
                        comentario_admin: r.comentario_admin || "",
                        justificacion_asunto: r.justificacion_asunto || "",
                        justificacion_mensaje: r.justificacion_mensaje || "",
                        justificacion_evidencia_url: r.justificacion_evidencia_url || "",
                    };
                });

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

    useEffect(() => {
        const refrescarAsistencia = () => consultarAhoraRef.current?.();
        window.addEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, refrescarAsistencia);
        return () => window.removeEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, refrescarAsistencia);
    }, []);

    const buscarJustificacion = (fila) => {
        if (!fila.justificacion_aceptada) return null;
        const aceptada = typeof fila.justificacion_aceptada === "object"
            ? {
                ...fila.justificacion_aceptada,
                estado: fila.justificacion_aceptada.estado || "ACEPTADA",
                comentario_admin: fila.comentario_admin
                    ?? fila.justificacion_aceptada.comentario_admin
                    ?? "",
            }
            : {
                estado: "ACEPTADA",
                comentario_admin: fila.comentario_admin || "",
                asunto: "Justificación aceptada",
                mensaje: "",
            };
        return String(aceptada.estado || "").toUpperCase() === "ACEPTADA"
            ? aceptada
            : null;
    };

    // ── Filtrado ───────────────────────────────────────
    const filasFiltradas = useMemo(() => {
        return filas.filter((f) => {
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
    }, [filas, filtroRol, filtroEstado, busqueda]);

    const abrirCalendario = () => {
        const input = document.getElementById("asistencia-admin-fecha");
        if (input?.showPicker) input.showPicker();
        else input?.click();
    };

    const limpiar = () => {
        setFiltroRol("");
        setFiltroEstado("");
        setBusqueda("");
        setFecha(hoy);
    };

    const verHorarioUsuario = async (usuarioId, nombreCompleto) => {
        setCargandoHorario(true);
        setModalHorarioAbierto(true);
        setHorarioUsuario({ nombre: nombreCompleto, imagen_url: null });

        try {
            const data = await obtenerHorarioDeUsuario(usuarioId);
            setHorarioUsuario({
                nombre: nombreCompleto,
                imagen_url: data.imagen_url,
            });
        } catch (error) {
            toast.error(
                error.response?.data?.detail
                    || "Ese usuario aún no tiene horario creado."
            );
            setModalHorarioAbierto(false);
        } finally {
            setCargandoHorario(false);
        }
    };

    const cerrarModalHorario = useCallback(() => {
        setModalHorarioAbierto(false);
        setHorarioUsuario(null);
    }, []);

    const columnasTabla = [
        {
            key: "usuario",
            header: "Usuario",
            render: (f) => {
                const urlAvatar = construirUrlAvatar(f.avatar_url, f.avatarVersion);
                const iniciales = `${(f.nombre[0] || "?").toUpperCase()}${(f.apellido[0] || "").toUpperCase()}`;

                return (
                    <div className="admin-usuario">
                        <div className="admin-avatar">
                            {urlAvatar ? (
                                <img
                                    src={urlAvatar}
                                    alt={`${f.nombre} ${f.apellido}`}
                                    loading="lazy"
                                    onError={(e) => {
                                        // Si la imagen falla, ocultamos el img para que se vean las iniciales.
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.parentElement.textContent = iniciales;
                                    }}
                                />
                            ) : (
                                iniciales
                            )}
                        </div>
                        <div className="admin-usuario-info">
                            <span className="admin-usuario-nombre">
                                {f.nombre} {f.apellido}
                            </span>
                            <span className="admin-usuario-email">{f.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "horario",
            header: "Horario",
            headClassName: "col-horario",
            className: "col-horario",
            render: (f) => (
                <button
                    type="button"
                    className="btn-ver-horario"
                    onClick={() => verHorarioUsuario(f.id, `${f.nombre} ${f.apellido}`)}
                    title="Ver horario de este usuario"
                >
                    Ver horario
                </button>
            ),
        },
        {
            key: "inicioRastreo",
            header: "Inicio de Rastreo",
            headClassName: "col-inicio-rastreo",
            className: "col-inicio-rastreo",
            render: (f) => formatearFechaTabla(f.inicioRastreo),
        },
        {
            key: "inicioPracticas",
            header: "Inicio de Prácticas",
            headClassName: "col-inicio-practicas",
            className: "col-inicio-practicas",
            render: (f) => formatearFechaTabla(f.inicioPracticas),
        },
        {
            key: "horasAcumuladas",
            header: "Tiempo acumulado",
            headClassName: "col-tiempo-acumulado",
            className: "admin-tiempo-acumulado",
            render: (f) => formatearTiempoAcumulado(f.horasAcumuladas),
        },
        {
            key: "entrada",
            header: "Entrada",
            align: "center",
            headClassName: "col-centrada",
            className: "admin-hora",
            render: (f) => formatearHora(f.entrada),
        },
        {
            key: "breakInicio",
            header: "Inicio desc.",
            align: "center",
            headClassName: "col-centrada",
            className: "admin-hora",
            render: (f) => formatearHora(f.breakInicio),
        },
        {
            key: "breakFin",
            header: "Fin desc.",
            align: "center",
            headClassName: "col-centrada",
            className: "admin-hora",
            render: (f) => formatearHora(f.breakFin),
        },
        {
            key: "duracion",
            header: "Duración",
            align: "center",
            headClassName: "col-centrada",
            className: "admin-hora admin-duracion",
            render: (f) => f.duracion,
        },
        {
            key: "salida",
            header: "Salida",
            align: "center",
            headClassName: "col-centrada",
            className: "admin-hora",
            render: (f) => formatearHora(f.salida),
        },
        {
            key: "estado",
            header: "Estado",
            render: (f) => (
                <span className={`admin-estado estado-${claseEstado(f.estado)}`}>
                    {textoEstado(f.estado)}
                </span>
            ),
        },
        {
            key: "justificacion",
            header: "Justificación",
            headClassName: "col-justificacion",
            className: "col-justificacion",
            render: (f) => {
                const justificacion = buscarJustificacion(f);
                return ["PENDIENTE", "ACEPTADA"].includes(justificacion?.estado) ? (
                    <button
                        type="button"
                        className="btn-ver-justificacion"
                        onClick={() => setJustificacionVer(f)}
                    >
                        Ver justificación
                    </button>
                ) : (
                    <span className="admin-sin-justificacion">---</span>
                );
            },
        },
        {
            key: "comentarioAdmin",
            header: "Comentario Admin",
            headClassName: "col-comentario-admin",
            className: "col-comentario-admin",
            render: (f) => {
                const justificacion = buscarJustificacion(f);
                return (
                    <span
                        className="admin-comentario-texto"
                        title={justificacion?.comentario_admin?.trim() || ""}
                    >
                        {justificacion?.estado === "PENDIENTE"
                            ? "Pendiente de revisión"
                            : ["ACEPTADA", "RECHAZADA", "INJUSTIFICADA"].includes(justificacion?.estado)
                                ? justificacion.comentario_admin?.trim() || "---"
                                : "---"}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="admin-asistencia-container">
            {/* HEADER */}
            <header className="admin-asistencia-header">
                <div>
                    <h1>Control de asistencia</h1>
                    <p className="admin-asistencia-sub">
                        Registro diario de entradas, descansos y salidas del equipo
                    </p>
                </div>
            </header>

            <section className="admin-filtros">
                <div className="admin-filtro-buscador">
                    <MagnifyingGlass size={15} weight="bold" />
                    <input
                        type="text"
                        placeholder="Buscar nombre o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="admin-filtro-fecha">
                    <CalendarBlank size={14} weight="bold" />
                    <input
                        id="asistencia-admin-fecha"
                        type="date"
                        lang="es-PE"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        onClick={abrirCalendario}
                    />
                </div>

                <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                    <option value="">Todos los roles</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Practicante">Practicante</option>
                </select>

                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="SIN_ENTRADA">Sin entrada</option>
                    <option value="TRABAJANDO">Trabajando</option>
                    <option value="EN_BREAK">En descanso</option>
                    <option value="FINALIZADO">Finalizado</option>
                </select>

                <button className="admin-filtro-limpiar" onClick={limpiar}>
                    Limpiar
                </button>
            </section>

            <section className="admin-tabla-container">
                <Tabla
                    rowKey="id"
                    data={filasFiltradas}
                    loading={cargandoInicial}
                    loadingText="Cargando registros..."
                    emptyText="No hay usuarios con esos filtros."
                    rowClassName={(f) => (!f.tieneEntrada ? "fila-sin-entrada" : "")}
                    columns={columnasTabla}
                />
            </section>
            {modalHorarioAbierto && (
                <ModalVerHorarioAdmin
                    abierto={modalHorarioAbierto}
                    usuarioNombre={horarioUsuario?.nombre}
                    imagenUrl={horarioUsuario?.imagen_url}
                    cargando={cargandoHorario}
                    onCerrar={cerrarModalHorario}
                />
            )}
            {justificacionVer && (
                <ModalVerJustificacion
                    abierto={Boolean(justificacionVer)}
                    justificacion={justificacionVer}
                    onCerrar={() => setJustificacionVer(null)}
                />
            )}
        </div>
    );
};

export default AsistenciaAdmin;