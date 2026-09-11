import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});


// =============================
// LISTAR
// =============================

export const obtenerProyectos = async (filtros = {}) => {
    const params = new URLSearchParams();

    params.append("estado", filtros.estado || "todo");
    if (filtros.nombre) params.append("nombre", filtros.nombre);
    if (filtros.cliente_id) params.append("cliente_id", filtros.cliente_id);

    const response = await axios.get(
        `${API_URL}/proyectos?${params.toString()}`,
        getConfig()
    );
    return response.data;
};


// =============================
// CREAR
// =============================

export const crearProyectoAPI = async (datos) => {
    const response = await axios.post(
        `${API_URL}/proyectos`,
        datos,
        getConfig()
    );
    return response.data;
};


// =============================
// EDITAR
// =============================

export const editarProyectoAPI = async (id, datos) => {
    const response = await axios.put(
        `${API_URL}/proyectos/${id}`,
        datos,
        getConfig()
    );
    return response.data;
};


// =============================
// ARCHIVAR
// =============================

export const archivarProyectoAPI = async (id) => {
    const response = await axios.patch(
        `${API_URL}/proyectos/${id}/archivar`,
        {},
        getConfig()
    );
    return response.data;
};


// =============================
// DESARCHIVAR
// =============================

export const restaurarProyectoAPI = async (id) => {
    const response = await axios.patch(
        `${API_URL}/proyectos/${id}/desarchivar`,
        {},
        getConfig()
    );
    return response.data;
};


// =============================
// ELIMINAR
// =============================

export const eliminarProyectoAPI = async (id) => {
    await axios.delete(
        `${API_URL}/proyectos/${id}`,
        getConfig()
    );
};