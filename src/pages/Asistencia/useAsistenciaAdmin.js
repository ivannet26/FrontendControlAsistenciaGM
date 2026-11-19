import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { obtenerFechaLocal, obtenerResumenAdminHoy, obtenerResumenAdminPorFecha } from "../../services/asistenciaService";
import { obtenerHorarioDeUsuario } from "../../services/horarioService";
import { construirUrlAvatar } from "../../hooks/useUsuarioActual";
import { EVENTO_JUSTIFICACIONES_ACTUALIZADAS } from "../../services/justificacionesService";

const formatearHora = (iso) => iso ? new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }) : "—";
const formatearFechaCorta = (f) => { const [a, m, d] = f.split("-"); return `${d}/${m}/${a}`; };
const normalizarFecha = (fecha) => {
  const valor = String(fecha || "").trim();
  if (!valor) return "";
  if (valor.includes("/")) { const [d, m, a] = valor.split(/[/-]/); return `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`; }
  const iso = valor.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const p = new Date(valor);
  if (Number.isNaN(p.getTime())) return "";
  return `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, "0")}-${String(p.getDate()).padStart(2, "0")}`;
};
const formatearFechaTabla = (v) => { const f = normalizarFecha(v); return f ? formatearFechaCorta(f) : "—"; };
const formatearDuracion = (seg) => {
  if (seg == null) return "—";
  const s = Math.max(0, Math.floor(seg));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return [h, m, r].map((n) => String(n).padStart(2, "0")).join(":");
};
const formatearTiempoAcumulado = (horas) => {
  if (horas == null || horas === "") return "—";
  const totalHoras = Number(horas);
  if (!Number.isFinite(totalHoras) || totalHoras < 0) return "—";
  let min = Math.round(totalHoras * 60);
  const meses = Math.floor(min / 9600); min %= 9600;
  const semanas = Math.floor(min / 2400); min %= 2400;
  const h = Math.floor(min / 60), m = min % 60;
  const partes = [];
  if (meses) partes.push(`${meses} ${meses === 1 ? "Mes" : "Meses"}`);
  if (semanas) partes.push(`${semanas} Sem`);
  if (h) partes.push(`${h}h`);
  if (m) partes.push(`${m}m`);
  if (!partes.length) partes.push("0h");
  return partes.length > 1 && !meses && !semanas ? partes.join(" ") : partes.join(", ");
};
const textoEstado = (e) => ({ SIN_ENTRADA: "Sin entrada", TRABAJANDO: "Trabajando", EN_BREAK: "En descanso", FINALIZADO: "Finalizado" }[e] || "Sin entrada");
const claseEstado = (e) => ({ SIN_ENTRADA: "sin-entrada", TRABAJANDO: "trabajando", EN_BREAK: "en-break", FINALIZADO: "finalizado" }[e] || "sin-entrada");
const normalizarRol = (rol) => {
  const r = (rol || "").toUpperCase();
  if (r.includes("ADMIN")) return "Administrador";
  if (r.includes("PRACTICANTE")) return "Practicante";
  return rol || "—";
};
const obtenerMensajeError = (error, pred) => {
  const detalle = error?.response?.data?.detail;
  if (typeof detalle === "string" && detalle.trim()) return detalle;
  return error?.message || pred;
};

const POR_PAGINA = 10;

const normalizarFilas = (data) =>
  (Array.isArray(data) ? data : []).map((r) => ({
    id: r.usuario_id,
    nombre: (r.usuario_nombre || "").split(" ")[0] || "",
    apellido: (r.usuario_nombre || "").split(" ").slice(1).join(" ") || "",
    email: r.usuario_email || "",
    rol: normalizarRol(r.rol),
    horasAcumuladas:
      r.horas_acumuladas ??
      (r.horas_acumuladas_segundos != null
        ? Number(r.horas_acumuladas_segundos) / 3600
        : null),
    avatar_url: r.avatar_url || null,
    avatarVersion: Date.now(),
    estado: r.estado || "SIN_ENTRADA",
    tieneEntrada: Boolean(r.tiene_entrada),
    entrada: r.entrada,
    breakInicio: r.break_inicio,
    breakFin: r.break_fin,
    duracion: formatearDuracion(r.duracion_break_segundos),
    salida: r.salida,
    inicioRastreo: r.fecha_inicio_rastreo ?? r.inicio_rastreo ?? null,
    inicioPracticas:
      r.fecha_inicio_practicas ??
      r.usuario?.fecha_inicio_practicas ??
      r.inicio_practicas ??
      null,
    justificacion_aceptada: r.justificacion_aceptada || null,
    comentario_admin: r.comentario_admin || "",
    justificacion_asunto: r.justificacion_asunto || "",
    justificacion_mensaje: r.justificacion_mensaje || "",
    justificacion_evidencia_url: r.justificacion_evidencia_url || "",
  }));

const obtenerResumen = async (fecha) => {
  const data =
    fecha === obtenerFechaLocal()
      ? await obtenerResumenAdminHoy()
      : await obtenerResumenAdminPorFecha(fecha);
  return normalizarFilas(data);
};

export const useAsistenciaAdmin = () => {
  const queryClient = useQueryClient();
  const [fecha, setFecha] = useState(() => obtenerFechaLocal());
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modalHorario, setModalHorario] = useState({
    abierto: false,
    nombre: "",
    imagenUrl: null,
    cargando: false,
  });
  const [justificacionVer, setJustificacionVer] = useState(null);
  const hoy = obtenerFechaLocal();

  const resumenQuery = useQuery({
    queryKey: ["asistencia", "admin", fecha],
    queryFn: () => obtenerResumen(fecha),
    refetchInterval: fecha === hoy ? 15000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: fecha === hoy,
  });

  useEffect(() => {
    if (resumenQuery.failureCount !== 1 || !resumenQuery.error) return;
    toast.error(
      obtenerMensajeError(
        resumenQuery.error,
        "No se pudo cargar el resumen de asistencia.",
      ),
    );
  }, [resumenQuery.error, resumenQuery.failureCount]);

  useEffect(() => {
    const refrescar = () => {
      void queryClient.invalidateQueries({
        queryKey: ["asistencia", "admin"],
      });
    };
    window.addEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, refrescar);
    return () =>
      window.removeEventListener(
        EVENTO_JUSTIFICACIONES_ACTUALIZADAS,
        refrescar,
      );
  }, [queryClient]);

  const filasFiltradas = useMemo(
    () =>
      (resumenQuery.data ?? []).filter((f) => {
        if (filtroRol && f.rol !== filtroRol) return false;
        if (filtroEstado && f.estado !== filtroEstado) return false;
        if (busqueda.trim()) {
          const q = busqueda.trim().toLowerCase();
          if (
            !`${f.nombre} ${f.apellido}`.toLowerCase().includes(q) &&
            !f.email.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [resumenQuery.data, filtroRol, filtroEstado, busqueda],
  );

  const verHorario = async (id, nombre) => {
    setModalHorario({ abierto: true, nombre, imagenUrl: null, cargando: true });
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["horario", id],
        queryFn: () => obtenerHorarioDeUsuario(id),
        staleTime: 0,
      });
      setModalHorario({
        abierto: true,
        nombre,
        imagenUrl: data.imagen_url,
        cargando: false,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Ese usuario aún no tiene horario creado.",
      );
      setModalHorario({
        abierto: false,
        nombre: "",
        imagenUrl: null,
        cargando: false,
      });
    }
  };

  const buscarJustificacion = (f) => {
    if (!f.justificacion_aceptada) return null;
    const a =
      typeof f.justificacion_aceptada === "object"
        ? {
            ...f.justificacion_aceptada,
            estado: f.justificacion_aceptada.estado || "ACEPTADA",
            comentario_admin:
              f.comentario_admin ?? f.justificacion_aceptada.comentario_admin ?? "",
          }
        : {
            estado: "ACEPTADA",
            comentario_admin: f.comentario_admin || "",
            asunto: "Justificación aceptada",
            mensaje: "",
          };
    return String(a.estado || "").toUpperCase() === "ACEPTADA" ? a : null;
  };

  const limpiar = () => {
    setFiltroRol("");
    setFiltroEstado("");
    setBusqueda("");
    setFecha(hoy);
    setPagina(1);
  };

  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const filasPagina = filasFiltradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const actualizarFecha = (valor) => {
    setFecha(valor);
    setPagina(1);
  };
  const actualizarFiltroRol = (valor) => {
    setFiltroRol(valor);
    setPagina(1);
  };
  const actualizarFiltroEstado = (valor) => {
    setFiltroEstado(valor);
    setPagina(1);
  };
  const actualizarBusqueda = (valor) => {
    setBusqueda(valor);
    setPagina(1);
  };

  return {
    fecha,
    setFecha: actualizarFecha,
    filasPagina,
    paginaActual,
    totalPaginas,
    setPagina,
    cargandoInicial: resumenQuery.isPending,
    filtroRol,
    setFiltroRol: actualizarFiltroRol,
    filtroEstado,
    setFiltroEstado: actualizarFiltroEstado,
    busqueda,
    setBusqueda: actualizarBusqueda,
    modalHorario,
    cerrarHorario: () =>
      setModalHorario({
        abierto: false,
        nombre: "",
        imagenUrl: null,
        cargando: false,
      }),
    justificacionVer,
    setJustificacionVer,
    verHorario,
    buscarJustificacion,
    limpiar,
    formatearHora,
    formatearFechaTabla,
    formatearTiempoAcumulado,
    textoEstado,
    claseEstado,
    construirUrlAvatar,
  };
};
