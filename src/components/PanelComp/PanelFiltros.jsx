import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from "lucide-react";

function PanelFiltros({
    labelSemana,
    usuarioFiltro,
    setUsuarioFiltro,
    onAnterior,
    onSiguiente,
    puedeAvanzar,
    fechaInicio,
    fechaFin
}) {

    const [menuAbierto, setMenuAbierto] = useState(false);
    const refUsuario = useRef(null);

    // Verificar si el usuario es administrador
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const ROLES_ADMIN = ["ADMINISTRACION", "ADMINISTRADOR"];
    const esAdmin = ROLES_ADMIN.includes(usuario?.rol);


    useEffect(() => {
        const cerrar = (e) => {
            if (refUsuario.current && !refUsuario.current.contains(e.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, []);


    // Formatear: 2026-09-14 → 14/09/2026
    const formatearFecha = (iso) => {
        if (!iso) return "—";
        const [y, m, d] = iso.split("-");
        return `${d}/${m}/${y}`;
    };


    return (
        <div className="panel-header">

            <h1>Panel</h1>

            <div className="panel-actions">

                {/* Dropdown admin */}
                {esAdmin ? (
                    <div className="panel-user-selector" ref={refUsuario}>
                        <button onClick={() => setMenuAbierto(!menuAbierto)}>
                            {usuarioFiltro === "yo" ? "Solo yo" : "Equipo"}
                            <ChevronDown size={14} />
                        </button>

                        {menuAbierto && (
                            <div className="panel-user-menu">
                                <button
                                    onClick={() => {
                                        setUsuarioFiltro("yo");
                                        setMenuAbierto(false);
                                    }}
                                >
                                    Solo yo
                                </button>
                                <button
                                    onClick={() => {
                                        setUsuarioFiltro("equipo");
                                        setMenuAbierto(false);
                                    }}
                                >
                                    Equipo
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="panel-user-label">
                        Solo yo
                    </div>
                )}

                {/* Selector de semana CON FECHAS */}
                <div className="panel-date-selector">
                    <button onClick={onAnterior} title="Semana anterior">
                        <ChevronLeft size={16} />
                    </button>

                    <span>
                        <Calendar size={14} />
                        {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
                    </span>

                    <button
                        onClick={onSiguiente}
                        disabled={!puedeAvanzar}
                        title="Semana siguiente"
                        style={{
                            opacity: puedeAvanzar ? 1 : 0.3,
                            cursor: puedeAvanzar ? "pointer" : "not-allowed"
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

            </div>

        </div>
    );
}

export default PanelFiltros;