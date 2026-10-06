// src/services/interceptor.js
import axios from "axios";

let redirigiendo = false;

function forzarLogout(mensaje) {
    if (redirigiendo) return;
    redirigiendo = true;

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    if (mensaje) {
        try {
            sessionStorage.setItem("logout_msg", mensaje);
        } catch (e) {}
    }

    window.location.href = "/";
}

export function instalarInterceptor() {
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status;
            const detalle = error.response?.data?.detail || "";

            if (status === 401 || status === 403) {
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