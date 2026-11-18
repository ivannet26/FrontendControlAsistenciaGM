import "./TimerBar.css";

import ProjectSelector from "../ProjectSelector/ProjectSelector";
import Timer from "../Timer/Timer";
import EtiquetaSelector from "../EtiquetaSelector/EtiquetaSelector";


/* Etiquetas visibles antes de agrupar el resto en el badge "+N". */
const MAX_ETIQUETAS_VISIBLES = 2;


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

                        {proyecto && <span className="tarea-separador"> - </span>}
                        <span className="tarea-nombre">{tarea.nombre}</span>
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

                            {/* Primeras etiquetas + badge con el resto */}
                            {
                                etiquetasSeleccionadas
                                    .slice(0, MAX_ETIQUETAS_VISIBLES)
                                    .map(e => (

                                        <span
                                            key={e.id}
                                            className="etiqueta-activa"
                                            title={e.nombre}
                                        >
                                            <span className="etiqueta-texto">
                                                {e.nombre}
                                            </span>
                                        </span>

                                    ))
                            }

                            {
                                etiquetasSeleccionadas.length > MAX_ETIQUETAS_VISIBLES && (

                                    <span
                                        className="etiqueta-activa etiqueta-mas"
                                        title={etiquetasSeleccionadas
                                            .slice(MAX_ETIQUETAS_VISIBLES)
                                            .map(e => e.nombre)
                                            .join(", ")}
                                    >
                                        +{etiquetasSeleccionadas.length - MAX_ETIQUETAS_VISIBLES}
                                    </span>

                                )
                            }


                            {/* botón para agregar más */}
                            {
                                !bloqueado && (

                                    <EtiquetaSelector
                                        etiquetas={etiquetas}
                                        etiquetasSeleccionadas={etiquetasSeleccionadas}
                                        setEtiquetasSeleccionadas={setEtiquetasSeleccionadas}
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