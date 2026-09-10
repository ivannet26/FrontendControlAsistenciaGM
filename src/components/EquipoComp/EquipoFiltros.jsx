import { Search } from "lucide-react";
import "./Equipo.css";
import { useEffect, useRef } from "react";


function EquipoFiltros({

    busqueda,
    setBusqueda,

    rolFiltro,
    setRolFiltro,

    grupoFiltro,
    setGrupoFiltro,

    estadoFiltro,
    setEstadoFiltro,

    filtroAbierto,
    setFiltroAbierto,

    grupos = []

}) {


    const filtroRef = useRef();


    useEffect(() => {

        const cerrarMenu = (e) => {

            if (
                filtroRef.current &&
                !filtroRef.current.contains(e.target)
            ) {
                setFiltroAbierto(null);
            }

        };

        document.addEventListener("mousedown", cerrarMenu);

        return () => {
            document.removeEventListener("mousedown", cerrarMenu);
        };

    }, [setFiltroAbierto]);



    const abrirFiltro = (nombre) => {

        setFiltroAbierto(
            filtroAbierto === nombre ? null : nombre
        );

    };



    return (

        <div className="equipo-filtros" ref={filtroRef}>

            <div className="filtros-izquierda">

                <span className="filtro-titulo">
                    FILTRAR
                </span>


                {/* ESTADO */}

                <div className="filtro-dropdown">

                    <button
                        className="filtro-btn"
                        onClick={() => abrirFiltro("estado")}
                    >
                        Estado ▾
                    </button>

                    {filtroAbierto === "estado" && (
                        <div className="dropdown-panel">

                            <label>
                                <input
                                    type="checkbox"
                                    checked={estadoFiltro === "Todos"}
                                    onChange={() => setEstadoFiltro("Todos")}
                                />
                                Todos
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={estadoFiltro === "ACTIVO"}
                                    onChange={(e) =>
                                        setEstadoFiltro(e.target.checked ? "ACTIVO" : "Todos")
                                    }
                                />
                                Activo
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={estadoFiltro === "INACTIVO"}
                                    onChange={(e) =>
                                        setEstadoFiltro(e.target.checked ? "INACTIVO" : "Todos")
                                    }
                                />
                                Inactivo
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={estadoFiltro === "INVITADO"}
                                    onChange={(e) =>
                                        setEstadoFiltro(e.target.checked ? "INVITADO" : "Todos")
                                    }
                                />
                                Invitado
                            </label>

                        </div>
                    )}

                </div>


                {/* ROL */}

                <div className="filtro-dropdown">

                    <button
                        className="filtro-btn"
                        onClick={() => abrirFiltro("rol")}
                    >
                        Rol ▾
                    </button>

                    {filtroAbierto === "rol" && (
                        <div className="dropdown-panel">

                            <label>
                                <input
                                    type="checkbox"
                                    checked={rolFiltro === "Todos"}
                                    onChange={() => setRolFiltro("Todos")}
                                />
                                Todos
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={rolFiltro === "ADMINISTRACION"}
                                    onChange={(e) =>
                                        setRolFiltro(e.target.checked ? "ADMINISTRACION" : "Todos")
                                    }
                                />
                                Administración
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={rolFiltro === "MIEMBRO"}
                                    onChange={(e) =>
                                        setRolFiltro(e.target.checked ? "MIEMBRO" : "Todos")
                                    }
                                />
                                Miembro
                            </label>

                        </div>
                    )}

                </div>


                {/* GRUPO */}

                <div className="filtro-dropdown">

                    <button
                        className="filtro-btn"
                        onClick={() => abrirFiltro("grupo")}
                    >
                        Grupo ▾
                    </button>

                    {filtroAbierto === "grupo" && (
                        <div className="dropdown-panel">

                            <label>
                                <input
                                    type="checkbox"
                                    checked={grupoFiltro === "Todos"}
                                    onChange={() => setGrupoFiltro("Todos")}
                                />
                                Todos
                            </label>

                            {grupos.map(g => (
                                <label key={g.id}>
                                    <input
                                        type="checkbox"
                                        checked={grupoFiltro === g.nombre}
                                        onChange={(e) =>
                                            setGrupoFiltro(e.target.checked ? g.nombre : "Todos")
                                        }
                                    />
                                    {g.nombre}
                                </label>
                            ))}

                        </div>
                    )}

                </div>

            </div>


            {/* PARTE DERECHA */}

            <div className="filtros-derecha">

                <div className="equipo-buscador">

                    <Search size={18} />

                    <input
                        placeholder="Buscar por nombre o correo"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />

                </div>

                <button className="aplicar-btn">
                    APLICAR FILTRO
                </button>

            </div>

        </div>

    );

}


export default EquipoFiltros;