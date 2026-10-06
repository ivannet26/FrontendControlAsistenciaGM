// src/services/usuariosService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/usuarios`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getUsuarios = async (filtros = {}) => {
    const response = await axios.get(API_URL, { ...getAuthHeaders(), params: filtros });
    return response.data;
};

export const crearUsuario = async (datos) => {
    const response = await axios.post(API_URL, datos, getAuthHeaders());
    return response.data;
};

export const editarUsuario = async (id, datos) => {
    const response = await axios.put(`${API_URL}/${id}`, datos, getAuthHeaders());
    return response.data;
};

export const desactivarUsuario = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/desactivar`, {}, getAuthHeaders());
    return response.data;
};

export const activarUsuario = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/activar`, {}, getAuthHeaders());
    return response.data;
};

export const eliminarUsuario = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
};