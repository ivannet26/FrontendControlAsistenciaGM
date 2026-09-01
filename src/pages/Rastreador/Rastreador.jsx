import "./Rastreador.css";

function Rastreador() {

    return (

        <div className="tracker-page">


            <div className="tracker-header">


                <input
                    type="text"
                    placeholder="¿En qué estás trabajando?"
                />


                <button className="project-btn">
                    + Proyecto
                </button>


                <div className="timer">
                    00:00:00
                </div>


                <button className="start-btn">
                    INICIO
                </button>


            </div>



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