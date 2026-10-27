// src/components/ModalJustificacion/ModalJustificacion.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Paperclip, UploadSimple, X } from "@phosphor-icons/react";
import { crear as crearJustificacion } from "../../services/justificacionesService";
import "./ModalJustificacion.css";

const MOTIVOS = [
    { valor: "FALTA", etiqueta: "Falta" },
    { valor: "TARDANZA", etiqueta: "Llegué tarde" },
    { valor: "OLVIDO_MARCAR", etiqueta: "Olvidé marcar" },
];

const TITULOS = {
    FALTA: "Justificar una falta",
    TARDANZA: "Justificar tardanza",
    OLVIDO_MARCAR: "Justificar olvido de marca",
};

const TIPOS_IMAGEN = ["image/jpeg", "image/jpg", "image/png"];
const PESO_MAXIMO = 5 * 1024 * 1024;

const fechaLocal = (fecha = new Date()) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
};

const hoy = () => fechaLocal();

const manana = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1);
    return fechaLocal(fecha);
};

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error?.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    return error?.message || mensajePredeterminado;
};

const crearFormularioInicial = (motivo, fechaSugerida) => {
    const tipo = MOTIVOS.some((opcion) => opcion.valor === motivo) ? motivo : "FALTA";
    return {
        tipo,
        fecha: fechaSugerida || (tipo === "FALTA" ? manana() : hoy()),
        asunto: "",
        mensaje: "",
    };
};

const validar = (datos, archivo) => {
    const errores = {};

    if (!datos.tipo) {
        errores.tipo = "Selecciona el motivo de la justificación.";
    }

    if (!datos.fecha) {
        errores.fecha = "Selecciona la fecha.";
    } else if (datos.tipo === "FALTA" && datos.fecha < manana()) {
        errores.fecha = "Para una falta, avisa con al menos un día de anticipación.";
    }

    if (!datos.asunto.trim()) {
        errores.asunto = "El asunto es obligatorio.";
    } else if (datos.asunto.trim().length < 4) {
        errores.asunto = "Describe el asunto con al menos 4 caracteres.";
    }

    if (!datos.mensaje.trim()) {
        errores.mensaje = "El mensaje es obligatorio.";
    } else if (datos.mensaje.trim().length < 10) {
        errores.mensaje = "Explica el motivo con al menos 10 caracteres.";
    }

    if (archivo && !TIPOS_IMAGEN.includes(archivo.type)) {
        errores.adjunto = "Adjunta una imagen JPG o PNG.";
    } else if (archivo && archivo.size > PESO_MAXIMO) {
        errores.adjunto = "La imagen no debe superar 5 MB.";
    }

    return errores;
};

const ModalJustificacion = ({
    abierto = false,
    motivoInicial = "FALTA",
    fechaInicial,
    minutosTarde,
    onCerrar,
    onEnviada,
}) => {
    // El modal se monta al abrirse: el estado inicial se toma de las props.
    const [form, setForm] = useState(() => crearFormularioInicial(motivoInicial, fechaInicial));
    const [archivo, setArchivo] = useState(null);
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    const vistaPreviaRef = useRef(null);
    const inputArchivoRef = useRef(null);

    useEffect(() => {
        if (!abierto) return undefined;

        const temporizador = window.setTimeout(() => {
            document.getElementById("justificacion-motivo")?.focus();
        }, 60);

        return () => window.clearTimeout(temporizador);
    }, [abierto]);

    useEffect(() => () => {
        if (vistaPreviaRef.current) URL.revokeObjectURL(vistaPreviaRef.current);
    }, []);

    useEffect(() => {
        if (!abierto) return undefined;

        const cerrarConEscape = (evento) => {
            if (evento.key !== "Escape") return;
            evento.stopPropagation();
            if (!enviando) onCerrar?.();
        };

        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [abierto, enviando, onCerrar]);

    if (!abierto) return null;

    const cambiarCampo = (campo, valor) => {
        setForm((actual) => {
            const siguiente = { ...actual, [campo]: valor };

            if (campo === "tipo") {
                if (valor === "FALTA" && siguiente.fecha < manana()) siguiente.fecha = manana();
                if (valor !== "FALTA" && siguiente.fecha > hoy()) siguiente.fecha = hoy();
            }

            return siguiente;
        });

        setErrores((actuales) => ({ ...actuales, [campo]: "" }));
    };

    const quitarArchivo = () => {
        if (vistaPreviaRef.current) {
            URL.revokeObjectURL(vistaPreviaRef.current);
            vistaPreviaRef.current = null;
        }

        setArchivo(null);
        setVistaPrevia(null);
        setErrores((actuales) => ({ ...actuales, adjunto: "" }));
        if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    };

    const cambiarArchivo = (evento) => {
        const seleccionado = evento.target.files?.[0];
        if (!seleccionado) {
            quitarArchivo();
            return;
        }

        if (!TIPOS_IMAGEN.includes(seleccionado.type)) {
            setErrores((actuales) => ({ ...actuales, adjunto: "Adjunta una imagen JPG o PNG." }));
            evento.target.value = "";
            return;
        }

        if (seleccionado.size > PESO_MAXIMO) {
            setErrores((actuales) => ({ ...actuales, adjunto: "La imagen no debe superar 5 MB." }));
            evento.target.value = "";
            return;
        }

        if (vistaPreviaRef.current) URL.revokeObjectURL(vistaPreviaRef.current);

        const url = URL.createObjectURL(seleccionado);
        vistaPreviaRef.current = url;
        setArchivo(seleccionado);
        setVistaPrevia(url);
        setErrores((actuales) => ({ ...actuales, adjunto: "" }));
    };

    const cerrar = () => {
        if (enviando) return;
        onCerrar?.();
    };

    const enviar = async (evento) => {
        evento.preventDefault();

        const nuevosErrores = validar(form, archivo);
        setErrores(nuevosErrores);

        const primerError = Object.keys(nuevosErrores).find((campo) => nuevosErrores[campo]);
        if (primerError) {
            const ids = {
                tipo: "justificacion-motivo",
                fecha: "justificacion-fecha",
                asunto: "justificacion-asunto",
                mensaje: "justificacion-mensaje",
            };
            document.getElementById(ids[primerError])?.focus();
            return;
        }

        setEnviando(true);
        try {
            await crearJustificacion({
                tipo: form.tipo,
                fecha: form.fecha,
                asunto: form.asunto.trim(),
                mensaje: form.mensaje.trim(),
                minutos_tarde: form.tipo === "TARDANZA" ? minutosTarde ?? null : null,
                evidencia: archivo,
            });

            toast.success("Justificación enviada. Queda pendiente de revisión.");
            onEnviada?.();
            onCerrar?.();
        } catch (error) {
            toast.error(obtenerMensajeError(error, "No se pudo enviar la justificación."));
        } finally {
            setEnviando(false);
        }
    };

    const titulo = TITULOS[form.tipo] || "Nueva justificación";
    const descripcionError = (campo) => (errores[campo] ? `justificacion-${campo}-error` : undefined);

    return createPortal(
        <div className="modal-justificacion-overlay" onClick={cerrar} role="presentation">
            <div
                className="modal-justificacion"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-justificacion-titulo"
                onClick={(evento) => evento.stopPropagation()}
            >
                <header className="modal-justificacion-header">
                    <div>
                        <p className="modal-justificacion-eyebrow">JUSTIFICACIONES</p>
                        <h2 id="modal-justificacion-titulo">{titulo}</h2>
                    </div>
                    <button
                        type="button"
                        className="modal-justificacion-cerrar"
                        onClick={cerrar}
                        aria-label="Cerrar"
                        disabled={enviando}
                    >
                        <X size={18} weight="bold" aria-hidden="true" />
                    </button>
                </header>

                <form className="modal-justificacion-form" onSubmit={enviar} noValidate>
                    <div className="modal-justificacion-fila">
                        <div className="modal-justificacion-campo">
                            <label htmlFor="justificacion-motivo">Motivo</label>
                            <select
                                id="justificacion-motivo"
                                value={form.tipo}
                                onChange={(evento) => cambiarCampo("tipo", evento.target.value)}
                                aria-invalid={Boolean(errores.tipo)}
                                aria-describedby={descripcionError("tipo")}
                                disabled={enviando}
                            >
                                {MOTIVOS.map((motivo) => (
                                    <option key={motivo.valor} value={motivo.valor}>
                                        {motivo.etiqueta}
                                    </option>
                                ))}
                            </select>
                            {errores.tipo && (
                                <span className="modal-justificacion-error" id="justificacion-tipo-error">
                                    {errores.tipo}
                                </span>
                            )}
                        </div>

                        <div className="modal-justificacion-campo">
                            <label htmlFor="justificacion-fecha">Fecha</label>
                            <input
                                id="justificacion-fecha"
                                type="date"
                                value={form.fecha}
                                min={form.tipo === "FALTA" ? manana() : undefined}
                                max={form.tipo === "FALTA" ? undefined : hoy()}
                                onChange={(evento) => cambiarCampo("fecha", evento.target.value)}
                                aria-invalid={Boolean(errores.fecha)}
                                aria-describedby={descripcionError("fecha")}
                                disabled={enviando}
                            />
                            {errores.fecha && (
                                <span className="modal-justificacion-error" id="justificacion-fecha-error">
                                    {errores.fecha}
                                </span>
                            )}
                        </div>
                    </div>

                    {form.tipo === "TARDANZA" && minutosTarde ? (
                        <p className="modal-justificacion-nota">
                            Tardanza registrada: {minutosTarde} min. Se enviará junto con tu justificación.
                        </p>
                    ) : null}

                    <div className="modal-justificacion-campo">
                        <label htmlFor="justificacion-asunto">Asunto</label>
                        <input
                            id="justificacion-asunto"
                            type="text"
                            value={form.asunto}
                            maxLength={120}
                            placeholder="Resume el motivo en una frase"
                            onChange={(evento) => cambiarCampo("asunto", evento.target.value)}
                            aria-invalid={Boolean(errores.asunto)}
                            aria-describedby={descripcionError("asunto")}
                            disabled={enviando}
                        />
                        {errores.asunto && (
                            <span className="modal-justificacion-error" id="justificacion-asunto-error">
                                {errores.asunto}
                            </span>
                        )}
                    </div>

                    <div className="modal-justificacion-campo">
                        <label htmlFor="justificacion-mensaje">Mensaje</label>
                        <textarea
                            id="justificacion-mensaje"
                            rows={4}
                            value={form.mensaje}
                            maxLength={500}
                            placeholder="Cuéntanos qué ocurrió"
                            onChange={(evento) => cambiarCampo("mensaje", evento.target.value)}
                            aria-invalid={Boolean(errores.mensaje)}
                            aria-describedby={descripcionError("mensaje")}
                            disabled={enviando}
                        />
                        {errores.mensaje && (
                            <span className="modal-justificacion-error" id="justificacion-mensaje-error">
                                {errores.mensaje}
                            </span>
                        )}
                    </div>

                    <div className="modal-justificacion-campo">
                        <span className="modal-justificacion-etiqueta" id="justificacion-adjunto-etiqueta">
                            Prueba <span className="modal-justificacion-opcional">(opcional, JPG o PNG, máx. 5 MB)</span>
                        </span>

                        <input
                            ref={inputArchivoRef}
                            id="justificacion-adjunto"
                            className="modal-justificacion-archivo"
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={cambiarArchivo}
                            aria-labelledby="justificacion-adjunto-etiqueta"
                            aria-invalid={Boolean(errores.adjunto)}
                            aria-describedby={descripcionError("adjunto")}
                            disabled={enviando}
                            tabIndex={-1}
                        />

                        {vistaPrevia ? (
                            <div className="modal-justificacion-previa">
                                <img src={vistaPrevia} alt="Vista previa de la prueba adjunta" />
                                <div className="modal-justificacion-previa-info">
                                    <span title={archivo?.name}>{archivo?.name}</span>
                                    <button type="button" onClick={quitarArchivo} disabled={enviando}>
                                        Quitar imagen
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="modal-justificacion-adjuntar"
                                onClick={() => inputArchivoRef.current?.click()}
                                disabled={enviando}
                            >
                                <UploadSimple size={17} weight="bold" aria-hidden="true" />
                                Adjuntar imagen
                            </button>
                        )}

                        {errores.adjunto && (
                            <span className="modal-justificacion-error" id="justificacion-adjunto-error">
                                {errores.adjunto}
                            </span>
                        )}
                    </div>

                    <footer className="modal-justificacion-footer">
                        <button
                            type="button"
                            className="modal-justificacion-cancelar"
                            onClick={cerrar}
                            disabled={enviando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="modal-justificacion-enviar"
                            disabled={enviando}
                        >
                            <Paperclip size={16} weight="bold" aria-hidden="true" />
                            {enviando ? "Enviando..." : "Enviar justificación"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ModalJustificacion;
