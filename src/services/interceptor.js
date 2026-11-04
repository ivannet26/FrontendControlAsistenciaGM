// src/services/interceptor.js
import axios from "axios";

// ============================================================
// TIMEOUT GLOBAL (único origen de verdad)
// ------------------------------------------------------------
// Render en plan gratuito duerme tras un periodo de inactividad
// y puede tardar ~50 s en despertar. Damos 60 s a TODAS las
// peticiones axios de la app para que el "cold start" quepa.
// No hay reintentos automáticos en ninguna capa.
// ============================================================
export const TIMEOUT_MS = 60000;

axios.defaults.timeout = TIMEOUT_MS;

let redirigiendo = false;

// Códigos que significan "no hubo respuesta del servidor"
const CODIGOS_RED = ["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT", "ERR_BAD_RESPONSE"];

function esErrorDeRed(error) {
    if (!error.response) return true;
    return CODIGOS_RED.includes(error.code);
}

/**
 * Convierte un error de axios en algo que la UI pueda mostrar
 * sin filtrar detalles técnicos. Devuelve null si la petición
 * fue cancelada (no es un error real, es intencional).
 */
export function mensajeAmigable(error) {
    if (error.code === "ERR_CANCELED") return null;

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return "El servidor está tardando más de un minuto en responder. Puede estar despertando; vuelve a intentarlo en unos segundos.";
    }

    if (error.code === "ERR_NETWORK") {
        return "No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.";
    }

    if (!error.response) {
        return "No se pudo contactar con el servidor. Inténtalo de nuevo en unos segundos.";
    }

    const status = error.response.status;
    const detalle = error.response.data?.detail || error.response.data?.message;

    if (status === 401) return "Tu sesión ha expirado. Vuelve a iniciar sesión.";
    if (status === 403) return "No tienes permisos para ver esta información.";
    if (status === 404) return "No se encontró la información solicitada.";
    if (status >= 500) return "El servidor tuvo un problema interno. Inténtalo de nuevo en unos segundos.";

    return detalle || "Ocurrió un error al cargar los datos.";
}

function forzarLogout(mensaje) {
    if (redirigiendo) return;
    redirigiendo = true;

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    if (mensaje) {
        try {
            sessionStorage.setItem("logout_msg", mensaje);
        } catch {
            /* sessionStorage no disponible: se ignora */
        }
    }

    window.location.href = "/";
}

// Un 401 en el propio login/registro es "credenciales incorrectas",
// no una sesión expirada: no debe redirigir ni recargar la página.
function esRutaDeAutenticacion(config) {
    const url = config?.url || "";
    return url.includes("/auth/");
}

export function instalarInterceptor() {
    axios.defaults.timeout = TIMEOUT_MS;

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            // Cancelaciones intencionales: se propagan tal cual,
            // sin mensajes ni redirecciones.
            if (error.code === "ERR_CANCELED") {
                error.esCancelado = true;
                return Promise.reject(error);
            }

            // Metadatos que consumen los componentes para decidir
            // si muestran "Cargando…" o un mensaje de error.
            error.esRed = esErrorDeRed(error);
            error.mensajeAmigable = mensajeAmigable(error);
            error.esTimeout = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";

            const status = error.response?.status;
            const detalle = error.response?.data?.detail || "";

            if ((status === 401 || status === 403) && !esRutaDeAutenticacion(error.config)) {
                const detalleLower = detalle.toLowerCase();

                const esDesactivado =
                    detalleLower.includes("desactivado") ||
                    detalleLower.includes("sesión cerrada") ||
                    detalleLower.includes("sesion cerrada") ||
                    detalleLower.includes("token inválido") ||
                    detalleLower.includes("token invalido") ||
                    detalleLower.includes("token expirado");

                if (status === 401 || esDesactivado) {
                    forzarLogout(detalle || "Tu sesión ha sido cerrada");
                }
            }

            return Promise.reject(error);
        }
    );
}
