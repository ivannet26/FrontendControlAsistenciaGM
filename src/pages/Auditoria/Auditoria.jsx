import React, { useEffect, useState } from "react";
import { getAuditoria, getResumenAuditoria } from "../../services/auditoriaService";
import { getUsuarios } from "../../services/usuariosService";
import "./Auditoria.css";

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
                    <option value="">Elemento</option>
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
            <div className="auditoria-tabla-container">
                {cargando ? (
                    <div className="auditoria-vacio">Cargando...</div>
                ) : registros.length === 0 ? (
                    <div className="auditoria-vacio">No hay registros con esos filtros.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Elemento</th>
                                <th>Descripción</th>
                                <th>Proyecto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registros.map((r) => (
                                <tr key={`${r.origen}-${r.id}`}>
                                    <td className="col-fecha">{fmt(r.fecha)}</td>
                                    <td>
                                        <span className="nombre-usuario">
                                            {r.usuario_nombre || "—"}
                                        </span>
                                        {r.usuario_email && (
                                            <span className="email-usuario">{r.usuario_email}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge-accion badge-${r.accion}`}>
                                            {r.accion}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge-entidad">{r.entidad}</span>
                                        {r.entidad_nombre && (
                                            <div className="entidad-nombre">{r.entidad_nombre}</div>
                                        )}
                                    </td>
                                    <td className="col-descripcion">{r.detalle || "—"}</td>
                                    <td className="col-proyecto">{r.proyecto_nombre || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Auditoria;