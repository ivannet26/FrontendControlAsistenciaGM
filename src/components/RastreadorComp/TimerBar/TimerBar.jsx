import "./TimerBar.css";

import ProjectSelector from "../ProjectSelector/ProjectSelector";
import Timer from "../Timer/Timer";
import EtiquetaSelector from "../EtiquetaSelector/EtiquetaSelector";


function TimerBar({

    actividad,
    setActividad,

    activo,
    setActivo,

    segundos,
    setSegundos,

    proyecto,
    setProyecto,

    etiquetas = [],
    etiquetasSeleccionadas = [],
    setEtiquetasSeleccionadas,

    detenerTiempo

}) {


    const controlarTimer = () => {


        if (activo) {


            if (detenerTiempo) {
                detenerTiempo();
            }


        }
        else {

            setActivo(true);

        }


    };





    return (

        <div className="tracker-header">



            {/* ACTIVIDAD */}

            <input

                type="text"

                placeholder="¿En qué estás trabajando?"

                value={actividad}

                onChange={(e) =>

                    setActividad(e.target.value)

                }

            />







            {/* PROYECTO */}

            <ProjectSelector

                proyecto={proyecto}

                setProyecto={setProyecto}

            />







            {/* ETIQUETAS */}

            <EtiquetaSelector


                etiquetas={etiquetas}


                etiquetasSeleccionadas={
                    etiquetasSeleccionadas
                }


                setEtiquetasSeleccionadas={
                    setEtiquetasSeleccionadas
                }


            />
            {
                etiquetasSeleccionadas.length > 0 &&

                <div className="etiquetas-activas">

                    {
                        etiquetasSeleccionadas.map(e => (

                            <span key={e.id}>

                                {e.nombre}

                            </span>

                        ))
                    }

                </div>

            }






            {/* TIEMPO */}

            <Timer

                segundos={segundos}

                setSegundos={setSegundos}

                activo={activo}

            />








            {/* BOTON */}

            <button

                className="start-btn"

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