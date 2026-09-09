import "./TimerBar.css";

import ProjectSelector from "../ProjectSelector/ProjectSelector";
import Timer from "../Timer/Timer";
import EtiquetaSelector from "../EtiquetaSelector/EtiquetaSelector";


function TimerBar({

    actividad,
    setActividad,

    activo,
    segundos,
    setSegundos,

    proyecto,
    setProyecto,
    tarea,
    setTarea,

    etiquetas,

    etiquetasSeleccionadas,
    setEtiquetasSeleccionadas,

    iniciarTiempo,
    detenerTiempo,

    bloqueado

}) {


    const controlarTimer = () => {


        if (activo) {

            detenerTiempo();

        }
        else {


            if (!actividad.trim()) {

                alert("Ingrese una actividad");

                return;

            }


            iniciarTiempo();

        }


    };




    return (

        <div className="tracker-header">



            {/* ACTIVIDAD */}

            <input

                type="text"

                placeholder="¿En qué estás trabajando?"

                value={actividad}

                disabled={bloqueado}

                onChange={(e) =>

                    setActividad(e.target.value)

                }

            />





            {/* PROYECTO */}

            <ProjectSelector

                proyecto={proyecto}

                setProyecto={setProyecto}
                tarea={tarea}
                setTarea={setTarea}


                bloqueado={bloqueado}

            />
            {
                tarea && (

                    <div className="tarea-activa">

                        {tarea.nombre}

                    </div>

                )
            }






            {/* ETIQUETAS */}

            <div className="zona-etiquetas">

                {
                    etiquetasSeleccionadas.length === 0 && (

                        <EtiquetaSelector

                            etiquetas={etiquetas}

                            etiquetasSeleccionadas={
                                etiquetasSeleccionadas
                            }

                            setEtiquetasSeleccionadas={
                                setEtiquetasSeleccionadas
                            }

                            bloqueado={bloqueado}

                        />

                    )
                }


                {
                    etiquetasSeleccionadas.length > 0 && (

                        <div className="etiquetas-activas">

                            {
                                etiquetasSeleccionadas.map(e => (

                                    <span
                                        key={e.id}
                                        className="etiqueta-activa"
                                    >

                                        {e.nombre}

                                    </span>

                                ))
                            }


                            {/* botón para agregar más */}

                            {
                                !bloqueado && (

                                    <EtiquetaSelector

                                        etiquetas={etiquetas}

                                        etiquetasSeleccionadas={
                                            etiquetasSeleccionadas
                                        }

                                        setEtiquetasSeleccionadas={
                                            setEtiquetasSeleccionadas
                                        }

                                        bloqueado={bloqueado}

                                    />

                                )
                            }


                        </div>

                    )
                }


            </div>















            {/* TIEMPO */}

            <Timer

                segundos={segundos}

                setSegundos={setSegundos}

                activo={activo}

            />







            {/* BOTON */}

            <button

                className={

                    activo

                        ?

                        "stop-btn"

                        :

                        "start-btn"

                }

                onClick={controlarTimer}

            >


                {

                    activo

                        ?

                        "DETENER"

                        :

                        "INICIO"

                }


            </button>



        </div>


    );

}


export default TimerBar;