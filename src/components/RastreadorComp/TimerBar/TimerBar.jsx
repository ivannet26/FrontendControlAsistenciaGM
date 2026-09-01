import "./TimerBar.css";
import ProjectSelector from "../ProjectSelector/ProjectSelector";
import Timer from "../Timer/Timer";
function TimerBar({

    actividad,
    setActividad,
    activo,
    setActivo,
    segundos,
    setSegundos,
    proyecto,
    setProyecto

}) {

    return (

        <div className="tracker-header">


            <input
                type="text"
                placeholder="¿En qué estás trabajando?"
                value={actividad}
                onChange={(e) => setActividad(e.target.value)}
            />


            <ProjectSelector
                setProyecto={setProyecto}
            />



            <Timer
                segundos={segundos}
                setSegundos={setSegundos}
                activo={activo}
            />



            <button
                className="start-btn"
                onClick={() => setActivo(!activo)}
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