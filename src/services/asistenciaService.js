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

let resumenHorasCache = null;
let resumenHorasExpira = 0;
let resumenHorasEnCurso = null;

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

export async function obtenerResumenHoras() {
    const ahora = Date.now();
    if (resumenHorasCache && ahora < resumenHorasExpira) {
        return resumenHorasCache;
    }
    if (resumenHorasEnCurso) {
        return resumenHorasEnCurso;
    }

    resumenHorasEnCurso = axios.get(`${API_URL}/resumen-horas`, getConfig())
        .then((response) => {
            resumenHorasCache = response.data;
            resumenHorasExpira = Date.now() + 30000;
            return response.data;
        })
        .finally(() => {
            resumenHorasEnCurso = null;
        });

    return resumenHorasEnCurso;
}

export function invalidarResumenHoras() {
    resumenHorasCache = null;
    resumenHorasExpira = 0;
    resumenHorasEnCurso = null;
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
    invalidarResumenHoras();
    return response.data;
}

const ESTADOS_CON_TARDANZA = ["TARDANZA", "TARDANZA_GRAVE"];

const primerNumero = (...valores) => {
    for (const valor of valores) {
        if (valor === null || valor === undefined || valor === "") continue;
        const numero = Number(valor);
        if (!Number.isNaN(numero)) return numero;
    }
    return null;
};

// Interpreta la respuesta al fichar. El cálculo de la tolerancia lo hace el
// backend: aquí solo se leen el estado del día y los minutos de tardanza.
export function interpretarMarcaje(respuesta) {
    if (!respuesta || typeof respuesta !== "object") return null;

    const estado = String(
        respuesta.estado || respuesta.estado_asistencia || respuesta.estado_dia || ""
    ).toUpperCase();
    const registros = Array.isArray(respuesta.registros) ? respuesta.registros : [];
    const entrada = registros.find((registro) => registro.tipo === "ENTRADA");

    return {
        estado: estado || null,
        esTardanza: ESTADOS_CON_TARDANZA.includes(estado),
        minutosTarde: primerNumero(
            respuesta.minutos_tarde,
            respuesta.minutosTardanza,
            respuesta.minutos
        ),
        horario:
            respuesta.horario_entrada
            || respuesta.hora_entrada_programada
            || respuesta.horario
            || null,
        horaMarcada:
            respuesta.hora_marcada
            || respuesta.hora_entrada
            || respuesta.hora
            || entrada?.hora
            || null,
    };
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
