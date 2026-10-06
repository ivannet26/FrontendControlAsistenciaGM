import React, { useState, useEffect } from "react";
import {
    getUsuarios,
    crearUsuario,
    editarUsuario,
    desactivarUsuario,
    activarUsuario,
    eliminarUsuario,
} from "../../services/usuariosService";
import "./GestionUsuarios.css";
import { Trash2 } from "lucide-react";
import ModalConfirm from "../../components/ModalConfirm/ModalConfirm";
import Toast from "../../components/Toast/Toast";

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [cargando, setCargando] = useState(true);

    // ── Filtros ─────────────────────────────────────────────
    const [filtroRol, setFiltroRol] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: "PRACTICANTE",
        activo: true,
    });

    // ── Modal de confirmación ───────────────────────────────
    const [confirm, setConfirm] = useState({
        abierto: false,
        titulo: "",
        mensaje: "",
        textoConfirmar: "Confirmar",
        tipo: "danger",
        onConfirmar: null,
    });

    const abrirConfirm = (config) => {
        setConfirm({
            abierto: true,
            titulo: config.titulo || "¿Estás seguro?",
            mensaje: config.mensaje || "",
            textoConfirmar: config.textoConfirmar || "Confirmar",
            tipo: config.tipo || "danger",
            onConfirmar: config.onConfirmar,
        });
    };

    const cerrarConfirm = () => {
        setConfirm((c) => ({ ...c, abierto: false, onConfirmar: null }));
    };

    const ejecutarConfirm = async () => {
        const fn = confirm.onConfirmar;
        cerrarConfirm();
        if (fn) await fn();
    };

    // ── Toast ───────────────────────────────────────────────
    const [toast, setToast] = useState({
        abierto: false,
        tipo: "info",
        mensaje: "",
    });

    const mostrarToast = (tipo, mensaje) => {
        setToast({ abierto: true, tipo, mensaje });
    };

    const cerrarToast = () => {
        setToast((t) => ({ ...t, abierto: false }));
    };

    // ── Cargar usuarios ─────────────────────────────────────
    const cargarUsuarios = async (filtros = {}) => {
        setCargando(true);
        try {
            const data = await getUsuarios(filtros);
            setUsuarios(data);
        } catch (error) {
            console.error(error);
            mostrarToast(
                "error",
                "Error al cargar usuarios. Verifica tus permisos."
            );
        } finally {
            setCargando(false);
        }
    };

    // ── Debounce para el buscador ───────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            const filtros = {};
            if (filtroRol) filtros.rol = filtroRol;
            if (busqueda.trim()) filtros.buscar = busqueda.trim();
            cargarUsuarios(filtros);
        }, 350);

        return () => clearTimeout(timer);
    }, [filtroRol, busqueda]);

    // ── Helper: recargar con filtros actuales ───────────────
    const recargarConFiltros = () => {
        const filtros = {};
        if (filtroRol) filtros.rol = filtroRol;
        if (busqueda.trim()) filtros.buscar = busqueda.trim();
        cargarUsuarios(filtros);
    };

    // ── Abrir modal CREAR ───────────────────────────────────
    const abrirCrear = () => {
        setUsuarioEditando(null);
        setFormData({
            nombre: "",
            apellido: "",
            email: "",
            password: "",
            rol: "PRACTICANTE",
            activo: true,
        });
        setModalAbierto(true);
    };

    // ── Abrir modal EDITAR ──────────────────────────────────
    const abrirEditar = (usuario) => {
        setUsuarioEditando(usuario);
        setFormData({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            password: "",
            rol: usuario.rol,
            activo: usuario.activo,
        });
        setModalAbierto(true);
    };

    // ── Guardar (Crear / Editar) ────────────────────────────
    const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validaciones de contraseña ──────────────────────────
    if (!usuarioEditando) {
        // CREAR: la contraseña es obligatoria
        if (!formData.password) {
            mostrarToast("error", "Debes ingresar una contraseña.");
            return;
        }
        if (formData.password.length < 6) {
            mostrarToast("error", "La contraseña debe tener al menos 6 caracteres.");
            return;
        }
    } else {
        // EDITAR: solo valida si el admin escribió algo
        if (formData.password && formData.password.length < 6) {
            mostrarToast("error", "La contraseña debe tener al menos 6 caracteres.");
            return;
        }
    }

    try {
        if (usuarioEditando) {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            await editarUsuario(usuarioEditando.id, payload);
            mostrarToast("success", "Usuario actualizado correctamente.");
        } else {
            await crearUsuario(formData);
            mostrarToast("success", "Usuario creado correctamente.");
        }
        setModalAbierto(false);
        recargarConFiltros();
    } catch (error) {
        const detalle =
            Array.isArray(error.response?.data?.detail)
                ? error.response.data.detail.map(e => `${e.loc?.join(".")}: ${e.msg}`).join(" | ")
                : error.response?.data?.detail;
        mostrarToast("error", detalle || "Error al guardar el usuario");
    }
};

    // ── Activar / Desactivar ────────────────────────────────
    const toggleActivo = (usuario) => {
        const accion = usuario.activo ? "desactivar" : "activar";
        abrirConfirm({
            titulo: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
            mensaje: (
                <>
                    ¿Estás seguro de <strong>{accion}</strong> a{" "}
                    <strong>{usuario.nombre} {usuario.apellido}</strong>?
                    {usuario.activo && (
                        <> No podrá iniciar sesión hasta que lo reactives.</>
                    )}
                </>
            ),
            textoConfirmar: accion.charAt(0).toUpperCase() + accion.slice(1),
            tipo: usuario.activo ? "warning" : "info",
            onConfirmar: async () => {
                try {
                    if (usuario.activo) {
                        await desactivarUsuario(usuario.id);
                        mostrarToast("success", "Usuario desactivado.");
                    } else {
                        await activarUsuario(usuario.id);
                        mostrarToast("success", "Usuario activado.");
                    }
                    recargarConFiltros();
                } catch (error) {
                    mostrarToast(
                        "error",
                        error.response?.data?.detail || "Error al cambiar estado"
                    );
                }
            },
        });
    };

    // ── Eliminar usuario desde el modal ─────────────────────
    const handleEliminarDesdeModal = (usuario) => {
        abrirConfirm({
            titulo: "Eliminar cuenta permanentemente",
            mensaje: (
                <>
                    Vas a eliminar a <strong>{usuario.nombre} {usuario.apellido}</strong>
                    <br />
                    <span style={{ color: "#8ea0af", fontSize: "13px" }}>
                        Correo: {usuario.email}
                    </span>
                    <br /><br />
                    Esta acción <strong>NO se puede deshacer</strong>. Si el usuario
                    tiene tareas o registros asociados, el sistema rechazará la
                    operación y deberás desactivarlo en su lugar.
                </>
            ),
            textoConfirmar: "Eliminar",
            tipo: "danger",
            onConfirmar: async () => {
                try {
                    await eliminarUsuario(usuario.id);
                    setModalAbierto(false);
                    setUsuarioEditando(null);
                    mostrarToast("success", "Usuario eliminado correctamente.");
                    recargarConFiltros();
                } catch (error) {
                    mostrarToast(
                        "error",
                        error.response?.data?.detail ||
                            "Error al eliminar el usuario"
                    );
                }
            },
        });
    };

    // ── Render ──────────────────────────────────────────────
    return (
        <div className="usuarios-container">

            {/* HEADER */}
            <div className="usuarios-header">
                <h1>Gestión de Usuarios</h1>
                <button onClick={abrirCrear}>CREAR NUEVO USUARIO</button>
            </div>

            {/* FILTROS */}
            <div className="filtros-usuarios">
                <span className="filtro-titulo">FILTRAR</span>

                <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="PRACTICANTE">Practicante</option>
                </select>

                <div className="buscador">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="#8ea0af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLA */}
            <div className="tabla-usuarios-container">
                {cargando ? (
                    <div className="usuarios-vacio">Cargando usuarios...</div>
                ) : usuarios.length === 0 ? (
                    <div className="usuarios-vacio">
                        No se encontraron usuarios con esos filtros.
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <span className="nombre-usuario">
                                            <strong>{u.nombre}</strong> {u.apellido}
                                        </span>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`rol-badge rol-${u.rol}`}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`estado-badge ${u.activo ? "estado-activo" : "estado-inactivo"}`}>
                                            <span className="estado-punto"></span>
                                            {u.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones-usuario">
                                            <button
                                                className="btn-editar"
                                                onClick={() => abrirEditar(u)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={u.activo ? "btn-desactivar" : "btn-activar"}
                                                onClick={() => toggleActivo(u)}
                                            >
                                                {u.activo ? "Desactivar" : "Activar"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL CREAR / EDITAR */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-usuario">
                        <div className="modal-header">
                            <h2>{usuarioEditando ? "Editar Usuario" : "Crear Nuevo Usuario"}</h2>
                            <button onClick={() => setModalAbierto(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Juan"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nombre: e.target.value })
                                    }
                                />

                                <label>Apellido</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Pérez"
                                    required
                                    value={formData.apellido}
                                    onChange={(e) =>
                                        setFormData({ ...formData, apellido: e.target.value })
                                    }
                                />

                                <label>Correo electrónico</label>
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />

                                <label>
                                    {usuarioEditando
                                        ? "Nueva contraseña"
                                        : "Contraseña"}
                                </label>
                                <input
                                    type="password"
                                    placeholder={
                                        usuarioEditando
                                            ? "Dejar en blanco para no cambiar"
                                            : "Contraseña inicial"
                                    }
                                    required={!usuarioEditando}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />

                                <label>Rol</label>
                                <select
                                    value={formData.rol}
                                    onChange={(e) =>
                                        setFormData({ ...formData, rol: e.target.value })
                                    }
                                >
                                    <option value="PRACTICANTE">Practicante</option>
                                    <option value="ADMINISTRADOR">Administrador</option>
                                </select>

                                {usuarioEditando && (
                                    <label className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    activo: e.target.checked,
                                                })
                                            }
                                        />
                                        Usuario activo
                                    </label>
                                )}
                            </div>

                            <div className="modal-footer">
                                {usuarioEditando && (
                                    <button
                                        type="button"
                                        className="btn-eliminar-modal"
                                        onClick={() => handleEliminarDesdeModal(usuarioEditando)}
                                    >
                                        <Trash2 size={14} />
                                        Eliminar cuenta
                                    </button>
                                )}

                                <div className="modal-footer-right">
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={() => setModalAbierto(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-guardar">
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN (reemplaza window.confirm) */}
            <ModalConfirm
                abierto={confirm.abierto}
                titulo={confirm.titulo}
                mensaje={confirm.mensaje}
                textoConfirmar={confirm.textoConfirmar}
                tipo={confirm.tipo}
                onConfirmar={ejecutarConfirm}
                onCancelar={cerrarConfirm}
            />

            {/* TOAST (reemplaza window.alert) */}
            <Toast
                abierto={toast.abierto}
                tipo={toast.tipo}
                mensaje={toast.mensaje}
                onCerrar={cerrarToast}
            />
        </div>
    );
};

export default GestionUsuarios;