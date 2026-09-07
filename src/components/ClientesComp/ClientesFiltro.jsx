import "./ClientesFiltro.css";
import { Search } from "lucide-react";



function ClientesFiltro({

    busqueda,
    setBusqueda,

    estadoFiltro,
    setEstadoFiltro

}) {



    return(

        <div className="clientes-filtros">



            <div className="filtros-izquierda">


                <span className="filtro-titulo">

                    FILTRAR

                </span>




                <select

                    value={estadoFiltro}

                    onChange={(e)=>

                        setEstadoFiltro(e.target.value)

                    }

                >


                    <option value="Todos">

                        Mostrar todo

                    </option>


                    <option value="Activo">

                        Activo

                    </option>


                    <option value="Archivado">

                        Archivado

                    </option>


                </select>



            </div>







            <div className="filtros-derecha">



                <div className="clientes-buscador">


                    <Search size={18}/>


                    <input


                        placeholder="Buscar cliente"


                        value={busqueda}


                        onChange={(e)=>

                            setBusqueda(e.target.value)

                        }


                    />


                </div>





                {/*<button className="aplicar-btn">

                    APLICAR FILTRO

                </button>*/ }



            </div>




        </div>


    );

}



export default ClientesFiltro;