import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";


// ============================================================
// HELPER: Formatear segundos de forma inteligente
// ============================================================
const formatearDuracion = (segundos) => {
    if (!segundos || segundos < 0) return "0s";

    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    // Menos de 1 minuto → solo segundos
    if (horas === 0 && minutos === 0) {
        return `${segs}s`;
    }

    // Menos de 1 hora → minutos y segundos
    if (horas === 0) {
        return segs > 0
            ? `${minutos} min ${segs}s`
            : `${minutos} min`;
    }

    // 1 hora o más → horas y minutos
    return minutos > 0
        ? `${horas}h ${minutos}min`
        : `${horas}h`;
};


function PanelGraficoBarras({ datos }) {

    const data = datos.map(d => ({
        dia: d.dia,
        horas: +(d.segundos / 3600).toFixed(2),
        segundos: d.segundos
    }));

    return (
        <div className="panel-bloque">

            <div className="panel-bloque-header">
                <span className="panel-bloque-titulo">Actividad por día</span>
            </div>

            <div className="chart-barras">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#263740"
                        />

                        <XAxis
                            dataKey="dia"
                            stroke="#9fb2c0"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: "#263740" }}
                            tickLine={false}
                        />

                        <YAxis
                            stroke="#9fb2c0"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v.toFixed(2)}h`}
                            axisLine={{ stroke: "#263740" }}
                            tickLine={false}
                        />

                        <Tooltip
                            cursor={{ fill: "rgba(16, 165, 245, 0.08)" }}
                            formatter={(value, name, props) => [
                                formatearDuracion(props.payload.segundos),
                                "Duración"
                            ]}
                            contentStyle={{
                                background: "#101b22",
                                border: "1px solid #263740",
                                borderRadius: 4,
                                color: "#d3dde3"
                            }}
                        />

                        <Bar
                            dataKey="horas"
                            fill="#10a5f5"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={60}
                        />

                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}

export default PanelGraficoBarras;