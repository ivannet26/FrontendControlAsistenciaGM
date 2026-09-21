import { deslogearUsuario, reactivarUsuario } from '../../services/authService';
import toast from "react-hot-toast";

function PanelActividadEquipo({ miembros }) {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esAdmin = ['ADMINISTRACION', 'ADMINISTRADOR', 'ADMIN']
        .includes((usuarioLogueado?.rol || '').toUpperCase());

    const formatoTiempo = (seg) => {
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        const s = seg % 60;
        return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
    };

    async function handleDeslogear(usuarioId, nombre) {
        if (!confirm(`¿Desconectar a ${nombre}?`)) return;
        try {
            const data = await deslogearUsuario(usuarioId);
            toast.success(data.mensaje);
            window.location.reload();
        } catch (err) {
            toast.error(err.message);
        }
    }

    async function handleReactivar(usuarioId, nombre) {
        if (!confirm(`¿Reactivar a ${nombre}?`)) return;
        try {
            const data = await reactivarUsuario(usuarioId);
            toast.success(data.mensaje);
            window.location.reload();
        } catch (err) {
            toast.error(err.message);
        }
    }

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
                {esAdmin && <div className="col-acciones">ACCIONES</div>}
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

                        {/* Botón condicional: Desconectar o Reactivar */}
                        {esAdmin && !m.es_usuario_actual && (
                            <div className="col-acciones">
                                {m.activo === false ? (
                                    <button
                                        className="btn-reactivar"
                                        onClick={() => handleReactivar(m.id, m.nombre)}
                                        title="Reactivar la cuenta de este usuario"
                                    >
                                        Reactivar
                                    </button>
                                ) : (
                                    <button
                                        className="btn-desconectar"
                                        onClick={() => handleDeslogear(m.id, m.nombre)}
                                        title="Cerrar la sesión de este usuario"
                                    >
                                        Desconectar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}

export default PanelActividadEquipo;