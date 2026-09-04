import { Star, MoreVertical } from "lucide-react";

import "./Proyectos.css";


function ProyectoTable({
    proyectos,
    setProyectos
}) {



    const cambiarFavorito = (id) => {


        setProyectos(

            proyectos.map((proyecto) =>


                proyecto.id === id

                    ?

                    {
                        ...proyecto,
                        favorito: !proyecto.favorito
                    }

                    :

                    proyecto

            )

        );


    };



    return (

        <div className="tabla-container">

             <div className="tabla-header">

            <span>
                Proyectos
            </span>


            <button>
                Exportar ▾
            </button>


        </div>

            <table>


                <thead>

                    <tr>

                        <th>
                            <input type="checkbox" />
                        </th>

                        <th>
                            NOMBRE
                        </th>


                        <th>
                            CLIENTE
                        </th>


                        <th>
                            REGISTRADO
                        </th>


                        <th>
                            PROGRESO
                        </th>


                        <th>
                            ACCESO
                        </th>


                        <th className="col-acciones">

                        </th>


                    </tr>

                </thead>



                <tbody>


                    {
                        proyectos.map((proyecto) => (


                            <tr key={proyecto.id}>


                                <td>

                                    <input type="checkbox" />

                                </td>


                                <td>

                                    <span className="nombre-proyecto">
                                        {proyecto.nombre}
                                    </span>

                                </td>



                                <td>

                                    {proyecto.cliente}

                                </td>



                                <td>

                                    {proyecto.horas}

                                </td>



                                <td>

                                    {proyecto.progreso}

                                </td>



                                <td>

                                    {proyecto.acceso}

                                </td>



                                <td className="col-acciones">

                                    <div className="acciones">

                                        <Star
                                            size={20}
                                            className={
                                                proyecto.favorito
                                                    ?
                                                    "star activo"
                                                    :
                                                    "star"
                                            }
                                            onClick={() =>
                                                cambiarFavorito(proyecto.id)
                                            }
                                        />


                                        <MoreVertical
                                            size={20}
                                            className="menu-icon"
                                        />

                                    </div>

                                </td>


                            </tr>


                        ))

                    }


                </tbody>


            </table>



        </div>

    );

}


export default ProyectoTable;