import "./ModalTarea.css";
import { useState } from "react";


function ModalTarea({ cerrar, guardar }) {


    const [nombreTarea, setNombreTarea] = useState("");



    const crear = ()=>{

        if(!nombreTarea.trim()) return;


        guardar(nombreTarea);


        setNombreTarea("");

        cerrar();

    }



    return (

        <div className="modal-overlay">


            <div className="modal-tarea">


                <div className="modal-header">

                    <h2>
                        Crear Tarea
                    </h2>


                    <span onClick={cerrar}>
                        ✕
                    </span>

                </div>



                <input

                    type="text"

                    placeholder="Nombre de la tarea"

                    value={nombreTarea}

                    onChange={(e)=>
                        setNombreTarea(e.target.value)
                    }

                />



                <div className="modal-footer">


                    <button
                        className="cancelar"
                        onClick={cerrar}
                    >
                        Cancelar
                    </button>


                    <button
                        className="guardar"
                        onClick={crear}
                    >
                        GUARDAR
                    </button>


                </div>



            </div>



        </div>


    )


}


export default ModalTarea;