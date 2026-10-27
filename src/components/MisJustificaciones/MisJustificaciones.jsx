// src/components/MisJustificaciones/MisJustificaciones.jsx
import { FilePlus, NoteBlank } from "@phosphor-icons/react";
import "./MisJustificaciones.css";

const TEXTO_TIPO = {
    TARDANZA: "Tardanza",
    FALTA: "Falta",
    OLVIDO_MARCAR: "Olvidé marcar",
};

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

const MisJustificaciones = ({
    justificaciones = [],
    cargando = false,
    error = "",
    onJustificarFalta,
}) => {
    const lista = Array.isArray(justificaciones) ? justificaciones : [];

    return (
        <section className="mis-justificaciones" aria-labelledby="mis-justificaciones-titulo">
            <header className="mis-justificaciones-header">
                <div>
                    <h2 id="mis-justificaciones-titulo">Mis justificaciones</h2>
                    <p>Revisa el estado de las tardanzas, faltas y olvidos que enviaste.</p>
                </div>

                <button
                    type="button"
                    className="mis-justificaciones-boton"
                    onClick={onJustificarFalta}
                >
                    <FilePlus size={17} weight="bold" aria-hidden="true" />
                    Justificar una falta
                </button>
            </header>

            {error && (
                <p className="mis-justificaciones-error" role="alert">{error}</p>
            )}

            {cargando ? (
                <p className="mis-justificaciones-vacio" aria-busy="true">
                    Cargando tus justificaciones...
                </p>
            ) : lista.length === 0 ? (
                <div className="mis-justificaciones-vacio">
                    <NoteBlank size={34} weight="regular" aria-hidden="true" />
                    <span>Aún no has enviado ninguna justificación.</span>
                </div>
            ) : (
                <ul className="mis-justificaciones-lista">
                    {lista.map((justificacion) => {
                        const estado = justificacion.estado || "PENDIENTE";

                        return (
                            <li className="mis-justificaciones-item" key={justificacion.id}>
                                <span className={`mis-justificaciones-tipo tipo-${(justificacion.tipo || "").toLowerCase()}`}>
                                    {TEXTO_TIPO[justificacion.tipo] || "Justificación"}
                                </span>

                                <span className="mis-justificaciones-fecha">
                                    {formatearFecha(justificacion.fecha)}
                                </span>

                                <span className="mis-justificaciones-asunto" title={justificacion.asunto}>
                                    {justificacion.asunto || "Sin asunto"}
                                </span>

                                <span className={`mis-justificaciones-estado estado-${estado.toLowerCase()}`}>
                                    {TEXTO_ESTADO[estado] || estado}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};

export default MisJustificaciones;
