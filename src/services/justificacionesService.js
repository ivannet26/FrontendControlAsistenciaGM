import axios from "axios";

export const EVENTO_JUSTIFICACIONES_ACTUALIZADAS = "justificaciones-actualizadas";

const API_URL = `${(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")}/justificaciones`;

const getConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay una sesión activa.");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const extraerDatos = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.justificaciones)) return data.justificaciones;
    if (Array.isArray(data?.results)) return data.results;
    return data;
};

const errorAmigable = (error, mensajePredeterminado) => {
    const detalle = error?.response?.data?.detail;

    if (typeof detalle === "string" && detalle.trim()) return detalle.trim();
    if (Array.isArray(detalle)) {
        const mensajes = detalle.map((item) => item?.msg || item?.message).filter(Boolean);
        if (mensajes.length) return mensajes.join(". ");
    }
    if (detalle && typeof detalle === "object") {
        if (typeof detalle.msg === "string" && detalle.msg.trim()) return detalle.msg.trim();
        return JSON.stringify(detalle);
    }
    if (typeof error?.mensajeAmigable === "string" && error.mensajeAmigable.trim()) {
        return error.mensajeAmigable.trim();
    }
    if (typeof error?.response?.data?.message === "string" && error.response.data.message.trim()) {
        return error.response.data.message.trim();
    }
    if (typeof error?.message === "string" && error.message.trim()) return error.message.trim();
    return mensajePredeterminado;
};

const lanzarError = (error, mensajePredeterminado) => {
    const mensaje = error?.response?.status === 422
        ? "Has alcanzado el límite de justificaciones para esta fecha"
        : errorAmigable(error, mensajePredeterminado);
    const errorNormalizado = new Error(mensaje);
    errorNormalizado.response = error?.response;
    throw errorNormalizado;
};

const notificarCambio = () => {
    window.dispatchEvent(new Event(EVENTO_JUSTIFICACIONES_ACTUALIZADAS));
};

export async function crearJustificacion(datos) {
    try {
        const evidenciaCandidata = datos?.evidencia;
        const evidencia = typeof File !== "undefined" && evidenciaCandidata instanceof File
            ? evidenciaCandidata
            : evidenciaCandidata?.name && evidenciaCandidata?.size !== undefined
                ? evidenciaCandidata
                : null;
        const tiposCompatibles = {
            FALTA: "Falta",
            TARDANZA: "Tardanza",
            OLVIDO_MARCAR: "Olvidé marcar",
        };
        const tipoSeleccionado = tiposCompatibles[datos?.tipo]
            || datos?.tipo?.trim()
            || "";
        let payload = { ...(datos || {}), tipo: tipoSeleccionado };
        let config = getConfig();

        if (evidencia) {
            const formData = new FormData();
            Object.entries(payload).forEach(([clave, valor]) => {
                if (clave === "evidencia" || valor === null || valor === undefined || valor === "") return;
                if (typeof valor === "boolean") {
                    formData.append(clave, valor ? "true" : "false");
                } else {
                    formData.append(clave, String(valor));
                }
            });
            formData.append("evidencia", evidencia);
            console.log("archivo enviado:", evidencia);
            console.log("tipoSeleccionado:", tipoSeleccionado);
            payload = formData;
        } else {
            const { evidencia: _evidencia, ...datosJson } = payload;
            payload = Object.fromEntries(
                Object.entries(datosJson).filter(([, valor]) =>
                    valor !== null && valor !== undefined && valor !== ""
                )
            );
        }

        if (evidencia) {
            const response = await axios.post(`${API_URL}/`, payload, config);
            notificarCambio();
            return response.data;
        }

        const response = await axios.post(`${API_URL}/`, payload, config);
        notificarCambio();
        return response.data;
    } catch (error) {
        lanzarError(error, "No se pudo enviar la justificación.");
    }
}

export async function obtenerMisJustificaciones(fecha) {
    try {
        const response = await axios.get(`${API_URL}/mias`, {
            ...getConfig(),
            params: fecha ? { fecha } : undefined,
        });
        return extraerDatos(response.data);
    } catch (error) {
        return { error: true, message: errorAmigable(error, "No se pudieron cargar tus justificaciones.") };
    }
}

export async function obtenerPendientes() {
    try {
        const response = await axios.get(`${API_URL}/pendientes`, getConfig());
        return extraerDatos(response.data);
    } catch (error) {
        return { error: true, message: errorAmigable(error, "No se pudieron cargar las justificaciones pendientes.") };
    }
}

export async function obtenerHistorial() {
    try {
        const response = await axios.get(`${API_URL}/historial`, getConfig());
        return extraerDatos(response.data);
    } catch (error) {
        return { error: true, message: errorAmigable(error, "No se pudo cargar el historial.") };
    }
}

export async function resolverJustificacion(id, datos) {
    try {
        const response = await axios.put(
            `${API_URL}/${id}/resolver`,
            datos,
            getConfig()
        );
        notificarCambio();
        return response.data;
    } catch (error) {
        lanzarError(error, "No se pudo resolver la justificación.");
    }
}

    export async function editarJustificacion(id, datos) {
        try {
            const evidenciaCandidata = datos?.evidencia;
            const evidencia = typeof File !== "undefined" && evidenciaCandidata instanceof File
                ? evidenciaCandidata
                : evidenciaCandidata?.name && evidenciaCandidata?.size !== undefined
                    ? evidenciaCandidata
                    : null;
            const tiposCompatibles = {
                FALTA: "Falta",
                TARDANZA: "Tardanza",
                OLVIDO_MARCAR: "Olvidé marcar",
            };
            const tipoSeleccionado = tiposCompatibles[datos?.tipo]
                || datos?.tipo?.trim()
                || "";
            let payload = { ...(datos || {}), tipo: tipoSeleccionado };

            if (evidencia) {
                const formData = new FormData();
                Object.entries(payload).forEach(([clave, valor]) => {
                    if (clave === "evidencia" || valor === null || valor === undefined || valor === "") return;
                    if (typeof valor === "boolean") {
                        formData.append(clave, valor ? "true" : "false");
                    } else {
                        formData.append(clave, String(valor));
                    }
                });
                formData.append("evidencia", evidencia);
                payload = formData;
            } else {
                const { evidencia: _evidencia, ...datosJson } = payload;
                payload = Object.fromEntries(
                    Object.entries(datosJson).filter(([, valor]) =>
                        valor !== null && valor !== undefined && valor !== ""
                    )
                );
            }

            const response = await axios.put(`${API_URL}/${id}`, payload, getConfig());
            notificarCambio();
            return response.data;
        } catch (error) {
            lanzarError(error, "No se pudo editar la justificación.");
        }
    }

export async function contarPendientes() {
    try {
        const response = await axios.get(`${API_URL}/contar-pendientes`, getConfig());
        const datos = response.data;
        if (typeof datos === "number") return datos;
        return Number(datos?.pendientes ?? datos?.count ?? datos?.total ?? 0);
    } catch (error) {
        return { error: true, message: errorAmigable(error, "No se pudo consultar el contador de pendientes.") };
    }
}

export async function obtenerTodas(filtros = {}) {
    try {
        if (String(filtros.estado || "").toUpperCase() === "PENDIENTE") {
            return obtenerPendientes();
        }
        if (filtros.estado && filtros.estado !== "TODAS") {
            const historial = await obtenerHistorial();
            const lista = Array.isArray(historial) ? historial : [];
            return lista.filter((fila) => fila.estado === filtros.estado);
        }
        const [pendientesResponse, historialResponse] = await Promise.all([
            obtenerPendientes(),
            obtenerHistorial(),
        ]);
        const pendientes = Array.isArray(pendientesResponse) ? pendientesResponse : [];
        const historial = Array.isArray(historialResponse) ? historialResponse : [];
        return [...pendientes, ...historial];
    } catch (error) {
        return { error: true, message: errorAmigable(error, "No se pudieron cargar las justificaciones.") };
    }
}

export async function crear(datos) {
    return crearJustificacion(datos);
}

export async function editar(id, datos) {
    return editarJustificacion(id, datos);
}

export async function resolver(id, estado, comentarioAdmin = "") {
    return resolverJustificacion(id, {
        estado,
        comentario_admin: comentarioAdmin,
    });
}

export async function obtenerMias(fecha) {
    return obtenerMisJustificaciones(fecha);
}
