import { useEffect, useState } from "react";
import axios from "axios";

const STORAGE_KEY = "usuario";
const EVENTO_USUARIO_ACTUALIZADO = "usuario-actualizado";
const USUARIO_VACIO = {};
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_PERFIL_URL = `${API_BASE_URL}/perfil/mi-perfil`;

let refreshEnCurso = null;
let tokenRefrescado = null;

const leerUsuario = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return USUARIO_VACIO;
        const usuario = JSON.parse(raw);
        return usuario && typeof usuario === "object" ? usuario : USUARIO_VACIO;
    } catch {
        return USUARIO_VACIO;
    }
};

const leerUsuarioDesde = (valor) => {
    try {
        const usuario = JSON.parse(valor);
        return usuario && typeof usuario === "object" ? usuario : USUARIO_VACIO;
    } catch {
        return USUARIO_VACIO;
    }
};

const getAuthHeaders = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export async function refrescarUsuarioDesdeBackend() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    if (tokenRefrescado === token) return leerUsuario();
    if (refreshEnCurso?.token === token) return refreshEnCurso.promise;

    const usuarioAlIniciar = leerUsuario();
    const timestampAlIniciar = usuarioAlIniciar._ts;
    const promise = axios.get(API_PERFIL_URL, getAuthHeaders(token))
        .then((response) => {
            if (localStorage.getItem("token") !== token) return null;

            const data = response.data || {};
            const perfil = {
                ...(data.usuario || {}),
                ...(data.perfil || {}),
                ...data,
            };
            const actual = leerUsuario();
            const preservarCambiosLocales = actual._ts !== timestampAlIniciar;
            const fusionado = {
                ...actual,
                nombre: preservarCambiosLocales
                    ? actual.nombre
                    : (perfil.nombre ?? perfil.nombres ?? actual.nombre),
                apellido: preservarCambiosLocales
                    ? actual.apellido
                    : (perfil.apellido ?? perfil.apellidos ?? actual.apellido),
                email: preservarCambiosLocales
                    ? actual.email
                    : (perfil.email ?? perfil.correo ?? actual.email),
                rol: preservarCambiosLocales
                    ? actual.rol
                    : (perfil.rol ?? actual.rol),
                avatar_url: preservarCambiosLocales
                    ? actual.avatar_url
                    : (perfil.avatar_url ?? perfil.avatar ?? actual.avatar_url),
                _ts: Date.now(),
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(fusionado));
            window.dispatchEvent(new CustomEvent(EVENTO_USUARIO_ACTUALIZADO, {
                detail: fusionado,
            }));
            tokenRefrescado = token;
            return fusionado;
        })
        .catch(() => null)
        .finally(() => {
            if (refreshEnCurso?.promise === promise) refreshEnCurso = null;
        });

    refreshEnCurso = { token, promise };
    return promise;
}

export function useUsuarioActual() {
    const [usuario, setUsuario] = useState(leerUsuario);

    useEffect(() => {
        const manejarEventoUsuario = (evento) => {
            setUsuario(evento.detail || leerUsuario());
        };

        const manejarStorage = (evento) => {
            if (evento.key !== STORAGE_KEY) return;
            setUsuario(evento.newValue ? leerUsuarioDesde(evento.newValue) : USUARIO_VACIO);
        };

        window.addEventListener(EVENTO_USUARIO_ACTUALIZADO, manejarEventoUsuario);
        window.addEventListener("storage", manejarStorage);
        void refrescarUsuarioDesdeBackend();

        return () => {
            window.removeEventListener(EVENTO_USUARIO_ACTUALIZADO, manejarEventoUsuario);
            window.removeEventListener("storage", manejarStorage);
        };
    }, []);

    return usuario;
}

export function actualizarUsuarioActual(nuevosDatos) {
    const datosDefinidos = Object.fromEntries(
        Object.entries(nuevosDatos).filter(([, valor]) => valor !== undefined)
    );
    const fusionado = {
        ...leerUsuario(),
        ...datosDefinidos,
        _ts: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(fusionado));
    window.dispatchEvent(new CustomEvent(EVENTO_USUARIO_ACTUALIZADO, {
        detail: fusionado,
    }));

    return fusionado;
}

export function construirUrlAvatar(avatarUrl, version) {
    if (!avatarUrl || typeof avatarUrl !== "string") return null;

    const ruta = avatarUrl.trim();
    if (!ruta) return null;

    const urlBase = /^https?:\/\//i.test(ruta)
        ? ruta
        : `${API_BASE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
    if (version === undefined || version === null || version === "") return urlBase;

    const indiceFragmento = urlBase.indexOf("#");
    const fragmento = indiceFragmento >= 0 ? urlBase.slice(indiceFragmento) : "";
    const urlSinFragmento = fragmento ? urlBase.slice(0, indiceFragmento) : urlBase;
    const separador = urlSinFragmento.includes("?") ? "&" : "?";
    return `${urlSinFragmento}${separador}v=${encodeURIComponent(version)}${fragmento}`;
}

export function obtenerUrlAvatar(usuario) {
    return construirUrlAvatar(
        usuario?.avatar_url || usuario?.avatar,
        usuario?._ts
    );
}
