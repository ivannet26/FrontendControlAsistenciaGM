import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { resolver as resolverJustificacion } from "../../services/justificacionesService";
import { useJustificaciones } from "../../hooks/useJustificaciones";

const POR_PAGINA = 10;

export const OPCIONES_ESTADO = [
  { valor: "TODAS", texto: "Todos los estados" },
  { valor: "PENDIENTE", texto: "Pendiente" },
  { valor: "ACEPTADA", texto: "Aceptada" },
  { valor: "RECHAZADA", texto: "Rechazada" },
];

export const TEXTO_ESTADO = {
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
};

const TEXTO_TIPO = {
  TARDANZA: "Tardanza",
  FALTA: "Falta",
  OLVIDO_MARCAR: "Olvidé marcar",
  OTRO: "Otro",
};

export const formatearFecha = (fechaIso) => {
  if (!fechaIso) return "—";
  const [año, mes, dia] = String(fechaIso).slice(0, 10).split("-");
  return año && mes && dia ? `${dia}/${mes}/${año}` : String(fechaIso);
};

export const obtenerNombreUsuario = (j) =>
  String(j?.usuario_nombre || "").trim() || "Usuario desconocido";
export const obtenerCorreoUsuario = (j) =>
  String(j?.usuario_email || j?.correo || "").trim();
const obtenerClaveUsuario = (j) =>
  String(j?.usuario_id ?? (obtenerCorreoUsuario(j) || obtenerNombreUsuario(j)));
const claveIntentos = (j) =>
  [
    String(j?.usuario_id ?? ""),
    String(j?.tipo || "").toUpperCase(),
    String(j?.fecha || "").slice(0, 10),
  ].join("|");

export const textoTipo = (j) => {
  const nombre =
    TEXTO_TIPO[j.tipo] || String(j.tipo || "").trim() || "Justificación";
  const minutos = j.minutos_tarde;
  if (["TARDANZA", "Tardanza"].includes(j.tipo) && minutos != null)
    return `${nombre} · ${minutos} min`;
  return nombre;
};

const obtenerMensajeError = (error, predeterminado) => {
  const detalle = error?.response?.data?.detail;
  if (typeof detalle === "string" && detalle.trim()) return detalle;
  return error?.message || predeterminado;
};

export const useJustificacionesPage = () => {
  const queryClient = useQueryClient();
  const [usuarioFiltro, setUsuarioFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("PENDIENTE");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [confirmacion, setConfirmacion] = useState(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [tabActiva, setTabActiva] = useState("PENDIENTES");
  const vistaHistorial = tabActiva === "HISTORIAL";

  const { justificaciones, cargando, error } = useJustificaciones({
    fuente: "todas",
  });
  const resolverMutation = useMutation({
    mutationFn: ({ id, estado, comentario }) =>
      resolverJustificacion(id, estado, comentario),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["justificaciones"] }),
  });
  const resolviendo = resolverMutation.isPending;
  const listaCompleta = useMemo(
    () => (Array.isArray(justificaciones) ? justificaciones : []),
    [justificaciones],
  );

  useEffect(() => {
    if (!imagenAmpliada) return;
    const cerrar = (e) => {
      if (e.key === "Escape") setImagenAmpliada(null);
    };
    document.addEventListener("keydown", cerrar);
    return () => document.removeEventListener("keydown", cerrar);
  }, [imagenAmpliada]);

  const usuarios = useMemo(() => {
    const mapa = new Map();
    listaCompleta.forEach((j) => {
      const id = obtenerClaveUsuario(j);
      if (!mapa.has(id)) mapa.set(id, { id, nombre: obtenerNombreUsuario(j) });
    });
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [listaCompleta]);

  const conteoIntentosPendientes = useMemo(() => {
    const conteos = new Map();
    listaCompleta
      .filter((j) => (j.estado || "PENDIENTE") === "PENDIENTE")
      .forEach((j) => {
        const clave = claveIntentos(j);
        conteos.set(clave, (conteos.get(clave) || 0) + 1);
      });
    return conteos;
  }, [listaCompleta]);

  const listaFiltrada = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase("es-PE");
    return listaCompleta
      .filter((j) => {
        const estado = j.estado || "PENDIENTE";
        if (!vistaHistorial && estado !== "PENDIENTE") return false;
        if (vistaHistorial && !["ACEPTADA", "RECHAZADA"].includes(estado))
          return false;
        if (estadoFiltro !== "TODAS" && estado !== estadoFiltro) return false;
        if (usuarioFiltro && obtenerClaveUsuario(j) !== usuarioFiltro)
          return false;
        if (fechaFiltro && String(j.fecha || "").slice(0, 10) !== fechaFiltro)
          return false;
        if (consulta) {
          const contenido = [
            obtenerNombreUsuario(j),
            obtenerCorreoUsuario(j),
            j.tipo,
            j.asunto,
            j.mensaje,
            j.comentario_admin,
            estado,
          ]
            .join(" ")
            .toLocaleLowerCase("es-PE");
          if (!contenido.includes(consulta)) return false;
        }
        return true;
      })
      .sort((a, b) =>
        String(b.fecha || "").localeCompare(String(a.fecha || "")),
      );
  }, [
    busqueda,
    estadoFiltro,
    fechaFiltro,
    listaCompleta,
    usuarioFiltro,
    vistaHistorial,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(listaFiltrada.length / POR_PAGINA),
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const listaPagina = listaFiltrada.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );
  const filtrosActivos = Boolean(
    usuarioFiltro ||
    fechaFiltro ||
    busqueda ||
    estadoFiltro !== (vistaHistorial ? "TODAS" : "PENDIENTE"),
  );

  const cambiarFiltro = (actualizar) => (e) => {
    actualizar(e.target.value);
    setPagina(1);
  };
  const limpiarFiltros = () => {
    setUsuarioFiltro("");
    setEstadoFiltro(vistaHistorial ? "TODAS" : "PENDIENTE");
    setFechaFiltro("");
    setBusqueda("");
    setPagina(1);
  };
  const cambiarPestana = (p) => {
    setTabActiva(p);
    setEstadoFiltro(p === "HISTORIAL" ? "TODAS" : "PENDIENTE");
    setPagina(1);
  };
  const abrirConfirmacion = (j, estado) =>
    setConfirmacion({ id: j.id, estado, usuario: obtenerNombreUsuario(j) });
  const cerrarConfirmacion = () => {
    if (!resolviendo) setConfirmacion(null);
  };

  const confirmarResolucion = async (comentarioAdmin) => {
    if (!confirmacion || resolviendo) return;
    try {
      await resolverMutation.mutateAsync({
        id: confirmacion.id,
        estado: confirmacion.estado,
        comentario: comentarioAdmin,
      });
      toast.success(
        confirmacion.estado === "ACEPTADA"
          ? "Justificación aceptada."
          : "Justificación rechazada.",
      );
      setConfirmacion(null);
    } catch (e) {
      toast.error(
        obtenerMensajeError(e, "No se pudo actualizar la justificación."),
      );
    }
  };

  const intentosDe = (j) => conteoIntentosPendientes.get(claveIntentos(j)) || 1;

  return {
    vistaHistorial,
    cargando,
    error,
    usuarios,
    listaFiltrada,
    listaPagina,
    paginaActual,
    totalPaginas,
    filtrosActivos,
    usuarioFiltro,
    estadoFiltro,
    fechaFiltro,
    busqueda,
    confirmacion,
    imagenAmpliada,
    setImagenAmpliada,
    setPagina,
    setBusqueda,
    setFechaFiltro,
    setUsuarioFiltro,
    setEstadoFiltro,
    cambiarFiltro,
    limpiarFiltros,
    cambiarPestana,
    abrirConfirmacion,
    confirmarResolucion,
    cerrarConfirmacion,
    intentosDe,
  };
};
