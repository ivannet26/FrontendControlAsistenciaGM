// src/pages/Justificaciones/Justificaciones.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Paperclip, X } from "@phosphor-icons/react";
import { obtenerTodas, resolver as resolverJustificacion } from "../../services/justificacionesService";
import { useJustificaciones } from "../../hooks/useJustificaciones";
import ModalConfirm from "../../components/ModalConfirm/ModalConfirm";
import "./Justificaciones.css";

const POR_PAGINA = 10;

const OPCIONES_ESTADO = [
    { valor: "PENDIENTE", texto: "Pendientes" },
    { valor: "ACEPTADA", texto: "Aceptadas" },
    { valor: "RECHAZADA", texto: "Rechazadas" },
    { valor: "TODAS", texto: "Todas" },
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

const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "—";

    const [año, mes, dia] = String(fechaIso).slice(0, 10).split("-");
    if (!año || !mes || !dia) return String(fechaIso);
    return `${dia}/${mes}/${año}`;
};

// El tipo y los minutos comparten un mismo chip neutro: "Tardanza · 45 min".
const textoTipo = (justificacion) => {
    const nombre = TEXTO_TIPO[justificacion.tipo] || "Justificación";
    const minutos = justificacion.minutos_tarde;

    if (justificacion.tipo !== "TARDANZA" || minutos === null || minutos === undefined) {
        return nombre;
    }

    return `${nombre} · ${minutos} min`;
};

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error?.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    return error?.message || mensajePredeterminado;
};

const TarjetaJustificacion = ({ justificacion, onAmpliar, onResolver }) => {
    const estado = justificacion.estado || "PENDIENTE";

    return (
        <article className="justificaciones-card">
            <header className="justificaciones-card-header">
                <div className="justificaciones-card-usuario">
                    <span>{justificacion.usuario || "Usuario"}</span>
                    {justificacion.correo && (
                        <span className="justificaciones-card-correo">{justificacion.correo}</span>
                    )}
                </div>
                <span className="justificaciones-estado">
                    {TEXTO_ESTADO[estado] || estado}
                </span>
            </header>

            <dl className="justificaciones-card-datos">
                <div>
                    <dt>Tipo</dt>
                    <dd>
                        <span className="justificaciones-tipo">{textoTipo(justificacion)}</span>
                    </dd>
                </div>
                <div>
                    <dt>Fecha</dt>
                    <dd>{formatearFecha(justificacion.fecha)}</dd>
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
                        className="justificaciones-ver-imagen"
                        onClick={() => onAmpliar(justificacion)}
                    >
                        Ver imagen
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
    const [estadoFiltro, setEstadoFiltro] = useState("PENDIENTE");
    const [filtroUsuario, setFiltroUsuario] = useState("");
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [pagina, setPagina] = useState(1);
    const [usuarios, setUsuarios] = useState([]);
    const [confirmacion, setConfirmacion] = useState(null);
    const [resolviendo, setResolviendo] = useState(false);
    const [imagenAmpliada, setImagenAmpliada] = useState(null);

    const filtros = useMemo(() => ({
        estado: estadoFiltro === "TODAS" ? "" : estadoFiltro,
        usuario_id: filtroUsuario ? Number(filtroUsuario) : "",
        desde,
        hasta,
    }), [estadoFiltro, filtroUsuario, desde, hasta]);

    const {
        justificaciones,
        cargando,
        error,
        recargar,
    } = useJustificaciones({
        fuente: "todas",
        filtros,
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

    const limpiarFiltros = () => {
        setEstadoFiltro("PENDIENTE");
        setFiltroUsuario("");
        setDesde("");
        setHasta("");
        setPagina(1);
    };

    const cambiarFiltro = (actualizar) => (evento) => {
        actualizar(evento.target.value);
        setPagina(1);
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
            await recargar({ silencioso: true });
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
    const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const listaPagina = lista.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
    );
    const contador = `${lista.length} ${lista.length === 1 ? "justificación" : "justificaciones"}`;
    const filtrosActivos = Boolean(filtroUsuario || desde || hasta) || estadoFiltro !== "PENDIENTE";

    return (
        <div className="justificaciones-container">
            <header className="justificaciones-header">
                <p className="justificaciones-eyebrow">GESTIÓN DE PERSONAL</p>
                <h1>Justificaciones</h1>
                <p className="justificaciones-sub">
                    Revisa tardanzas, faltas y olvidos de marca enviados por el equipo.
                </p>
            </header>

            <section className="justificaciones-filtros" aria-label="Filtros de justificaciones">
                <span className="justificaciones-filtros-titulo">FILTRAR</span>

                <div className="justificaciones-filtro">
                    <label htmlFor="justificaciones-usuario">Usuario</label>
                    <select
                        id="justificaciones-usuario"
                        value={filtroUsuario}
                        onChange={cambiarFiltro(setFiltroUsuario)}
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
                    <label htmlFor="justificaciones-estado">Estado</label>
                    <select
                        id="justificaciones-estado"
                        value={estadoFiltro}
                        onChange={cambiarFiltro(setEstadoFiltro)}
                    >
                        {OPCIONES_ESTADO.map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor}>
                                {opcion.texto}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="justificaciones-filtro">
                    <label htmlFor="justificaciones-desde">Desde</label>
                    <input
                        id="justificaciones-desde"
                        type="date"
                        lang="es-PE"
                        value={desde}
                        max={hasta || undefined}
                        onChange={cambiarFiltro(setDesde)}
                    />
                </div>

                <div className="justificaciones-filtro">
                    <label htmlFor="justificaciones-hasta">Hasta</label>
                    <input
                        id="justificaciones-hasta"
                        type="date"
                        lang="es-PE"
                        value={hasta}
                        min={desde || undefined}
                        onChange={cambiarFiltro(setHasta)}
                    />
                </div>

                <button
                    type="button"
                    className="justificaciones-limpiar"
                    onClick={limpiarFiltros}
                    disabled={!filtrosActivos}
                >
                    Limpiar filtros
                </button>
            </section>

            <section
                className="justificaciones-panel"
                aria-busy={cargando}
                aria-label="Lista de justificaciones"
            >
                {!cargando && lista.length > 0 && (
                    <div className="justificaciones-panel-header">
                        <span className="justificaciones-contador">{contador}</span>
                    </div>
                )}

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
                                        <th>Fecha</th>
                                        <th>Asunto y mensaje</th>
                                        <th>Imagen</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaPagina.map((justificacion) => {
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
                                                    <span className="justificaciones-tipo">
                                                        {textoTipo(justificacion)}
                                                    </span>
                                                </td>
                                                <td className="justificaciones-fecha">
                                                    {formatearFecha(justificacion.fecha)}
                                                </td>
                                                <td className="justificaciones-asunto-mensaje">
                                                    <strong className="justificaciones-asunto">
                                                        {justificacion.asunto || "Sin asunto"}
                                                    </strong>
                                                    <p className="justificaciones-mensaje">
                                                        {justificacion.mensaje || "Sin mensaje"}
                                                    </p>
                                                </td>
                                                <td>
                                                    {justificacion.evidencia_url ? (
                                                        <button
                                                            type="button"
                                                            className="justificaciones-ver-imagen"
                                                            onClick={() => setImagenAmpliada(justificacion)}
                                                        >
                                                            Ver imagen
                                                        </button>
                                                    ) : (
                                                        <span className="justificaciones-sin-adjunto">Sin adjunto</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="justificaciones-estado">
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
                            {listaPagina.map((justificacion) => (
                                <TarjetaJustificacion
                                    key={justificacion.id}
                                    justificacion={justificacion}
                                    onAmpliar={setImagenAmpliada}
                                    onResolver={abrirConfirmacion}
                                />
                            ))}
                        </div>

                        <footer className="justificaciones-paginacion">
                            <button
                                type="button"
                                className="justificaciones-paginacion-boton"
                                onClick={() => setPagina(paginaActual - 1)}
                                disabled={paginaActual <= 1}
                            >
                                Anterior
                            </button>
                            <span className="justificaciones-paginacion-texto">
                                {paginaActual} de {totalPaginas}
                            </span>
                            <button
                                type="button"
                                className="justificaciones-paginacion-boton"
                                onClick={() => setPagina(paginaActual + 1)}
                                disabled={paginaActual >= totalPaginas}
                            >
                                Siguiente
                            </button>
                        </footer>
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
                tipo="info"
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
