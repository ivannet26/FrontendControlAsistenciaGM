import { useState, useEffect, useCallback, useRef } from "react";
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

const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
};

const calcularRangoSemana = (offsetSemanas = 0) => {
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

const AVISO_LENTO_MS = 8000;

function Panel() {

    const rangoInicial = calcularRangoSemana(0);

    const [fechaInicio, setFechaInicio] = useState(rangoInicial.fecha_inicio);
    const [fechaFin, setFechaFin] = useState(rangoInicial.fecha_fin);
    const [usuarioFiltro, setUsuarioFiltro] = useState("yo");

    const [datos, setDatos] = useState(null);
    const [equipo, setEquipo] = useState(null);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [despertando, setDespertando] = useState(false);

    const abortControllerRef = useRef(null);
    const avisoLentoRef = useRef(null);

    const cargarTodo = useCallback(async () => {

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setCargando(true);
        setError(null);
        setDespertando(false);

        window.clearTimeout(avisoLentoRef.current);
        avisoLentoRef.current = window.setTimeout(() => {
            if (!controller.signal.aborted) setDespertando(true);
        }, AVISO_LENTO_MS);

        try {
            const res = await obtenerResumenTiempo(
                {
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    usuario_filtro: usuarioFiltro
                },
                controller.signal
            );

            if (controller.signal.aborted) return;

            setDatos(res);

            if (usuarioFiltro === "equipo") {
                try {
                    const resEquipo = await obtenerActividadEquipo(
                        { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
                        controller.signal
                    );

                    if (controller.signal.aborted) return;
                    setEquipo(resEquipo);
                } catch (errEquipo) {
                    if (!errEquipo.esCancelado && !controller.signal.aborted) {
                        console.error("Error cargando equipo:", errEquipo);
                        setEquipo(null);
                    }
                }
            } else {
                setEquipo(null);
            }

        } catch (err) {
            if (err.esCancelado || controller.signal.aborted) return;

            console.error("Error cargando panel:", err);
            setError(
                err.mensajeAmigable ||
                err.message ||
                "No se pudo cargar el panel"
            );
        } finally {
            window.clearTimeout(avisoLentoRef.current);
            if (!controller.signal.aborted) {
                setCargando(false);
                setDespertando(false);
            }
        }
    }, [fechaInicio, fechaFin, usuarioFiltro]);

    useEffect(() => {
        cargarTodo();

        return () => {
            window.clearTimeout(avisoLentoRef.current);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [cargarTodo]);

    const cambiarRango = (inicio, fin) => {
        setFechaInicio(inicio);
        setFechaFin(fin);
    };

    if (error && !datos) {
        return (
            <div className="panel-page">
                <div className="panel-aviso-servidor">
                    <strong className="panel-aviso-titulo">Cargando…</strong>
                    <p className="panel-aviso-texto">{error}</p>
                    <button
                        type="button"
                        className="panel-aviso-boton"
                        onClick={cargarTodo}
                        disabled={cargando}
                    >
                        {cargando ? "Reintentando…" : "Reintentar"}
                    </button>
                </div>
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
                subtexto={
                    despertando
                        ? "El servidor está despertando, esto puede tardar hasta un minuto"
                        : "Por favor espere"
                }
            />

            {error && datos && (
                <div className="panel-banner-error">
                    <span>{error}</span>
                    <button
                        type="button"
                        className="panel-aviso-boton"
                        onClick={cargarTodo}
                        disabled={cargando}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {datos && (
                <>
                    <PanelFiltros
                        usuarioFiltro={usuarioFiltro}
                        setUsuarioFiltro={setUsuarioFiltro}
                        fechaInicio={fechaInicio}
                        fechaFin={fechaFin}
                        onCambiarRango={cambiarRango}
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