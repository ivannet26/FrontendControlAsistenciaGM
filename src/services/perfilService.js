import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_USUARIOS_URL = `${API_BASE_URL}/usuarios`;
const API_PERFIL_URL = `${API_BASE_URL}/perfil/mi-perfil`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Consulta el perfil combinado del usuario autenticado.
export const obtenerMiPerfil = async () => {
    const response = await axios.get(API_PERFIL_URL, getAuthHeaders());
    return response.data;
};

// Actualiza los datos personales y complementarios del usuario.
export const actualizarMiPerfil = async (datos) => {
    const response = await axios.put(API_PERFIL_URL, datos, getAuthHeaders());
    return response.data;
};

// Mantiene compatibilidad con el modal heredado de perfil.
export const actualizarPerfil = async (datos) => {
    const response = await axios.put(`${API_USUARIOS_URL}/me`, datos, getAuthHeaders());
    return response.data;
};

export const cambiarPassword = async ({ password_actual, password_nueva }) => {
    const response = await axios.put(
        `${API_USUARIOS_URL}/me/password`,
        { password_actual, password_nueva },
        getAuthHeaders()
    );
    return response.data;
};

// Usa el endpoint de avatar existente; la carga puede habilitarse desde el backend.
export const subirAvatar = async (archivo) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const response = await axios.post(
        `${API_USUARIOS_URL}/me/avatar`,
        formData,
        {
            headers: {
                ...getAuthHeaders().headers,
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};
