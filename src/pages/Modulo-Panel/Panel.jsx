import { useState, useEffect } from "react";
import "./Panel.css";

import PanelFiltros from "../../components/PanelComp/PanelFiltros";
import PanelKpis from "../../components/PanelComp/PanelKpis";
import PanelGraficoBarras from "../../components/PanelComp/PanelGraficoBarras";
import PanelDonut from "../../components/PanelComp/PanelDonut";
import PanelTopActividades from "../../components/PanelComp/PanelTopActividades";
import PanelActividadEquipo from "../../components/PanelComp/PanelActividadEquipo";

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


    // ============================================================
    // CARGA INICIAL + AUTO-REFRESH cada 30 segundos
    // ============================================================
    useEffect(() => {

        // Cargar inmediatamente
        cargarTodo();

        // Intervalo de actualización
        const intervalo = setInterval(() => {
            cargarTodo(true);  // ← true = modo "silencioso" (sin loader)
        }, 30000);  // 30 segundos

        return () => clearInterval(intervalo);

    }, [offsetSemana, usuarioFiltro]);


    const cargarTodo = async (silencioso = false) => {
        if (!silencioso) setCargando(true);
        setError(null);

        try {
            const { fecha_inicio, fecha_fin } = calcularRangoSemana(offsetSemana);

            // Siempre cargamos el resumen
            const res = await obtenerResumenTiempo({
                fecha_inicio,
                fecha_fin,
                usuario_filtro: usuarioFiltro
            });
            setDatos(res);

            // Si es "equipo", cargamos también la actividad de cada uno
            if (usuarioFiltro === "equipo") {
                const resEquipo = await obtenerActividadEquipo({
                    fecha_inicio,
                    fecha_fin
                });
                setEquipo(resEquipo);
            } else {
                setEquipo(null);
            }

        } catch (err) {
            console.error("Error cargando panel:", err);
            setError(err.message);
        } finally {
            if (!silencioso) setCargando(false);
        }
    };


    const semanaAnterior = () => setOffsetSemana(offsetSemana - 1);
    const semanaSiguiente = () => {
        if (offsetSemana < 0) setOffsetSemana(offsetSemana + 1);
    };


    // ============================================================
    // RENDER
    // ============================================================

    if (cargando) {
        return (
            <div className="panel-page">
                <div className="panel-loading">Cargando panel...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel-page">
                <div className="panel-error">Error: {error}</div>
            </div>
        );
    }

    if (!datos) {
        return (
            <div className="panel-page">
                <div className="panel-error">Sin datos disponibles</div>
            </div>
        );
    }


    return (
        <div className="panel-page">

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

            {/* Contenedor de equipo SOLO cuando el filtro es "equipo" */}
            {usuarioFiltro === "equipo" && equipo && (
                <PanelActividadEquipo miembros={equipo.miembros} />
            )}

        </div>
    );
}

export default Panel;