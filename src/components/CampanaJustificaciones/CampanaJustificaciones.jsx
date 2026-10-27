// src/components/CampanaJustificaciones/CampanaJustificaciones.jsx
import { useNavigate } from "react-router-dom";
import { Bell } from "@phosphor-icons/react";
import { useJustificaciones } from "../../hooks/useJustificaciones";
import "./CampanaJustificaciones.css";

const CampanaJustificaciones = () => {
    const navigate = useNavigate();
    const { pendientes } = useJustificaciones({ fuente: null, conContador: true });

    const total = Number(pendientes) || 0;
    const detalle = total === 1
        ? "1 justificación pendiente"
        : `${total} justificaciones pendientes`;

    return (
        <button
            type="button"
            className="campana-justificaciones"
            onClick={() => navigate("/app/justificaciones")}
            aria-label={`Ver justificaciones. ${detalle}`}
            title="Justificaciones pendientes"
        >
            <Bell size={22} weight="regular" aria-hidden="true" />
            {total > 0 && (
                <span className="campana-justificaciones-contador" aria-hidden="true">
                    {total > 99 ? "99+" : total}
                </span>
            )}
        </button>
    );
};

export default CampanaJustificaciones;
