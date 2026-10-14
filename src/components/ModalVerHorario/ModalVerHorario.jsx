import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    descargarHorarioBlob,
    obtenerMiHorario,
} from "../../services/horarioService";
import "./ModalVerHorario.css";

const noOp = () => {};

const ModalVerHorario = ({
    abierto,
    horario,
    onClose,
    onEdit,
    onCerrar,
    onEditar,
    onHorarioActualizado,
}) => {
    const [descargando, setDescargando] = useState(false);
    const [urlImagenFallida, setUrlImagenFallida] = useState(null);
    const avisoErrorRef = useRef(false);
    const imagenUrl = typeof horario?.imagen_url === "string" && horario.imagen_url.trim()
        ? horario.imagen_url.trim()
        : null;
    const tieneImagen = Boolean(imagenUrl);
    const tieneHorario = Boolean(horario && Array.isArray(horario.bloques) && horario.bloques.length);
    const cerrar = onCerrar || onClose || noOp;
    const editar = onEditar || onEdit || cerrar;

    useEffect(() => {
        console.log("ModalVerHorario - horario recibido:", horario);
    }, [horario]);

    useEffect(() => {
        const overflowOriginal = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const manejarTecla = (evento) => {
            if (evento.key === "Escape" && !descargando) cerrar();
        };
        window.addEventListener("keydown", manejarTecla);
        return () => {
            document.body.style.overflow = overflowOriginal;
            window.removeEventListener("keydown", manejarTecla);
        };
    }, [descargando, cerrar]);

    useEffect(() => {
        if (!tieneHorario || tieneImagen) return undefined;

        let activo = true;
        let temporizador;
        const recargar = async () => {
            try {
                const data = await obtenerMiHorario();
                if (!activo) return;
                onHorarioActualizado(data);
                if (!data?.imagen_url) {
                    temporizador = window.setTimeout(recargar, 2000);
                }
            } catch (error) {
                if (!activo) return;
                if (!avisoErrorRef.current) {
                    toast.error(error.message || "No se pudo actualizar el estado del horario.");
                    avisoErrorRef.current = true;
                }
                temporizador = window.setTimeout(recargar, 2000);
            }
        };

        temporizador = window.setTimeout(recargar, 2000);
        return () => {
            activo = false;
            window.clearTimeout(temporizador);
        };
    }, [tieneHorario, tieneImagen, onHorarioActualizado]);

    const descargarPDF = async () => {
        setDescargando(true);
        try {
            const blob = await descargarHorarioBlob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            const base64 = await new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => reject(new Error("No se pudo procesar la imagen del horario."));
            });

            const img = new Image();
            const imagenCargada = new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error("No se pudo procesar la imagen del horario."));
            });
            img.src = base64;
            await imagenCargada;

            const { jsPDF } = await import("jspdf");

            // La página del PDF tiene la misma proporción que la imagen,
            // así se llena toda la hoja sin estirar ni dejar bordes.
            const anchoPagina = 297; // mm (ancho de un A4 horizontal)
            const altoPagina = (img.naturalHeight * anchoPagina) / img.naturalWidth;

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: [anchoPagina, altoPagina],
            });
            pdf.addImage(base64, "PNG", 0, 0, anchoPagina, altoPagina, "", "FAST");
            pdf.save("horario-trabajo.pdf");
        } catch (error) {
            console.error("Error al descargar PDF:", error);
            toast.error("No se pudo descargar el horario. Intenta de nuevo.");
        } finally {
            setDescargando(false);
        }
    };

    if (abierto === false) return null;

    return (
        <div
            className="horario-ver-overlay"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget && !descargando) cerrar();
            }}
        >
            <section
                className="horario-ver-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="horario-ver-titulo"
            >
                <header className="horario-ver-header">
                    <h2 id="horario-ver-titulo">Mi Horario</h2>
                    <div className="horario-ver-acciones">
                        {(tieneHorario || tieneImagen) && (
                            <>
                                <button
                                    className="horario-ver-boton"
                                    type="button"
                                    onClick={editar}
                                >
                                    Editar
                                </button>
                                {tieneImagen && (
                                    <button
                                        className="horario-ver-boton horario-ver-descargar"
                                        type="button"
                                        onClick={descargarPDF}
                                        disabled={descargando}
                                    >
                                        {descargando ? "Generando PDF..." : "Descargar PDF"}
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            className="horario-ver-cerrar"
                            type="button"
                            onClick={cerrar}
                            aria-label="Cerrar"
                            title="Cerrar"
                        >
                            ×
                        </button>
                    </div>
                </header>

                <div className="horario-ver-cuerpo">
                    {tieneImagen && urlImagenFallida !== imagenUrl ? (
                        <img
                            className="modal-ver-horario-img"
                            src={imagenUrl}
                            alt="Mi horario"
                            onError={() => setUrlImagenFallida(imagenUrl)}
                        />
                    ) : tieneImagen && urlImagenFallida === imagenUrl ? (
                        <p className="horario-ver-mensaje horario-ver-error">
                            No se pudo cargar la imagen. Puede estar en proceso de generación.
                        </p>
                    ) : !imagenUrl ? (
                        <div className="horario-ver-vacio">
                            <p>
                                Aún no has creado tu horario. Usa el botón &apos;Crear Horario&apos; en tu perfil.
                            </p>
                            <button
                                className="horario-ver-boton horario-ver-descargar"
                                type="button"
                                onClick={editar}
                            >
                                Crear ahora
                            </button>
                        </div>
                    ) : null}
                </div>
            </section>
        </div>
    );
};

export default ModalVerHorario;