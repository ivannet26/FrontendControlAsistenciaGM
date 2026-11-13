import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { MagnifyingGlass, Paperclip, X } from "@phosphor-icons/react";
import { resolver as resolverJustificacion } from "../../services/justificacionesService";
import { useJustificaciones } from "../../hooks/useJustificaciones";
import ModalConfirm from "../../components/ModalConfirm/ModalConfirm";
import "./Justificaciones.css";

const POR_PAGINA = 10;
const JUSTIFICACIONES_VACIAS = [];

const OPCIONES_ESTADO = [
    { valor: "TODAS", texto: "Todos los estados" },
    { valor: "PENDIENTE", texto: "Pendiente" },
    { valor: "ACEPTADA", texto: "Aceptada" },
    { valor: "RECHAZADA", texto: "Rechazada" },
];

const TEXTO_TIPO = {
    TARDANZA: "Tardanza",
    Tardanza: "Tardanza",
    FALTA: "Falta",
    Falta: "Falta",
    OLVIDO_MARCAR: "Olvidé marcar",
    "Olvidé marcar": "Olvidé marcar",
    OTRO: "Otro",
    Otro: "Otro",
};

const TEXTO_ESTADO = {
    PENDIENTE: "Pendiente",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
};

const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "—";
    const [año, mes, dia] = String(fechaIso).slice(0, 10).split("-");
    return año && mes && dia ? `${dia}/${mes}/${año}` : String(fechaIso);
};

const obtenerNombreUsuario = (justificacion) =>
    String(justificacion?.usuario_nombre || "").trim() || "Usuario desconocido";

const obtenerCorreoUsuario = (justificacion) =>
    String(justificacion?.usuario_email || justificacion?.correo || "").trim();

const obtenerClaveUsuario = (justificacion) => String(
    justificacion?.usuario_id
        ?? (obtenerCorreoUsuario(justificacion) || obtenerNombreUsuario(justificacion))
);

const claveIntentos = (justificacion) => [
    String(justificacion?.usuario_id ?? ""),
    String(justificacion?.tipo || "").toUpperCase(),
    String(justificacion?.fecha || "").slice(0, 10),
].join("|");

const textoTipo = (justificacion) => {
    const nombre = TEXTO_TIPO[justificacion.tipo]
        || String(justificacion.tipo || "").trim()
        || "Justificación";
    const minutos = justificacion.minutos_tarde;
    const esTardanza = ["TARDANZA", "Tardanza"].includes(justificacion.tipo);

    if (!esTardanza || minutos === null || minutos === undefined) return nombre;
    return `${nombre} · ${minutos} min`;
};

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error?.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    return error?.message || mensajePredeterminado;
};

const Justificaciones = () => {
    const [usuarioFiltro, setUsuarioFiltro] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("PENDIENTE");
    const [fechaFiltro, setFechaFiltro] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(1);
    const [confirmacion, setConfirmacion] = useState(null);
    const [resolviendo, setResolviendo] = useState(false);
    const [imagenAmpliada, setImagenAmpliada] = useState(null);
    const [tabActiva, setTabActiva] = useState("PENDIENTES");
    const vistaHistorial = tabActiva === "HISTORIAL";

    const {
        justificaciones,
        cargando,
        error,
        recargar,
    } = useJustificaciones({ fuente: "todas" });

    useEffect(() => {
        if (!imagenAmpliada) return undefined;

        const cerrarConEscape = (evento) => {
            if (evento.key === "Escape") setImagenAmpliada(null);
        };

        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [imagenAmpliada]);

    const listaCompleta = Array.isArray(justificaciones)
        ? justificaciones
        : JUSTIFICACIONES_VACIAS;
    const usuarios = useMemo(() => {
        const mapa = new Map();
        listaCompleta.forEach((justificacion) => {
            const id = obtenerClaveUsuario(justificacion);
            if (!mapa.has(id)) {
                mapa.set(id, {
                    id,
                    nombre: obtenerNombreUsuario(justificacion),
                });
            }
        });
        return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [listaCompleta]);

    const conteoIntentosPendientes = useMemo(() => {
        const conteos = new Map();
        listaCompleta
            .filter((justificacion) => (justificacion.estado || "PENDIENTE") === "PENDIENTE")
            .forEach((justificacion) => {
                const clave = claveIntentos(justificacion);
                conteos.set(clave, (conteos.get(clave) || 0) + 1);
            });
        return conteos;
    }, [listaCompleta]);

    const listaFiltrada = useMemo(() => {
        const consulta = busqueda.trim().toLocaleLowerCase("es-PE");

        return listaCompleta
            .filter((justificacion) => {
                const estado = justificacion.estado || "PENDIENTE";
                if (!vistaHistorial && estado !== "PENDIENTE") return false;
                if (vistaHistorial && !["ACEPTADA", "RECHAZADA"].includes(estado)) return false;
                if (estadoFiltro !== "TODAS" && estado !== estadoFiltro) return false;
                if (usuarioFiltro && obtenerClaveUsuario(justificacion) !== usuarioFiltro) return false;

                const fecha = String(justificacion.fecha || "").slice(0, 10);
                if (fechaFiltro && fecha !== fechaFiltro) return false;

                if (consulta) {
                    const contenido = [
                        obtenerNombreUsuario(justificacion),
                        obtenerCorreoUsuario(justificacion),
                        justificacion.tipo,
                        justificacion.asunto,
                        justificacion.mensaje,
                        justificacion.comentario_admin,
                        estado,
                    ].join(" ").toLocaleLowerCase("es-PE");
                    if (!contenido.includes(consulta)) return false;
                }
                return true;
            })
            .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
    }, [busqueda, estadoFiltro, fechaFiltro, listaCompleta, usuarioFiltro, vistaHistorial]);

    const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const listaPagina = listaFiltrada.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
    );
    const filtrosActivos = Boolean(
        usuarioFiltro
        || fechaFiltro
        || busqueda
        || estadoFiltro !== (vistaHistorial ? "TODAS" : "PENDIENTE")
    );

    const cambiarFiltro = (actualizar) => (evento) => {
        actualizar(evento.target.value);
        setPagina(1);
    };

    const limpiarFiltros = () => {
        setUsuarioFiltro("");
        setEstadoFiltro(vistaHistorial ? "TODAS" : "PENDIENTE");
        setFechaFiltro("");
        setBusqueda("");
        setPagina(1);
    };

    const cambiarPestana = (pestana) => {
        setTabActiva(pestana);
        setEstadoFiltro(pestana === "HISTORIAL" ? "TODAS" : "PENDIENTE");
        setPagina(1);
    };

    const abrirConfirmacion = (justificacion, estado) => {
        setConfirmacion({
            id: justificacion.id,
            estado,
            usuario: obtenerNombreUsuario(justificacion),
        });
    };

    const confirmarResolucion = async (comentarioAdmin) => {
        if (!confirmacion || resolviendo) return;

        setResolviendo(true);
        try {
            await resolverJustificacion(confirmacion.id, confirmacion.estado, comentarioAdmin);
            toast.success(
                confirmacion.estado === "ACEPTADA"
                    ? "Justificación aceptada."
                    : "Justificación rechazada.",
                { duration: 3500, id: `justificacion-resuelta-${confirmacion.id}` }
            );
            setConfirmacion(null);
            await recargar({ silencioso: true });
        } catch (errorResolucion) {
            toast.error(obtenerMensajeError(
                errorResolucion,
                "No se pudo actualizar la justificación."
            ), { duration: 4000, id: "justificacion-resolucion-error" });
        } finally {
            setResolviendo(false);
        }
    };

    return (
        <div className="justificaciones-container">
            <header className="justificaciones-header">
                <p className="justificaciones-eyebrow">GESTIÓN DE PERSONAL</p>
                <h1>Justificaciones</h1>
                <p className="justificaciones-sub">
                    Revisa tardanzas, faltas y olvidos de marca enviados por el equipo.
                </p>
            </header>

            <div className="equipo-tabs" role="tablist" aria-label="Vistas de justificaciones">
                <button
                    type="button"
                    role="tab"
                    aria-selected={!vistaHistorial}
                    className={!vistaHistorial ? "activo" : ""}
                    onClick={() => cambiarPestana("PENDIENTES")}
                >
                    PENDIENTES
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={vistaHistorial}
                    className={vistaHistorial ? "activo" : ""}
                    onClick={() => cambiarPestana("HISTORIAL")}
                >
                    HISTORIAL
                </button>
            </div>

            <div className="equipo-contenedor">
                <section className="justificaciones-filtros" aria-label="Filtros de justificaciones">
                    <span className="justificaciones-filtros-titulo">FILTRAR</span>

                    <label className="justificaciones-filtro justificaciones-filtro-select">
                        <span className="sr-only">Usuario</span>
                        <select
                            aria-label="Filtrar por usuario"
                            value={usuarioFiltro}
                            onChange={cambiarFiltro(setUsuarioFiltro)}
                        >
                            <option value="">Todos los usuarios</option>
                            {usuarios.map((usuario) => (
                                <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                            ))}
                        </select>
                    </label>

                    <label className="justificaciones-filtro justificaciones-filtro-select">
                        <span className="sr-only">Estado</span>
                        <select
                            aria-label="Filtrar por estado"
                            value={estadoFiltro}
                            onChange={cambiarFiltro(setEstadoFiltro)}
                        >
                            {(vistaHistorial
                                ? OPCIONES_ESTADO
                                : OPCIONES_ESTADO.filter((opcion) => opcion.valor === "PENDIENTE")
                            ).map((opcion) => (
                                <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>
                            ))}
                        </select>
                    </label>

                    <label className="justificaciones-filtro justificaciones-filtro-fecha">
                        <span>Fecha</span>
                        <input
                            type="date"
                            lang="es-PE"
                            value={fechaFiltro}
                            onChange={cambiarFiltro(setFechaFiltro)}
                        />
                    </label>

                    <label className="justificaciones-buscador">
                        <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
                        <span className="sr-only">Buscar justificaciones</span>
                        <input
                            type="search"
                            placeholder="Buscar..."
                            value={busqueda}
                            onChange={cambiarFiltro(setBusqueda)}
                        />
                    </label>

                    <button
                        type="button"
                        className="justificaciones-limpiar"
                        onClick={limpiarFiltros}
                        disabled={!filtrosActivos}
                    >
                        Limpiar
                    </button>
                </section>

                <section
                    className="justificaciones-panel"
                    aria-busy={cargando}
                    aria-label={vistaHistorial ? "Historial de justificaciones" : "Justificaciones pendientes"}
                >
                    {error && <p className="justificaciones-error" role="alert">{error}</p>}

                    {cargando ? (
                        <p className="justificaciones-vacio" aria-busy="true">
                            Cargando justificaciones...
                        </p>
                    ) : listaFiltrada.length === 0 ? (
                        <p className="justificaciones-vacio">
                            {vistaHistorial
                                ? "No hay justificaciones procesadas para estos filtros."
                                : "No hay justificaciones para estos filtros."}
                        </p>
                    ) : (
                        <>
                            <div className="justificaciones-tabla-scroll">
                                <table className="justificaciones-tabla">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th className="col-tipo">Tipo</th>
                                            <th className="col-fecha">Fecha</th>
                                            <th className="col-asunto">Asunto</th>
                                            <th className="col-mensaje">Mensaje</th>
                                            <th className="col-imagen">Imagen</th>
                                            <th className="col-estado">Estado</th>
                                            <th className="col-acciones">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listaPagina.map((justificacion) => {
                                            const estado = justificacion.estado || "PENDIENTE";
                                            const cantidadIntentos = conteoIntentosPendientes.get(
                                                claveIntentos(justificacion)
                                            ) || 1;

                                            return (
                                                <tr key={justificacion.id}>
                                                    <td>
                                                        <div className="justificaciones-usuario">
                                                            <span className="justificaciones-usuario-nombre">
                                                                {obtenerNombreUsuario(justificacion)}
                                                            </span>
                                                            {obtenerCorreoUsuario(justificacion) && (
                                                                <span className="justificaciones-usuario-correo">
                                                                    {obtenerCorreoUsuario(justificacion)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td><span className="justificaciones-tipo">{textoTipo(justificacion)}</span></td>
                                                    <td className="justificaciones-fecha">{formatearFecha(justificacion.fecha)}</td>
                                                    <td className="justificaciones-asunto-mensaje">
                                                        <strong className="justificaciones-asunto">
                                                            {justificacion.asunto || "Sin asunto"}
                                                        </strong>
                                                    </td>
                                                    <td className="justificaciones-asunto-mensaje justificaciones-mensaje-celda">
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
                                                        {estado === "PENDIENTE" && cantidadIntentos > 1 && (
                                                            <span className="justificaciones-intentos-badge">
                                                                {cantidadIntentos} intentos · Actualización
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="justificaciones-acciones-celda">
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
                                                            <div className="justificaciones-resumen-resolucion">
                                                                <span>
                                                                    {justificacion.revisado_por
                                                                        ? `Por ${justificacion.revisado_por}`
                                                                        : "Revisada"}
                                                                </span>
                                                                <span>
                                                                    {justificacion.comentario_admin?.trim() || "Sin comentario"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <footer className="justificaciones-paginacion" aria-label="Paginación">
                                <button
                                    type="button"
                                    className="justificaciones-paginacion-boton"
                                    onClick={() => setPagina(paginaActual - 1)}
                                    disabled={paginaActual <= 1}
                                >
                                    Anterior
                                </button>
                                <div className="justificaciones-paginacion-paginas">
                                    {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
                                        <button
                                            type="button"
                                            key={numero}
                                            className={`justificaciones-pagina${numero === paginaActual ? " activo" : ""}`}
                                            aria-current={numero === paginaActual ? "page" : undefined}
                                            onClick={() => setPagina(numero)}
                                        >
                                            {numero}
                                        </button>
                                    ))}
                                </div>
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
            </div>

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
                requiereComentario
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
                        aria-label={`Adjunto de ${obtenerNombreUsuario(imagenAmpliada)}`}
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <img
                            src={imagenAmpliada.evidencia_url}
                            alt={`Adjunto de ${obtenerNombreUsuario(imagenAmpliada)}`}
                        />
                        <div className="justificaciones-lightbox-info">
                            <span>
                                <Paperclip size={15} weight="bold" aria-hidden="true" />
                                {obtenerNombreUsuario(imagenAmpliada)}
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
