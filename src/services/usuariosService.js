// src/services/usuariosService.js
import axios from 'axios';

// Ajusta esta URL si usas variables de entorno (.env)
const API_URL = 'http://localhost:8000/usuarios';

// Función auxiliar para obtener el token (ajústalo a cómo guardas el token en tu Login)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // o sessionStorage, o tu Context
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getUsuarios = async (filtros = {}) => {
  // filtros puede ser { activo: true, rol: 'PRACTICANTE', buscar: 'juan' }
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