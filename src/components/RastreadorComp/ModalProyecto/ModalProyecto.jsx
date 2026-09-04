import "./ModalProyecto.css";

import { X } from "lucide-react";
import { useState } from "react";


function ModalProyecto({ cerrar, guardar }) {


    const [nombreProyecto, setNombreProyecto] = useState("");



    const crearProyecto = () => {

        if (!nombreProyecto.trim()) return;


        guardar(nombreProyecto);

        setNombreProyecto("");

        cerrar();

    };



    return (

        <div className="modal-overlay">


            <div className="modal-proyecto">


                {/* HEADER */}

                <div className="modal-header">

                    <h2>
                        Crear nuevo Proyecto
                    </h2>


                    <X
                        size={22}
                        cursor="pointer"
                        onClick={cerrar}
                    />

                </div>




                {/* BODY */}

                <div className="modal-body">


                    {/* FILA SUPERIOR */}

                    <div className="modal-row">


                        <input

                            type="text"

                            placeholder="Introduce el nombre de Proyecto"

                            value={nombreProyecto}

                            onChange={(e)=>
                                setNombreProyecto(e.target.value)
                            }

                        />



                        <select>

                            <option>
                                Seleccionar cliente
                            </option>

                        </select>


                    </div>






                    {/* OPCIONES */}

                    <div className="modal-options">



                        <div className="color-box">

                            <div></div>

                        </div>




                        <label className="public-label">


                            <input

                                type="checkbox"

                                defaultChecked

                            />


                            <span>
                                Público
                            </span>


                        </label>





                        <select className="template-select">


                            <option>
                                Sin plantilla
                            </option>


                        </select>



                    </div>



                </div>







                {/* FOOTER */}

                <div className="modal-footer">


                    <button

                        className="cancelar"

                        onClick={cerrar}

                    >

                        Cancelar

                    </button>





                    <button

                        className="crear"

                        onClick={crearProyecto}

                    >

                        CREAR

                    </button>



                </div>




            </div>



        </div>

    );

}



export default ModalProyecto;