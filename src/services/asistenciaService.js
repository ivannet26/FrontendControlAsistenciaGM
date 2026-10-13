import axios from "axios";

const API_URL = `${(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")}/asistencia`;

const getConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No hay una sesión activa. Inicia sesión para consultar asistencia.");
    }

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const ENDPOINTS_ACCION = {
    ENTRADA: "/entrada",
    BREAK_INICIO: "/break/iniciar",
    BREAK_FIN: "/break/terminar",
    SALIDA: "/salida",
};

export function obtenerFechaLocal() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
}

export async function obtenerRegistrosHoy() {
    const response = await axios.get(`${API_URL}/hoy`, getConfig());
    return response.data;
}

export async function obtenerRegistrosPorFecha(fecha) {
    const response = await axios.get(`${API_URL}/por-fecha`, {
        ...getConfig(),
        params: { fecha },
    });
    return response.data;
}

export async function registrarEvento(tipo) {
    const endpoint = ENDPOINTS_ACCION[tipo];
    if (!endpoint) {
        throw new Error(`Tipo de asistencia no válido: ${tipo}`);
    }

    const response = await axios.post(`${API_URL}${endpoint}`, {}, getConfig());
    return response.data;
}

export async function obtenerResumenAdminHoy() {
    const response = await axios.get(`${API_URL}/admin/hoy`, getConfig());
    return response.data;
}

export async function obtenerResumenAdminPorFecha(fecha) {
    const response = await axios.get(`${API_URL}/admin/por-fecha`, {
        ...getConfig(),
        params: { fecha },
    });
    return response.data;
}
