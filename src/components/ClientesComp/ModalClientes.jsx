import { useState } from "react";
import "../ClientesComp/ModalClientes.css";


function ModalCliente({

    cerrar,
    guardar,
    clienteEditar

}) {


    const [nombre,setNombre] = useState(
        clienteEditar?.nombre || ""
    );


    const [direccion,setDireccion] = useState(
        clienteEditar?.direccion || ""
    );


    const [moneda,setMoneda] = useState(
        clienteEditar?.moneda || "SOL"
    );




    const guardarCliente = ()=>{


        const nuevoCliente = {


            id: clienteEditar

                ?

                clienteEditar.id

                :

                Date.now(),


            nombre,

            direccion,

            moneda,

            estado:"Activo"


        };



        guardar(nuevoCliente);

        cerrar();


    };







    return(

        <div className="modal-overlay">



            <div className="modal-cliente">





                <div className="modal-header">


                    <h2>

                        {
                            clienteEditar

                            ?

                            "Editar cliente"

                            :

                            "Añadir nuevo cliente"

                        }

                    </h2>



                    <button

                        onClick={cerrar}

                    >

                        ×

                    </button>


                </div>









                <div className="modal-body">



                    <label>

                        Nombre

                    </label>


                    <input

                        placeholder="Nombre del cliente"

                        value={nombre}

                        onChange={(e)=>

                            setNombre(e.target.value)

                        }

                    />







                    <label>

                        Dirección

                    </label>



                    <input

                        placeholder="Dirección"

                        value={direccion}

                        onChange={(e)=>

                            setDireccion(e.target.value)

                        }

                    />









                    <label>

                        Moneda

                    </label>



                    <select

                        value={moneda}

                        onChange={(e)=>

                            setMoneda(e.target.value)

                        }

                    >


                        <option value="SOL">

                            SOL

                        </option>


                        <option value="USD">

                            USD

                        </option>



                    </select>




                </div>







                <div className="modal-footer">


                    <button

                        className="cancelar"

                        onClick={cerrar}

                    >

                        Cancelar

                    </button>





                    <button

                        className="guardar"

                        onClick={guardarCliente}

                    >

                        Guardar

                    </button>


                </div>






            </div>


        </div>


    );


}



export default ModalCliente;