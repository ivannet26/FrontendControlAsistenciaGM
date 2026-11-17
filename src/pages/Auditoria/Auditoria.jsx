import { useEffect, useState } from "react";
import { getAuditoria, getResumenAuditoria } from "../../services/auditoriaService";
import { getUsuarios } from "../../services/usuariosService";
import { CalendarBlank, MagnifyingGlass } from "@phosphor-icons/react";
import Tabla from "../../components/Tabla/Tabla";
import "./Auditoria.css";


// ============================================================
// MAPA DE ENTIDADES: nombre técnico → nombre amigable
// ============================================================

const ENTIDADES_LABEL = {
    TIEMPO_REGISTRO: "Rastreador",
    TIEMPO: "Rastreador",
    USUARIO: "Usuario",
    MIEMBRO: "Miembro de equipo",
    PROYECTO: "Proyecto",
    TAREA: "Tarea",
    CLIENTE: "Cliente",
    ETIQUETA: "Etiqueta",
};

const ACCIONES_LABEL = {
    CREAR: "Creó",
    EDITAR: "Editó",
    ELIMINAR: "Eliminó",
    ASIGNAR: "Asignó",
    REMOVER: "Removió",
    ARCHIVAR: "Archivó",
    DESARCHIVAR: "Desarchivó",
    DESACTIVAR: "Desactivó",
    ACTIVAR: "Activó",
    EDITAR_TIEMPO: "Editó tiempo",
    CREAR_TIEMPO_ADMIN: "Creó tiempo",
};

const labelEntidad = (codigo) =>
    ENTIDADES_LABEL[codigo] || codigo || "—";

const labelAccion = (codigo) =>
    ACCIONES_LABEL[codigo] || codigo || "—";

const hoy = () => new Date().toISOString().split("T")[0];


const Auditoria = () => {
    const [registros, setRegistros] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [resumen, setResumen] = useState(null);

    const [filtros, setFiltros] = useState({
        usuario_id: "",
        accion: "",
        entidad: "",
        fecha_inicio: hoy(),
        fecha_fin: hoy(),
        buscar: "",
    });

    useEffect(() => {
        getUsuarios().then(setUsuarios).catch(console.error);
        getResumenAuditoria(30).then(setResumen).catch(console.error);
    }, []);

    useEffect(() => {
        const t = setTimeout(async () => {
            try {
                const data = await getAuditoria(filtros);
                setRegistros(data);
            } catch (e) {
                console.error(e);
            }
        }, 350);
        return () => clearTimeout(t);
    }, [filtros]);

    const limpiar = () =>
        setFiltros({
            usuario_id: "",
            accion: "",
            entidad: "",
            fecha_inicio: hoy(),
            fecha_fin: hoy(),
            buscar: "",
        });

    const fmt = (iso) =>
        new Date(iso).toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    // Formatea "2026-10-07" → "miércoles, 7 de octubre de 2026"
    const formatearFecha = (iso) => {
        if (!iso) return "—";
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const columnas = [
        {
            key: "fecha",
            header: "Fecha",
            className: "col-fecha",
            render: (r) => fmt(r.fecha),
        },
        {
            key: "usuario",
            header: "Usuario",
            className: "col-usuario",
            render: (r) => (
                <>
                    <span className="nombre-usuario">
                        {r.usuario_nombre || "—"}
                    </span>
                    {r.usuario_email && (
                        <span className="email-usuario">
                            {r.usuario_email}
                        </span>
                    )}
                </>
            ),
        },
        {
            key: "accion",
            header: "Acción",
            className: "col-accion",
            render: (r) => (
                <span className={`texto-accion accion-${r.accion}`}>
                    {labelAccion(r.accion)}
                </span>
            ),
        },
        {
            key: "entidad",
            header: "Módulo",
            className: "col-modulo",
            render: (r) => (
                <>
                    <span className="texto-entidad">
                        {labelEntidad(r.entidad)}
                    </span>
                    {r.entidad_nombre && (
                        <span className="entidad-nombre">
                            {r.entidad_nombre}
                        </span>
                    )}
                </>
            ),
        },
        {
            key: "detalle",
            header: "Descripción",
            className: "col-descripcion",
            render: (r) => r.detalle || "—",
        },
        {
            key: "proyecto",
            header: "Proyecto",
            className: "col-proyecto",
            render: (r) => r.proyecto_nombre || "—",
        },
    ];

    return (
        <div className="auditoria-container">
            <header className="auditoria-header">
                <h1>Registro de auditoría</h1>
                <p className="auditoria-sub">Historial de actividades, modificaciones y eventos del sistema</p>
            </header>

            {/* RESUMEN — siempre visible, con optional chaining */}
            <div className="auditoria-resumen">
                <div className="resumen-card">
                    <span className="resumen-label">Registros</span>
                    <span className="resumen-valor">
                        {resumen?.total ?? "—"}
                    </span>
                </div>
                <div className="resumen-card">
                    <span className="resumen-label">Usuarios activos</span>
                    <span className="resumen-valor">
                        {resumen?.usuarios_activos ?? "—"}
                    </span>
                </div>
                <div className="resumen-card">
                    <span className="resumen-label">Creaciones</span>
                    <span className="resumen-valor">
                        {resumen?.por_accion?.CREAR ?? 0}
                    </span>
                </div>
                <div className="resumen-card">
                    <span className="resumen-label">Ediciones</span>
                    <span className="resumen-valor">
                        {resumen?.por_accion?.EDITAR ?? 0}
                    </span>
                </div>
                <div className="resumen-card">
                    <span className="resumen-label">Eliminaciones</span>
                    <span className="resumen-valor">
                        {resumen?.por_accion?.ELIMINAR ?? 0}
                    </span>
                </div>
            </div>

            <section className="auditoria-filtros">
                <div className="filtro-buscador">
                    <MagnifyingGlass size={15} weight="bold" />
                    <input
                        type="text"
                        placeholder="Buscar por usuario o detalle..."
                        value={filtros.buscar}
                        onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                    />
                </div>

                <div className="filtro-fechas">
                    <CalendarBlank size={14} weight="bold" />
                    <input
                        type="date"
                        value={filtros.fecha_inicio}
                        onChange={(e) =>
                            setFiltros({ ...filtros, fecha_inicio: e.target.value })
                        }
                        title="Fecha desde"
                    />
                    <span className="fecha-sep">→</span>
                    <input
                        type="date"
                        value={filtros.fecha_fin}
                        onChange={(e) =>
                            setFiltros({ ...filtros, fecha_fin: e.target.value })
                        }
                        title="Fecha hasta"
                    />
                </div>

                <select
                    value={filtros.usuario_id}
                    onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
                    title="Filtrar por usuario"
                >
                    <option value="">Todos los usuarios</option>
                    {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.nombre} {u.apellido}
                        </option>
                    ))}
                </select>

                <select
                    value={filtros.accion}
                    onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
                    title="Filtrar por acción"
                >
                    <option value="">Todas las acciones</option>
                    <option value="CREAR">Crear</option>
                    <option value="EDITAR">Editar</option>
                    <option value="ELIMINAR">Eliminar</option>
                    <option value="ASIGNAR">Asignar</option>
                    <option value="REMOVER">Remover</option>
                    <option value="ARCHIVAR">Archivar</option>
                    <option value="DESARCHIVAR">Desarchivar</option>
                    <option value="DESACTIVAR">Desactivar</option>
                    <option value="ACTIVAR">Activar</option>
                </select>

                <select
                    value={filtros.entidad}
                    onChange={(e) => setFiltros({ ...filtros, entidad: e.target.value })}
                    title="Filtrar por módulo"
                >
                    <option value="">Todos los módulos</option>
                    <option value="PROYECTO">Proyecto</option>
                    <option value="TAREA">Tarea</option>
                    <option value="USUARIO">Usuario</option>
                    <option value="MIEMBRO">Miembro</option>
                    <option value="CLIENTE">Cliente</option>
                    <option value="ETIQUETA">Etiqueta</option>
                    <option value="TIEMPO">Tiempo</option>
                </select>

                <button className="limpiar-btn" onClick={limpiar}>
                    Limpiar
                </button>
            </section>

            {/* TABLA */}
            <div className="auditoria-tabla">
                {registros.length === 0 ? (
                    <div className="auditoria-vacio">
                        <p className="auditoria-vacio-titulo">
                            Sin registros
                        </p>
                        <p className="auditoria-vacio-sub">
                            {filtros.fecha_inicio === filtros.fecha_fin
                                ? formatearFecha(filtros.fecha_inicio)
                                : `${formatearFecha(filtros.fecha_inicio)} → ${formatearFecha(filtros.fecha_fin)}`
                            }
                        </p>
                    </div>
                ) : (
                    <Tabla
                        variant="grid"
                        headClassName="auditoria-cabecera"
                        rowClassName="auditoria-row"
                        rowKey={(r) => `${r.origen}-${r.id}`}
                        columns={columnas}
                        data={registros}
                    />
                )}
            </div>
        </div>
    );
};

export default Auditoria;