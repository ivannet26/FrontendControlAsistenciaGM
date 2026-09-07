import EquipoAcciones from "./EquipoAcciones";
import "./Equipo.css";


function EquipoTable({

    miembros,
    eliminarMiembro,
    editarMiembro

}) {


    return (

        <div className="equipo-tabla-container">


            <div className="tabla-header">


                <span>
                    Miembros
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
                            CORREO ELECTRÓNICO
                        </th>



                        <th>
                            ROL
                        </th>



                        <th>
                            GRUPO
                        </th>



                        <th className="col-acciones">

                        </th>



                    </tr>


                </thead>



                <tbody>


                    {
                        miembros.map((miembro) => (


                            <tr key={miembro.id}>


                                <td>
                                    <input type="checkbox" />
                                </td>



                                <td>

                                    {miembro.nombre}

                                </td>



                                <td>

                                    {miembro.correo}

                                </td>



                                <td>


                                    <span className="rol-badge">

                                        {miembro.rol}

                                    </span>


                                </td>



                                <td>


                                    <span className="grupo-badge">

                                        {miembro.grupo}

                                    </span>


                                </td>



                                <td className="col-acciones">


                                    <EquipoAcciones

                                        miembro={miembro}

                                        eliminar={eliminarMiembro}
                                        editar={editarMiembro}

                                    />

                                </td>



                            </tr>


                        ))
                    }


                </tbody>



            </table>



        </div>


    );

}


export default EquipoTable;