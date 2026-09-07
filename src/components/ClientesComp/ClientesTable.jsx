import { MoreVertical } from "lucide-react";
import "./ClientesTable.css";


function ClientesTable({

    clientes,
    eliminarCliente,
    editarCliente

}) {



    return(

        <div className="clientes-tabla-container">



            <div className="tabla-header">


                <span>

                    Clientes

                </span>



                <button>

                    Exportar ▾

                </button>


            </div>







            <table>



                <thead>


                    <tr>


                        <th>

                            <input type="checkbox"/>

                        </th>



                        <th>

                            NOMBRE

                        </th>



                        <th>

                            DIRECCIÓN

                        </th>



                        <th>

                            MONEDA

                        </th>



                        <th className="col-acciones">

                        </th>


                    </tr>


                </thead>








                <tbody>



                    {

                        clientes.map((cliente)=>(



                            <tr key={cliente.id}>


                                <td>

                                    <input type="checkbox"/>

                                </td>




                                <td>

                                    {cliente.nombre}

                                </td>





                                <td>

                                    {cliente.direccion}

                                </td>





                                <td>


                                    <span className="moneda-badge">

                                        {cliente.moneda}

                                    </span>


                                </td>






                                <td className="col-acciones">


                                    <div className="cliente-acciones">


                                        <button

                                            onClick={()=>editarCliente(cliente)}

                                        >

                                            ✏

                                        </button>



                                        <MoreVertical

                                            size={18}

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



export default ClientesTable;