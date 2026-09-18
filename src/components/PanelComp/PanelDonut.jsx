import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORES = ["#10a5f5", "#10a878", "#e6a23c", "#f56c6c", "#8a90a0"];

function PanelDonut({ datos, total }) {

    const formatoTiempo = (seg) => {
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        const s = seg % 60;
        return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
    };

    const dataChart = datos.map((d, i) => ({
        name: d.nombre,
        value: d.segundos,
        color: COLORES[i % COLORES.length]
    }));

    return (
        <div className="panel-bloque">

            <div className="panel-bloque-header">
                <span className="panel-bloque-titulo">Distribución por proyecto</span>
            </div>

            <div className="donut-container">

                <div className="donut-chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dataChart}
                                dataKey="value"
                                innerRadius={75}
                                outerRadius={120}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={2}
                                stroke="#101b22"
                                strokeWidth={2}
                            >
                                {dataChart.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="donut-centro">
                        {formatoTiempo(total)}
                    </div>
                </div>

                <div className="donut-leyenda">
                    {dataChart.map((d, i) => {
                        const porcentaje = total
                            ? ((d.value / total) * 100).toFixed(2)
                            : "0.00";

                        return (
                            <div key={i} className="donut-item">

                                <span className="donut-item-nombre">
                                    {d.name}
                                </span>

                                <span className="donut-item-tiempo">
                                    {formatoTiempo(d.value)}
                                </span>

                                <div className="donut-item-barra">
                                    <div
                                        className="donut-item-barra-relleno"
                                        style={{
                                            width: `${porcentaje}%`,
                                            backgroundColor: d.color
                                        }}
                                    />
                                </div>

                                <span className="donut-item-porcentaje">
                                    {porcentaje}%
                                </span>

                            </div>
                        );
                    })}
                </div>

            </div>

        </div>
    );
}

export default PanelDonut;