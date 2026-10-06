import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./Panel.css";

import PanelFiltros from "../../components/PanelComp/PanelFiltros";
import PanelKpis from "../../components/PanelComp/PanelKpis";
import PanelGraficoBarras from "../../components/PanelComp/PanelGraficoBarras";
import PanelDonut from "../../components/PanelComp/PanelDonut";
import PanelTopActividades from "../../components/PanelComp/PanelTopActividades";
import PanelActividadEquipo from "../../components/PanelComp/PanelActividadEquipo";
import LoadingOverlay from "../../components/Loading/LoadingOverlay";

import {
    obtenerResumenTiempo,
    obtenerActividadEquipo
} from "../../services/panelService";


// ============================================================
// HELPERS
// ============================================================

const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
};

const calcularRangoSemana = (offsetSemanas) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const dia = hoy.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;

    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diff + offsetSemanas * 7);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    return {
        fecha_inicio: formatYMD(lunes),
        fecha_fin: formatYMD(domingo)
    };
};

const timeout = (ms) => new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms)
);


// ============================================================
// COMPONENTE
// ============================================================

function Panel() {

    const [offsetSemana, setOffsetSemana] = useState(0);
    const [usuarioFiltro, setUsuarioFiltro] = useState("yo");

    const [datos, setDatos] = useState(null);
    const [equipo, setEquipo] = useState(null);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Ref para evitar peticiones duplicadas
    const abortControllerRef = useRef(null);
    const cargandoRef = useRef(false);

    // ✅ useMemo: el rango solo se recalcula cuando cambia offsetSemana
    const rangoActual = useMemo(
        () => calcularRangoSemana(offsetSemana),
        [offsetSemana]
    );


    // ============================================================
    // CARGA DE DATOS (estabilizada con useCallback)
    // ============================================================

    const cargarTodo = useCallback(async (silencioso = false) => {

        // ✅ Evitar peticiones duplicadas simultáneas
        if (cargandoRef.current && silencioso) return;
        cargandoRef.current = true;

        // ✅ Cancelar petición anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (!silencioso) setCargando(true);
        setError(null);

        try {
            const { fecha_inicio, fecha_fin } = calcularRangoSemana(offsetSemana);

            // Petición 1: resumen tiempo
            const res = await Promise.race([
                obtenerResumenTiempo({
                    fecha_inicio,
                    fecha_fin,
                    usuario_filtro: usuarioFiltro
                }, controller.signal),
                timeout(15000)
            ]);

            // Si la petición fue abortada, salir sin actualizar
            if (controller.signal.aborted) return;

            setDatos(res);

            // Petición 2: equipo (solo si aplica)
            if (usuarioFiltro === "equipo") {
                try {
                    const resEquipo = await Promise.race([
                        obtenerActividadEquipo(
                            { fecha_inicio, fecha_fin },
                            controller.signal
                        ),
                        timeout(15000)
                    ]);

                    if (controller.signal.aborted) return;
                    setEquipo(resEquipo);
                } catch (errEquipo) {
                    if (errEquipo.name !== "AbortError") {
                        console.error("Error cargando equipo:", errEquipo);
                        setEquipo(null);
                    }
                }
            } else {
                setEquipo(null);
            }

        } catch (err) {
            if (err.name === "AbortError") return; // Ignorar cancelaciones
            console.error("Error cargando panel:", err);
            setError(err.message || "Error al cargar");
        } finally {
            cargandoRef.current = false;
            if (!controller.signal.aborted) {
                setCargando(false);
            }
        }
    }, [offsetSemana, usuarioFiltro]);


    // ============================================================
    // EFECTO PRINCIPAL
    // ============================================================

    useEffect(() => {
        cargarTodo();

        const intervalo = setInterval(() => {
            cargarTodo(true);
        }, 30000);

        return () => {
            clearInterval(intervalo);
            // Cancelar petición en curso al desmontar
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [cargarTodo]);


    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    const semanaAnterior = () => setOffsetSemana(prev => prev - 1);
    const semanaSiguiente = () => {
        if (offsetSemana < 0) setOffsetSemana(prev => prev + 1);
    };


    // ============================================================
    // RENDER
    // ============================================================

    if (error) {
        return (
            <div className="panel-page">
                <div className="panel-error">Error: {error}</div>
            </div>
        );
    }

    if (!datos && !cargando) {
        return (
            <div className="panel-page">
                <div className="panel-error">Sin datos disponibles</div>
            </div>
        );
    }


    return (
        <div className="panel-page">

            <LoadingOverlay
                visible={cargando}
                texto="Cargando"
                subtexto="Por favor espere"
            />

            {datos && (
                <>
                    <PanelFiltros
                        labelSemana={datos.label_semana}
                        usuarioFiltro={usuarioFiltro}
                        setUsuarioFiltro={setUsuarioFiltro}
                        onAnterior={semanaAnterior}
                        onSiguiente={semanaSiguiente}
                        puedeAvanzar={offsetSemana < 0}
                        fechaInicio={rangoActual.fecha_inicio}
                        fechaFin={rangoActual.fecha_fin}
                    />

                    <div className="panel-layout">
                        <div className="panel-main">
                            <PanelKpis
                                tiempoTotal={datos.tiempo_total}
                                tiempoHoy={datos.tiempo_hoy}
                                proyectoPrincipal={datos.proyecto_principal}
                                clientePrincipal={datos.cliente_principal || "—"}
                            />
                            <PanelGraficoBarras datos={datos.por_dia} />
                            <PanelDonut
                                datos={datos.por_proyecto}
                                total={datos.tiempo_total}
                            />
                        </div>

                        <div className="panel-side">
                            <PanelTopActividades actividades={datos.top_actividades} />
                        </div>
                    </div>

                    {usuarioFiltro === "equipo" && equipo && (
                        <PanelActividadEquipo miembros={equipo.miembros} />
                    )}
                </>
            )}

        </div>
    );
}

export default Panel;