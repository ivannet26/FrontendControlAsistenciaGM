// src/components/ModalInicioRastreo/ModalInicioRastreo.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarBlank, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { actualizarInicioRastreo } from "../../services/perfilService";
import "./ModalInicioRastreo.css";

const TEXTO_EXPLICATIVO = "Selecciona la fecha desde la cual empezarás a contar tus horas. Las horas pendientes se sumarán a la siguiente semana.";

const fechaLocalActual = () => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
};

const normalizarFecha = (valor) => {
    const texto = String(valor ?? "").slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(texto) ? texto : "";
};

const obtenerMensajeError = (error, fallback) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(". ");
    return error.message || fallback;
};

const ModalInicioRastreo = ({
    abierto = false,
    fechaActual = "",
    onCerrar,
    onGuardado,
}) => {
    const [fecha, setFecha] = useState(() => normalizarFecha(fechaActual));
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!abierto) return undefined;

        const cerrarConEscape = (evento) => {
            if (evento.key !== "Escape" || guardando) return;
            onCerrar?.();
        };

        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [abierto, guardando, onCerrar]);

    if (!abierto) return null;

    const hoy = fechaLocalActual();

    const confirmar = async (evento) => {
        evento.preventDefault();
        const valor = normalizarFecha(fecha);

        if (!valor) {
            setError("Selecciona una fecha para continuar.");
            return;
        }
        if (valor > hoy) {
            setError("La fecha no puede ser futura.");
            return;
        }

        setError("");
        setGuardando(true);

        try {
            const respuesta = await actualizarInicioRastreo(valor);
            const fechaGuardada = normalizarFecha(
                respuesta?.fecha_inicio_rastreo
                ?? respuesta?.perfil?.fecha_inicio_rastreo
                ?? respuesta?.usuario?.fecha_inicio_rastreo
            ) || valor;

            toast.success("Inicio de rastreo configurado correctamente.");
            onGuardado?.(fechaGuardada);
            onCerrar?.();
        } catch (errorGuardado) {
            toast.error(obtenerMensajeError(
                errorGuardado,
                "No se pudo guardar la fecha de inicio de rastreo."
            ));
        } finally {
            setGuardando(false);
        }
    };

    return createPortal(
        <div
            className="modal-inicio-rastreo-overlay"
            role="presentation"
            onClick={() => {
                if (!guardando) onCerrar?.();
            }}
        >
            <form
                className="modal-inicio-rastreo"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-inicio-rastreo-titulo"
                onClick={(evento) => evento.stopPropagation()}
                onSubmit={confirmar}
            >
                <header className="modal-inicio-rastreo-header">
                    <div className="modal-inicio-rastreo-titulo">
                        <p className="modal-inicio-rastreo-eyebrow">CONTEO DE HORAS</p>
                        <h2 id="modal-inicio-rastreo-titulo">Configurar inicio de rastreo</h2>
                    </div>

                    <button
                        type="button"
                        className="modal-inicio-rastreo-cerrar"
                        onClick={() => onCerrar?.()}
                        disabled={guardando}
                        aria-label="Cerrar"
                    >
                        <X size={18} weight="bold" aria-hidden="true" />
                    </button>
                </header>

                <div className="modal-inicio-rastreo-cuerpo">
                    <p className="modal-inicio-rastreo-texto">{TEXTO_EXPLICATIVO}</p>

                    <div className={`modal-inicio-rastreo-campo${error ? " con-error" : ""}`}>
                        <label htmlFor="inicio-rastreo-fecha">Fecha de inicio</label>
                        <div className="modal-inicio-rastreo-input">
                            <CalendarBlank size={16} weight="regular" aria-hidden="true" />
                            <input
                                id="inicio-rastreo-fecha"
                                type="date"
                                lang="es-PE"
                                value={fecha}
                                max={hoy}
                                disabled={guardando}
                                autoFocus
                                onChange={(evento) => {
                                    setFecha(evento.target.value);
                                    setError("");
                                }}
                            />
                        </div>
                        {error && (
                            <span className="modal-inicio-rastreo-error" role="alert">
                                {error}
                            </span>
                        )}
                    </div>
                </div>

                <footer className="modal-inicio-rastreo-footer">
                    <button
                        type="button"
                        className="modal-inicio-rastreo-cancelar"
                        onClick={() => onCerrar?.()}
                        disabled={guardando}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="modal-inicio-rastreo-confirmar"
                        disabled={guardando}
                    >
                        {guardando ? "Guardando..." : "Confirmar fecha"}
                    </button>
                </footer>
            </form>
        </div>,
        document.body
    );
};

export default ModalInicioRastreo;
