// src/pages/Justificaciones/Justificaciones.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
    CheckCircle,
    Clock,
    NotePencil,
    Paperclip,
    X,
    XCircle,
} from "@phosphor-icons/react";
import { obtenerTodas, resolver as resolverJustificacion } from "../../services/justificacionesService";
import { useJustificaciones } from "../../hooks/useJustificaciones";
import ModalConfirm from "../../components/ModalConfirm/ModalConfirm";
import "./Justificaciones.css";

const PESTANAS = [
    { id: "PENDIENTE", texto: "Pendientes" },
    { id: "ACEPTADA", texto: "Aceptadas" },
    { id: "RECHAZADA", texto: "Rechazadas" },
    { id: "TODAS", texto: "Todas" },
];

const TEXTO_TIPO = {
    TARDANZA: "Tardanza",
    FALTA: "Falta",
    OLVIDO_MARCAR: "Olvidé marcar",
};

const TEXTO_ESTADO = {
    PENDIENTE: "Pendiente",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
};

const fechaLocal = (fecha = new Date()) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
};

const fechaHaceDias = (dias) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fechaLocal(fecha);
};

const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "—";

    const [año, mes, dia] = String(fechaIso).slice(0, 10).split("-");
    if (!año || !mes || !dia) return String(fechaIso);
    return `${dia}/${mes}/${año}`;
};

const minutosTardanza = (justificacion) => (
    justificacion.tipo !== "TARDANZA" || justificacion.minutos_tarde === null || justificacion.minutos_tarde === undefined
        ? "—"
        : `${justificacion.minutos_tarde} min`
);

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error?.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    return error?.message || mensajePredeterminado;
};

const TarjetaJustificacion = ({ justificacion, onAmpliar, onResolver }) => {
    const estado = justificacion.estado || "PENDIENTE";

    return (
        <article className={`justificaciones-card${estado === "PENDIENTE" ? " justificaciones-card-pendiente" : ""}`}>
            <header className="justificaciones-card-header">
                <div className="justificaciones-card-usuario">
                    <span>{justificacion.usuario || "Usuario"}</span>
                    {justificacion.correo && (
                        <span className="justificaciones-card-correo">{justificacion.correo}</span>
                    )}
                </div>
                <span className={`justificaciones-estado estado-${estado.toLowerCase()}`}>
                    {TEXTO_ESTADO[estado] || estado}
                </span>
            </header>

            <dl className="justificaciones-card-datos">
                <div>
                    <dt>Tipo</dt>
                    <dd>{TEXTO_TIPO[justificacion.tipo] || "—"}</dd>
                </div>
                <div>
                    <dt>Fecha</dt>
                    <dd>{formatearFecha(justificacion.fecha)}</dd>
                </div>
                <div>
                    <dt>Minutos</dt>
                    <dd>{minutosTardanza(justificacion)}</dd>
                </div>
            </dl>

            <div className="justificaciones-card-texto">
                <strong>{justificacion.asunto || "Sin asunto"}</strong>
                <p>{justificacion.mensaje || "Sin mensaje"}</p>
            </div>

            <div className="justificaciones-card-pie">
                {justificacion.evidencia_url ? (
                    <button
                        type="button"
                        className="justificaciones-miniatura"
                        onClick={() => onAmpliar(justificacion)}
                        aria-label={`Ampliar adjunto de ${justificacion.usuario || "la justificación"}`}
                    >
                        <img src={justificacion.evidencia_url} alt="" loading="lazy" />
                    </button>
                ) : (
                    <span className="justificaciones-sin-adjunto">Sin adjunto</span>
                )}

                {estado === "PENDIENTE" && (
                    <div className="justificaciones-acciones">
                        <button
                            type="button"
                            className="justificaciones-accion accion-aceptar"
                            onClick={() => onResolver(justificacion, "ACEPTADA")}
                        >
                            Aceptar
                        </button>
                        <button
                            type="button"
                            className="justificaciones-accion accion-rechazar"
                            onClick={() => onResolver(justificacion, "RECHAZADA")}
                        >
                            Rechazar
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
};

const Justificaciones = () => {
    const [pestana, setPestana] = useState("PENDIENTE");
    const [filtroUsuario, setFiltroUsuario] = useState("");
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [confirmacion, setConfirmacion] = useState(null);
    const [resolviendo, setResolviendo] = useState(false);
    const [imagenAmpliada, setImagenAmpliada] = useState(null);

    const hoy = fechaLocal();
    const desdeSemana = fechaHaceDias(6);

    const filtros = useMemo(() => ({
        estado: pestana === "TODAS" ? "" : pestana,
        usuario_id: filtroUsuario ? Number(filtroUsuario) : "",
        desde,
        hasta,
    }), [pestana, filtroUsuario, desde, hasta]);

    const filtrosResumen = useMemo(() => ({
        desde: desdeSemana,
        hasta: hoy,
    }), [desdeSemana, hoy]);

    const {
        justificaciones,
        cargando,
        error,
        pendientes,
        recargar,
    } = useJustificaciones({
        fuente: "todas",
        filtros,
        conContador: true,
    });

    const {
        justificaciones: justificacionesSemana,
        recargar: recargarResumen,
    } = useJustificaciones({
        fuente: "todas",
        filtros: filtrosResumen,
    });

    // Opciones del filtro por usuario: se toman de las justificaciones recibidas.
    useEffect(() => {
        let cancelado = false;

        obtenerTodas({})
            .then((datos) => {
                if (cancelado) return;

                const mapa = new Map();
                (Array.isArray(datos) ? datos : []).forEach((fila) => {
                    const clave = String(fila.usuario_id ?? fila.correo ?? fila.usuario ?? "");
                    if (!clave || mapa.has(clave)) return;
                    mapa.set(clave, {
                        id: fila.usuario_id ?? clave,
                        nombre: fila.usuario || fila.correo || "Usuario",
                    });
                });

                setUsuarios([...mapa.values()]);
            })
            .catch(() => {
                // El filtro por usuario es opcional: la lista principal sigue funcionando.
            });

        return () => {
            cancelado = true;
        };
    }, []);

    useEffect(() => {
        if (!imagenAmpliada) return undefined;

        const cerrarConEscape = (evento) => {
            if (evento.key === "Escape") setImagenAmpliada(null);
        };

        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [imagenAmpliada]);

    const resumen = useMemo(() => {
        const lista = Array.isArray(justificacionesSemana) ? justificacionesSemana : [];

        return {
            faltasJustificadas: lista.filter((fila) => fila.tipo === "FALTA" && fila.estado === "ACEPTADA").length,
            faltasSinJustificar: lista.filter((fila) => fila.tipo === "FALTA" && fila.estado === "RECHAZADA").length,
            tardanzas: lista.filter((fila) => fila.tipo === "TARDANZA").length,
            olvidos: lista.filter((fila) => fila.tipo === "OLVIDO_MARCAR").length,
        };
    }, [justificacionesSemana]);

    const limpiarFiltros = () => {
        setFiltroUsuario("");
        setDesde("");
        setHasta("");
    };

    const abrirConfirmacion = (justificacion, estado) => {
        setConfirmacion({
            id: justificacion.id,
            estado,
            usuario: justificacion.usuario || "este usuario",
        });
    };

    const confirmarResolucion = async () => {
        if (!confirmacion || resolviendo) return;

        setResolviendo(true);
        try {
            await resolverJustificacion(confirmacion.id, confirmacion.estado);
            toast.success(
                confirmacion.estado === "ACEPTADA"
                    ? "Justificación aceptada."
                    : "Justificación rechazada."
            );
            setConfirmacion(null);
            await Promise.all([
                recargar({ silencioso: true }),
                recargarResumen(),
            ]);
        } catch (errorResolucion) {
            toast.error(obtenerMensajeError(
                errorResolucion,
                "No se pudo actualizar la justificación."
            ));
        } finally {
            setResolviendo(false);
        }
    };

    const lista = Array.isArray(justificaciones) ? justificaciones : [];

    return (
        <div className="justificaciones-container">
            <header className="justificaciones-header">
                <p className="justificaciones-eyebrow">GESTIÓN DE PERSONAL</p>
                <h1>Justificaciones</h1>
                <p className="justificaciones-sub">
                    Revisa tardanzas, faltas y olvidos de marca enviados por el equipo.
                </p>
            </header>

            <section className="justificaciones-resumen" aria-label="Resumen semanal">
                <div className="justificaciones-resumen-card resumen-verde">
                    <span className="justificaciones-resumen-icono" aria-hidden="true">
                        <CheckCircle size={22} weight="duotone" />
                    </span>
                    <div className="justificaciones-resumen-datos">
                        <span className="justificaciones-resumen-label">Faltas justificadas</span>
                        <span className="justificaciones-resumen-valor">{resumen.faltasJustificadas}</span>
                    </div>
                </div>

                <div className="justificaciones-resumen-card resumen-rojo">
                    <span className="justificaciones-resumen-icono" aria-hidden="true">
                        <XCircle size={22} weight="duotone" />
                    </span>
                    <div className="justificaciones-resumen-datos">
                        <span className="justificaciones-resumen-label">Faltas sin justificar</span>
                        <span className="justificaciones-resumen-valor">{resumen.faltasSinJustificar}</span>
                    </div>
                </div>

                <div className="justificaciones-resumen-card resumen-amarillo">
                    <span className="justificaciones-resumen-icono" aria-hidden="true">
                        <Clock size={22} weight="duotone" />
                    </span>
                    <div className="justificaciones-resumen-datos">
                        <span className="justificaciones-resumen-label">Tardanzas</span>
                        <span className="justificaciones-resumen-valor">{resumen.tardanzas}</span>
                    </div>
                </div>

                <div className="justificaciones-resumen-card resumen-azul">
                    <span className="justificaciones-resumen-icono" aria-hidden="true">
                        <NotePencil size={22} weight="duotone" />
                    </span>
                    <div className="justificaciones-resumen-datos">
                        <span className="justificaciones-resumen-label">Olvidos</span>
                        <span className="justificaciones-resumen-valor">{resumen.olvidos}</span>
                    </div>
                </div>
            </section>

            <p className="justificaciones-resumen-nota">
                Resumen de los últimos 7 días, según la fecha de cada justificación.
            </p>

            <section className="justificaciones-filtros" aria-label="Filtros de justificaciones">
                <span className="justificaciones-filtros-titulo">FILTRAR</span>

                <div className="justificaciones-filtro">
                    <label htmlFor="justificaciones-usuario">Usuario</label>
                    <select
                        id="justificaciones-usuario"
                        value={filtroUsuario}
                        onChange={(evento) => setFiltroUsuario(evento.target.value)}
                    >
                        <option value="">Todos los usuarios</option>
                        {usuarios.map((usuario) => (
                            <option key={usuario.id} value={usuario.id}>
                                {usuario.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="justificaciones-filtro">
                    <label htmlFor="justificaciones-desde">Desde</label>
                    <input
                        id="justificaciones-desde"
                        type="date"
                        value={desde}
                        max={hasta || undefined}
                        onChange={(evento) => setDesde(evento.target.value)}
                    />
                </div>

                <div className="justificaciones-filtro">
                    <label htmlFor="justificaciones-hasta">Hasta</label>
                    <input
                        id="justificaciones-hasta"
                        type="date"
                        value={hasta}
                        min={desde || undefined}
                        onChange={(evento) => setHasta(evento.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className="justificaciones-limpiar"
                    onClick={limpiarFiltros}
                    disabled={!filtroUsuario && !desde && !hasta}
                >
                    Limpiar filtros
                </button>
            </section>

            <div className="justificaciones-tabs" role="tablist" aria-label="Estado de las justificaciones">
                {PESTANAS.map((opcion) => (
                    <button
                        key={opcion.id}
                        type="button"
                        role="tab"
                        id={`justificaciones-tab-${opcion.id.toLowerCase()}`}
                        aria-selected={pestana === opcion.id}
                        aria-controls="justificaciones-panel"
                        className={`justificaciones-tab${pestana === opcion.id ? " justificaciones-tab-activa" : ""}`}
                        onClick={() => setPestana(opcion.id)}
                    >
                        {opcion.texto}
                        {opcion.id === "PENDIENTE" && pendientes > 0 && (
                            <span className="justificaciones-tab-contador">{pendientes}</span>
                        )}
                    </button>
                ))}
            </div>

            <section
                className="justificaciones-panel"
                id="justificaciones-panel"
                role="tabpanel"
                aria-labelledby={`justificaciones-tab-${pestana.toLowerCase()}`}
                aria-busy={cargando}
            >
                {error && (
                    <p className="justificaciones-error" role="alert">{error}</p>
                )}

                {cargando ? (
                    <p className="justificaciones-vacio">Cargando justificaciones...</p>
                ) : lista.length === 0 ? (
                    <p className="justificaciones-vacio">
                        No hay justificaciones para este estado y estos filtros.
                    </p>
                ) : (
                    <>
                        <div className="justificaciones-tabla-scroll">
                            <table className="justificaciones-tabla">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Tipo</th>
                                        <th className="col-centrada">Minutos</th>
                                        <th className="col-centrada">Fecha</th>
                                        <th>Asunto</th>
                                        <th>Mensaje</th>
                                        <th className="col-centrada">Imagen</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lista.map((justificacion) => {
                                        const estado = justificacion.estado || "PENDIENTE";

                                        return (
                                            <tr key={justificacion.id}>
                                                <td>
                                                    <div className="justificaciones-usuario">
                                                        <span className="justificaciones-usuario-nombre">
                                                            {justificacion.usuario || "Usuario"}
                                                        </span>
                                                        {justificacion.correo && (
                                                            <span className="justificaciones-usuario-correo">
                                                                {justificacion.correo}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`justificaciones-tipo tipo-${(justificacion.tipo || "").toLowerCase()}`}>
                                                        {TEXTO_TIPO[justificacion.tipo] || "—"}
                                                    </span>
                                                </td>
                                                <td className="col-centrada justificaciones-minutos">
                                                    {minutosTardanza(justificacion)}
                                                </td>
                                                <td className="col-centrada justificaciones-fecha">
                                                    {formatearFecha(justificacion.fecha)}
                                                </td>
                                                <td className="justificaciones-asunto">
                                                    {justificacion.asunto || "—"}
                                                </td>
                                                <td className="justificaciones-mensaje">
                                                    {justificacion.mensaje || "—"}
                                                </td>
                                                <td className="col-centrada">
                                                    {justificacion.evidencia_url ? (
                                                        <button
                                                            type="button"
                                                            className="justificaciones-miniatura"
                                                            onClick={() => setImagenAmpliada(justificacion)}
                                                            aria-label={`Ampliar adjunto de ${justificacion.usuario || "la justificación"}`}
                                                        >
                                                            <img
                                                                src={justificacion.evidencia_url}
                                                                alt=""
                                                                loading="lazy"
                                                            />
                                                        </button>
                                                    ) : (
                                                        <span className="justificaciones-sin-adjunto">Sin adjunto</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`justificaciones-estado estado-${estado.toLowerCase()}`}>
                                                        {TEXTO_ESTADO[estado] || estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    {estado === "PENDIENTE" ? (
                                                        <div className="justificaciones-acciones">
                                                            <button
                                                                type="button"
                                                                className="justificaciones-accion accion-aceptar"
                                                                onClick={() => abrirConfirmacion(justificacion, "ACEPTADA")}
                                                            >
                                                                Aceptar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="justificaciones-accion accion-rechazar"
                                                                onClick={() => abrirConfirmacion(justificacion, "RECHAZADA")}
                                                            >
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="justificaciones-revisada">
                                                            {justificacion.revisado_por
                                                                ? `Por ${justificacion.revisado_por}`
                                                                : "Revisada"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="justificaciones-cards">
                            {lista.map((justificacion) => (
                                <TarjetaJustificacion
                                    key={justificacion.id}
                                    justificacion={justificacion}
                                    onAmpliar={setImagenAmpliada}
                                    onResolver={abrirConfirmacion}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>

            <ModalConfirm
                abierto={Boolean(confirmacion)}
                titulo={confirmacion?.estado === "ACEPTADA"
                    ? "Aceptar justificación"
                    : "Rechazar justificación"}
                mensaje={confirmacion
                    ? `¿Confirmas que deseas ${confirmacion.estado === "ACEPTADA" ? "aceptar" : "rechazar"} la justificación de ${confirmacion.usuario}?`
                    : ""}
                textoConfirmar={confirmacion?.estado === "ACEPTADA" ? "Aceptar" : "Rechazar"}
                textoCancelar="Cancelar"
                tipo={confirmacion?.estado === "ACEPTADA" ? "info" : "danger"}
                onConfirmar={confirmarResolucion}
                onCancelar={() => {
                    if (!resolviendo) setConfirmacion(null);
                }}
            />

            {imagenAmpliada && createPortal(
                <div
                    className="justificaciones-lightbox"
                    role="presentation"
                    onClick={() => setImagenAmpliada(null)}
                >
                    <div
                        className="justificaciones-lightbox-caja"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Adjunto de ${imagenAmpliada.usuario || "la justificación"}`}
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <img
                            src={imagenAmpliada.evidencia_url}
                            alt={`Adjunto de ${imagenAmpliada.usuario || "la justificación"}`}
                        />
                        <div className="justificaciones-lightbox-info">
                            <span>
                                <Paperclip size={15} weight="bold" aria-hidden="true" />
                                {imagenAmpliada.usuario || "Justificación"}
                            </span>
                            <button
                                type="button"
                                className="justificaciones-lightbox-cerrar"
                                onClick={() => setImagenAmpliada(null)}
                                aria-label="Cerrar adjunto"
                            >
                                <X size={18} weight="bold" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Justificaciones;
