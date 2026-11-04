import React, { useEffect, useState } from "react";
import "./ModalConfirm.css";

const ModalConfirm = ({
    abierto,
    titulo = "¿Estás seguro?",
    mensaje,
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar",
    tipo = "danger", // "danger" | "warning" | "info"
    onConfirmar,
    onCancelar,
    requiereComentario = false,
}) => {
    const [comentario, setComentario] = useState("");
    const [errorComentario, setErrorComentario] = useState("");

    useEffect(() => {
        if (!abierto) {
            setComentario("");
            setErrorComentario("");
        }
    }, [abierto]);

    if (!abierto) return null;

    const confirmar = () => {
        if (requiereComentario && !comentario.trim()) {
            setErrorComentario("El comentario es obligatorio");
            return;
        }

        setErrorComentario("");
        onConfirmar?.(requiereComentario ? comentario.trim() : undefined);
    };

    return (
        <div className="modal-confirm-overlay" onClick={onCancelar}>
            <div
                className={`modal-confirm modal-confirm-${tipo}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-confirm-header">
                    <h3>{titulo}</h3>
                </div>

                <div className="modal-confirm-body">
                    {typeof mensaje === "string" ? (
                        <p>{mensaje}</p>
                    ) : (
                        mensaje
                    )}
                    {requiereComentario && (
                        <label className="modal-confirm-comentario">
                            Comentario
                            <textarea
                                value={comentario}
                                onChange={(evento) => {
                                    setComentario(evento.target.value);
                                    if (evento.target.value.trim()) setErrorComentario("");
                                }}
                                rows={4}
                                aria-invalid={Boolean(errorComentario)}
                            />
                            {errorComentario && (
                                <span className="modal-confirm-error" role="alert">
                                    {errorComentario}
                                </span>
                            )}
                        </label>
                    )}
                </div>

                <div className="modal-confirm-footer">
                    <button
                        type="button"
                        className="btn-confirm-cancelar"
                        onClick={onCancelar}
                    >
                        {textoCancelar}
                    </button>
                    <button
                        type="button"
                        className={`btn-confirm-aceptar btn-confirm-${tipo}`}
                        onClick={confirmar}
                    >
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirm;