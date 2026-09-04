import { useState } from "react";

import ProyectoTable from "./ProyectoTable";
import ProyectoFiltros from "./ProyectoFiltros";
import ModalProyecto from "./ModalProyecto";

import "./Proyectos.css";


function ProyectosComp(){


    const [mostrarModal,setMostrarModal] = useState(false);


    const [proyectos,setProyectos] = useState([

        {
            id:1,
            nombre:"Sistema de asistencia GM",
            cliente:"sistema_asistencia_gm",
            horas:"1.94h",
            progreso:"-",
            acceso:"Público",
            favorito:false
        },

        {
            id:2,
            nombre:"Proyecto de prueba",
            cliente:"-",
            horas:"0.00h",
            progreso:"-",
            acceso:"Público",
            favorito:false
        }

    ]);



    return (

        <div className="proyectos-container">


            <div className="proyectos-header">


                <h1>
                    Proyectos
                </h1>


                <button
                    onClick={()=>
                        setMostrarModal(true)
                    }
                >

                    CREAR NUEVO PROYECTO

                </button>


            </div>



            <ProyectoFiltros />



            <ProyectoTable

                proyectos={proyectos}

                setProyectos={setProyectos}

            />



            {
                mostrarModal && (

                    <ModalProyecto

                        cerrar={()=>
                            setMostrarModal(false)
                        }

                        guardar={(nuevo)=>{


                            setProyectos([

                                ...proyectos,

                                nuevo

                            ]);


                            setMostrarModal(false);


                        }}

                    />

                )
            }



        </div>

    );

}


export default ProyectosComp;