import { Search } from "lucide-react";

import "./Proyectos.css";


function ProyectoFiltros(){


    return (

        <div className="filtros-container">


            <div className="filtro-titulo">

                FILTRAR

            </div>



            <select>

                <option>
                    Activo
                </option>

                <option>
                    Inactivo
                </option>

            </select>




            <select>

                <option>
                    Cliente
                </option>

            </select>




            <select>

                <option>
                    Acceso
                </option>


                <option>
                    Público
                </option>


                <option>
                    Privado
                </option>


            </select>





            <div className="buscador">


                <Search size={18}/>


                <input

                    placeholder="Buscar proyecto"

                />


            </div>




            <button>

                APLICAR FILTRO

            </button>



        </div>

    );

}


export default ProyectoFiltros;