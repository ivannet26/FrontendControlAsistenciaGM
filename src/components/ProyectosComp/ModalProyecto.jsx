import { useState } from "react";

import "./Proyectos.css";


function ModalProyecto({
    cerrar,
    guardar
}) {


    const [nombre,setNombre] = useState("");

    const [cliente,setCliente] = useState("");

    const [acceso,setAcceso] = useState("Público");



    const crearProyecto = ()=>{


        const nuevoProyecto = {


            id: Date.now(),


            nombre,


            cliente: cliente || "-",


            horas:"0.00h",


            progreso:"-",


            acceso,


            favorito:false


        };


        guardar(nuevoProyecto);


    };




    return (

        <div className="modal-overlay">


            <div className="modal-proyecto">


                <div className="modal-header">


                    <h2>
                        Crear nuevo proyecto
                    </h2>


                    <button
                        onClick={cerrar}
                    >
                        ×
                    </button>


                </div>




                <div className="modal-body">


                    <label>
                        Nombre del proyecto
                    </label>


                    <input

                        value={nombre}

                        onChange={
                            (e)=>
                            setNombre(e.target.value)
                        }

                        placeholder="Nombre proyecto"

                    />





                    <label>
                        Cliente
                    </label>


                    <input

                        value={cliente}

                        onChange={
                            (e)=>
                            setCliente(e.target.value)
                        }

                        placeholder="Cliente"

                    />






                    <label>
                        Acceso
                    </label>


                    <select

                        value={acceso}

                        onChange={
                            (e)=>
                            setAcceso(e.target.value)
                        }

                    >

                        <option>
                            Público
                        </option>


                        <option>
                            Privado
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

                        onClick={crearProyecto}

                    >

                        Guardar

                    </button>



                </div>



            </div>


        </div>

    );


}


export default ModalProyecto;