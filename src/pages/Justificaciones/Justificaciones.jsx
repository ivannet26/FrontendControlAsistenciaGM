// src/pages/Justificaciones/Justificaciones.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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

const DropdownCheckbox = ({
    etiqueta,
    opciones,
    seleccionados,
    onChange,
    abierto,
    setAbierto,
    busqueda = false,
}) => {
    const contenedorRef = useRef(null);
    const [textoBusqueda, setTextoBusqueda] = useState("");

    useEffect(() => {
        const cerrarAlExterior = (evento) => {
            if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
                setAbierto(false);
            }
        };
        const cerrarConEscape = (evento) => {
            if (evento.key === "Escape") setAbierto(false);
        };

        document.addEventListener("mousedown", cerrarAlExterior);
        document.addEventListener("keydown", cerrarConEscape);
        return () => {
            document.removeEventListener("mousedown", cerrarAlExterior);
            document.removeEventListener("keydown", cerrarConEscape);
        };
    }, [setAbierto]);

    const opcionesVisibles = busqueda
        ? opciones.filter((opcion) => opcion.texto.toLowerCase().includes(textoBusqueda.toLowerCase()))
        : opciones;
    const todosSeleccionados = seleccionados.length === 0;
    const cantidad = seleccionados.length;

    const cambiarTodos = () => onChange([]);

    const cambiarOpcion = (valor) => {
        if (seleccionados.includes(valor)) {
            const siguientes = seleccionados.filter((seleccionado) => seleccionado !== valor);
            onChange(siguientes.length ? siguientes : []);
            return;
        }
        onChange([...seleccionados.filter(Boolean), valor]);
    };

    return (
        <div className="justificaciones-dropdown" ref={contenedorRef}>
            <button
                type="button"
                className="justificaciones-dropdown-boton"
                aria-expanded={abierto}
                aria-haspopup="listbox"
                onClick={() => setAbierto(!abierto)}
            >
                <span>{etiqueta}{cantidad > 0 ? ` (${cantidad})` : ""}</span>
                <span aria-hidden="true">▾</span>
            </button>
            {abierto && (
                <div className="justificaciones-dropdown-panel" role="listbox" aria-multiselectable="true">
                    {busqueda && (
                        <input
                            type="search"
                            className="justificaciones-dropdown-busqueda"
                            placeholder="Buscar usuario..."
                            value={textoBusqueda}
                            onChange={(evento) => setTextoBusqueda(evento.target.value)}
                        />
                    )}
                    <label className="justificaciones-dropdown-opcion">
                        <input
                            type="checkbox"
                            checked={todosSeleccionados}
                            aria-checked={todosSeleccionados}
                            onChange={cambiarTodos}
                        />
                        <span>Todos</span>
                    </label>
                    <div className="justificaciones-dropdown-opciones">
                        {opcionesVisibles.map((opcion) => {
                            const marcado = seleccionados.includes(opcion.valor);
                            return (
                                <label className="justificaciones-dropdown-opcion" key={String(opcion.valor)}>
                                    <input
                                        type="checkbox"
                                        checked={marcado}
                                        aria-checked={marcado}
                                        onChange={() => cambiarOpcion(opcion.valor)}
                                    />
                                    <span>{opcion.texto}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "—";

    const [año, mes, dia] = String(fechaIso).slice(0, 10).split("-");
    if (!año || !mes || !dia) return String(fechaIso);
    return `${dia}/${mes}/${año}`;
};

const obtenerNombreUsuario = (justificacion) =>
    String(justificacion?.usuario_nombre || "").trim() || "Usuario desconocido";

const obtenerCorreoUsuario = (justificacion) =>
    String(justificacion?.usuario_email || justificacion?.correo || "").trim();

const claveIntentos = (justificacion) => [
    String(justificacion?.usuario_id ?? ""),
    String(justificacion?.tipo || "").toUpperCase(),
    String(justificacion?.fecha || "").slice(0, 10),
].join("|");

// El tipo y los minutos comparten un mismo chip neutro: "Tardanza · 45 min".
const textoTipo = (justificacion) => {
    const nombre = TEXTO_TIPO[justificacion.tipo] || String(justificacion.tipo || "").trim() || "Justificación";
    const minutos = justificacion.minutos_tarde;
    const esTardanza = ["TARDANZA", "Tardanza"].includes(justificacion.tipo);

    if (!esTardanza || minutos === null || minutos === undefined) {
        return nombre;
    }

    return `${nombre} · ${minutos} min`;
};

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error?.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    return error?.message || mensajePredeterminado;
};

const TarjetaJustificacion = ({ justificacion, cantidadIntentos, onAmpliar, onResolver }) => {
    const estado = justificacion.estado || "PENDIENTE";

    return (
        <article className="justificaciones-card">
            <header className="justificaciones-card-header">
                <div className="justificaciones-card-usuario">
                    <span>{obtenerNombreUsuario(justificacion)}</span>
                    {obtenerCorreoUsuario(justificacion) && (
                        <span className="justificaciones-card-correo">
                            {obtenerCorreoUsuario(justificacion)}
                        </span>
                    )}
                </div>
                <span className="justificaciones-estado">
                    {TEXTO_ESTADO[estado] || estado}
                </span>
                {estado === "PENDIENTE" && cantidadIntentos > 1 && (
                    <span className="justificaciones-intentos-badge">
                        {cantidadIntentos} intentos · Actualización
                    </span>
                )}
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
    const [estadosFiltro, setEstadosFiltro] = useState(["PENDIENTE"]);
    const [usuariosFiltro, setUsuariosFiltro] = useState([]);
    const [dropdownAbierto, setDropdownAbierto] = useState(null);
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [pagina, setPagina] = useState(1);
    const [usuarios, setUsuarios] = useState([]);
    const [confirmacion, setConfirmacion] = useState(null);
    const [resolviendo, setResolviendo] = useState(false);
    const [imagenAmpliada, setImagenAmpliada] = useState(null);
    const [tabActiva, setTabActiva] = useState("PENDIENTES");
    const vistaHistorial = tabActiva === "HISTORIAL";

    const filtros = useMemo(() => ({
        estado: "",
        usuario_id: "",
        desde,
        hasta,
    }), [desde, hasta]);

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
                    const clave = String(fila.usuario_id ?? obtenerCorreoUsuario(fila) ?? obtenerNombreUsuario(fila));
                    if (!clave || mapa.has(clave)) return;
                    mapa.set(clave, {
                        id: fila.usuario_id ?? clave,
                        nombre: obtenerNombreUsuario(fila),
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
        setEstadosFiltro([]);
        setUsuariosFiltro([]);
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

    const listaCompleta = Array.isArray(justificaciones) ? justificaciones : [];
    const conteoIntentosPendientes = new Map();
    listaCompleta
        .filter((justificacion) => (justificacion.estado || "PENDIENTE") === "PENDIENTE")
        .forEach((justificacion) => {
            const clave = claveIntentos(justificacion);
            conteoIntentosPendientes.set(clave, (conteoIntentosPendientes.get(clave) || 0) + 1);
        });
    const lista = listaCompleta.filter((justificacion) => {
        const coincideEstado = estadosFiltro.length === 0 || estadosFiltro.includes(justificacion.estado || "PENDIENTE");
        const usuarioId = String(justificacion.usuario_id ?? "");
        const coincideUsuario = usuariosFiltro.length === 0 || usuariosFiltro.includes(usuarioId) ||
            usuariosFiltro.includes(justificacion.usuario);
        return coincideEstado && coincideUsuario;
    });
    const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const listaPagina = lista.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
    );
    const contador = `${lista.length} ${lista.length === 1 ? "justificación" : "justificaciones"}`;
    const filtrosActivos = usuariosFiltro.length > 0 || estadosFiltro.length > 0 || Boolean(desde || hasta);
    const historial = lista.filter((justificacion) =>
        justificacion.estado === "ACEPTADA" || justificacion.estado === "RECHAZADA"
    );
    const historialPagina = historial.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
    );

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
                    onClick={() => {
                        setTabActiva("PENDIENTES");
                        setEstadosFiltro(["PENDIENTE"]);
                        setPagina(1);
                    }}
                >
                    PENDIENTES
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={vistaHistorial}
                    className={vistaHistorial ? "activo" : ""}
                    onClick={() => {
                        setTabActiva("HISTORIAL");
                        setEstadosFiltro(["ACEPTADA", "RECHAZADA"]);
                        setPagina(1);
                    }}
                >
                    HISTORIAL
                </button>
            </div>

            <div className="equipo-contenedor">
            <section className="justificaciones-filtros" aria-label="Filtros de justificaciones">
                <span className="justificaciones-filtros-titulo">FILTRAR</span>

                <DropdownCheckbox
                    etiqueta="Usuario"
                    opciones={usuarios.map((usuario) => ({
                        valor: String(usuario.id),
                        texto: usuario.nombre,
                    }))}
                    seleccionados={usuariosFiltro}
                    onChange={(valores) => {
                        setUsuariosFiltro(valores);
                        setPagina(1);
                    }}
                    abierto={dropdownAbierto === "usuario"}
                    setAbierto={(abierto) => setDropdownAbierto(abierto ? "usuario" : null)}
                    busqueda
                />

                <DropdownCheckbox
                    etiqueta="Estado"
                    opciones={[
                        { valor: "PENDIENTE", texto: "Pendiente" },
                        { valor: "ACEPTADA", texto: "Aceptada" },
                        { valor: "RECHAZADA", texto: "Rechazada" },
                    ]}
                    seleccionados={estadosFiltro}
                    onChange={(valores) => {
                        setEstadosFiltro(valores);
                        setPagina(1);
                    }}
                    abierto={dropdownAbierto === "estado"}
                    setAbierto={(abierto) => setDropdownAbierto(abierto ? "estado" : null)}
                />

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
                className={`justificaciones-panel${vistaHistorial ? " justificaciones-panel-historial" : ""}`}
                aria-busy={cargando}
                aria-label="Lista de justificaciones"
            >
                {!cargando && (vistaHistorial ? historial.length > 0 : lista.length > 0) && (
                    <div className="justificaciones-panel-header">
                        <span className="justificaciones-contador">
                            {vistaHistorial
                                ? `${historial.length} ${historial.length === 1 ? "justificación procesada" : "justificaciones procesadas"}`
                                : contador}
                        </span>
                    </div>
                )}

                {error && (
                    <p className="justificaciones-error" role="alert">{error}</p>
                )}

                {cargando ? (
                    <p className="justificaciones-vacio">Cargando justificaciones...</p>
                ) : (vistaHistorial ? historial.length === 0 : lista.length === 0) ? (
                    <p className="justificaciones-vacio">
                        {vistaHistorial
                            ? "No hay justificaciones procesadas."
                            : "No hay justificaciones para este estado y estos filtros."}
                    </p>
                ) : vistaHistorial ? (
                    <>
                        <div className="miembros-tabla-container">
                            <div className="tabla-header">
                                <span>Justificaciones</span>
                            </div>
                        <div className="justificaciones-tabla-scroll">
                            <table className="justificaciones-tabla justificaciones-historial-tabla">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Tipo</th>
                                        <th>Fecha</th>
                                        <th>Asunto</th>
                                        <th>Comentario del Admin</th>
                                        <th>Evidencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historialPagina.map((justificacion) => (
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
                                            <td>
                                                <span className="justificaciones-tipo">{textoTipo(justificacion)}</span>
                                            </td>
                                            <td>{formatearFecha(justificacion.fecha)}</td>
                                            <td>{justificacion.asunto || "Sin asunto"}</td>
                                            <td className="justificaciones-comentario-admin">
                                                {justificacion.comentario_admin?.trim() || "Sin comentario"}
                                            </td>
                                            <td>
                                                {justificacion.evidencia_url ? (
                                                    <button
                                                        type="button"
                                                        className="justificaciones-ver-imagen"
                                                        onClick={() => setImagenAmpliada(justificacion)}
                                                    >
                                                        Ver Evidencia
                                                    </button>
                                                ) : (
                                                    <span className="justificaciones-sin-adjunto">Sin adjunto</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                ) : (
                    <>
                        <div className="miembros-tabla-container">
                            <div className="tabla-header">
                                <span>Justificaciones</span>
                            </div>
                        <div className="justificaciones-tabla-scroll">
                            <table className="justificaciones-tabla">
                                <thead>
                                    <tr>
                                        <th className="col-usuario">Usuario</th>
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
                                        const cantidadIntentos = conteoIntentosPendientes.get(claveIntentos(justificacion)) || 1;

                                        return (
                                            <tr key={justificacion.id}>
                                                <td>
                                                    <div className="justificaciones-usuario">
                                                        <span className="justificaciones-usuario-nombre">
                                                            {obtenerNombreUsuario(justificacion)}
                                                        </span>
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
                        </div>

                        <div className="justificaciones-cards">
                            {listaPagina.map((justificacion) => (
                                <TarjetaJustificacion
                                    key={justificacion.id}
                                    justificacion={justificacion}
                                    cantidadIntentos={conteoIntentosPendientes.get(claveIntentos(justificacion)) || 1}
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
