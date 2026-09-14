import "./Rastreador.css";

import {
    useState,
    useEffect
} from "react";

import TimerBar from "../../components/RastreadorComp/TimerBar/TimerBar";

import {
    obtenerEtiquetas
} from "../../services/etiquetaService";



function Rastreador() {


    const [actividad, setActividad] = useState("");

    const [activo, setActivo] = useState(false);

    const [proyecto, setProyecto] = useState(null);

    const [tarea, setTarea] = useState(null);

    const [segundos, setSegundos] = useState(0);

    const [horaInicio, setHoraInicio] = useState(null);

    const [bloqueado, setBloqueado] = useState(false);



    const [registros, setRegistros] = useState(() => {

        const datos = localStorage.getItem(
            "rastreador_registros"
        );

        return datos
            ? JSON.parse(datos)
            : [];

    });



    const [etiquetas, setEtiquetas] = useState([]);



    const [
        etiquetasSeleccionadas,
        setEtiquetasSeleccionadas
    ] = useState([]);


const continuarRegistro = (registro)=>{


    setActividad(
        registro.actividad
    );


    setProyecto(
        registro.proyecto
    );


    setTarea(
        registro.tarea
    );


    setEtiquetasSeleccionadas(
        registro.etiquetas || []
    );



    const inicio = new Date();



    setHoraInicio(
        inicio
    );


    setSegundos(
        registro.tiempo
    );


    setActivo(true);


    setBloqueado(true);



    localStorage.setItem(

        "actividad_activa",

        JSON.stringify({

            actividad:
                registro.actividad,


            proyecto:
                registro.proyecto,


            tarea:
                registro.tarea,


            etiquetas:
                registro.etiquetas,


            horaInicio:
                inicio.toISOString()

        })

    );


};

    // =====================================
    // RECUPERAR ACTIVIDAD ACTIVA
    // =====================================

    useEffect(() => {


        const guardado = localStorage.getItem(
            "actividad_activa"
        );


        if (guardado) {


            const data = JSON.parse(
                guardado
            );



            setActividad(
                data.actividad
            );


            setProyecto(
                data.proyecto
            );


            setTarea(
                data.tarea
            );


            setEtiquetasSeleccionadas(
                data.etiquetas || []
            );



            const inicio = new Date(
                data.horaInicio
            );


            setHoraInicio(
                inicio
            );



            const diferencia = Math.floor(
                (new Date() - inicio) / 1000
            );


            setSegundos(
                diferencia
            );



            setActivo(true);

            setBloqueado(true);


        }


    }, []);





    // =====================================
    // CARGAR ETIQUETAS
    // =====================================

    useEffect(() => {

        cargarEtiquetas();

    }, []);



    const cargarEtiquetas = async () => {


        try {


            const data = await obtenerEtiquetas();

            setEtiquetas(data);


        }
        catch (error) {

            console.error(
                "Error cargando etiquetas",
                error
            );

        }


    };






    // =====================================
    // CONTADOR REAL
    // =====================================

    useEffect(() => {


        if (!activo || !horaInicio)
            return;



        const intervalo = setInterval(() => {


            const ahora = new Date();



            const diferencia = Math.floor(
                (ahora - new Date(horaInicio)) / 1000
            );



            setSegundos(
                diferencia
            );


        }, 1000);



        return () => clearInterval(intervalo);



    }, [
        activo,
        horaInicio
    ]);









    // =====================================
    // INICIAR TIMER
    // =====================================

    const iniciarTiempo = () => {



        if (!actividad.trim()) {

            alert(
                "Ingrese actividad"
            );

            return;

        }



        if (!proyecto) {


            alert(
                "Seleccione proyecto"
            );


            return;

        }




        if (!tarea) {


            alert(
                "Seleccione una tarea"
            );


            return;

        }




        const inicio = new Date();



        setHoraInicio(
            inicio
        );


        setSegundos(0);


        setActivo(true);


        setBloqueado(true);




        localStorage.setItem(

            "actividad_activa",

            JSON.stringify({

                actividad,

                proyecto,

                tarea,

                etiquetas:
                    etiquetasSeleccionadas,


                horaInicio:
                    inicio.toISOString()

            })

        );


    };









    // =====================================
    // DETENER TIMER
    // =====================================

    const detenerTiempo = () => {



        const confirmar = window.confirm(

            "¿Está seguro que desea terminar esta actividad?"

        );



        if (!confirmar) {

            return;

        }




        const horaFin = new Date();





        const nuevoRegistro = {


            id: Date.now(),


            actividad,


            proyecto,


            tarea,


            etiquetas:
                etiquetasSeleccionadas,



            horaInicio:
                horaInicio?.toISOString(),



            horaFin:
                horaFin.toISOString(),



            tiempo:
                segundos,



            fecha:
                new Date().toISOString()


        };





        const nuevosRegistros = [

            ...registros,

            nuevoRegistro

        ];





        setRegistros(
            nuevosRegistros
        );





        localStorage.setItem(

            "rastreador_registros",

            JSON.stringify(
                nuevosRegistros
            )

        );







        // eliminar actividad activa

        localStorage.removeItem(
            "actividad_activa"
        );







        // limpiar


        setActivo(false);


        setBloqueado(false);


        setSegundos(0);


        setHoraInicio(null);



        setActividad("");


        setProyecto(null);


        setTarea(null);



        setEtiquetasSeleccionadas([]);



    };









    // =====================================
    // FORMATO TIEMPO
    // =====================================

    const formatoTiempo = (seg) => {


        const h = Math.floor(
            seg / 3600
        );


        const m = Math.floor(
            (seg % 3600) / 60
        );


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






    // =====================================
    // FORMATO HORA
    // =====================================

    const formatoHora = (fecha) => {


        if (!fecha)
            return "";



        return new Date(fecha)
            .toLocaleTimeString(
                [],
                {

                    hour: "2-digit",

                    minute: "2-digit"

                }
            );


    };







    const totalTiempo = registros.reduce(

        (total, r) =>

            total + r.tiempo,

        0

    );








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



                iniciarTiempo={
                    iniciarTiempo
                }



                detenerTiempo={
                    detenerTiempo
                }



                bloqueado={
                    bloqueado
                }


            />









            <div className="registro-container">


                <div className="registro-header">


                    <span>
                        Hoy
                    </span>



                    <div className="registro-total">


                        <span>
                            Total:
                        </span>


                        <strong>

                            {
                                formatoTiempo(totalTiempo)
                            }

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

                                {
                                    registro.actividad
                                }

                            </div>




                            <div className="registro-proyecto">


                                <span className="punto"></span>


                                <span>


                                    {
                                        registro.proyecto?.nombre ||
                                        "Sin proyecto"
                                    }



                                    {

                                        registro.tarea &&

                                        <span className="registro-tarea">

                                            {" - "}

                                            {
                                                registro.tarea.nombre
                                            }

                                        </span>

                                    }



                                </span>


                            </div>





                            <div className="registro-tags">


                                {
                                    registro.etiquetas?.map(e => (


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


                                {
                                    formatoHora(
                                        registro.horaInicio
                                    )
                                }


                                -


                                {
                                    formatoHora(
                                        registro.horaFin
                                    )
                                }


                            </div>





                            <div className="registro-tiempo">


                                {
                                    formatoTiempo(
                                        registro.tiempo
                                    )
                                }


                            </div>



                            <div className="registro-actions">


                                <button
                                    onClick={() => continuarRegistro(registro)}
                                >
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