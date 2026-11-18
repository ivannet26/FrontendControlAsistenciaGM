import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";

function PanelFiltros({
    usuarioFiltro,
    setUsuarioFiltro,
    fechaInicio,
    fechaFin,
    onCambiarRango
}) {

    const [menuAbierto, setMenuAbierto] = useState(false);
    const refUsuario = useRef(null);

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

    const cambiarInicio = (e) => {
        const nuevoInicio = e.target.value;
        if (!nuevoInicio) return;
        const nuevoFin = nuevoInicio > fechaFin ? nuevoInicio : fechaFin;
        onCambiarRango(nuevoInicio, nuevoFin);
    };

    const cambiarFin = (e) => {
        const nuevoFin = e.target.value;
        if (!nuevoFin) return;
        const nuevoInicio = nuevoFin < fechaInicio ? nuevoFin : fechaInicio;
        onCambiarRango(nuevoInicio, nuevoFin);
    };

    return (
        <div className="panel-header">

            <h1>Panel</h1>

            <div className="panel-actions">

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

                <div className="panel-rango">
                    <Calendar size={14} />

                    <label>
                        <span>Desde</span>
                        <input
                            type="date"
                            value={fechaInicio}
                            max={fechaFin}
                            onChange={cambiarInicio}
                        />
                    </label>

                    <span className="panel-rango-separador">—</span>

                    <label>
                        <span>Hasta</span>
                        <input
                            type="date"
                            value={fechaFin}
                            min={fechaInicio}
                            onChange={cambiarFin}
                        />
                    </label>
                </div>

            </div>

        </div>
    );
}

export default PanelFiltros;