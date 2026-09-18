import { useState, useEffect } from "react";
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

// Timeout helper
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


    useEffect(() => {
        cargarTodo();

        const intervalo = setInterval(() => {
            cargarTodo(true);
        }, 30000);

        return () => clearInterval(intervalo);
    }, [offsetSemana, usuarioFiltro]);


    const cargarTodo = async (silencioso = false) => {
        if (!silencioso) setCargando(true);
        setError(null);

        try {
            const { fecha_inicio, fecha_fin } = calcularRangoSemana(offsetSemana);

            // Cargar resumen con timeout
            const res = await Promise.race([
                obtenerResumenTiempo({
                    fecha_inicio,
                    fecha_fin,
                    usuario_filtro: usuarioFiltro
                }),
                timeout(15000)
            ]);
            setDatos(res);

            // Cargar equipo SOLO si el filtro es "equipo"
            if (usuarioFiltro === "equipo") {
                try {
                    const resEquipo = await Promise.race([
                        obtenerActividadEquipo({ fecha_inicio, fecha_fin }),
                        timeout(15000)
                    ]);
                    setEquipo(resEquipo);
                } catch (errEquipo) {
                    console.error("Error cargando equipo:", errEquipo);
                    setEquipo(null);   // no rompemos la página
                }
            } else {
                setEquipo(null);
            }

        } catch (err) {
            console.error("Error cargando panel:", err);
            setError(err.message || "Error al cargar");
        } finally {
            setCargando(false);   // ← SIEMPRE se ejecuta
        }
    };


    const semanaAnterior = () => setOffsetSemana(offsetSemana - 1);
    const semanaSiguiente = () => {
        if (offsetSemana < 0) setOffsetSemana(offsetSemana + 1);
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

            {/* 👇 OVERLAY DE CARGA */}
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