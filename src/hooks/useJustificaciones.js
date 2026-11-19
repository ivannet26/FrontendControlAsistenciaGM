// src/hooks/useJustificaciones.js
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const validarLista = (datos) => {
    if (datos?.error) throw new Error(datos.message);
    return Array.isArray(datos) ? datos : [];
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
    const queryClient = useQueryClient();

    // Los filtros llegan como objeto nuevo en cada render: se comparan por valor.
    const filtrosClave = JSON.stringify(filtros ?? {});
    const filtrosEstables = useMemo(() => JSON.parse(filtrosClave), [filtrosClave]);

    const listaQuery = useQuery({
        queryKey: ["justificaciones", "lista", fuente, filtrosEstables],
        queryFn: async () => {
            if (fuente === "todas") return validarLista(await obtenerTodas(filtrosEstables));
            if (fuente === "mias") return validarLista(await obtenerMias());
            return [];
        },
        enabled: Boolean(autoCargar && fuente),
        refetchInterval: intervaloRefresco || false,
        refetchIntervalInBackground: false,
    });

    const contadorQuery = useQuery({
        queryKey: ["justificaciones", "pendientes"],
        queryFn: async () => {
            const total = await contarPendientesServicio();
            if (total?.error) throw new Error(total.message);
            return Number(total) || 0;
        },
        enabled: conContador,
        refetchInterval: intervaloContador || false,
        refetchIntervalInBackground: false,
    });

    // Las mutaciones del servicio notifican por evento: se invalida todo y cada
    // consumidor vuelve a consultar con su propia caché compartida.
    useEffect(() => {
        const manejarActualizacion = () => {
            void queryClient.invalidateQueries({ queryKey: ["justificaciones"] });
        };
        window.addEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, manejarActualizacion);
        return () => window.removeEventListener(EVENTO_JUSTIFICACIONES_ACTUALIZADAS, manejarActualizacion);
    }, [queryClient]);

    const recargar = async () => {
        if (!fuente) return [];
        const resultado = await listaQuery.refetch();
        return Array.isArray(resultado.data) ? resultado.data : [];
    };

    const refrescarContador = async () => {
        const resultado = await contadorQuery.refetch();
        return Number(resultado.data) || 0;
    };

    return {
        justificaciones: listaQuery.data ?? [],
        cargando: Boolean(autoCargar && fuente) && listaQuery.isPending,
        error: listaQuery.error
            ? obtenerMensajeError(listaQuery.error, MENSAJE_ERROR)
            : "",
        pendientes: contadorQuery.data ?? 0,
        recargar,
        refrescarContador,
    };
}
