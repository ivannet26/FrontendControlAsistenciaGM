import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/usuarios`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// Actualiza los datos del usuario con la sesión iniciada
export const actualizarPerfil = async (datos) => {
    const response = await axios.put(`${API_URL}/me`, datos, getAuthHeaders());
    return response.data;
};

// Cambia la contraseña del usuario con la sesión iniciada
export const cambiarPassword = async ({ password_actual, password_nueva }) => {
    const response = await axios.put(
        `${API_URL}/me/password`,
        { password_actual, password_nueva },
        getAuthHeaders()
    );
    return response.data;
};

// Sube/actualiza la foto de perfil (requiere endpoint en el backend)
export const subirAvatar = async (archivo) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const response = await axios.post(
        `${API_URL}/me/avatar`,
        formData,
        {
            headers: {
                ...getAuthHeaders().headers,
                "Content-Type": "multipart/form-data"
            }
        }
    );
    return response.data;
};