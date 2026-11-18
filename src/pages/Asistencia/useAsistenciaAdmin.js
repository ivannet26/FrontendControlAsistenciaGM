import { useEffect, useMemo, useRef, useState } from "react";
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

export const useAsistenciaAdmin = () => {
  const [fecha, setFecha] = useState(() => obtenerFechaLocal());
  const [filas, setFilas] = useState([]);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modalHorario, setModalHorario] = useState({ abierto: false, nombre: "", imagenUrl: null, cargando: false });
  const [justificacionVer, setJustificacionVer] = useState(null);
  const consultarAhoraRef = useRef(null);
  const hoy = obtenerFechaLocal();

  useEffect(() => {
    let cancelado = false;
    let enCurso = false;
    const esHoy = fecha === hoy;

    const consultar = async (tipo = "polling") => {
      if (cancelado || enCurso) return;
      if (tipo === "polling" && document.visibilityState !== "visible") return;
      enCurso = true;
      if (tipo === "inicial") setCargandoInicial(true);
      try {
        const data = fecha === obtenerFechaLocal() ? await obtenerResumenAdminHoy() : await obtenerResumenAdminPorFecha(fecha);
        if (cancelado) return;
        const normalizadas = (Array.isArray(data) ? data : []).map((r) => ({
          id: r.usuario_id,
          nombre: (r.usuario_nombre || "").split(" ")[0] || "",
          apellido: (r.usuario_nombre || "").split(" ").slice(1).join(" ") || "",
          email: r.usuario_email || "",
          rol: normalizarRol(r.rol),
          horasAcumuladas: r.horas_acumuladas ?? (r.horas_acumuladas_segundos != null ? Number(r.horas_acumuladas_segundos) / 3600 : null),
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
          inicioPracticas: r.fecha_inicio_practicas ?? r.usuario?.fecha_inicio_practicas ?? r.inicio_practicas ?? null,
          justificacion_aceptada: r.justificacion_aceptada || null,
          comentario_admin: r.comentario_admin || "",
          justificacion_asunto: r.justificacion_asunto || "",
          justificacion_mensaje: r.justificacion_mensaje || "",
          justificacion_evidencia_url: r.justificacion_evidencia_url || "",
        }));
        setFilas((actuales) => JSON.stringify(normalizadas) === JSON.stringify(actuales) ? actuales : normalizadas);
      } catch (error) {
        if (!cancelado && tipo !== "polling") toast.error(obtenerMensajeError(error, "No se pudo cargar el resumen de asistencia."));
      } finally {
        enCurso = false;
        if (!cancelado && tipo === "inicial") setCargandoInicial(false);
      }
    };

    consultarAhoraRef.current = () => consultar("manual");
    consultar("inicial");
    if (!esHoy) return () => { cancelado = true; consultarAhoraRef.current = null; };

    const intervalo = window.setInterval(() => consultar("polling"), 15000);
    const vis = () => { if (document.visibilityState === "visible") consultar("polling"); };
    document.addEventListener("visibilitychange", vis);
    return () => { cancelado = true; window.clearInterval(intervalo); document.removeEventListener("visibilitychange", vis); consultarAhoraRef.current = null; };
  }, [fecha, hoy]);

  useEffect(() => {
    const refrescar = () => consultarAhoraRef.current?.();
    window.addEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, refrescar);
    return () => window.removeEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, refrescar);
  }, []);

  const filasFiltradas = useMemo(() => filas.filter((f) => {
    if (filtroRol && f.rol !== filtroRol) return false;
    if (filtroEstado && f.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      if (!`${f.nombre} ${f.apellido}`.toLowerCase().includes(q) && !f.email.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filas, filtroRol, filtroEstado, busqueda]);

  const verHorario = async (id, nombre) => {
    setModalHorario({ abierto: true, nombre, imagenUrl: null, cargando: true });
    try {
      const data = await obtenerHorarioDeUsuario(id);
      setModalHorario({ abierto: true, nombre, imagenUrl: data.imagen_url, cargando: false });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Ese usuario aún no tiene horario creado.");
      setModalHorario({ abierto: false, nombre: "", imagenUrl: null, cargando: false });
    }
  };

  const buscarJustificacion = (f) => {
    if (!f.justificacion_aceptada) return null;
    const a = typeof f.justificacion_aceptada === "object"
      ? { ...f.justificacion_aceptada, estado: f.justificacion_aceptada.estado || "ACEPTADA", comentario_admin: f.comentario_admin ?? f.justificacion_aceptada.comentario_admin ?? "" }
      : { estado: "ACEPTADA", comentario_admin: f.comentario_admin || "", asunto: "Justificación aceptada", mensaje: "" };
    return String(a.estado || "").toUpperCase() === "ACEPTADA" ? a : null;
  };

  const limpiar = () => { setFiltroRol(""); setFiltroEstado(""); setBusqueda(""); setFecha(hoy); };

  return {
    fecha, setFecha, filasFiltradas, cargandoInicial, filtroRol, setFiltroRol, filtroEstado, setFiltroEstado, busqueda, setBusqueda,
    modalHorario, cerrarHorario: () => setModalHorario({ abierto: false, nombre: "", imagenUrl: null, cargando: false }),
    justificacionVer, setJustificacionVer, verHorario, buscarJustificacion, limpiar,
    formatearHora, formatearFechaTabla, formatearTiempoAcumulado, textoEstado, claseEstado, construirUrlAvatar,
  };
};
