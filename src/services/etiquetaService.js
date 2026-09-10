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

export const obtenerEtiquetas = async () => {
    const response = await axios.get(
        `${API_URL}/etiquetas?estado=todo`,
        getConfig()
    );
    return response.data;
};


// =============================
// CREAR
// =============================

export const crearEtiqueta = async (datos) => {
    const response = await axios.post(
        `${API_URL}/etiquetas`,
        datos,
        getConfig()
    );
    return response.data;
};


// =============================
// EDITAR
// =============================

export const editarEtiquetaAPI = async (id, datos) => {
    const response = await axios.put(
        `${API_URL}/etiquetas/${id}`,
        datos,
        getConfig()
    );
    return response.data;
};


// =============================
// ARCHIVAR
// =============================

export const archivarEtiquetaAPI = async (id) => {
    const response = await axios.patch(
        `${API_URL}/etiquetas/${id}/archivar`,
        {},
        getConfig()
    );
    return response.data;
};


// =============================
// DESARCHIVAR
// =============================

export const restaurarEtiquetaAPI = async (id) => {
    const response = await axios.patch(
        `${API_URL}/etiquetas/${id}/desarchivar`,
        {},
        getConfig()
    );
    return response.data;
};


// =============================
// ELIMINAR
// =============================

export const eliminarEtiquetaAPI = async (id) => {
    await axios.delete(
        `${API_URL}/etiquetas/${id}`,
        getConfig()
    );
};