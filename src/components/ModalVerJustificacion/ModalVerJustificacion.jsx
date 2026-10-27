// src/components/ModalVerJustificacion/ModalVerJustificacion.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import "./ModalVerJustificacion.css";

const TEXTO_TIPO = {
    TARDANZA: "Tardanza",
    FALTA: "Falta",
    OLVIDO_MARCAR: "Olvidé marcar",
};

const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "—";

    const [año, mes, dia] = String(fechaIso).slice(0, 10).split("-");
    if (!año || !mes || !dia) return String(fechaIso);
    return `${dia}/${mes}/${año}`;
};

const ModalVerJustificacion = ({ abierto = false, justificacion, onCerrar }) => {
    const [imagenAbierta, setImagenAbierta] = useState(false);

    useEffect(() => {
        if (!abierto) return undefined;

        const cerrarConEscape = (evento) => {
            if (evento.key !== "Escape") return;

            if (imagenAbierta) {
                setImagenAbierta(false);
                return;
            }

            onCerrar?.();
        };

        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [abierto, imagenAbierta, onCerrar]);

    if (!abierto || !justificacion) return null;

    const tipo = TEXTO_TIPO[justificacion.tipo] || "Justificación";
    const evidencia = justificacion.evidencia_url;

    return createPortal(
        <>
            <div
                className="modal-ver-justificacion-overlay"
                role="presentation"
                onClick={() => onCerrar?.()}
            >
                <div
                    className="modal-ver-justificacion"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-ver-justificacion-titulo"
                    onClick={(evento) => evento.stopPropagation()}
                >
                    <header className="modal-ver-justificacion-header">
                        <div className="modal-ver-justificacion-titulo">
                            <p className="modal-ver-justificacion-eyebrow">JUSTIFICACIÓN ACEPTADA</p>
                            <h2 id="modal-ver-justificacion-titulo">
                                {justificacion.asunto || "Sin asunto"}
                            </h2>
                            <p className="modal-ver-justificacion-meta">
                                {tipo} · {formatearFecha(justificacion.fecha)}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="modal-ver-justificacion-cerrar"
                            onClick={() => onCerrar?.()}
                            aria-label="Cerrar"
                            autoFocus
                        >
                            <X size={18} weight="bold" aria-hidden="true" />
                        </button>
                    </header>

                    <div className="modal-ver-justificacion-cuerpo">
                        <p className="modal-ver-justificacion-texto">
                            {justificacion.mensaje || "Sin mensaje"}
                        </p>

                        <div className="modal-ver-justificacion-foto">
                            <span className="modal-ver-justificacion-etiqueta">Foto</span>

                            {evidencia ? (
                                <button
                                    type="button"
                                    className="modal-ver-justificacion-ver-imagen"
                                    onClick={() => setImagenAbierta(true)}
                                >
                                    Ver imagen
                                </button>
                            ) : (
                                <span className="modal-ver-justificacion-sin-adjunto">Sin adjunto</span>
                            )}
                        </div>
                    </div>

                    <footer className="modal-ver-justificacion-footer">
                        <button
                            type="button"
                            className="modal-ver-justificacion-cerrar-boton"
                            onClick={() => onCerrar?.()}
                        >
                            Cerrar
                        </button>
                    </footer>
                </div>
            </div>

            {imagenAbierta && evidencia && (
                <div
                    className="modal-ver-justificacion-lightbox"
                    role="presentation"
                    onClick={() => setImagenAbierta(false)}
                >
                    <div
                        className="modal-ver-justificacion-lightbox-caja"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Imagen de la justificación de ${justificacion.usuario || "el usuario"}`}
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <img
                            src={evidencia}
                            alt={`Adjunto de la justificación de ${justificacion.usuario || "el usuario"}`}
                        />
                        <div className="modal-ver-justificacion-lightbox-info">
                            <button
                                type="button"
                                className="modal-ver-justificacion-lightbox-cerrar"
                                onClick={() => setImagenAbierta(false)}
                                aria-label="Cerrar imagen"
                            >
                                <X size={18} weight="bold" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>,
        document.body
    );
};

export default ModalVerJustificacion;
