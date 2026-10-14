import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { guardarMiHorario } from "../../services/horarioService";
import "./ModalCrearHorario.css";

const DIAS_SEMANA = [
    { numero: 1, nombre: "Lun", completo: "Lunes" },
    { numero: 2, nombre: "Mar", completo: "Martes" },
    { numero: 3, nombre: "Mié", completo: "Miércoles" },
    { numero: 4, nombre: "Jue", completo: "Jueves" },
    { numero: 5, nombre: "Vie", completo: "Viernes" },
    { numero: 6, nombre: "Sáb", completo: "Sábado" },
    { numero: 7, nombre: "Dom", completo: "Domingo" },
];

const HORAS_POSIBLES = Array.from({ length: 16 }, (_, indice) => indice + 6);

const ModalCrearHorario = ({ horario, onClose, onSaved }) => {
    const [diasActivos, setDiasActivos] = useState(() => DIAS_SEMANA.map((dia) => dia.numero));
    const [horasActivas, setHorasActivas] = useState(HORAS_POSIBLES);
    const [seleccion, setSeleccion] = useState(() => {
        const inicial = {};
        (horario?.bloques || []).forEach((bloque) => {
            inicial[`${bloque.dia_semana}-${bloque.hora_inicio}`] = true;
        });
        return inicial;
    });
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const overflowOriginal = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const manejarTecla = (evento) => {
            if (evento.key === "Escape" && !guardando) onClose();
        };
        window.addEventListener("keydown", manejarTecla);
        return () => {
            document.body.style.overflow = overflowOriginal;
            window.removeEventListener("keydown", manejarTecla);
        };
    }, [guardando, onClose]);

    const titulo = horario?.bloques?.length ? "Editar Horario" : "Crear Horario";
    const horasPorDia = useMemo(() => {
        const totales = {};
        diasActivos.forEach((dia) => {
            totales[dia] = horasActivas.reduce(
                (total, hora) => total + (seleccion[`${dia}-${hora}`] ? 1 : 0),
                0
            );
        });
        return totales;
    }, [diasActivos, horasActivas, seleccion]);
    const totalSemanal = Object.values(horasPorDia).reduce((total, horas) => total + horas, 0);

    const agregarDia = () => {
        if (diasActivos.length >= DIAS_SEMANA.length) return;
        const siguienteDia = DIAS_SEMANA.find((dia) => !diasActivos.includes(dia.numero));
        if (siguienteDia) {
            setDiasActivos((actuales) => [...actuales, siguienteDia.numero].sort((a, b) => a - b));
        }
    };

    const quitarDia = (numero) => {
        if (diasActivos.length <= 1) return;
        setDiasActivos((actuales) => actuales.filter((dia) => dia !== numero));
        setSeleccion((actual) => {
            const siguiente = { ...actual };
            HORAS_POSIBLES.forEach((hora) => delete siguiente[`${numero}-${hora}`]);
            return siguiente;
        });
    };

    const agregarHora = () => {
        if (horasActivas.length >= HORAS_POSIBLES.length) return;
        const siguienteHora = HORAS_POSIBLES.find((hora) => !horasActivas.includes(hora));
        if (siguienteHora !== undefined) {
            setHorasActivas((actuales) => [...actuales, siguienteHora].sort((a, b) => a - b));
        }
    };

    const quitarHora = (hora) => {
        if (horasActivas.length <= 1) return;
        setHorasActivas((actuales) => actuales.filter((horaActiva) => horaActiva !== hora));
        setSeleccion((actual) => {
            const siguiente = { ...actual };
            DIAS_SEMANA.forEach((dia) => delete siguiente[`${dia.numero}-${hora}`]);
            return siguiente;
        });
    };

    const alternarCelda = (dia, hora) => {
        const clave = `${dia}-${hora}`;
        setSeleccion((actual) => ({ ...actual, [clave]: !actual[clave] }));
    };

    const guardar = async () => {
        const bloques = diasActivos.flatMap((dia) => (
            horasActivas
                .filter((hora) => seleccion[`${dia}-${hora}`])
                .map((hora) => ({ dia_semana: dia, hora_inicio: hora }))
        ));

        if (!bloques.length) {
            toast.error("Marca al menos una hora para guardar tu horario.");
            return;
        }

        setGuardando(true);
        try {
            await guardarMiHorario(bloques);
            toast.success("Horario guardado");
            onClose();
            try {
                await onSaved();
            } catch (error) {
                toast.error(error.message || "El horario se guardó, pero no se pudo recargar.");
            }
        } catch (error) {
            const detalle = error.response?.data?.detail;
            toast.error(
                (typeof detalle === "string" && detalle.trim())
                    ? detalle
                    : error.message || "No se pudo guardar el horario."
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div
            className="horario-crear-overlay"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget && !guardando) onClose();
            }}
        >
            <section
                className="horario-crear-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="horario-crear-titulo"
            >
                <header className="horario-crear-header">
                    <button
                        className="horario-crear-boton-secundario"
                        type="button"
                        onClick={onClose}
                        disabled={guardando}
                    >
                        Cancelar
                    </button>
                    <h2 id="horario-crear-titulo">{titulo}</h2>
                    <button
                        className="horario-crear-boton-guardar"
                        type="button"
                        onClick={guardar}
                        disabled={guardando}
                    >
                        {guardando ? "Guardando..." : "Guardar horario"}
                    </button>
                </header>

                <div className="horario-crear-cuerpo">
                    <p className="horario-crear-advertencia">
                        Marca las horas que trabajas. Puedes agregar o quitar filas y columnas.
                    </p>

                    <div className="horario-grilla-scroll">
                        <table className="horario-grilla">
                            <thead>
                                <tr className="horario-grilla-controles">
                                    <th aria-label="Eliminar fila" />
                                    <th aria-label="Hora" />
                                    {diasActivos.map((numero) => {
                                        const dia = DIAS_SEMANA[numero - 1];
                                        return (
                                            <th key={numero}>
                                                <button
                                                    className="horario-grilla-circular horario-grilla-agregar"
                                                    type="button"
                                                    onClick={agregarDia}
                                                    disabled={diasActivos.length >= DIAS_SEMANA.length}
                                                    aria-label={`Agregar columna después de ${dia.completo}`}
                                                    title="Agregar columna"
                                                >
                                                    +
                                                </button>
                                            </th>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <th aria-label="Acciones de fila" />
                                    <th>Hora</th>
                                    {diasActivos.map((numero) => {
                                        const dia = DIAS_SEMANA[numero - 1];
                                        return (
                                            <th key={numero} className="horario-grilla-dia">
                                                <span>{dia.nombre}</span>
                                                <button
                                                    className="horario-grilla-circular horario-grilla-quitar"
                                                    type="button"
                                                    onClick={() => quitarDia(numero)}
                                                    disabled={diasActivos.length <= 1}
                                                    aria-label={`Quitar columna ${dia.completo}`}
                                                    title="Quitar columna"
                                                >
                                                    −
                                                </button>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {horasActivas.map((hora) => (
                                    <tr key={hora}>
                                        <td className="horario-grilla-accion">
                                            <button
                                                className="horario-grilla-circular horario-grilla-quitar"
                                                type="button"
                                                onClick={() => quitarHora(hora)}
                                                disabled={horasActivas.length <= 1}
                                                aria-label={`Quitar fila ${hora}:00`}
                                                title="Quitar fila"
                                            >
                                                −
                                            </button>
                                        </td>
                                        <th scope="row" className="horario-grilla-hora">
                                            {String(hora).padStart(2, "0")}:00–{String(hora + 1).padStart(2, "0")}:00
                                        </th>
                                        {diasActivos.map((dia) => {
                                            const marcada = Boolean(seleccion[`${dia}-${hora}`]);
                                            return (
                                                <td key={dia} className="horario-grilla-celda">
                                                    <button
                                                        className={`horario-grilla-toggle${marcada ? " marcada" : ""}`}
                                                        type="button"
                                                        onClick={() => alternarCelda(dia, hora)}
                                                        aria-label={`${DIAS_SEMANA[dia - 1].completo}, ${hora}:00, ${marcada ? "trabajando" : "libre"}`}
                                                        aria-pressed={marcada}
                                                    >
                                                        {marcada ? "✓" : ""}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th aria-label="Agregar fila">
                                        <button
                                            className="horario-grilla-circular horario-grilla-agregar"
                                            type="button"
                                            onClick={agregarHora}
                                            disabled={horasActivas.length >= HORAS_POSIBLES.length}
                                            aria-label="Agregar fila de hora"
                                            title="Agregar fila"
                                        >
                                            +
                                        </button>
                                    </th>
                                    <th scope="row">Total</th>
                                    {diasActivos.map((dia) => (
                                        <td key={dia} className="horario-grilla-total-dia">
                                            {horasPorDia[dia]} h
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <p className="horario-crear-total">
                        Total semanal: <strong>{totalSemanal} horas</strong>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default ModalCrearHorario;
