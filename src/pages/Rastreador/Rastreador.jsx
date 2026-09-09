import "./Rastreador.css";

import { useState } from "react";

import TimerBar from "../../components/RastreadorComp/TimerBar/TimerBar";


function Rastreador() {

    const [actividad, setActividad] = useState("");

    const [activo, setActivo] = useState(false);

    const [proyecto, setProyecto] = useState(null);

    const [tarea, setTarea] = useState(null);

    const [segundos, setSegundos] = useState(0);

    const [horaInicio, setHoraInicio] = useState(null);

    const [bloqueado, setBloqueado] = useState(false);

    const [registros, setRegistros] = useState([]);



    const [etiquetas] = useState([

        {
            id: 1,
            nombre: "Análisis"
        },

        {
            id: 2,
            nombre: "Programación"
        },

        {
            id: 3,
            nombre: "Desarrollo Frontend"
        },

        {
            id: 4,
            nombre: "Desarrollo Backend"
        },

        {
            id: 5,
            nombre: "Base de Datos"
        },

        {
            id: 6,
            nombre: "SQL"
        },

        {
            id: 7,
            nombre: "PostgreSQL"
        },

        {
            id: 8,
            nombre: "Testing"
        }

    ]);



    const [
        etiquetasSeleccionadas,
        setEtiquetasSeleccionadas
    ] = useState([]);




    // INICIAR TIMER

    const iniciarTiempo = () => {


        if (!actividad.trim()) {

            alert("Ingrese actividad");

            return;

        }


        if (!proyecto) {

            alert("Seleccione un proyecto");

            return;

        }



        setHoraInicio(new Date());

        setSegundos(0);

        setActivo(true);

        setBloqueado(true);


    };






    // DETENER TIMER Y GUARDAR

    const detenerTiempo = () => {


        const horaFin = new Date();



        const nuevoRegistro = {


            id: Date.now(),


            actividad,


            proyecto,


            tarea,


            etiquetas:
                etiquetasSeleccionadas,


            horaInicio,


            horaFin,


            tiempo: segundos,


            fecha: new Date()

        };



        setRegistros([

            ...registros,

            nuevoRegistro

        ]);



        setActivo(false);

        setBloqueado(false);



        setSegundos(0);

        setHoraInicio(null);



        setActividad("");

        setProyecto(null);

        setTarea(null);

        setEtiquetasSeleccionadas([]);



    };





    const formatoTiempo = (seg) => {


        const h = Math.floor(seg / 3600);

        const m = Math.floor((seg % 3600) / 60);

        const s = seg % 60;


        return (

            String(h).padStart(2, "0")
            +
            ":"
            +
            String(m).padStart(2, "0")
            +
            ":"
            +
            String(s).padStart(2, "0")

        );

    };





    const formatoHora = (fecha) => {


        if (!fecha)
            return "";


        return fecha.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    };





    const totalTiempo = registros.reduce(

        (total, r) =>

            total + r.tiempo

        , 0);







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


                tarea={tarea}
                setTarea={setTarea}


                etiquetas={etiquetas}


                etiquetasSeleccionadas={
                    etiquetasSeleccionadas
                }


                setEtiquetasSeleccionadas={
                    setEtiquetasSeleccionadas
                }


                iniciarTiempo={iniciarTiempo}


                detenerTiempo={detenerTiempo}


                bloqueado={bloqueado}

            />





            <div className="registro-container">


                <div className="registro-header">


                    <span>
                        Hoy
                    </span>


                    <div className="registro-total">

                        Total:

                        <strong>

                            {formatoTiempo(totalTiempo)}

                        </strong>


                    </div>


                </div>






                {
                    registros.map(registro => (


                        <div
                            className="registro-row"
                            key={registro.id}
                        >


                            <div className="registro-actividad">

                                {registro.actividad}

                            </div>




                            <div className="registro-proyecto">

                                <span className="punto"></span>

                                <span>

                                    {registro.proyecto?.nombre || "Sin proyecto"}

                                    {
                                        registro.tarea &&
                                        <>
                                            {" - "}
                                            <span className="registro-tarea">
                                                {registro.tarea.nombre}
                                            </span>
                                        </>
                                    }

                                </span>


                            </div>





                            <div className="registro-tags">


                                {
                                    registro.etiquetas.map(e => (

                                        <span
                                            className="tag"
                                            key={e.id}
                                        >

                                            {e.nombre}

                                        </span>

                                    ))

                                }


                            </div>





                            <div className="registro-hora">

                                {formatoHora(registro.horaInicio)}

                                -

                                {formatoHora(registro.horaFin)}

                            </div>





                            <div className="registro-tiempo">

                                {formatoTiempo(registro.tiempo)}

                            </div>




                            <div className="registro-actions">

                                <button>
                                    ▶
                                </button>


                                <button>
                                    ⋮
                                </button>


                            </div>




                        </div>


                    ))

                }



            </div>





        </div>


    );


}


export default Rastreador;