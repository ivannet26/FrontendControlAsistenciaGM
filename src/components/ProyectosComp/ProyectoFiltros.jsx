import { Search } from "lucide-react";
import "./Proyectos.css";


function ProyectoFiltros({
    busqueda,
    setBusqueda,
    estadoFiltro,
    setEstadoFiltro,
    clienteFiltro,
    setClienteFiltro,
    clientes = []
}) {

    return (
        <div className="filtros-container">

            <div className="filtro-titulo">
                FILTRAR
            </div>

            <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
            >
                <option value="TODO">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="ARCHIVADO">Archivado</option>
            </select>

            <select
                value={clienteFiltro}
                onChange={(e) => setClienteFiltro(e.target.value)}
            >
                <option value="TODOS">Todos los clientes</option>
                {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.nombre}
                    </option>
                ))}
            </select>

            <div className="buscador">
                <Search size={18} />
                <input
                    placeholder="Buscar proyecto"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <button>
                APLICAR FILTRO
            </button>

        </div>
    );
}

export default ProyectoFiltros;