function PanelActividadEquipo({ miembros }) {

    const formatoTiempo = (seg) => {
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        const s = seg % 60;
        return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
    };

    return (
        <div className="equipo-container">

            <div className="equipo-header">
                <span>ACTIVIDAD DE EQUIPO</span>
            </div>

            {/* Cabecera de columnas */}
            <div className="equipo-cabecera">
                <div className="col-miembro">MIEMBRO DE EQUIPO</div>
                <div className="col-actividad">ÚLTIMA ACTIVIDAD</div>
                <div className="col-hora">HORA</div>
                <div className="col-estado">ESTADO</div>
                <div className="col-total">TOTAL HOY</div>
            </div>

            {/* Filas */}
            <div className="equipo-lista">
                {miembros.length === 0 && (
                    <div className="equipo-vacio">
                        No hay miembros registrados
                    </div>
                )}

                {miembros.map((m) => (
                    <div
                        key={m.id}
                        className={
                            "equipo-row" +
                            (m.es_usuario_actual ? " equipo-row-yo" : "")
                        }
                    >
                        {/* Miembro */}
                        <div className="col-miembro">
                            <div
                                className="equipo-avatar"
                                style={{ backgroundColor: m.color_avatar }}
                            >
                                {m.iniciales}
                            </div>
                            <span className="equipo-nombre">
                                {m.nombre}
                            </span>
                        </div>

                        {/* Última actividad */}
                        <div className="col-actividad">
                            <span className="equipo-actividad-texto">
                                {m.ultima_actividad}
                            </span>

                            {m.ultimo_proyecto && (
                                <span className="equipo-proyecto">
                                    <span className="equipo-punto" />
                                    {m.ultimo_proyecto}
                                </span>
                            )}
                        </div>

                        {/* Hora */}
                        <div className="col-hora">
                            {m.hora}
                        </div>

                        {/* Estado */}
                        <div className="col-estado">
                            {m.estado === "EN_CURSO" && (
                                <span className="estado-circulo" />
                            )}
                            <span
                                className={
                                    "estado-texto estado-" +
                                    m.estado.toLowerCase()
                                }
                            >
                                {m.estado_texto}
                            </span>
                        </div>

                        {/* Total + barra */}
                        <div className="col-total">
                            <span className="equipo-total-texto">
                                {formatoTiempo(m.total_segundos)}
                            </span>
                            <div className="equipo-barra-fondo">
                                <div
                                    className="equipo-barra-relleno"
                                    style={{
                                        width: `${m.porcentaje}%`,
                                        backgroundColor: m.color_avatar
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default PanelActividadEquipo;