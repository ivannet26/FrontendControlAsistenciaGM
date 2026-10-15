import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/horario`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const obtenerMiHorario = async () => {
    const response = await axios.get(`${API_URL}/mi-horario`, getAuthHeaders());
    return response.data;
};

export const guardarMiHorario = async (bloques) => {
    const response = await axios.put(
        `${API_URL}/mi-horario`,
        { bloques },
        getAuthHeaders()
    );
    return response.data;
};

export const eliminarMiHorario = async () => {
    const response = await axios.delete(`${API_URL}/mi-horario`, getAuthHeaders());
    return response.data;
};

export const descargarHorarioBlob = async () => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

    const response = await fetch(`${API_BASE_URL}/horario/mi-horario/descargar`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("No se pudo descargar el horario.");
    }

    return response.blob();
};

export async function obtenerHorarioDeUsuario(usuarioId) {
    const response = await axios.get(
        `${API_URL}/usuarios/${usuarioId}/imagen`,
        getAuthHeaders()
    );
    return response.data;
}
