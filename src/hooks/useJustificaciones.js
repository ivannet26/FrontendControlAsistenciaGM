// src/hooks/useJustificaciones.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    EVENTO_JUSTIFICACIONES_ACTUALIZADAS,
    contarPendientes as contarPendientesServicio,
    obtenerMias,
    obtenerTodas,
} from "../services/justificacionesService";

const MENSAJE_ERROR = "No se pudieron cargar las justificaciones.";

const obtenerMensajeError = (error, mensajePredeterminado) => {
    const detalle = error?.response?.data?.detail;
    if (typeof detalle === "string" && detalle.trim()) return detalle;
    return error?.message || mensajePredeterminado;
};

/**
 * Carga justificaciones y opcionalmente el contador de pendientes.
 *
 * fuente: "mias" (usuario), "todas" (administración) o null (solo contador).
 * filtros: { estado, usuario_id, desde, hasta } para la fuente "todas".
 * conContador: consulta y refresca el número de pendientes.
 * intervaloRefresco: milisegundos entre recargas silenciosas de la lista (0 = sin refresco).
 * intervaloContador: milisegundos entre refrescos del contador.
 */
export function useJustificaciones({
    fuente = "mias",
    filtros = {},
    conContador = false,
    autoCargar = true,
    intervaloRefresco = 0,
    intervaloContador = 60000,
} = {}) {
    const [justificaciones, setJustificaciones] = useState([]);
    const [cargando, setCargando] = useState(Boolean(autoCargar && fuente));
    const [error, setError] = useState("");
    const [pendientes, setPendientes] = useState(0);

    const activoRef = useRef(true);
    const peticionRef = useRef(0);

    // Los filtros llegan como objeto nuevo en cada render: se comparan por valor.
    const filtrosClave = JSON.stringify(filtros ?? {});
    const filtrosEstables = useMemo(() => JSON.parse(filtrosClave), [filtrosClave]);

    const solicitarLista = useCallback(() => {
        if (fuente === "todas") return obtenerTodas(filtrosEstables);
        if (fuente === "mias") return obtenerMias();
        return Promise.resolve([]);
    }, [fuente, filtrosEstables]);

    // Carga inicial y recarga cuando cambian la fuente o los filtros.
    useEffect(() => {
        activoRef.current = true;

        if (!autoCargar || !fuente) {
            return () => {
                activoRef.current = false;
            };
        }

        const peticion = ++peticionRef.current;

        const cargar = async () => {
            setCargando(true);
            try {
                const datos = await solicitarLista();
                if (!activoRef.current || peticion !== peticionRef.current) return;

                if (datos?.error) throw new Error(datos.message);
                setJustificaciones(Array.isArray(datos) ? datos : []);
                setError("");
            } catch (err) {
                if (!activoRef.current || peticion !== peticionRef.current) return;
                setError(obtenerMensajeError(err, MENSAJE_ERROR));
            } finally {
                if (activoRef.current && peticion === peticionRef.current) {
                    setCargando(false);
                }
            }
        };

        void cargar();

        return () => {
            activoRef.current = false;
        };
    }, [autoCargar, fuente, solicitarLista]);

    // Recarga manual (botones o acciones de la vista).
    const recargar = useCallback(async (opciones = {}) => {
        const { silencioso = false } = opciones;
        if (!fuente) return [];

        const peticion = ++peticionRef.current;
        if (!silencioso) setCargando(true);

        try {
            const datos = await solicitarLista();
            if (!activoRef.current || peticion !== peticionRef.current) return [];

            if (datos?.error) throw new Error(datos.message);
            const lista = Array.isArray(datos) ? datos : [];
            setJustificaciones(lista);
            setError("");
            return lista;
        } catch (err) {
            if (!activoRef.current || peticion !== peticionRef.current) return [];

            setError(obtenerMensajeError(err, MENSAJE_ERROR));
            return [];
        } finally {
            if (activoRef.current && peticion === peticionRef.current && !silencioso) {
                setCargando(false);
            }
        }
    }, [fuente, solicitarLista]);

    const refrescarContador = useCallback(async () => {
        try {
            const total = await contarPendientesServicio();
            if (!activoRef.current) return 0;

            const valor = Number(total) || 0;
            setPendientes(valor);
            return valor;
        } catch {
            // El contador no debe romper la interfaz: se deja el último valor.
            return 0;
        }
    }, []);

    // Contador de pendientes: al montar, cuando cambia algo y por intervalo.
    useEffect(() => {
        if (!conContador) return undefined;

        let cancelado = false;

        const consultarContador = async () => {
            try {
                const total = await contarPendientesServicio();
                if (cancelado) return;

                setPendientes(Number(total) || 0);
            } catch {
                // Sin conexión se mantiene el último valor conocido.
            }
        };

        void consultarContador();

        const manejarActualizacion = () => {
            void consultarContador();
        };
        window.addEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, manejarActualizacion);

        const intervalo = intervaloContador
            ? window.setInterval(() => {
                if (document.visibilityState !== "visible") return;
                void consultarContador();
            }, intervaloContador)
            : null;

        return () => {
            cancelado = true;
            window.removeEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, manejarActualizacion);
            if (intervalo) window.clearInterval(intervalo);
        };
    }, [conContador, intervaloContador]);

    useEffect(() => {
        if (!fuente) return undefined;

        const manejarActualizacion = () => {
            void recargar({ silencioso: true });
        };
        window.addEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, manejarActualizacion);
        return () => window.removeEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, manejarActualizacion);
    }, [fuente, recargar]);

    // Refresco periódico y silencioso de la lista.
    useEffect(() => {
        if (!intervaloRefresco || !fuente) return undefined;

        const intervalo = window.setInterval(() => {
            if (document.visibilityState !== "visible") return;
            void recargar({ silencioso: true });
        }, intervaloRefresco);

        return () => window.clearInterval(intervalo);
    }, [intervaloRefresco, fuente, recargar]);

    return {
        justificaciones,
        cargando,
        error,
        pendientes,
        recargar,
        refrescarContador,
    };
}
