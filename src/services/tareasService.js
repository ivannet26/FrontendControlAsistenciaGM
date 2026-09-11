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