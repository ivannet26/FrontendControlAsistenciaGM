// src/services/informesService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

/**
 * Obtiene los datos del informe (tiempos agrupados) para gráficos y tabla
 */
export const obtenerDatosInforme = async (fechaDesde, fechaHasta) => {
  const { data } = await axios.get(`${API_URL}/informes/tiempo/datos`, {
    ...authHeaders(),
    params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta },
  });
  return data;
};

/**
 * Exporta el informe de tiempo en CSV o Excel
 */
export const exportarInformeTiempo = async (
  formato,
  { fechaDesde, fechaHasta, proyectoId, clienteId, usuarioId } = {}
) => {
  const params = new URLSearchParams({ formato });
  if (fechaDesde) params.append("fecha_desde", fechaDesde);
  if (fechaHasta) params.append("fecha_hasta", fechaHasta);
  if (proyectoId) params.append("proyecto_id", proyectoId);
  if (clienteId) params.append("cliente_id", clienteId);
  if (usuarioId) params.append("usuario_id", usuarioId);

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
/**
 * Exporta el informe en PDF
 */
export const exportarInformePDF = async ({ fechaDesde, fechaHasta } = {}) => {
  const params = new URLSearchParams();
  if (fechaDesde) params.append("fecha_desde", fechaDesde);
  if (fechaHasta) params.append("fecha_hasta", fechaHasta);

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