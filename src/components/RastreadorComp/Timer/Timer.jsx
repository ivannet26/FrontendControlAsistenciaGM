import { useEffect } from "react";

import "./Timer.css";


function Timer({

    segundos,

    setSegundos,

    activo,

}) {


    useEffect(() => {


        let intervalo;


        if (activo) {


            intervalo = setInterval(() => {


                setSegundos((prev) => prev + 1);


            }, 1000);


        }



        return () => clearInterval(intervalo);



    }, [activo, setSegundos]);




    const formatoTiempo = () => {


        const horas = Math.floor(segundos / 3600);

        const minutos = Math.floor((segundos % 3600) / 60);

        const segundosRestantes = segundos % 60;



        return (

            String(horas).padStart(2,"0")
            + ":"
            +
            String(minutos).padStart(2,"0")
            + ":"
            +
            String(segundosRestantes).padStart(2,"0")

        );


    };



    return (

        <div className="timer">


            {formatoTiempo()}


        </div>

    );


}


export default Timer;