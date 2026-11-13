// src/services/panelService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// El timeout (60 s) NO se define aquí: viene de axios.defaults.timeout
// configurado en interceptor.js. Así hay un único valor para toda la app.

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
});

// Los errores se dejan propagar: el interceptor los enriquece con
// `mensajeAmigable`, `esRed`, `esTimeout` y `esCancelado`.
// Aquí NO hay reintentos: una petición = una sola llamada HTTP.

export async function obtenerResumenTiempo(
    { fecha_inicio, fecha_fin, usuario_filtro = "yo" },
    signal
) {
    const { data } = await axios.get(`${API_URL}/panel/resumen-tiempo`, {
        params: { fecha_inicio, fecha_fin, usuario_filtro },
        headers: authHeaders(),
        signal
    });

    return data;
}

export async function obtenerActividadEquipo(
    { fecha_inicio, fecha_fin },
    signal
) {
    const { data } = await axios.get(`${API_URL}/panel/equipo-actividad`, {
        params: { fecha_inicio, fecha_fin },
        headers: authHeaders(),
        signal
    });

    return data;
}
