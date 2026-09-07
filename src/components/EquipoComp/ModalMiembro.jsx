import { useState } from "react";
import "./Equipo.css";


function ModalMiembro({

    cerrar,
    enviarInvitacion

}){


    const [correo,setCorreo] = useState("");



    const invitar = ()=>{


        if(!correo){

            return;

        }


        enviarInvitacion(correo);

        cerrar();


    };



    return(

        <div className="modal-overlay">


            <div className="modal-miembro">


                <div className="modal-header">


                    <h2>
                        Invitar nuevo miembro
                    </h2>


                    <button onClick={cerrar}>
                        ×
                    </button>


                </div>



                <div className="modal-body">


                    <label>
                        Correo electrónico
                    </label>


                    <input

                        type="email"

                        placeholder="correo@ejemplo.com"

                        value={correo}

                        onChange={(e)=>
                            setCorreo(e.target.value)
                        }

                    />


                    <p className="mensaje-invitacion">

                        Se enviará una invitación al correo ingresado.

                    </p>



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

                        onClick={invitar}

                    >

                        Enviar invitación

                    </button>



                </div>



            </div>


        </div>


    );

}


export default ModalMiembro;