// src/components/AlertaTardanza/AlertaTardanza.jsx
import { Clock, WarningCircle, X } from "@phosphor-icons/react";
import "./AlertaTardanza.css";

const formatearMinutos = (minutos) => {
    if (minutos === null || minutos === undefined || Number.isNaN(Number(minutos))) {
        return null;
    }

    const total = Math.max(0, Math.round(Number(minutos)));
    if (total < 60) return `${total} min`;

    const horas = Math.floor(total / 60);
    const resto = total % 60;
    return resto ? `${horas} h ${resto} min` : `${horas} h`;
};

const formatearHora = (valor) => {
    if (!valor) return null;

    if (typeof valor === "string" && valor.includes("T")) {
        const fecha = new Date(valor);
        if (!Number.isNaN(fecha.getTime())) {
            return fecha.toLocaleTimeString("es-PE", {
                hour: "2-digit", minute: "2-digit", hourCycle: "h23",
            });
        }
        return null;
    }

    if (typeof valor === "string" && /^\d{1,2}:\d{2}/.test(valor)) {
        return valor.slice(0, 5);
    }

    return null;
};

const AlertaTardanza = ({
    estado = "TARDANZA",
    minutosTarde,
    horario,
    horaMarcada,
    onJustificar,
    onCerrar,
}) => {
    const esGrave = estado === "TARDANZA_GRAVE";
    const minutos = formatearMinutos(minutosTarde);
    const horaEntrada = formatearHora(horario);
    const horaRegistrada = formatearHora(horaMarcada);

    return (
        <section
            className="alerta-tardanza"
            role="alert"
            aria-labelledby="alerta-tardanza-titulo"
        >
            <span className="alerta-tardanza-icono" aria-hidden="true">
                <WarningCircle size={26} weight="fill" />
            </span>

            <div className="alerta-tardanza-contenido">
                <p className="alerta-tardanza-eyebrow">
                    {esGrave ? "TARDANZA GRAVE" : "TARDANZA REGISTRADA"}
                </p>
                <h2 className="alerta-tardanza-titulo" id="alerta-tardanza-titulo">
                    {esGrave
                        ? "Tu entrada supera las 2 horas de tolerancia"
                        : "Registraste tu entrada fuera de la tolerancia"}
                </h2>
                <p className="alerta-tardanza-texto">
                    La justificación es obligatoria. Envíala para que administración pueda revisarla.
                </p>

                <dl className="alerta-tardanza-detalle">
                    <div>
                        <dt>Minutos de tardanza</dt>
                        <dd>{minutos || "—"}</dd>
                    </div>
                    <div>
                        <dt>Horario de entrada</dt>
                        <dd>{horaEntrada || "—"}</dd>
                    </div>
                    <div>
                        <dt>Hora marcada</dt>
                        <dd>{horaRegistrada || "—"}</dd>
                    </div>
                </dl>

                <div className="alerta-tardanza-acciones">
                    <button
                        type="button"
                        className="alerta-tardanza-boton"
                        onClick={onJustificar}
                    >
                        <Clock size={17} weight="bold" aria-hidden="true" />
                        Justificar tardanza
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="alerta-tardanza-cerrar"
                onClick={onCerrar}
                aria-label="Cerrar aviso de tardanza"
            >
                <X size={16} weight="bold" aria-hidden="true" />
            </button>
        </section>
    );
};

export default AlertaTardanza;
