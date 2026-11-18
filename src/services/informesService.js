import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const construirParams = (fechaDesde, fechaHasta, filtros = {}) => {
  const params = {};
  if (fechaDesde) params.fecha_desde = fechaDesde;
  if (fechaHasta) params.fecha_hasta = fechaHasta;
  if (filtros.equipo) params.usuario_id = filtros.equipo;
  if (filtros.cliente) params.cliente_id = filtros.cliente;
  if (filtros.proyecto) params.proyecto_id = filtros.proyecto;
  if (filtros.tarea) params.tarea_id = filtros.tarea;
  if (filtros.etiqueta) params.etiqueta_id = filtros.etiqueta;
  return params;
};

const extraerLista = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const primeraLista = Object.values(data).find(Array.isArray);
    if (primeraLista) return primeraLista;
  }
  return [];
};

const obtenerId = (o) => {
  if (o.id !== undefined && o.id !== null) return o.id;
  const clave = Object.keys(o).find((k) => /^id[_A-Z]?/i.test(k) && o[k] !== null);
  return clave ? o[clave] : undefined;
};

const obtenerNombre = (o) => {
  const nombres = o.nombres || o.nombre_usuario || o.first_name;
  const apellidos = o.apellidos || o.apellido || o.last_name;
  if (nombres && apellidos) return `${nombres} ${apellidos}`.trim();

  const clave = Object.keys(o).find(
    (k) => /nombre|name|titulo|descripcion/i.test(k) && typeof o[k] === "string" && o[k].trim()
  );
  if (clave) return o[clave];

  return o.email || o.correo || "";
};

const normalizarLista = (data) =>
  extraerLista(data)
    .map((o) => ({ id: obtenerId(o), nombre: obtenerNombre(o) }))
    .filter((o) => o.id !== undefined && o.id !== null && o.nombre);

const pedirLista = async (ruta, params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}${ruta}`, {
      ...authHeaders(),
      params,
    });
    return normalizarLista(data);
  } catch (err) {
    console.error(`Error al cargar ${ruta}:`, err);
    return [];
  }
};

export const obtenerOpcionesFiltros = async () => {
  const [equipo, clientes, proyectos, etiquetas] = await Promise.all([
    pedirLista("/usuarios"),
    pedirLista("/clientes", { estado: "todo" }),
    pedirLista("/proyectos", { estado: "todo" }),
    pedirLista("/etiquetas", { estado: "todo" }),
  ]);
  return { equipo, clientes, proyectos, tareas: [], etiquetas };
};

export const obtenerTareasPorProyecto = async (proyectoId) => {
  if (!proyectoId) return [];
  return pedirLista("/rastreador/tareas", { proyecto_id: proyectoId });
};

export const obtenerDatosInforme = async (fechaDesde, fechaHasta, filtros = {}) => {
  const { data } = await axios.get(`${API_URL}/informes/tiempo/datos`, {
    ...authHeaders(),
    params: construirParams(fechaDesde, fechaHasta, filtros),
  });
  return data;
};

export const exportarInformeTiempo = async (
  formato,
  { fechaDesde, fechaHasta, filtros = {}, proyectoId, clienteId, usuarioId } = {}
) => {
  const params = new URLSearchParams({ formato });
  const base = construirParams(fechaDesde, fechaHasta, filtros);
  Object.entries(base).forEach(([k, v]) => params.append(k, v));
  if (proyectoId && !base.proyecto_id) params.append("proyecto_id", proyectoId);
  if (clienteId && !base.cliente_id) params.append("cliente_id", clienteId);
  if (usuarioId && !base.usuario_id) params.append("usuario_id", usuarioId);

  const respuesta = await axios.get(
    `${API_URL}/informes/tiempo/exportar?${params.toString()}`,
    { ...authHeaders(), responseType: "blob" }
  );

  const blob = new Blob([respuesta.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const extension = formato === "excel" ? "xlsx" : "csv";
  const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  link.download = `informe_tiempo_${hoy}.${extension}`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportarInformePDF = async ({ fechaDesde, fechaHasta, filtros = {} } = {}) => {
  const params = new URLSearchParams();
  const base = construirParams(fechaDesde, fechaHasta, filtros);
  Object.entries(base).forEach(([k, v]) => params.append(k, v));

  const respuesta = await axios.get(
    `${API_URL}/informes/tiempo/exportar/pdf?${params.toString()}`,
    { ...authHeaders(), responseType: "blob" }
  );

  const blob = new Blob([respuesta.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  link.download = `informe_tiempo_${hoy}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};