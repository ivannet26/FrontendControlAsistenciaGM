import { useState, useEffect } from "react";
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
import { MagnifyingGlass } from "@phosphor-icons/react";
import ModalConfirm from "../../components/ModalConfirm/ModalConfirm";
import Toast from "../../components/Toast/Toast";
import Tabla from "../../components/Tabla/Tabla";

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Filtros
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

  const [confirm, setConfirm] = useState({ abierto: false });
  const [toast, setToast] = useState({
    abierto: false,
    tipo: "info",
    mensaje: "",
  });

  const mostrarToast = (tipo, mensaje) =>
    setToast({ abierto: true, tipo, mensaje });
  const cerrarToast = () => setToast((t) => ({ ...t, abierto: false }));

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

  const cerrarConfirm = () =>
    setConfirm((c) => ({ ...c, abierto: false, onConfirmar: null }));

  const ejecutarConfirm = async () => {
    const fn = confirm.onConfirmar;
    cerrarConfirm();
    if (fn) await fn();
  };

  const cargarUsuarios = async (filtros = {}) => {
    setCargando(true);
    try {
      const data = await getUsuarios(filtros);
      setUsuarios(data);
    } catch {
      mostrarToast("error", "Error al cargar usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtros = {};
      if (filtroRol) filtros.rol = filtroRol;
      if (busqueda.trim()) filtros.buscar = busqueda.trim();
      cargarUsuarios(filtros);
    }, 350);
    return () => clearTimeout(timer);
  }, [filtroRol, busqueda]);

  const recargarConFiltros = () => {
    const filtros = {};
    if (filtroRol) filtros.rol = filtroRol;
    if (busqueda.trim()) filtros.buscar = busqueda.trim();
    cargarUsuarios(filtros);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !usuarioEditando &&
      (!formData.password || formData.password.length < 6)
    ) {
      mostrarToast("error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const payload = { ...formData };
      if (usuarioEditando && !payload.password) delete payload.password;

      if (usuarioEditando) {
        await editarUsuario(usuarioEditando.id, payload);
        mostrarToast("success", "Usuario actualizado correctamente.");
      } else {
        await crearUsuario(payload);
        mostrarToast("success", "Usuario creado correctamente.");
      }
      setModalAbierto(false);
      recargarConFiltros();
    } catch (error) {
      mostrarToast(
        "error",
        error.response?.data?.detail || "Error al guardar el usuario",
      );
    }
  };

  const toggleActivo = (usuario) => {
    const accion = usuario.activo ? "desactivar" : "activar";
    abrirConfirm({
      titulo: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      mensaje: `¿Estás seguro de ${accion} a ${usuario.nombre} ${usuario.apellido}?`,
      textoConfirmar: accion.charAt(0).toUpperCase() + accion.slice(1),
      tipo: usuario.activo ? "warning" : "info",
      onConfirmar: async () => {
        try {
          if (usuario.activo) await desactivarUsuario(usuario.id);
          else await activarUsuario(usuario.id);
          mostrarToast("success", `Usuario ${accion}do exitosamente.`);
          recargarConFiltros();
        } catch {
          mostrarToast("error", "Error al cambiar estado");
        }
      },
    });
  };

  const handleEliminarDesdeModal = (usuario) => {
    abrirConfirm({
      titulo: "Eliminar cuenta permanentemente",
      mensaje: `Vas a eliminar a ${usuario.nombre} ${usuario.apellido}. Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tipo: "danger",
      onConfirmar: async () => {
        try {
          await eliminarUsuario(usuario.id);
          setModalAbierto(false);
          recargarConFiltros();
          mostrarToast("success", "Usuario eliminado.");
        } catch {
          mostrarToast("error", "No se pudo eliminar el usuario.");
        }
      },
    });
  };

  // Subcomponentes visuales
  const BadgeRol = ({ rol }) => <span className="rol-badge">{rol}</span>;

  const BadgeEstado = ({ activo }) => (
    <span
      className={`estado-badge ${activo ? "estado-activo" : "estado-inactivo"}`}
    >
      <span className="estado-punto" />
      {activo ? "Activo" : "Inactivo"}
    </span>
  );

  const AccionesBotones = ({ u }) => (
    <div className="acciones-usuario">
      <button className="btn-editar" onClick={() => abrirEditar(u)}>
        Editar
      </button>
      <button
        className={u.activo ? "btn-desactivar" : "btn-activar"}
        onClick={() => toggleActivo(u)}
      >
        {u.activo ? "Desactivar" : "Activar"}
      </button>
    </div>
  );

  return (
    <div className="usuarios-container">
      <header className="usuarios-header">
        <div>
          <h1>Gestión de usuarios</h1>
          <p className="usuarios-sub">
            Administración de cuentas, roles y accesos
          </p>
        </div>
        <button
          type="button"
          onClick={abrirCrear}
          className="btn-crear-usuario"
        >
          + Crear usuario
        </button>
      </header>

      {/* Filtros */}
      <section className="filtros-usuarios">
        <div className="buscador">
          <MagnifyingGlass size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="PRACTICANTE">Practicante</option>
        </select>

        <button
          type="button"
          className="btn-limpiar"
          onClick={() => {
            setBusqueda("");
            setFiltroRol("");
          }}
          disabled={!busqueda && !filtroRol}
        >
          Limpiar
        </button>
      </section>

      {/* VISTA DESKTOP / TABLET: TABLA */}
      <div className="tabla-usuarios-container desktop-only">
        <Tabla
          rowKey="id"
          data={usuarios}
          loading={cargando}
          loadingText="Cargando usuarios..."
          emptyText="No hay usuarios para estos filtros."
          columns={[
            {
              key: "nombre",
              header: "Nombre",
              render: (u) => (
                <span className="nombre-usuario">
                  <strong>{u.nombre}</strong> {u.apellido}
                </span>
              ),
            },
            {
              key: "email",
              header: "Email",
            },
            {
              key: "rol",
              header: "Rol",
              render: (u) => <BadgeRol rol={u.rol} />,
            },
            {
              key: "estado",
              header: "Estado",
              render: (u) => <BadgeEstado activo={u.activo} />,
            },
            {
              key: "acciones",
              header: "Acciones",
              render: (u) => <AccionesBotones u={u} />,
            },
          ]}
        />
      </div>

      {/* VISTA MÓVIL: CARDS */}
      <div className="usuarios-cards-container mobile-only">
        {cargando && (
          <p
            style={{
              color: "var(--text-muted)",
              textAlign: "center",
              padding: "16px",
            }}
          >
            Cargando usuarios...
          </p>
        )}
        {!cargando && usuarios.length === 0 && (
          <p
            style={{
              color: "var(--text-muted)",
              textAlign: "center",
              padding: "16px",
            }}
          >
            No hay usuarios para estos filtros.
          </p>
        )}
        {!cargando &&
          usuarios.map((u) => (
            <article key={u.id} className="usuario-card">
              <div className="usuario-card-header">
                <div>
                  <div className="nombre">
                    {u.nombre} {u.apellido}
                  </div>
                  <div className="email">{u.email}</div>
                </div>
                <BadgeEstado activo={u.activo} />
              </div>
              <div className="usuario-card-meta">
                <span>Rol de acceso</span>
                <BadgeRol rol={u.rol} />
              </div>
              <AccionesBotones u={u} />
            </article>
          ))}
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-usuario">
            <div className="modal-header">
              <h2>{usuarioEditando ? "Editar Usuario" : "Nuevo Usuario"}</h2>
              <button
                className="btn-cerrar-modal"
                onClick={() => setModalAbierto(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <label>
                  Nombre
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </label>

                <label>
                  Apellido
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                  />
                </label>

                <label>
                  Correo electrónico
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </label>

                <label>
                  {usuarioEditando
                    ? "Nueva contraseña (opcional)"
                    : "Contraseña"}
                  <input
                    type="password"
                    required={!usuarioEditando}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </label>

                <label>
                  Rol
                  <select
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({ ...formData, rol: e.target.value })
                    }
                  >
                    <option value="PRACTICANTE">Practicante</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </label>

                {usuarioEditando && (
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) =>
                        setFormData({ ...formData, activo: e.target.checked })
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
                    <Trash2 size={15} /> Eliminar
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

      <ModalConfirm
        abierto={confirm.abierto}
        titulo={confirm.titulo}
        mensaje={confirm.mensaje}
        textoConfirmar={confirm.textoConfirmar}
        tipo={confirm.tipo}
        onConfirmar={ejecutarConfirm}
        onCancelar={cerrarConfirm}
      />

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
