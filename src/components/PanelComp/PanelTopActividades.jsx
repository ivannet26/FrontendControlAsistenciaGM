function PanelTopActividades({ actividades }) {

    const formatoTiempo = (seg) => {
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        const s = seg % 60;
        return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
    };

    return (
        <div className="top-container">

            <div className="top-header">
                <span>Actividades más registradas</span>
                <select>
                    <option>Top 10</option>
                    <option>Top 20</option>
                    <option>Top 50</option>
                </select>
            </div>

            <div className="top-lista">
                {actividades.map((a, i) => (
                    <div key={i} className="top-item">

                        <div className="top-item-info">
                            <span className="top-item-nombre">{a.nombre}</span>
                            <span className="top-item-proyecto">
                                <span className="top-item-punto" />
                                {a.proyecto}
                            </span>
                        </div>

                        <span className="top-item-tiempo">
                            {formatoTiempo(a.segundos)}
                        </span>

                    </div>
                ))}
            </div>

        </div>
    );
}

export default PanelTopActividades;