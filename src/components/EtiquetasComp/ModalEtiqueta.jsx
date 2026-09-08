import { useState, useEffect } from "react";

import "./ModalEtiqueta.css";


function ModalEtiqueta({

    cerrar,

    guardar,

    etiquetaEditar

}) {


    const [nombre, setNombre] = useState("");



    useEffect(() => {


        if (etiquetaEditar) {

            setNombre(
                etiquetaEditar.nombre
            );

        }
        else {

            setNombre("");

        }


    }, [etiquetaEditar]);





    const guardarEtiqueta = () => {


        if (nombre.trim() === "") return;



        const nuevaEtiqueta = {


            id:

                etiquetaEditar

                    ?

                    etiquetaEditar.id

                    :

                    Date.now(),


            nombre: nombre,


            estado:

                etiquetaEditar

                    ?

                    etiquetaEditar.estado

                    :

                    "Activo"


        };



        guardar(nuevaEtiqueta);


        cerrar();


    };





    return (


        <div className="modal-overlay">



            <div className="modal-etiqueta">



                <div className="modal-header">


                    <h2>

                        {
                            etiquetaEditar

                                ?

                                "Editar etiqueta"

                                :

                                "Añadir nueva etiqueta"

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

                        Cambiar nombre

                    </label>



                    <input

                        value={nombre}

                        onChange={(e) =>

                            setNombre(
                                e.target.value
                            )

                        }

                        placeholder="Nombre de etiqueta"

                    />


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

                        onClick={guardarEtiqueta}

                    >

                        GUARDAR

                    </button>




                </div>




            </div>



        </div>


    );


}


export default ModalEtiqueta;