import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});


// =============================
// LISTAR TAREAS DE UN PROYECTO
// =============================

export const obtenerTareasProyecto = async (proyectoId) => {
    const response = await axios.get(
        `${API_URL}/rastreador/tareas?proyecto_id=${proyectoId}`,
        getConfig()
    );
    return response.data;
};


// =============================
// CREAR TAREA
// =============================

export const crearTarea = async (datos) => {
    const response = await axios.post(
        `${API_URL}/rastreador/tareas`,
        datos,
        getConfig()
    );
    return response.data;
};


// =============================
// ACTUALIZAR TAREA
// =============================

export const actualizarTareaAPI = async (id, datos) => {
    const response = await axios.put(
        `${API_URL}/rastreador/tareas/${id}`,
        datos,
        getConfig()
    );
    return response.data;
};


// =============================
// ELIMINAR TAREA
// =============================

export const eliminarTareaAPI = async (id) => {
    await axios.delete(
        `${API_URL}/rastreador/tareas/${id}`,
        getConfig()
    );
};


// =============================
// ASIGNAR MIEMBRO A TAREA
// =============================

export const asignarMiembroTareaAPI = async (tareaId, miembroId) => {
    const response = await axios.post(
        `${API_URL}/rastreador/tareas/${tareaId}/miembros/${miembroId}`,
        {},
        getConfig()
    );
    return response.data;
};


// =============================
// DESASIGNAR MIEMBRO DE TAREA
// =============================

export const desasignarMiembroTareaAPI = async (tareaId, miembroId) => {
    const response = await axios.delete(
        `${API_URL}/rastreador/tareas/${tareaId}/miembros/${miembroId}`,
        getConfig()
    );
    return response.data;
};
// =============================
// RASTREADOR - TIEMPO
// =============================

// Iniciar temporizador
export const iniciarTiempoAPI = async (datos) => {
    // datos = { proyecto_id, tarea_id, descripcion }
    const response = await axios.post(
        `${API_URL}/rastreador/tiempo/iniciar`,
        datos,
        getConfig()
    );
    return response.data;
};

// Detener temporizador
export const detenerTiempoAPI = async () => {
    const response = await axios.post(
        `${API_URL}/rastreador/tiempo/detener`,
        {},
        getConfig()
    );
    return response.data;
};

// Consultar temporizador activo
export const obtenerTiempoActivoAPI = async () => {
    const response = await axios.get(
        `${API_URL}/rastreador/tiempo/activo`,
        getConfig()
    );
    return response.data;
};

// Historial de tiempos
export const obtenerHistorialTiemposAPI = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.proyecto_id) params.append("proyecto_id", filtros.proyecto_id);
    if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);

    const response = await axios.get(
        `${API_URL}/rastreador/tiempo/historial?${params.toString()}`,
        getConfig()
    );
    return response.data;
};

// Eliminar registro de tiempo
export const eliminarTiempoAPI = async (id) => {
    await axios.delete(
        `${API_URL}/rastreador/tiempo/${id}`,
        getConfig()
    );
};