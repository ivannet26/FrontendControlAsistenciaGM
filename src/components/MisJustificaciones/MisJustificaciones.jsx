// src/components/MisJustificaciones/MisJustificaciones.jsx
import { useState } from "react";
import { CaretLeft, CaretRight, FilePlus, NoteBlank } from "@phosphor-icons/react";
import "./MisJustificaciones.css";

const POR_PAGINA = 10;

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
}) => {
    const [pagina, setPagina] = useState(1);

    const lista = Array.isArray(justificaciones) ? justificaciones : [];
    const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const listaPagina = lista.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
    );

    return (
        <section className="mis-justificaciones" aria-labelledby="mis-justificaciones-titulo">
            <header className="mis-justificaciones-header">
                <div className="mis-justificaciones-titulo">
                    <h2 id="mis-justificaciones-titulo">Mis justificaciones</h2>
                    <p>Revisa el estado de las tardanzas, faltas y olvidos que enviaste.</p>
                </div>

                <div className="mis-justificaciones-acciones-cabecera">
                    {lista.length > 0 && (
                        <div className="mis-justificaciones-paginacion">
                            <button
                                type="button"
                                className="mis-justificaciones-pagina-boton"
                                onClick={() => setPagina(paginaActual - 1)}
                                disabled={paginaActual <= 1}
                                aria-label="Página anterior"
                            >
                                <CaretLeft size={12} weight="bold" aria-hidden="true" />
                            </button>
                            <span className="mis-justificaciones-pagina-texto">
                                {paginaActual} de {totalPaginas}
                            </span>
                            <button
                                type="button"
                                className="mis-justificaciones-pagina-boton"
                                onClick={() => setPagina(paginaActual + 1)}
                                disabled={paginaActual >= totalPaginas}
                                aria-label="Página siguiente"
                            >
                                <CaretRight size={12} weight="bold" aria-hidden="true" />
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        className="mis-justificaciones-boton"
                        onClick={onJustificarFalta}
                    >
                        <FilePlus size={17} weight="bold" aria-hidden="true" />
                        Justificar una falta
                    </button>
                </div>
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
                    {listaPagina.map((justificacion) => {
                        const estado = justificacion.estado || "PENDIENTE";

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
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};

export default MisJustificaciones;
