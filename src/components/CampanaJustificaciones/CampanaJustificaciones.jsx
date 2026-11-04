// src/components/CampanaJustificaciones/CampanaJustificaciones.jsx
import { useEffect, useRef, useState } from "react";
import { Bell } from "@phosphor-icons/react";
import { useJustificaciones } from "../../hooks/useJustificaciones";
import "./CampanaJustificaciones.css";

const CampanaJustificaciones = () => {
    const { pendientes } = useJustificaciones({ fuente: null, conContador: true });
    const [tooltipAbierto, setTooltipAbierto] = useState(false);
    const contenedorRef = useRef(null);

    const total = Number(pendientes) || 0;
    const detalle = total === 1
        ? "1 justificación pendiente"
        : `${total} justificaciones pendientes`;

    useEffect(() => {
        if (!tooltipAbierto) return undefined;

        const cerrarFuera = (evento) => {
            if (!contenedorRef.current?.contains(evento.target)) setTooltipAbierto(false);
        };
        const cerrarEscape = (evento) => {
            if (evento.key === "Escape") setTooltipAbierto(false);
        };
        document.addEventListener("pointerdown", cerrarFuera);
        document.addEventListener("keydown", cerrarEscape);
        return () => {
            document.removeEventListener("pointerdown", cerrarFuera);
            document.removeEventListener("keydown", cerrarEscape);
        };
    }, [tooltipAbierto]);

    const mensaje = total > 0
        ? `Tienes ${detalle}`
        : "No tienes justificaciones pendientes";

    return (
        <div className="campana-justificaciones-contenedor" ref={contenedorRef}>
        <button
            type="button"
            className={`campana-justificaciones${total > 0 ? " tiene-pendientes" : ""}`}
            onClick={() => setTooltipAbierto((abierto) => !abierto)}
            aria-label={`Ver justificaciones. ${detalle}`}
            aria-expanded={tooltipAbierto}
        >
            <Bell size={22} weight="regular" aria-hidden="true" />
            {total > 0 && (
                <span className="campana-justificaciones-contador" aria-hidden="true">
                    {total > 99 ? "99+" : total}
                </span>
            )}
        </button>
        {tooltipAbierto && (
            <div className="campana-justificaciones-tooltip" role="status">
                {mensaje}
            </div>
        )}
        </div>
    );
};

export default CampanaJustificaciones;
