import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  activarUsuario,
  crearUsuario,
  desactivarUsuario,
  editarUsuario,
  eliminarUsuario,
  getUsuarios,
} from "../../services/usuariosService";

const FORM_VACIO = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  rol: "PRACTICANTE",
  activo: true,
};

export const useGestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [confirm, setConfirm] = useState({ abierto: false });
  const montado = useRef(false);

  const cargar = async (filtros = {}) => {
    setCargando(true);
    try {
      setUsuarios(await getUsuarios(filtros));
    } catch {
      toast.error("Error al cargar usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const f = {};
    if (filtroRol) f.rol = filtroRol;
    if (busqueda.trim()) f.buscar = busqueda.trim();
    if (!montado.current) {
      montado.current = true;
      cargar(f);
      return;
    }
    const timer = setTimeout(() => cargar(f), 350);
    return () => clearTimeout(timer);
  }, [filtroRol, busqueda]);

  const recargar = () => {
    const f = {};
    if (filtroRol) f.rol = filtroRol;
    if (busqueda.trim()) f.buscar = busqueda.trim();
    cargar(f);
  };

  const abrirCrear = () => {
    setUsuarioEditando(null);
    setFormData(FORM_VACIO);
    setModalAbierto(true);
  };
  const abrirEditar = (u) => {
    setUsuarioEditando(u);
    setFormData({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      password: "",
      rol: u.rol,
      activo: u.activo,
    });
    setModalAbierto(true);
  };
  const cerrarModal = () => setModalAbierto(false);

  const guardar = async (e) => {
    e.preventDefault();
    if (
      !usuarioEditando &&
      (!formData.password || formData.password.length < 6)
    ) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    try {
      const payload = { ...formData };
      if (usuarioEditando && !payload.password) delete payload.password;
      if (usuarioEditando) {
        await editarUsuario(usuarioEditando.id, payload);
        toast.success("Usuario actualizado correctamente.");
      } else {
        await crearUsuario(payload);
        toast.success("Usuario creado correctamente.");
      }
      setModalAbierto(false);
      recargar();
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Error al guardar el usuario",
      );
    }
  };

  const pedirConfirm = (config) => setConfirm({ abierto: true, ...config });
  const cerrarConfirm = () =>
    setConfirm((c) => ({ ...c, abierto: false, onConfirmar: null }));
  const ejecutarConfirm = async () => {
    const fn = confirm.onConfirmar;
    cerrarConfirm();
    if (fn) await fn();
  };

  const toggleActivo = (u) => {
    const accion = u.activo ? "desactivar" : "activar";
    pedirConfirm({
      titulo: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      mensaje: `¿Estás seguro de ${accion} a ${u.nombre} ${u.apellido}?`,
      textoConfirmar: accion.charAt(0).toUpperCase() + accion.slice(1),
      tipo: u.activo ? "warning" : "info",
      onConfirmar: async () => {
        try {
          if (u.activo) await desactivarUsuario(u.id);
          else await activarUsuario(u.id);
          toast.success(`Usuario ${accion}do exitosamente.`);
          recargar();
        } catch {
          toast.error("Error al cambiar estado");
        }
      },
    });
  };

  const eliminarDesdeModal = (u) => {
    pedirConfirm({
      titulo: "Eliminar cuenta permanentemente",
      mensaje: `Vas a eliminar a ${u.nombre} ${u.apellido}. Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tipo: "danger",
      onConfirmar: async () => {
        try {
          await eliminarUsuario(u.id);
          setModalAbierto(false);
          recargar();
          toast.success("Usuario eliminado.");
        } catch {
          toast.error("No se pudo eliminar el usuario.");
        }
      },
    });
  };

  const setCampo = (campo) => (e) => {
    const valor =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((f) => ({ ...f, [campo]: valor }));
  };

  return {
    usuarios,
    cargando,
    busqueda,
    setBusqueda,
    filtroRol,
    setFiltroRol,
    modalAbierto,
    usuarioEditando,
    formData,
    setCampo,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    guardar,
    toggleActivo,
    eliminarDesdeModal,
    confirm,
    cerrarConfirm,
    ejecutarConfirm,
    limpiarFiltros: () => {
      setBusqueda("");
      setFiltroRol("");
    },
    filtrosActivos: Boolean(busqueda || filtroRol),
  };
};
