import "./Rastreador.css";

import { useState } from "react";

import TimerBar from "../../components/RastreadorComp/TimerBar/TimerBar";



function Rastreador() {


    const [actividad, setActividad] = useState("");

    const [activo, setActivo] = useState(false);

    const [proyecto, setProyecto] = useState(null);

    const [segundos, setSegundos] = useState(0);


    const [registros, setRegistros] = useState([]);



    // ETIQUETAS TEMPORALES
    const [etiquetas, setEtiquetas] = useState([

        {
            id:1,
            nombre:"Análisis",
            estado:"Activo"
        },

        {
            id:2,
            nombre:"Programación",
            estado:"Activo"
        },

        {
            id:3,
            nombre:"Desarrollo Frontend",
            estado:"Activo"
        },

        {
            id:4,
            nombre:"Desarrollo Backend",
            estado:"Activo"
        },

        {
            id:5,
            nombre:"Base de Datos",
            estado:"Activo"
        },

        {
            id:6,
            nombre:"SQL",
            estado:"Activo"
        },

        {
            id:7,
            nombre:"PostgreSQL",
            estado:"Activo"
        },

        {
            id:8,
            nombre:"Testing",
            estado:"Activo"
        }

    ]);



    // MULTIPLES ETIQUETAS SELECCIONADAS

    const [
        etiquetasSeleccionadas,
        setEtiquetasSeleccionadas

    ] = useState([]);




    const detenerTiempo = () => {


        setActivo(false);



        const nuevoRegistro = {


            id: Date.now(),


            actividad,


            proyecto,


            etiquetas: etiquetasSeleccionadas,


            tiempo: segundos,


            fecha: new Date()


        };




        setRegistros([

            ...registros,

            nuevoRegistro

        ]);




        setSegundos(0);


        setActividad("");

        setProyecto(null);

        setEtiquetasSeleccionadas([]);



    };





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




                etiquetas={etiquetas}



                etiquetasSeleccionadas={
                    etiquetasSeleccionadas
                }



                setEtiquetasSeleccionadas={
                    setEtiquetasSeleccionadas
                }



                detenerTiempo={detenerTiempo}



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