import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});


// ═══════════════════════════════════════════════════════════════════════════
// GRUPOS
// ═══════════════════════════════════════════════════════════════════════════

export const obtenerGrupos = async () => {
    const response = await axios.get(`${API_URL}/equipo/grupos`, getConfig());
    return response.data;
};

export const obtenerGrupo = async (id) => {
    const response = await axios.get(`${API_URL}/equipo/grupos/${id}`, getConfig());
    return response.data;
};

export const crearGrupoAPI = async (datos) => {
    const response = await axios.post(`${API_URL}/equipo/grupos`, datos, getConfig());
    return response.data;
};

export const editarGrupoAPI = async (id, datos) => {
    const response = await axios.put(`${API_URL}/equipo/grupos/${id}`, datos, getConfig());
    return response.data;
};

export const eliminarGrupoAPI = async (id) => {
    await axios.delete(`${API_URL}/equipo/grupos/${id}`, getConfig());
};


// ═══════════════════════════════════════════════════════════════════════════
// MIEMBROS
// ═══════════════════════════════════════════════════════════════════════════

export const obtenerMiembros = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append("estado", filtros.estado);
    if (filtros.tipo_usuario) params.append("tipo_usuario", filtros.tipo_usuario);
    if (filtros.grupo_id) params.append("grupo_id", filtros.grupo_id);

    const query = params.toString();
    const url = query
        ? `${API_URL}/equipo/miembros?${query}`
        : `${API_URL}/equipo/miembros`;

    const response = await axios.get(url, getConfig());
    return response.data;
};

export const obtenerMiembro = async (id) => {
    const response = await axios.get(`${API_URL}/equipo/miembros/${id}`, getConfig());
    return response.data;
};

export const crearMiembroAPI = async (datos) => {
    const response = await axios.post(`${API_URL}/equipo/miembros`, datos, getConfig());
    return response.data;
};

export const editarMiembroAPI = async (id, datos) => {
    const response = await axios.put(`${API_URL}/equipo/miembros/${id}`, datos, getConfig());
    return response.data;
};

export const eliminarMiembroAPI = async (id) => {
    await axios.delete(`${API_URL}/equipo/miembros/${id}`, getConfig());
};

export const verClaveMiembroAPI = async (id) => {
    const response = await axios.get(`${API_URL}/equipo/miembros/${id}/clave`, getConfig());
    return response.data;
};


// ═══════════════════════════════════════════════════════════════════════════
// ETIQUETAS DE MIEMBROS
// ═══════════════════════════════════════════════════════════════════════════

export const asignarEtiquetaMiembroAPI = async (miembroId, etiquetaId) => {
    const response = await axios.post(
        `${API_URL}/equipo/miembros/${miembroId}/etiquetas/${etiquetaId}`,
        {},
        getConfig()
    );
    return response.data;
};

export const desasignarEtiquetaMiembroAPI = async (miembroId, etiquetaId) => {
    const response = await axios.delete(
        `${API_URL}/equipo/miembros/${miembroId}/etiquetas/${etiquetaId}`,
        getConfig()
    );
    return response.data;
};