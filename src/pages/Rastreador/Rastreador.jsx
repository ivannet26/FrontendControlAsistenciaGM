import "./Rastreador.css";

import { useState } from "react";

import TimerBar from "../../components/RastreadorComp/TimerBar/TimerBar";


function Rastreador() {


    const [actividad, setActividad] = useState("");

    const [activo, setActivo] = useState(false);

    const [proyecto, setProyecto] = useState(null);
    const [segundos, setSegundos] = useState(0);


    return (

        <div className="tracker-page">


            <TimerBar

                actividad={actividad}

                setActividad={setActividad}

                activo={activo}

                setActivo={setActivo}

                segundos={segundos}

                setSegundos={setSegundos}

                proyecto={proyecto}

                setProyecto={setProyecto}

            />



            <div className="tracker-content">


                <div className="tracker-card">


                    <div className="clock-icon">

                        ⏱️

                    </div>


                    <h2>

                        ¡Empecemos a rastrear!

                    </h2>


                    <p>

                        Inicia tu jornada y registra

                        tu tiempo de asistencia.

                    </p>


                </div>


            </div>


        </div>

    );

}


export default Rastreador;