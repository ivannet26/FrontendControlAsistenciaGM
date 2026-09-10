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

export const obtenerClientes = async () => {
    const response = await axios.get(
        `${API_URL}/clientes?estado=todo`,
        getConfig()
    );
    return response.data;
};


// =============================
// CREAR
// =============================

export const crearCliente = async (datos) => {
    const response = await axios.post(
        `${API_URL}/clientes`,
        datos,
        getConfig()
    );
    return response.data;
};


// =============================
// EDITAR
// =============================

export const editarClienteAPI = async (id, datos) => {
    const response = await axios.put(
        `${API_URL}/clientes/${id}`,
        datos,
        getConfig()
    );
    return response.data;
};


// =============================
// ARCHIVAR
// =============================

export const archivarClienteAPI = async (id) => {
    const response = await axios.patch(
        `${API_URL}/clientes/${id}/archivar`,
        {},
        getConfig()
    );
    return response.data;
};


// =============================
// DESARCHIVAR
// =============================

export const restaurarClienteAPI = async (id) => {
    const response = await axios.patch(
        `${API_URL}/clientes/${id}/desarchivar`,
        {},
        getConfig()
    );
    return response.data;
};


// =============================
// ELIMINAR
// =============================

export const eliminarClienteAPI = async (id) => {
    await axios.delete(
        `${API_URL}/clientes/${id}`,
        getConfig()
    );
};