// src/services/justificacionesService.js
import axios from "axios";

// Mientras el backend de justificaciones no exista, el módulo funciona con
// datos de prueba en memoria. Cambia este flag a false cuando la API esté
// lista: los componentes no necesitan ningún cambio.
export const USAR_MOCK = true;

// Permite que el contador de la campana se actualice al instante.
export const EVENTO_JUSTIFICACIONES_ACTUALIZADAS = "justificaciones-actualizadas";

const notificarCambio = () => {
    window.dispatchEvent(new Event(EVENTO_JUSTIFICACIONES_ACTUALIZADAS));
};

const API_URL = `${(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")}/justificaciones`;

const getConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No hay una sesión activa. Inicia sesión para gestionar justificaciones.");
    }

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/* ============================================================
   DATOS DE PRUEBA (solo con USAR_MOCK = true)
   ============================================================ */

const LATENCIA_MOCK = 320;

const esperar = (ms = LATENCIA_MOCK) => new Promise((resolver) => {
    window.setTimeout(resolver, ms);
});

const fechaLocal = (fecha = new Date()) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
};

const fechaRelativa = (dias) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fechaLocal(fecha);
};

const creadoEnRelativo = (dias, horas = 9) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    fecha.setHours(horas, 15, 0, 0);
    return fecha.toISOString();
};

// Imagen de muestra en línea para poder probar la miniatura sin red.
const EVIDENCIA_MOCK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
  <rect width="480" height="320" fill="#162630"/>
  <rect x="24" y="24" width="432" height="272" fill="none" stroke="#344650" stroke-width="2"/>
  <text x="240" y="142" fill="#d3dde3" font-family="Arial, sans-serif" font-size="22" text-anchor="middle">Comprobante de atención</text>
  <text x="240" y="180" fill="#8ea0af" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">Imagen de prueba</text>
</svg>`)}`;

const leerUsuarioSesion = () => {
    try {
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        return usuario && typeof usuario === "object" ? usuario : {};
    } catch {
        return {};
    }
};

const nombreSesion = () => {
    const usuario = leerUsuarioSesion();
    const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ").trim();
    return nombre || "Usuario actual";
};

let siguienteId = 11;

const JUSTIFICACIONES_MOCK = [
    {
        id: 1,
        usuario_id: 21,
        usuario: "María Fernanda Quispe",
        correo: "mquispe@gmingenieros.pe",
        tipo: "TARDANZA",
        fecha: fechaRelativa(0),
        minutos_tarde: 45,
        asunto: "Cita médica",
        mensaje: "Asistí a una cita médica programada antes de ingresar y adjunto el comprobante de atención.",
        evidencia_url: EVIDENCIA_MOCK,
        estado: "PENDIENTE",
        revisado_por: null,
        fecha_revision: null,
        creado_en: creadoEnRelativo(0, 9),
    },
    {
        id: 2,
        usuario_id: 34,
        usuario: "Jorge Luis Ramírez",
        correo: "jramirez@gmingenieros.pe",
        tipo: "FALTA",
        fecha: fechaRelativa(1),
        minutos_tarde: null,
        asunto: "Trámite personal",
        mensaje: "Necesito ausentarme mañana para un trámite en el banco. Aviso con un día de anticipación.",
        evidencia_url: null,
        estado: "PENDIENTE",
        revisado_por: null,
        fecha_revision: null,
        creado_en: creadoEnRelativo(0, 8),
    },
    {
        id: 3,
        usuario_id: 12,
        usuario: "Usuario actual",
        correo: "usuario@gmingenieros.pe",
        tipo: "TARDANZA",
        fecha: fechaRelativa(0),
        minutos_tarde: 78,
        asunto: "Tráfico en la avenida",
        mensaje: "El tráfico estuvo detenido por un accidente y no pude llegar a la hora de entrada.",
        evidencia_url: null,
        estado: "PENDIENTE",
        revisado_por: null,
        fecha_revision: null,
        creado_en: creadoEnRelativo(0, 9),
        es_mia: true,
    },
    {
        id: 4,
        usuario_id: 21,
        usuario: "María Fernanda Quispe",
        correo: "mquispe@gmingenieros.pe",
        tipo: "OLVIDO_MARCAR",
        fecha: fechaRelativa(-1),
        minutos_tarde: null,
        asunto: "Olvidé marcar mi salida",
        mensaje: "Terminé la jornada a las 18:30, pero olvidé registrar la salida en el sistema.",
        evidencia_url: EVIDENCIA_MOCK,
        estado: "ACEPTADA",
        revisado_por: "Administración",
        fecha_revision: creadoEnRelativo(0, 10),
        creado_en: creadoEnRelativo(-1, 18),
    },
    {
        id: 5,
        usuario_id: 34,
        usuario: "Jorge Luis Ramírez",
        correo: "jramirez@gmingenieros.pe",
        tipo: "FALTA",
        fecha: fechaRelativa(-2),
        minutos_tarde: null,
        asunto: "Permiso por salud",
        mensaje: "No pude asistir por un malestar general. No alcancé a avisar con un día de anticipación.",
        evidencia_url: null,
        estado: "RECHAZADA",
        revisado_por: "Administración",
        fecha_revision: creadoEnRelativo(-1, 9),
        creado_en: creadoEnRelativo(-2, 8),
    },
    {
        id: 6,
        usuario_id: 12,
        usuario: "Usuario actual",
        correo: "usuario@gmingenieros.pe",
        tipo: "OLVIDO_MARCAR",
        fecha: fechaRelativa(-3),
        minutos_tarde: null,
        asunto: "Olvidé marcar la entrada",
        mensaje: "Ingresé a las 9:00, pero el navegador se cerró antes de registrar la entrada.",
        evidencia_url: null,
        estado: "ACEPTADA",
        revisado_por: "Administración",
        fecha_revision: creadoEnRelativo(-2, 9),
        creado_en: creadoEnRelativo(-3, 9),
        es_mia: true,
    },
    {
        id: 7,
        usuario_id: 21,
        usuario: "María Fernanda Quispe",
        correo: "mquispe@gmingenieros.pe",
        tipo: "TARDANZA",
        fecha: fechaRelativa(-4),
        minutos_tarde: 35,
        asunto: "Movilidad restringida",
        mensaje: "El transporte público no llegó a la hora habitual y tuve que esperar otra unidad.",
        evidencia_url: null,
        estado: "RECHAZADA",
        revisado_por: "Administración",
        fecha_revision: creadoEnRelativo(-3, 10),
        creado_en: creadoEnRelativo(-4, 9),
    },
    {
        id: 8,
        usuario_id: 34,
        usuario: "Jorge Luis Ramírez",
        correo: "jramirez@gmingenieros.pe",
        tipo: "TARDANZA",
        fecha: fechaRelativa(-5),
        minutos_tarde: 120,
        asunto: "Reunión externa",
        mensaje: "Me presenté en la oficina del cliente antes de venir y la reunión se extendió.",
        evidencia_url: null,
        estado: "ACEPTADA",
        revisado_por: "Administración",
        fecha_revision: creadoEnRelativo(-4, 11),
        creado_en: creadoEnRelativo(-5, 9),
    },
    {
        id: 9,
        usuario_id: 21,
        usuario: "María Fernanda Quispe",
        correo: "mquispe@gmingenieros.pe",
        tipo: "FALTA",
        fecha: fechaRelativa(-6),
        minutos_tarde: null,
        asunto: "Descanso médico",
        mensaje: "Conté con descanso médico por dos días y adjunto el certificado correspondiente.",
        evidencia_url: EVIDENCIA_MOCK,
        estado: "ACEPTADA",
        revisado_por: "Administración",
        fecha_revision: creadoEnRelativo(-5, 9),
        creado_en: creadoEnRelativo(-6, 8),
    },
    {
        id: 10,
        usuario_id: 34,
        usuario: "Jorge Luis Ramírez",
        correo: "jramirez@gmingenieros.pe",
        tipo: "OLVIDO_MARCAR",
        fecha: fechaRelativa(-6),
        minutos_tarde: null,
        asunto: "Olvidé marcar la salida",
        mensaje: "Salí a las 18:00 para una diligencia y no registré la salida del día.",
        evidencia_url: null,
        estado: "PENDIENTE",
        revisado_por: null,
        fecha_revision: null,
        creado_en: creadoEnRelativo(-6, 18),
    },
];

// Completa el nombre real del usuario que tiene la sesión abierta.
const materializarMock = (fila) => {
    if (!fila.es_mia) return { ...fila };

    const usuario = leerUsuarioSesion();
    return {
        ...fila,
        usuario: nombreSesion(),
        correo: usuario.email || fila.correo,
        usuario_id: usuario.id ?? fila.usuario_id,
    };
};

const ordenarMock = (a, b) => (
    a.fecha === b.fecha
        ? String(b.creado_en || "").localeCompare(String(a.creado_en || ""))
        : String(b.fecha).localeCompare(String(a.fecha))
);

const filtrarMock = (filtros = {}) => {
    const estado = String(filtros.estado || "").toUpperCase();
    const usuarioId = filtros.usuario_id === "" || filtros.usuario_id === undefined || filtros.usuario_id === null
        ? null
        : Number(filtros.usuario_id);

    return JUSTIFICACIONES_MOCK
        .map(materializarMock)
        .filter((fila) => {
            if (estado && fila.estado !== estado) return false;
            if (usuarioId !== null && Number(fila.usuario_id) !== usuarioId) return false;
            if (filtros.desde && fila.fecha < filtros.desde) return false;
            if (filtros.hasta && fila.fecha > filtros.hasta) return false;
            return true;
        })
        .sort(ordenarMock);
};

/* ============================================================
   API DEL MÓDULO
   ============================================================ */

// Envía una justificación. La imagen viaja como multipart/form-data.
export async function crear(datos = {}) {
    if (USAR_MOCK) {
        await esperar();

        const usuario = leerUsuarioSesion();
        const fila = {
            id: siguienteId++,
            usuario_id: usuario.id ?? 0,
            usuario: nombreSesion(),
            correo: usuario.email || "",
            tipo: datos.tipo,
            fecha: datos.fecha,
            minutos_tarde: datos.minutos_tarde ?? null,
            asunto: datos.asunto,
            mensaje: datos.mensaje,
            // La URL local solo sirve para la vista previa del mock.
            evidencia_url: datos.evidencia ? URL.createObjectURL(datos.evidencia) : null,
            estado: "PENDIENTE",
            revisado_por: null,
            fecha_revision: null,
            creado_en: new Date().toISOString(),
            es_mia: true,
        };

        JUSTIFICACIONES_MOCK.push(fila);
        notificarCambio();
        return materializarMock(fila);
    }

    const formData = new FormData();
    formData.append("tipo", datos.tipo);
    formData.append("fecha", datos.fecha);
    formData.append("asunto", datos.asunto);
    formData.append("mensaje", datos.mensaje);
    if (datos.minutos_tarde !== null && datos.minutos_tarde !== undefined) {
        formData.append("minutos_tarde", String(datos.minutos_tarde));
    }
    // El nombre del campo puede cambiar cuando el backend quede definido.
    if (datos.evidencia) {
        formData.append("evidencia", datos.evidencia);
    }

    const response = await axios.post(API_URL, formData, {
        headers: {
            ...getConfig().headers,
            "Content-Type": "multipart/form-data",
        },
    });
    notificarCambio();
    return response.data;
}

// Justificaciones del usuario autenticado.
export async function obtenerMias() {
    if (USAR_MOCK) {
        await esperar();
        return JUSTIFICACIONES_MOCK
            .filter((fila) => fila.es_mia)
            .map(materializarMock)
            .sort(ordenarMock);
    }

    const response = await axios.get(`${API_URL}/mias`, getConfig());
    return response.data;
}

// Justificaciones de todo el equipo. Acepta estado, usuario_id, desde y hasta.
export async function obtenerTodas(filtros = {}) {
    if (USAR_MOCK) {
        await esperar();
        return filtrarMock(filtros);
    }

    const params = {};
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.usuario_id) params.usuario_id = filtros.usuario_id;
    if (filtros.desde) params.desde = filtros.desde;
    if (filtros.hasta) params.hasta = filtros.hasta;

    const response = await axios.get(API_URL, {
        ...getConfig(),
        params,
    });
    return response.data;
}

// Acepta o rechaza una justificación pendiente.
export async function resolver(id, estado) {
    if (USAR_MOCK) {
        await esperar(200);

        const fila = JUSTIFICACIONES_MOCK.find((item) => item.id === Number(id));
        if (!fila) {
            throw new Error("La justificación ya no existe.");
        }

        fila.estado = estado;
        fila.revisado_por = nombreSesion();
        fila.fecha_revision = new Date().toISOString();
        notificarCambio();
        return materializarMock(fila);
    }

    const response = await axios.patch(`${API_URL}/${id}`, { estado }, getConfig());
    notificarCambio();
    return response.data;
}

// Total de justificaciones pendientes (contador de la campana).
export async function contarPendientes() {
    if (USAR_MOCK) {
        await esperar(150);
        return JUSTIFICACIONES_MOCK.filter((fila) => fila.estado === "PENDIENTE").length;
    }

    const response = await axios.get(`${API_URL}/pendientes/count`, getConfig());
    const datos = response.data || {};
    return Number(datos.total ?? datos.count ?? datos.pendientes ?? 0) || 0;
}
