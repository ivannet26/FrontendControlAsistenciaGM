import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

const POR_PAGINA = 10;

export const useGestionUsuarios = () => {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [confirm, setConfirm] = useState({ abierto: false });

  useEffect(() => {
    const timer = window.setTimeout(
      () => setBusquedaDebounced(busqueda),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [busqueda]);

  const filtros = useMemo(() => {
    const f = {};
    if (filtroRol) f.rol = filtroRol;
    if (busquedaDebounced.trim()) f.buscar = busquedaDebounced.trim();
    return f;
  }, [filtroRol, busquedaDebounced]);

  const usuariosQuery = useQuery({
    queryKey: ["usuarios", filtros],
    queryFn: () => getUsuarios(filtros),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (usuariosQuery.error) toast.error("Error al cargar usuarios.");
  }, [usuariosQuery.error]);

  const invalidarUsuarios = () =>
    queryClient.invalidateQueries({ queryKey: ["usuarios"] });

  const guardarMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? editarUsuario(id, payload) : crearUsuario(payload),
    onSuccess: (_, { id }) => {
      toast.success(
        id
          ? "Usuario actualizado correctamente."
          : "Usuario creado correctamente.",
      );
      setModalAbierto(false);
      void invalidarUsuarios();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.detail || "Error al guardar el usuario",
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, activo }) =>
      activo ? desactivarUsuario(id) : activarUsuario(id),
    onSuccess: (_, { activo }) => {
      toast.success(
        `Usuario ${activo ? "desactivado" : "activado"} exitosamente.`,
      );
      void invalidarUsuarios();
    },
    onError: () => toast.error("Error al cambiar estado"),
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      setModalAbierto(false);
      toast.success("Usuario eliminado.");
      void invalidarUsuarios();
    },
    onError: () => toast.error("No se pudo eliminar el usuario."),
  });

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

  const guardar = (e) => {
    e.preventDefault();
    if (
      !usuarioEditando &&
      (!formData.password || formData.password.length < 6)
    ) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const payload = { ...formData };
    if (usuarioEditando && !payload.password) delete payload.password;
    guardarMutation.mutate({
      id: usuarioEditando?.id ?? null,
      payload,
    });
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
      onConfirmar: () => toggleMutation.mutate({ id: u.id, activo: u.activo }),
    });
  };

  const eliminarDesdeModal = (u) => {
    pedirConfirm({
      titulo: "Eliminar cuenta permanentemente",
      mensaje: `Vas a eliminar a ${u.nombre} ${u.apellido}. Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tipo: "danger",
      onConfirmar: () => eliminarMutation.mutate(u.id),
    });
  };

  const setCampo = (campo) => (e) => {
    const valor =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((f) => ({ ...f, [campo]: valor }));
  };

  const usuarios = usuariosQuery.data ?? [];
  const totalPaginas = Math.max(1, Math.ceil(usuarios.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const usuariosPagina = usuarios.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const actualizarBusqueda = (valor) => {
    setBusqueda(valor);
    setPagina(1);
  };
  const actualizarFiltroRol = (valor) => {
    setFiltroRol(valor);
    setPagina(1);
  };

  return {
    usuarios: usuariosPagina,
    paginaActual,
    totalPaginas,
    setPagina,
    cargando: usuariosQuery.isPending,
    busqueda,
    setBusqueda: actualizarBusqueda,
    filtroRol,
    setFiltroRol: actualizarFiltroRol,
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
      setPagina(1);
    },
    filtrosActivos: Boolean(busqueda || filtroRol),
  };
};
