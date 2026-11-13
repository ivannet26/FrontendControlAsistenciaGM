import { FilePlus, NoteBlank, PencilSimple } from "@phosphor-icons/react";
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
    const todas = Array.isArray(justificaciones) ? justificaciones : [];
    const historial = [...todas].sort((a, b) =>
        String(b.fecha || "").localeCompare(String(a.fecha || ""))
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
                    <button
                        type="button"
                        className="mis-justificaciones-boton"
                        onClick={onJustificarFalta}
                        disabled={limiteIntentosAlcanzado}
                    >
                        <FilePlus size={17} weight="bold" aria-hidden="true" />
                        Justificar una falta
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
            ) : historial.length === 0 ? (
                <div className="mis-justificaciones-vacio">
                    <NoteBlank size={34} weight="regular" aria-hidden="true" />
                    <span>No hay justificaciones registradas.</span>
                </div>
            ) : (
                <div className="mis-justificaciones-tabla-scroll">
                    <table className="mis-justificaciones-tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Asunto</th>
                                <th>Estado</th>
                                <th>Comentario del Admin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.map((justificacion) => {
                                const estado = justificacion.estado || "PENDIENTE";
                                const editable = estado === "PENDIENTE"
                                    && String(justificacion.fecha || "").slice(0, 10) === hoyIso;

                                return (
                                    <tr key={justificacion.id}>
                                        <td>{formatearFecha(justificacion.fecha)}</td>
                                        <td>{textoTipo(justificacion)}</td>
                                        <td>{justificacion.asunto || "Sin asunto"}</td>
                                        <td>{TEXTO_ESTADO[estado] || estado}</td>
                                        <td>
                                            {estado === "PENDIENTE"
                                                ? "En revisión"
                                                : justificacion.comentario_admin?.trim() || "Sin comentario"}
                                        </td>
                                        <td className="mis-justificaciones-acciones-celda">
                                            {editable && (
                                                <button
                                                    type="button"
                                                    className="mis-justificaciones-editar"
                                                    onClick={() => onEditarJustificacion?.(justificacion)}
                                                    aria-label={`Editar justificación: ${justificacion.asunto || "Sin asunto"}`}
                                                >
                                                    <PencilSimple size={15} weight="bold" aria-hidden="true" />
                                                    Editar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default MisJustificaciones;
