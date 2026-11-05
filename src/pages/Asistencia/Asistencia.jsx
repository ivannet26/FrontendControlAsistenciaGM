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
    interpretarMarcaje,
    obtenerFechaLocal,
    obtenerRegistrosHoy,
    obtenerRegistrosPorFecha,
    obtenerResumenHoras,
    registrarEvento,
} from "../../services/asistenciaService";
import { useJustificaciones } from "../../hooks/useJustificaciones";
import AlertaTardanza from "../../components/AlertaTardanza/AlertaTardanza";
import MisJustificaciones from "../../components/MisJustificaciones/MisJustificaciones";
import ModalJustificacion from "../../components/ModalJustificacion/ModalJustificacion";
import ProgresoHoras from "../../components/ProgresoHoras/ProgresoHoras";
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
        justificacionFalta: respuesta?.justificacion_falta || null,
    };
};

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    if (detalle !== undefined && detalle !== null) return JSON.stringify(detalle);
    return error.message || mensajePredeterminado;
};

const Asistencia = () => {
    const [tabActiva, setTabActiva] = useState("MI_ASISTENCIA");
    const [registrosHoy, setRegistrosHoy] = useState([]);
    const [resumenHoras, setResumenHoras] = useState(null);
    const [estadoRespuestaHoy, setEstadoRespuestaHoy] = useState("SIN_ENTRADA");
    const [estadoFechaVista, setEstadoFechaVista] = useState("SIN_ENTRADA");
    const [justificacionFaltaFechaVista, setJustificacionFaltaFechaVista] = useState(null);
    const [registrosFechaVista, setRegistrosFechaVista] = useState([]);
    const [errorCarga, setErrorCarga] = useState("");
    const [fechaVista, setFechaVista] = useState(() => obtenerFechaLocal());
    const [horaActual, setHoraActual] = useState(() => new Date());
    const [cargando, setCargando] = useState(true);
    const [alerta, setAlerta] = useState(null);
    const [alertaTardanza, setAlertaTardanza] = useState(null);
    const [modalJustificacion, setModalJustificacion] = useState(null);

    // Anti-spam
    const [accionEnProceso, setAccionEnProceso] = useState(false);
    const accionEnProcesoRef = useRef(false);

    // Ref del input de fecha (para abrir el calendario nativo)
    const inputFechaRef = useRef(null);

    // Estados previos: permiten avisar cuando administración resuelve una justificación.
    const estadosJustificacionesRef = useRef(null);
    const {
        justificaciones,
        cargando: cargandoJustificaciones,
        error: errorJustificaciones,
        recargar: recargarJustificaciones,
    } = useJustificaciones({ fuente: "mias", intervaloRefresco: 60000 });

    const hoy = obtenerFechaLocal();
    const esHoy = fechaVista === hoy;
    const estadoHoy = estadoRespuestaHoy || obtenerEstado(registrosHoy);
    const faltaJustificada = fechaVista === hoy
        ? estadoRespuestaHoy === "FALTA_JUSTIFICADA"
        : estadoFechaVista === "FALTA_JUSTIFICADA"
            || Boolean(justificacionFaltaFechaVista);

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

    // Aviso cuando una justificación propia pasa de pendiente a aceptada o rechazada.
    useEffect(() => {
        const actuales = new Map(
            (Array.isArray(justificaciones) ? justificaciones : [])
                .map((justificacion) => [justificacion.id, justificacion.estado])
        );
        const previos = estadosJustificacionesRef.current;

        if (previos) {
            actuales.forEach((estado, id) => {
                if (previos.get(id) !== "PENDIENTE") return;

                if (estado === "ACEPTADA") {
                    toast.success("Tu justificación fue aceptada.");
                } else if (estado === "RECHAZADA") {
                    toast.error("Tu justificación fue rechazada.");
                }
            });
        }

        estadosJustificacionesRef.current = actuales;
    }, [justificaciones]);

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
                setEstadoFechaVista(respuesta.estado);
                setJustificacionFaltaFechaVista(respuesta.justificacionFalta);
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

        obtenerResumenHoras()
            .then((resumen) => {
                if (!cancelado) setResumenHoras(resumen);
            })
            .catch((error) => {
                if (!cancelado) {
                    console.error("No se pudo cargar el resumen de horas.", error);
                }
            });

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
            const respuestaMarcaje = await registrarEvento(tipo);
            const respuesta = normalizarRespuestaAsistencia(
                await leerRegistros(obtenerFechaLocal())
            );
            setErrorCarga("");
            setRegistrosHoy(respuesta.registros);
            setEstadoRespuestaHoy(respuesta.estado);
            if (fechaVista === obtenerFechaLocal()) setEstadoFechaVista(respuesta.estado);
            setJustificacionFaltaFechaVista(respuesta.justificacionFalta);
            if (fechaVista === obtenerFechaLocal()) {
                setRegistrosFechaVista(respuesta.registros);
            }
            obtenerResumenHoras()
                .then((resumenActualizado) => setResumenHoras(resumenActualizado))
                .catch((errorResumen) => {
                    console.error("No se pudo actualizar el resumen de horas.", errorResumen);
                });
            if (tipo === "ENTRADA") {
                // El estado y los minutos de tardanza vienen resueltos por el backend.
                const marcaje = interpretarMarcaje(respuestaMarcaje);
                setAlertaTardanza(marcaje?.esTardanza
                    ? {
                        estado: marcaje.estado,
                        minutosTarde: marcaje.minutosTarde,
                        horario: marcaje.horario,
                        horaMarcada: marcaje.horaMarcada,
                    }
                    : null);

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
            setEstadoFechaVista(respuesta.estado);
            setJustificacionFaltaFechaVista(respuesta.justificacionFalta);
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
            setEstadoFechaVista(respuesta.estado);
            setJustificacionFaltaFechaVista(respuesta.justificacionFalta);
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

    const abrirJustificacionFalta = () => setModalJustificacion({ motivo: "FALTA" });

    const abrirEdicionJustificacion = (justificacion) => setModalJustificacion({
        motivo: justificacion.tipo,
        fecha: String(justificacion.fecha || "").slice(0, 10),
        justificacionEditando: justificacion,
        intentoNumero: justificacion.intento_numero,
    });

    const obtenerIntentoSiguiente = (tipo, fecha) => {
        const tiposEquivalentes = {
            FALTA: "Falta",
            Falta: "Falta",
            TARDANZA: "Tardanza",
            Tardanza: "Tardanza",
            OLVIDO_MARCAR: "Olvidé marcar",
            "Olvidé marcar": "Olvidé marcar",
            OTRO: "Otro",
            Otro: "Otro",
        };
        const tipoNormalizado = tiposEquivalentes[tipo] || tipo;
        const fechaNormalizada = String(fecha || "").slice(0, 10);
        const intentos = (Array.isArray(justificaciones) ? justificaciones : [])
            .filter((justificacion) =>
                String(justificacion.fecha || "").slice(0, 10) === fechaNormalizada
                && (tiposEquivalentes[justificacion.tipo] || justificacion.tipo) === tipoNormalizado
            ).length;
        return Math.min(intentos + 1, 2);
    };
    const intentoSiguiente = modalJustificacion
        ? obtenerIntentoSiguiente(modalJustificacion.motivo, modalJustificacion.fecha || hoy)
        : 1;

    const abrirJustificacionTardanza = () => setModalJustificacion({
        motivo: "TARDANZA",
        fecha: hoy,
        minutosTarde: alertaTardanza?.minutosTarde ?? null,
    });

    const cerrarJustificacion = () => setModalJustificacion(null);

    const alEnviarJustificacion = () => {
        setAlertaTardanza(null);
        void recargarJustificaciones();
    };

    return (
        <div className="asistencia-container">
            <div className="asistencia-contenido">
            <header className="asistencia-header">
                <div className="asistencia-titulo">
                    <p className="asistencia-eyebrow">CONTROL PERSONAL</p>
                    <h1>Mi asistencia</h1>
                    <p className="asistencia-fecha">{formatearFechaLarga(fechaVista)}</p>
                </div>
            </header>

            <div className="asistencia-tabs" role="tablist" aria-label="Secciones de asistencia">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tabActiva === "MI_ASISTENCIA"}
                    className={tabActiva === "MI_ASISTENCIA" ? "activo" : ""}
                    onClick={() => setTabActiva("MI_ASISTENCIA")}
                >
                    MI ASISTENCIA
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tabActiva === "MIS_JUSTIFICACIONES"}
                    className={tabActiva === "MIS_JUSTIFICACIONES" ? "activo" : ""}
                    onClick={() => setTabActiva("MIS_JUSTIFICACIONES")}
                >
                    MIS JUSTIFICACIONES
                </button>
            </div>

            {tabActiva === "MI_ASISTENCIA" && (
            <>
            {alertaTardanza && (
                <AlertaTardanza
                    estado={alertaTardanza.estado}
                    minutosTarde={alertaTardanza.minutosTarde}
                    horario={alertaTardanza.horario}
                    horaMarcada={alertaTardanza.horaMarcada}
                    onJustificar={abrirJustificacionTardanza}
                    onCerrar={() => setAlertaTardanza(null)}
                />
            )}

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

                    {faltaJustificada && (
                        <div className="asistencia-falta-justificada" role="status">
                            <strong>Falta Justificada</strong>
                            <span>
                                {justificacionFaltaFechaVista?.asunto
                                    || justificacionFaltaFechaVista?.mensaje
                                    || "Falta programada aprobada"}
                            </span>
                        </div>
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
                                        cargando ||
                                        faltaJustificada
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
                </section>

                <aside className="asistencia-columna-progreso" aria-label="Progreso de horas">
                    <ProgresoHoras
                        estado={estadoHoy}
                        datos={resumenHoras}
                        registros={registrosHoy}
                        horaActual={horaActual}
                    />
                </aside>
            </main>

            </>
            )}

            {tabActiva === "MIS_JUSTIFICACIONES" && (
                <section className="asistencia-tab-justificaciones" aria-label="Mis justificaciones">
                    <MisJustificaciones
                        justificaciones={justificaciones}
                        cargando={cargandoJustificaciones}
                        error={errorJustificaciones}
                        onJustificarFalta={abrirJustificacionFalta}
                        onEditarJustificacion={abrirEdicionJustificacion}
                    />
                </section>
            )}
            </div>

            {modalJustificacion && (
                <ModalJustificacion
                    abierto={Boolean(modalJustificacion)}
                    motivoInicial={modalJustificacion.motivo}
                    fechaInicial={modalJustificacion.fecha}
                    minutosTarde={modalJustificacion.minutosTarde}
                    intentoNumero={modalJustificacion.intentoNumero || intentoSiguiente}
                    justificacionEditando={modalJustificacion.justificacionEditando}
                    justificaciones={justificaciones}
                    onCerrar={cerrarJustificacion}
                    onEnviada={alEnviarJustificacion}
                />
            )}

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