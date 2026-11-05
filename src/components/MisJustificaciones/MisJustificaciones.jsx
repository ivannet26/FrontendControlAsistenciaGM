// src/components/MisJustificaciones/MisJustificaciones.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FilePlus, NoteBlank, PencilSimple } from "@phosphor-icons/react";
import { Popover } from "@headlessui/react";
import "./MisJustificaciones.css";

const TEXTO_TIPO = {
    TARDANZA: "Tardanza",
    FALTA: "Falta",
    OLVIDO_MARCAR: "Olvidé marcar",
    Otro: "Otro",
};

const fechaLocalIso = (fecha = new Date()) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
};

const normalizarTipo = (tipo) => ({
    FALTA: "Falta",
    Falta: "Falta",
    TARDANZA: "Tardanza",
    Tardanza: "Tardanza",
    OLVIDO_MARCAR: "Olvidé marcar",
    "Olvidé marcar": "Olvidé marcar",
    OTRO: "Otro",
    Otro: "Otro",
}[tipo] || tipo);

const TEXTO_ESTADO = {
    PENDIENTE: "Pendiente",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
};

const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "—";

    const [año, mes, dia] = String(fechaIso).slice(0, 10).split("-");
    if (!año || !mes || !dia) return String(fechaIso);
    return `${dia}/${mes}/${año}`;
};

// El tipo y los minutos comparten un mismo chip neutro: "Tardanza · 45 min".
const textoTipo = (justificacion) => {
    const nombre = TEXTO_TIPO[justificacion.tipo] || "Justificación";
    const minutos = justificacion.minutos_tarde;

    if (justificacion.tipo !== "TARDANZA" || minutos === null || minutos === undefined) {
        return nombre;
    }

    return `${nombre} · ${minutos} min`;
};

const MisJustificaciones = ({
    justificaciones = [],
    cargando = false,
    error = "",
    onJustificarFalta,
    onEditarJustificacion,
}) => {
    const [historialAbierto, setHistorialAbierto] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(() => new Date());

    const todas = Array.isArray(justificaciones) ? justificaciones : [];
    const fechaSeleccionadaIso = (() => {
        const año = fechaSeleccionada.getFullYear();
        const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, "0");
        const dia = String(fechaSeleccionada.getDate()).padStart(2, "0");
        return `${año}-${mes}-${dia}`;
    })();
    const listaSeleccionada = todas.filter((justificacion) =>
        String(justificacion.fecha || "").slice(0, 10) === fechaSeleccionadaIso
    );
    const hoyIso = fechaLocalIso();
    const intentosFaltaHoy = todas.filter((justificacion) =>
        String(justificacion.fecha || "").slice(0, 10) === hoyIso
        && normalizarTipo(justificacion.tipo) === "Falta"
    ).length;
    const limiteIntentosAlcanzado = intentosFaltaHoy >= 2;

    return (
        <section className="mis-justificaciones" aria-labelledby="mis-justificaciones-titulo">
            <header className="mis-justificaciones-header">
                <div className="mis-justificaciones-titulo">
                    <h2 id="mis-justificaciones-titulo">Mis Justificaciones</h2>
                    <p>Revisa el estado de las tardanzas, faltas y olvidos que enviaste.</p>
                </div>

                <div className="mis-justificaciones-acciones-cabecera">
                    <Popover className="mis-justificaciones-calendario-controles">
                        <Popover.Button
                            type="button"
                            className="mis-justificaciones-calendario-boton"
                            aria-label="Filtrar justificaciones por fecha"
                        >
                            <span aria-hidden="true">📅</span>
                        </Popover.Button>
                        <Popover.Panel className="mis-justificaciones-calendario-popover">
                            {({ close }) => (
                                <Calendar
                                    locale="es-PE"
                                    value={fechaSeleccionada}
                                    onChange={(fecha) => {
                                        setFechaSeleccionada(fecha);
                                        close();
                                    }}
                                />
                            )}
                        </Popover.Panel>
                    </Popover>
                    <button
                        type="button"
                        className="mis-justificaciones-boton"
                        onClick={onJustificarFalta}
                        disabled={limiteIntentosAlcanzado}
                    >
                        <FilePlus size={17} weight="bold" aria-hidden="true" />
                        Justificar una falta
                    </button>
                    <button
                        type="button"
                        className="mis-justificaciones-boton mis-justificaciones-historial-boton"
                        onClick={() => setHistorialAbierto(true)}
                    >
                        Ver historial completo
                    </button>
                </div>
            </header>

            {limiteIntentosAlcanzado && (
                <p className="mis-justificaciones-limite" role="status">
                    Has alcanzado el límite de intentos
                </p>
            )}

            {error && (
                <p className="mis-justificaciones-error" role="alert">{error}</p>
            )}

            {cargando ? (
                <p className="mis-justificaciones-vacio" aria-busy="true">
                    Cargando tus justificaciones...
                </p>
            ) : listaSeleccionada.length === 0 ? (
                <div className="mis-justificaciones-vacio">
                    <NoteBlank size={34} weight="regular" aria-hidden="true" />
                    <span>No hay justificaciones para el día seleccionado.</span>
                </div>
            ) : (
                <ul className="mis-justificaciones-lista">
                    {listaSeleccionada.map((justificacion) => {
                        const estado = justificacion.estado || "PENDIENTE";
                        const editable = estado === "PENDIENTE"
                            && String(justificacion.fecha || "").slice(0, 10) === hoyIso;

                        return (
                            <li className="mis-justificaciones-item" key={justificacion.id}>
                                <span className="mis-justificaciones-tipo">
                                    {textoTipo(justificacion)}
                                </span>

                                <span className="mis-justificaciones-fecha">
                                    {formatearFecha(justificacion.fecha)}
                                </span>

                                <span className="mis-justificaciones-asunto" title={justificacion.asunto}>
                                    {justificacion.asunto || "Sin asunto"}
                                </span>

                                <span className="mis-justificaciones-estado">
                                    {TEXTO_ESTADO[estado] || estado}
                                </span>
                                <span className="mis-justificaciones-intento">
                                    {justificacion.intento_numero
                                        ? `Intento ${justificacion.intento_numero} de 2`
                                        : ""}
                                </span>
                                {editable && (
                                    <button
                                        type="button"
                                        className="mis-justificaciones-editar"
                                        onClick={() => onEditarJustificacion?.(justificacion)}
                                    >
                                        <PencilSimple size={15} weight="bold" aria-hidden="true" />
                                        Editar
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {historialAbierto && createPortal(
                <div
                    className="mis-justificaciones-historial-overlay"
                    role="presentation"
                    onClick={() => setHistorialAbierto(false)}
                >
                    <section
                        className="mis-justificaciones-historial-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Historial completo de justificaciones"
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <header>
                            <h2>Historial completo de justificaciones</h2>
                            <button
                                type="button"
                                aria-label="Cerrar historial"
                                onClick={() => setHistorialAbierto(false)}
                            >
                                ×
                            </button>
                        </header>
                        <div className="mis-justificaciones-historial-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Asunto</th>
                                        <th>Estado</th>
                                        <th>Comentario del Admin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...todas].sort((a, b) =>
                                        String(b.fecha || "").localeCompare(String(a.fecha || ""))
                                    ).map((justificacion) => (
                                        <tr key={`historial-${justificacion.id}`}>
                                            <td>{formatearFecha(justificacion.fecha)}</td>
                                            <td>{TEXTO_TIPO[justificacion.tipo] || "Justificación"}</td>
                                            <td>{justificacion.asunto || "Sin asunto"}</td>
                                            <td>{TEXTO_ESTADO[justificacion.estado || "PENDIENTE"]}</td>
                                            <td>
                                                {(justificacion.estado || "PENDIENTE") === "PENDIENTE"
                                                    ? "En revisión"
                                                    : justificacion.comentario_admin?.trim() || "Sin comentario"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {todas.length === 0 && (
                                <p className="mis-justificaciones-historial-vacio">
                                    No hay justificaciones registradas.
                                </p>
                            )}
                        </div>
                    </section>
                </div>,
                document.body
            )}
        </section>
    );
};

export default MisJustificaciones;
