import { Search } from "lucide-react";
import "./Equipo.css";
import { useEffect, useRef } from "react";


function EquipoFiltro({

    busqueda,
    setBusqueda,

    rolFiltro,
    setRolFiltro,

    grupoFiltro,
    setGrupoFiltro,

    estadoFiltro,
    setEstadoFiltro,

    filtroAbierto,
    setFiltroAbierto

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


        document.addEventListener(
            "mousedown",
            cerrarMenu
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                cerrarMenu
            );

        };


    }, [setFiltroAbierto]);





    const abrirFiltro = (nombre) => {


        setFiltroAbierto(

            filtroAbierto === nombre

                ?

                null

                :

                nombre

        );


    };





    return (


        <div
            className="equipo-filtros"
            ref={filtroRef}
        >


            <div className="filtros-izquierda">


                <span className="filtro-titulo">
                    FILTRAR
                </span>





                {/* ACTIVO */}

                <div className="filtro-dropdown">


                    <button

                        className="filtro-btn"

                        onClick={() => abrirFiltro("activo")}

                    >

                        Estado ▾

                    </button>



                    {
                        filtroAbierto === "activo" &&

                        <div className="dropdown-panel">


                            <label>

                                <input

                                    type="checkbox"

                                    checked={estadoFiltro === "Activo"}

                                    onChange={(e) => {

                                        setEstadoFiltro(

                                            e.target.checked

                                                ?

                                                "Activo"

                                                :

                                                "Todos"

                                        );

                                    }}

                                />

                                Activo

                            </label>



                            <label>

                                <input

                                    type="checkbox"

                                    checked={estadoFiltro === "Inactivo"}

                                    onChange={(e) => {

                                        setEstadoFiltro(

                                            e.target.checked

                                                ?

                                                "Inactivo"

                                                :

                                                "Todos"

                                        );

                                    }}

                                />

                                Inactivo

                            </label>



                            <label>

                                <input

                                    type="checkbox"

                                    checked={estadoFiltro === "Invitado"}

                                    onChange={(e) => {

                                        setEstadoFiltro(

                                            e.target.checked

                                                ?

                                                "Invitado"

                                                :

                                                "Todos"

                                        );

                                    }}

                                />

                                Invitado

                            </label>


                        </div>
                    }


                </div>







                {/* ROL */}

                <div className="filtro-dropdown">


                    <button

                        className="filtro-btn"

                        onClick={() => abrirFiltro("rol")}

                    >

                        Rol ▾

                    </button>




                    {
                        filtroAbierto === "rol" &&


                        <div className="dropdown-panel">


                            <label>

                                <input

                                    type="checkbox"

                                    checked={rolFiltro === "Administrador"}

                                    onChange={(e) =>

                                        setRolFiltro(

                                            e.target.checked

                                                ?

                                                "Administrador"

                                                :

                                                "Todos"

                                        )

                                    }

                                />

                                Administrador

                            </label>





                            <label>

                                <input

                                    type="checkbox"

                                    checked={rolFiltro === "Miembro"}

                                    onChange={(e) =>

                                        setRolFiltro(

                                            e.target.checked

                                                ?

                                                "Miembro"

                                                :

                                                "Todos"

                                        )

                                    }

                                />

                                Miembro

                            </label>





                            <label>

                                <input

                                    type="checkbox"

                                    checked={rolFiltro === "Propietario"}

                                    onChange={(e) =>

                                        setRolFiltro(

                                            e.target.checked

                                                ?

                                                "Propietario"

                                                :

                                                "Todos"

                                        )

                                    }

                                />

                                Propietario

                            </label>




                        </div>


                    }



                </div>








                {/* GRUPO */}


                <div className="filtro-dropdown">


                    <button

                        className="filtro-btn"

                        onClick={() => abrirFiltro("grupo")}

                    >

                        Grupo ▾

                    </button>



                    {

                        filtroAbierto === "grupo" &&


                        <div className="dropdown-panel">



                            <label>

                                <input

                                    type="checkbox"

                                    checked={grupoFiltro === "Sistemas"}

                                    onChange={(e) =>

                                        setGrupoFiltro(

                                            e.target.checked

                                                ?

                                                "Sistemas"

                                                :

                                                "Todos"

                                        )

                                    }

                                />

                                Sistemas

                            </label>





                            <label>

                                <input

                                    type="checkbox"

                                    checked={grupoFiltro === "Área técnica"}

                                    onChange={(e) =>

                                        setGrupoFiltro(

                                            e.target.checked

                                                ?

                                                "Área técnica"

                                                :

                                                "Todos"

                                        )

                                    }

                                />

                                Área técnica

                            </label>




                        </div>


                    }



                </div>



            </div>








            {/* PARTE DERECHA */}


            <div className="filtros-derecha">



                <div className="equipo-buscador">


                    <Search size={18} />


                    <input

                        placeholder="Buscar por nombre o correo"

                        value={busqueda}

                        onChange={(e) =>

                            setBusqueda(e.target.value)

                        }

                    />


                </div>





                <button className="aplicar-btn">

                    APLICAR FILTRO

                </button>



            </div>





        </div>



    );


}



export default EquipoFiltro;