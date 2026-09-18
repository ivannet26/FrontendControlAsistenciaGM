// src/components/InformesComp/InformeSemanal.jsx
import { useEffect, useState } from "react";
import { obtenerDatosInforme } from "../../services/informesService";
import BotonExportar from "./BotonExportar";
import FiltrosInforme from "./FiltrosInforme";
import "./InformeSemanal.css";

const InformeSemanal = () => {
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  const [fechaDesde, setFechaDesde] = useState(lunes.toISOString().slice(0, 10));
  const [fechaHasta, setFechaHasta] = useState(domingo.toISOString().slice(0, 10));
  const [filtros, setFiltros] = useState({});
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerDatosInforme(fechaDesde, fechaHasta);
        setDatos(data);
      } catch (err) {
        console.error("Error al cargar informe:", err);
        setError("No se pudo cargar el informe");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [fechaDesde, fechaHasta, filtros]);

  const cambiarSemana = (offset) => {
    const nueva = new Date(fechaDesde);
    nueva.setDate(nueva.getDate() + offset * 7);
    setFechaDesde(nueva.toISOString().slice(0, 10));
    const nuevaHasta = new Date(nueva);
    nuevaHasta.setDate(nuevaHasta.getDate() + 6);
    setFechaHasta(nuevaHasta.toISOString().slice(0, 10));
  };

  const formatearFecha = (iso) => {
    const [y, m, d] = iso.split("-");
    const fecha = new Date(y, m - 1, d);
    const meses = ["ene", "feb", "mar", "abr", "may", "jun",
                   "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${meses[fecha.getMonth()]}. ${fecha.getDate()}, ${fecha.getFullYear()}`;
  };

  const formatear = (seg) => {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = seg % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const maxSegundos = datos?.por_dia
    ? Math.max(...datos.por_dia.map((d) => d.segundos), 1)
    : 1;

  const totalSegundos = datos?.tiempo_total || 0;

  // ✅ MISMA PALETA QUE EL PANEL
  const colores = [
    "#10a5f5", // azul (principal)
    "#10a878", // verde
    "#e6a23c", // naranja
    "#f56c6c", // rojo
    "#8b5cf6", // violeta
    "#ec4899", // rosa
    "#42b8d8", // celeste
    "#6b7d88", // gris
  ];

  return (
    <div className="panel-page">
      {/* HEADER */}
      <div className="panel-header">
        <h1>Informe de Tiempo</h1>

        <div className="panel-actions">
          <div className="panel-date-selector">
            <button onClick={() => cambiarSemana(-1)}>‹</button>
            <span>
              📅 {formatearFecha(fechaDesde)} - {formatearFecha(fechaHasta)}
            </span>
            <button onClick={() => cambiarSemana(1)}>›</button>
          </div>

          <BotonExportar
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            filtros={filtros}
          />
        </div>
      </div>

      {/* FILTROS */}
      <FiltrosInforme onAplicar={setFiltros} />

      {cargando && <div className="panel-loading">Cargando informe...</div>}
      {error && <div className="panel-error">{error}</div>}

      {datos && !cargando && (
        <div className="panel-layout">
          {/* COLUMNA PRINCIPAL */}
          <div className="panel-main">
            {/* TOTAL + CREAR FACTURA */}
            <div className="panel-bloque">
              <div className="panel-bloque-header">
                <span className="panel-bloque-titulo">
                  Total: {formatear(totalSegundos)}
                </span>
                <button className="boton-exportar">Crear factura</button>
              </div>
            </div>

            {/* GRÁFICO DE BARRAS POR DÍA */}
            <div className="panel-bloque">
              <div className="panel-bloque-header">
                <span className="panel-bloque-titulo">Tiempo por día</span>
              </div>
              <div className="chart-barras">
                <div className="grafico-barras">
                  {datos.por_dia?.map((d) => {
                    const alturaPct = (d.segundos / maxSegundos) * 100;
                    return (
                      <div key={d.fecha} className="barra-col">
                        <div className="barra-valor">
                          {d.segundos > 0 ? formatear(d.segundos) : "00:00:00"}
                        </div>
                        <div className="barra-wrapper">
                          <div
                            className="barra-relleno"
                            style={{ height: `${alturaPct}%` }}
                          />
                        </div>
                        <div className="barra-dia">{d.dia}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ACTIVIDADES REALIZADAS */}
            <div className="top-container">
              <div className="top-header">
                <span>Actividades realizadas</span>
              </div>
              <div className="top-lista">
                {datos.top_actividades?.map((a, i) => (
                  <div key={i} className="top-item">
                    <div className="top-item-info">
                      <span className="top-item-nombre">{a.nombre}</span>
                      <span className="top-item-proyecto">
                        <span className="top-item-punto" />
                        {a.proyecto}
                      </span>
                    </div>
                    <span className="top-item-tiempo">
                      {formatear(a.segundos)}
                    </span>
                  </div>
                ))}
                {(!datos.top_actividades || datos.top_actividades.length === 0) && (
                  <div className="equipo-vacio">
                    Sin actividades en este período
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR: DONUT POR PROYECTO */}
          <div className="panel-side">
            <div className="panel-bloque">
              <div className="panel-bloque-header">
                <span className="panel-bloque-titulo">Por proyecto</span>
              </div>

              <div className="donut-container" style={{ gridTemplateColumns: "1fr" }}>
                <div className="donut-chart-wrapper">
                  <DonutSVG
                    datos={datos.por_proyecto || []}
                    total={totalSegundos}
                    formatear={formatear}
                    colores={colores}
                  />
                </div>

                <div className="donut-leyenda">
                  {datos.por_proyecto?.map((p, i) => {
                    const pct = totalSegundos > 0
                      ? Math.round((p.segundos / totalSegundos) * 100)
                      : 0;
                    const color = p.color || colores[i % colores.length];
                    return (
                      <div key={i} className="donut-item">
                        <span className="donut-item-nombre">{p.nombre}</span>
                        <span className="donut-item-tiempo">
                          {formatear(p.segundos)}
                        </span>
                        <div className="donut-item-barra">
                          <div
                            className="donut-item-barra-relleno"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                        <span className="donut-item-porcentaje">{pct}%</span>
                      </div>
                    );
                  })}
                  {(!datos.por_proyecto || datos.por_proyecto.length === 0) && (
                    <div className="equipo-vacio">Sin proyectos</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DonutSVG = ({ datos, total, formatear, colores }) => {
  if (!datos || datos.length === 0 || total === 0) {
    return <div className="equipo-vacio">Sin datos</div>;
  }

  const radio = 80;
  const grosor = 30;
  const cx = 100;
  const cy = 100;
  const circunferencia = 2 * Math.PI * radio;

  let offset = 0;

  return (
    <div className="donut-svg-wrapper">
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        {datos.map((d, i) => {
          const pct = d.segundos / total;
          const dash = pct * circunferencia;
          const gap = circunferencia - dash;
          const color = d.color || colores[i % colores.length];
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radio}
              fill="none"
              stroke={color}
              strokeWidth={grosor}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="donut-centro">{formatear(total)}</div>
    </div>
  );
};

export default InformeSemanal;