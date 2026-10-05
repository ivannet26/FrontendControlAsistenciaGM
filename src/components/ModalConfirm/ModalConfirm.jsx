import React from "react";
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
}) => {
    if (!abierto) return null;

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
                        onClick={onConfirmar}
                    >
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirm;