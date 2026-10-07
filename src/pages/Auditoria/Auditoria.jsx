import React, { useEffect, useState } from "react";
import { getAuditoria, getResumenAuditoria } from "../../services/auditoriaService";
import { getUsuarios } from "../../services/usuariosService";
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
    EDITAR: "Editar",
    ELIMINAR: "Eliminó",
    ASIGNAR: "Asignó",
    REMOVER: "Removió",
    ARCHIVAR: "Archivó",
    DESARCHIVAR: "Desarchivó",
    DESACTIVAR: "Desactivó",
    ACTIVAR: "Activó",
    EDITAR_TIEMPO: "Editar tiempo",
    CREAR_TIEMPO_ADMIN: "Creó tiempo",
};

// Helper para obtener el label amigable
const labelEntidad = (codigo) =>
    ENTIDADES_LABEL[codigo] || codigo || "—";

const labelAccion = (codigo) =>
    ACCIONES_LABEL[codigo] || codigo || "—";
const hoy = () => new Date().toISOString().split("T")[0];

const Auditoria = () => {
    const [registros, setRegistros] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);

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
            setCargando(true);
            try {
                const data = await getAuditoria(filtros);
                setRegistros(data);
            } catch (e) {
                console.error(e);
            } finally {
                setCargando(false);
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

    return (
        <div className="auditoria-container">
            <div className="auditoria-header">
                <h1>Registro de Auditoría</h1>
            </div>

            {/* RESUMEN — COMPACTO */}
            {resumen && (
                <div className="auditoria-resumen">
                    <div className="resumen-card">
                        <span className="resumen-label">Registros</span>
                        <span className="resumen-valor">{resumen.total}</span>
                    </div>
                    <div className="resumen-card">
                        <span className="resumen-label">Usuarios activos</span>
                        <span className="resumen-valor">{resumen.usuarios_activos}</span>
                    </div>
                    <div className="resumen-card">
                        <span className="resumen-label">Creaciones</span>
                        <span className="resumen-valor">{resumen.por_accion?.CREAR || 0}</span>
                    </div>
                    <div className="resumen-card">
                        <span className="resumen-label">Ediciones</span>
                        <span className="resumen-valor">{resumen.por_accion?.EDITAR || 0}</span>
                    </div>
                    <div className="resumen-card">
                        <span className="resumen-label">Eliminaciones</span>
                        <span className="resumen-valor">{resumen.por_accion?.ELIMINAR || 0}</span>
                    </div>
                </div>
            )}

            {/* FILTROS COMPACTOS (sin buscador) */}
            <div className="auditoria-filtros">
                <span className="filtro-titulo">FILTRAR</span>

                <select
                    value={filtros.usuario_id}
                    onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
                    title="Filtrar por usuario"
                >
                    <option value="">Usuario</option>
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
                    <option value="">Acción</option>
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
                    title="Filtrar por elemento"
                >
                    <option value="">Modulo</option>
                    <option value="PROYECTO">Proyecto</option>
                    <option value="TAREA">Tarea</option>
                    <option value="USUARIO">Usuario</option>
                    <option value="MIEMBRO">Miembro</option>
                    <option value="CLIENTE">Cliente</option>
                    <option value="ETIQUETA">Etiqueta</option>
                    <option value="TIEMPO">Tiempo</option>
                </select>

                <div className="filtro-fechas">
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

                <button className="limpiar-btn" onClick={limpiar}>
                    Limpiar
                </button>
            </div>

            {/* TABLA */}
            {/* TABLA */}
            <div className="auditoria-tabla">
                {registros.length === 0 ? (
                    <div className="auditoria-vacio">No hay registros con esos filtros.</div>
                ) : (
                    <>
                        {/* Cabecera solo visible en desktop/tablet */}
                        <div className="auditoria-cabecera">
                            <div>Fecha</div>
                            <div>Usuario</div>
                            <div>Acción</div>
                            <div>Módulo</div>
                            <div>Descripción</div>
                            <div>Proyecto</div>
                        </div>

                        {registros.map((r) => (
                            <div className="auditoria-row" key={`${r.origen}-${r.id}`}>

                                <div className="col-fecha">
                                    {fmt(r.fecha)}
                                </div>

                                <div className="col-usuario">
                                    <span className="nombre-usuario">
                                        {r.usuario_nombre || "—"}
                                    </span>
                                    {r.usuario_email && (
                                        <span className="email-usuario">{r.usuario_email}</span>
                                    )}
                                </div>

                                <div className="col-accion">
                                    <span className={`texto-accion accion-${r.accion}`}>
                                        {labelAccion(r.accion)}
                                    </span>
                                </div>

                                <div className="col-modulo">
                                    <span className="texto-entidad">
                                        {labelEntidad(r.entidad)}
                                    </span>
                                    {r.entidad_nombre && (
                                        <span className="entidad-nombre">
                                            {r.entidad_nombre}
                                        </span>
                                    )}
                                </div>

                                <div className="col-descripcion">
                                    {r.detalle || "—"}
                                </div>

                                <div className="col-proyecto">
                                    {r.proyecto_nombre || "—"}
                                </div>

                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Auditoria;