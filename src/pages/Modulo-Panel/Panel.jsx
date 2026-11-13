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

// A partir de aquí mostramos el aviso de "el servidor está despertando".
// No es un timeout: la petición sigue viva hasta los 60 s de axios.
const AVISO_LENTO_MS = 8000;


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
    const [despertando, setDespertando] = useState(false);

    // ✅ Solo cancelación: no hay reintentos ni polling
    const abortControllerRef = useRef(null);
    const avisoLentoRef = useRef(null);

    // ✅ useMemo: el rango solo se recalcula cuando cambia offsetSemana
    const rangoActual = useMemo(
        () => calcularRangoSemana(offsetSemana),
        [offsetSemana]
    );


    // ============================================================
    // CARGA DE DATOS (una petición por rango/filtro, sin reintentos)
    // ============================================================

    const cargarTodo = useCallback(async () => {

        // Cancelar la petición anterior (cambio de semana/filtro)
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setCargando(true);
        setError(null);
        setDespertando(false);

        // Aviso pasivo a los 8 s: el usuario entiende la espera,
        // pero NO abortamos ni relanzamos nada.
        window.clearTimeout(avisoLentoRef.current);
        avisoLentoRef.current = window.setTimeout(() => {
            if (!controller.signal.aborted) setDespertando(true);
        }, AVISO_LENTO_MS);

        try {
            const { fecha_inicio, fecha_fin } = calcularRangoSemana(offsetSemana);

            // Petición 1: resumen tiempo (timeout de 60 s en axios)
            const res = await obtenerResumenTiempo(
                { fecha_inicio, fecha_fin, usuario_filtro: usuarioFiltro },
                controller.signal
            );

            if (controller.signal.aborted) return;

            setDatos(res);

            // Petición 2: equipo (solo si aplica)
            if (usuarioFiltro === "equipo") {
                try {
                    const resEquipo = await obtenerActividadEquipo(
                        { fecha_inicio, fecha_fin },
                        controller.signal
                    );

                    if (controller.signal.aborted) return;
                    setEquipo(resEquipo);
                } catch (errEquipo) {
                    // Un fallo del bloque de equipo no tumba el panel
                    if (!errEquipo.esCancelado && !controller.signal.aborted) {
                        console.error("Error cargando equipo:", errEquipo);
                        setEquipo(null);
                    }
                }
            } else {
                setEquipo(null);
            }

        } catch (err) {
            if (err.esCancelado || controller.signal.aborted) return; // Ignorar cancelaciones

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
    }, [offsetSemana, usuarioFiltro]);


    // ============================================================
    // EFECTO PRINCIPAL
    // ------------------------------------------------------------
    // Se ejecuta UNA vez por cambio de semana/filtro.
    // Sin setInterval: no hay peticiones periódicas en segundo plano.
    // ============================================================

    useEffect(() => {
        cargarTodo();

        return () => {
            window.clearTimeout(avisoLentoRef.current);
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

    // Sin datos todavía: mantenemos el lenguaje de "Cargando…"
    // en lugar de soltar un error técnico de inmediato.
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

            {/* Si ya había datos y falla una recarga, no se borra la pantalla:
                se avisa arriba y se ofrece reintentar a mano. */}
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
