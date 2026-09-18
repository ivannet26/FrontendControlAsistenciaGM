function PanelKpis({ tiempoTotal, tiempoHoy, proyectoPrincipal, clientePrincipal }) {

    const formatoTiempo = (seg) => {
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        const s = seg % 60;
        return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
    };

    return (
        <div className="summary-container">

            <div className="summary-item">
                <span>Semana</span>
                <strong>{formatoTiempo(tiempoTotal)}</strong>
                <span className="kpi-sub">
                    Hoy: {formatoTiempo(tiempoHoy || 0)}
                </span>
            </div>

            <div className="summary-item">
                <span>Proyecto principal</span>
                <strong className="texto">{proyectoPrincipal || "—"}</strong>
            </div>

            <div className="summary-item">
                <span>Principal Cliente</span>
                <strong className="texto">{clientePrincipal || "—"}</strong>
            </div>

        </div>
    );
}

export default PanelKpis;