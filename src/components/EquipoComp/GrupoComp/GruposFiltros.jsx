import { Search } from "lucide-react";
import "../Equipo.css";                  // 👈 sube un nivel
import "./GruposFiltros.css";            // 👈 su propio CSS


function GruposFiltros({
    busqueda,
    setBusqueda,
    nuevoGrupo,
    setNuevoGrupo,
    onCrear
}) {

    return (
        <div className="grupos-toolbar">

            <div className="equipo-buscador">
                <Search size={18} />
                <input
                    placeholder="Buscar por nombre de grupo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="grupos-toolbar-der">

                <input
                    className="input-nuevo-grupo"
                    placeholder="Añadir nuevo grupo"
                    value={nuevoGrupo}
                    onChange={(e) => setNuevoGrupo(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onCrear();
                    }}
                />

                <button
                    className="btn-anadir-grupo"
                    onClick={onCrear}
                >
                    AÑADIR
                </button>

            </div>

        </div>
    );
}

export default GruposFiltros;