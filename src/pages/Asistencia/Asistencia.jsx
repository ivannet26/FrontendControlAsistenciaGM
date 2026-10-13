import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    Alarm,
    ArrowUUpLeft,
    CalendarBlank,
    CheckCircle,
    Clock,
    Coffee,
    SignIn,
    SignOut,
} from "@phosphor-icons/react";
import {
    obtenerFechaLocal,
    obtenerRegistrosHoy,
    obtenerRegistrosPorFecha,
    registrarEvento,
} from "../../services/asistenciaService";
import {
    MENSAJES_ENTRADA,
    MENSAJES_SALIDA,
    obtenerMensajeAleatorio,
} from "./mensajesAsistencia";
import "./Asistencia.css";

const ACCIONES = [
    { tipo: "ENTRADA", titulo: "ENTRADA", descripcion: "Fichar entrada", icono: SignIn, color: "entrada" },
    { tipo: "BREAK_INICIO", titulo: "INICIO DESCANSO", descripcion: "Iniciar tiempo de break", icono: Coffee, color: "descanso" },
    { tipo: "BREAK_FIN", titulo: "FIN DESCANSO", descripcion: "Terminar tiempo de break", icono: Alarm, color: "descanso" },
    { tipo: "SALIDA", titulo: "SALIDA", descripcion: "Fichar salida", icono: SignOut, color: "salida" },
];

const formatearHora = (iso) => iso
    ? new Date(iso).toLocaleTimeString("es-PE", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    })
    : "—";

const formatearFechaLarga = (fechaIso) => {
    const [año, mes, dia] = fechaIso.split("-").map(Number);
    const texto = new Date(año, mes - 1, dia).toLocaleDateString("es-PE", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    return texto.charAt(0).toLocaleUpperCase("es-PE") + texto.slice(1);
};

const formatearFechaCorta = (fechaIso) => {
    const [año, mes, dia] = fechaIso.split("-");
    return `${dia}/${mes}/${año}`;
};

// Formatea la duración entre dos fechas ISO en formato HH:MM:SS
const formatearDuracion = (inicio, fin) => {
    if (!inicio || !fin) return "—";
    const ms = new Date(fin) - new Date(inicio);
    if (ms < 0) return "—";
    const totalSeg = Math.floor(ms / 1000);
    const h = Math.floor(totalSeg / 3600);
    const m = Math.floor((totalSeg % 3600) / 60);
    const s = totalSeg % 60;
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const obtenerEstado = (registros) => {
    if (registros.length === 0) return "SIN_ENTRADA";
    const ultimoTipo = registros[registros.length - 1].tipo;
    if (ultimoTipo === "ENTRADA" || ultimoTipo === "BREAK_FIN") return "TRABAJANDO";
    if (ultimoTipo === "BREAK_INICIO") return "EN_BREAK";
    if (ultimoTipo === "SALIDA") return "FINALIZADO";
    return "SIN_ENTRADA";
};

// ⭐ FIX: valida la acción según los registros completos del día
// Regla clave: solo 1 descanso por jornada.
const validarAccion = (tipo, registros) => {
    const estado = obtenerEstado(registros);
    const ultimo = registros[registros.length - 1];

    // Encontrar el índice de la última ENTRADA (inicio de la jornada actual)
    const ultimaEntradaIdx = registros.map((r) => r.tipo).lastIndexOf("ENTRADA");
    const registrosJornada = ultimaEntradaIdx >= 0
        ? registros.slice(ultimaEntradaIdx)
        : [];

    // Contar cuántos breaks se iniciaron en la jornada actual
    const breaksIniciados = registrosJornada.filter(
        (r) => r.tipo === "BREAK_INICIO"
    ).length;

    switch (tipo) {
        case "ENTRADA":
            return estado === "SIN_ENTRADA";

        case "BREAK_INICIO":
            // Solo si está trabajando Y NO ha iniciado break aún en esta jornada
            return estado === "TRABAJANDO" && breaksIniciados === 0;

        case "BREAK_FIN":
            // Solo si está en break y el último evento fue BREAK_INICIO
            return estado === "EN_BREAK" && ultimo?.tipo === "BREAK_INICIO";

        case "SALIDA":
            return estado === "TRABAJANDO";

        default:
            return false;
    }
};

const textoAccion = (tipo) => ({
    ENTRADA: "Entrada",
    BREAK_INICIO: "Inicio descanso",
    BREAK_FIN: "Fin descanso",
    SALIDA: "Salida",
}[tipo] || tipo.replaceAll("_", " "));

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

const normalizarRespuestaAsistencia = (respuesta) => {
    const registros = Array.isArray(respuesta?.registros) ? respuesta.registros : [];
    return {
        registros,
        estado: respuesta?.estado || obtenerEstado(registros),
    };
};

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    if (detalle !== undefined && detalle !== null) return JSON.stringify(detalle);
    return error.message || mensajePredeterminado;
};

const Asistencia = () => {
    const [registrosHoy, setRegistrosHoy] = useState([]);
    const [estadoRespuestaHoy, setEstadoRespuestaHoy] = useState("SIN_ENTRADA");
    const [registrosFechaVista, setRegistrosFechaVista] = useState([]);
    const [errorCarga, setErrorCarga] = useState("");
    const [fechaVista, setFechaVista] = useState(() => obtenerFechaLocal());
    const [horaActual, setHoraActual] = useState(() => new Date());
    const [cargando, setCargando] = useState(true);
    const [alerta, setAlerta] = useState(null);

    // Anti-spam
    const [accionEnProceso, setAccionEnProceso] = useState(false);
    const accionEnProcesoRef = useRef(false);

    // Ref del input de fecha (para abrir el calendario nativo)
    const inputFechaRef = useRef(null);

    const hoy = obtenerFechaLocal();
    const esHoy = fechaVista === hoy;
    const estadoHoy = estadoRespuestaHoy || obtenerEstado(registrosHoy);

    const leerRegistros = useCallback(async (fecha) => (
        fecha === obtenerFechaLocal()
            ? obtenerRegistrosHoy()
            : obtenerRegistrosPorFecha(fecha)
    ), []);

    useEffect(() => {
        const intervalo = window.setInterval(() => setHoraActual(new Date()), 1000);
        return () => window.clearInterval(intervalo);
    }, []);

    useEffect(() => {
        if (!alerta) return undefined;
        const timeout = window.setTimeout(() => setAlerta(null), 3000);
        return () => window.clearTimeout(timeout);
    }, [alerta]);

    useEffect(() => {
        let cancelado = false;

        const cargarAsistenciaHoy = async () => {
            setCargando(true);
            try {
                const respuesta = normalizarRespuestaAsistencia(
                    await obtenerRegistrosHoy()
                );
                if (cancelado) return;
                setRegistrosHoy(respuesta.registros);
                setRegistrosFechaVista(respuesta.registros);
                setEstadoRespuestaHoy(respuesta.estado);
                setErrorCarga("");
            } catch (error) {
                if (cancelado) return;
                const mensaje = obtenerMensajeError(
                    error,
                    "No se pudieron cargar los registros de asistencia."
                );
                setErrorCarga(mensaje);
                toast.error(mensaje);
            } finally {
                if (!cancelado) setCargando(false);
            }
        };

        cargarAsistenciaHoy();
        return () => {
            cancelado = true;
        };
    }, []);

    const registrar = async (tipo) => {
        if (accionEnProcesoRef.current || accionEnProceso) return;

        // ⭐ FIX: pasamos registrosHoy en lugar de estadoHoy
        if (!validarAccion(tipo, registrosHoy)) {
            toast.error("Acción no válida en el estado actual.");
            return;
        }

        accionEnProcesoRef.current = true;
        setAccionEnProceso(true);

        try {
            await registrarEvento(tipo);
            const respuesta = normalizarRespuestaAsistencia(
                await leerRegistros(obtenerFechaLocal())
            );
            setErrorCarga("");
            setRegistrosHoy(respuesta.registros);
            setEstadoRespuestaHoy(respuesta.estado);
            if (fechaVista === obtenerFechaLocal()) {
                setRegistrosFechaVista(respuesta.registros);
            }
            if (tipo === "ENTRADA") {
                setAlerta({
                    tipo,
                    mensaje: obtenerMensajeAleatorio(MENSAJES_ENTRADA),
                });
            } else if (tipo === "SALIDA") {
                setAlerta({
                    tipo,
                    mensaje: obtenerMensajeAleatorio(MENSAJES_SALIDA),
                });
            } else {
                toast.success(`${textoAccion(tipo)} registrada correctamente.`);
            }
        } catch (error) {
            toast.error(obtenerMensajeError(error, "No se pudo registrar la acción."));
        } finally {
            window.setTimeout(() => {
                accionEnProcesoRef.current = false;
                setAccionEnProceso(false);
            }, 800);
        }
    };

    // Abre el calendario nativo del navegador
    const abrirCalendario = () => {
        if (inputFechaRef.current?.showPicker) {
            inputFechaRef.current.showPicker();
        } else {
            inputFechaRef.current?.focus();
            inputFechaRef.current?.click();
        }
    };

    // Cambia la fecha cuando el usuario elige una en el calendario
    const cambiarFecha = async (e) => {
        const nuevaFecha = e.target.value;
        if (!nuevaFecha) return;
        try {
            const respuesta = normalizarRespuestaAsistencia(await leerRegistros(nuevaFecha));
            setRegistrosFechaVista(respuesta.registros);
            if (nuevaFecha === obtenerFechaLocal()) {
                setRegistrosHoy(respuesta.registros);
                setEstadoRespuestaHoy(respuesta.estado);
            }
            setErrorCarga("");
            setFechaVista(nuevaFecha);
        } catch (error) {
            toast.error(obtenerMensajeError(
                error,
                "No se pudieron cargar los registros de esa fecha."
            ));
        }
    };

    const volverHoy = async () => {
        const fechaActual = obtenerFechaLocal();
        try {
            const respuesta = normalizarRespuestaAsistencia(await leerRegistros(fechaActual));
            setRegistrosHoy(respuesta.registros);
            setRegistrosFechaVista(respuesta.registros);
            setEstadoRespuestaHoy(respuesta.estado);
            setErrorCarga("");
            setFechaVista(fechaActual);
        } catch (error) {
            toast.error(obtenerMensajeError(error, "No se pudieron cargar los registros de hoy."));
        }
    };

    // Busca el primer registro por tipo en la fecha vista
    const buscarRegistro = (tipo) =>
        registrosFechaVista.find((r) => r.tipo === tipo);

    const entradaReg = buscarRegistro("ENTRADA");
    const breakInicioReg = buscarRegistro("BREAK_INICIO");
    const breakFinReg = buscarRegistro("BREAK_FIN");
    const salidaReg = buscarRegistro("SALIDA");

    return (
        <div className="asistencia-container">
            <header className="asistencia-header">
                <div className="asistencia-titulo">
                    <p className="asistencia-eyebrow">CONTROL PERSONAL</p>
                    <h1>Mi asistencia</h1>
                    <p className="asistencia-fecha">{formatearFechaLarga(fechaVista)}</p>
                </div>
            </header>

            <main className="asistencia-layout">
                <section className="asistencia-columna-izquierda" aria-label="Reloj y acciones">
                    <div className="asistencia-reloj" aria-label="Hora actual">
                        <div className="asistencia-reloj-label">
                            <Clock size={20} weight="bold" aria-hidden="true" />
                            <span>HORA ACTUAL</span>
                        </div>
                        <strong>{horaActual.toLocaleTimeString("es-PE", {
                            hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
                        })}</strong>
                    </div>

                    {!esHoy && (
                        <p className="asistencia-solo-lectura">Solo puedes registrar acciones para hoy.</p>
                    )}

                    <section className="asistencia-acciones" aria-label="Acciones de asistencia">
                        {ACCIONES.map(({ tipo, titulo, descripcion, icono: Icono, color }) => {
                            // ⭐ FIX: pasamos registrosHoy en lugar de estadoHoy
                            const habilitado = esHoy && validarAccion(tipo, registrosHoy);
                            return (
                                <button
                                    className={`asistencia-accion asistencia-accion-${color}`}
                                    key={tipo}
                                    type="button"
                                    disabled={
                                        !habilitado ||
                                        accionEnProceso ||
                                        cargando
                                    }
                                    onClick={() => registrar(tipo)}
                                >
                                    <Icono size={22} weight="bold" aria-hidden="true" />
                                    <span className="asistencia-accion-texto">
                                        <span className="asistencia-accion-titulo">{titulo}</span>
                                        <span className="asistencia-accion-sub">{descripcion}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </section>
                </section>

                <section className="asistencia-registros" aria-label="Registros de asistencia">
                    {errorCarga && (
                        <div className="asistencia-error-carga" role="alert">{errorCarga}</div>
                    )}

                    {!esHoy && (
                        <div className="asistencia-aviso-historico">
                            <span>Viendo registros del {formatearFechaCorta(fechaVista)}</span>
                            <button type="button" onClick={volverHoy}>
                                <ArrowUUpLeft size={14} weight="bold" aria-hidden="true" />
                                Volver a hoy
                            </button>
                        </div>
                    )}

                    <div className="asistencia-seccion-header">
                        <h2>{esHoy ? "Registros del día" : `Registros del ${formatearFechaCorta(fechaVista)}`}</h2>

                        <div className="asistencia-seccion-header-derecha">
                            {esHoy && (
                                <span className={`asistencia-estado estado-${claseEstado(estadoHoy)}`}>
                                    {textoEstado(estadoHoy)}
                                </span>
                            )}

                            {/* Selector de fecha: abre directamente el calendario nativo */}
                            <div className="asistencia-selector-fecha">
                                <button
                                    type="button"
                                    className="asistencia-ver-dias"
                                    onClick={abrirCalendario}
                                    title="Cambiar fecha"
                                    aria-label="Cambiar fecha"
                                >
                                    <CalendarBlank size={16} weight="bold" aria-hidden="true" />
                                </button>
                                <input
                                    ref={inputFechaRef}
                                    type="date"
                                    value={fechaVista}
                                    max={hoy}
                                    onChange={cambiarFecha}
                                    className="asistencia-input-fecha-oculto"
                                    tabIndex={-1}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="asistencia-tabla-scroll">
                        {cargando && esHoy ? (
                            <div className="asistencia-vacio">
                                <span>Cargando registros...</span>
                            </div>
                        ) : registrosFechaVista.length === 0 ? (
                            <div className="asistencia-vacio">
                                <Clock size={48} weight="regular" aria-hidden="true" />
                                <span>Aún no has registrado ninguna acción</span>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Entrada</th>
                                        <th>Inicio descanso</th>
                                        <th>Fin descanso</th>
                                        <th>Duración</th>
                                        <th>Salida</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="asistencia-hora">
                                            {formatearHora(entradaReg?.hora)}
                                        </td>
                                        <td className="asistencia-hora">
                                            {formatearHora(breakInicioReg?.hora)}
                                        </td>
                                        <td className="asistencia-hora">
                                            {formatearHora(breakFinReg?.hora)}
                                        </td>
                                        <td className="asistencia-hora asistencia-duracion">
                                            {formatearDuracion(
                                                breakInicioReg?.hora,
                                                breakFinReg?.hora
                                            )}
                                        </td>
                                        <td className="asistencia-hora">
                                            {formatearHora(salidaReg?.hora)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>

            {alerta && (
                <div className="asistencia-alerta-overlay" role="presentation">
                    <section
                        className="asistencia-alerta-caja"
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <CheckCircle
                            className="asistencia-alerta-icono"
                            size={64}
                            weight="fill"
                            aria-hidden="true"
                        />
                        <h2 className="asistencia-alerta-titulo">
                            {alerta.tipo === "ENTRADA" ? "Entrada registrada" : "Salida registrada"}
                        </h2>
                        <p className="asistencia-alerta-subtitulo">{alerta.mensaje}</p>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Asistencia;