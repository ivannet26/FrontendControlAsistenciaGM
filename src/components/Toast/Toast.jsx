// src/components/Toast/Toast.jsx
import React, { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import "./Toast.css";

const Toast = ({ abierto, tipo = "info", mensaje, onCerrar, duracion = 3500 }) => {
    useEffect(() => {
        if (!abierto) return;
        const timer = setTimeout(() => {
            onCerrar();
        }, duracion);
        return () => clearTimeout(timer);
    }, [abierto, duracion, onCerrar]);

    if (!abierto) return null;

    const iconos = {
        success: <CheckCircle2 size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />,
    };

    return (
        <div className={`toast toast-${tipo}`}>
            <div className="toast-icon">{iconos[tipo]}</div>
            <div className="toast-mensaje">{mensaje}</div>
            <button className="toast-cerrar" onClick={onCerrar}>
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;