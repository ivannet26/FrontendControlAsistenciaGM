import { Popover } from "@headlessui/react";
import { Search, Star, Plus } from "lucide-react";
import { useState } from "react";
import ModalProyecto from "../ModalProyecto/ModalProyecto";
import ModalTarea from "../ModalTarea/ModalTarea";

import "./ProjectSelector.css";


function ProjectSelector({ setProyecto }) {


    const [mostrarModalTarea, setMostrarModalTarea] = useState(false);

    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

    const [tareas, setTareas] = useState([]);

    const [mostrarModalProyecto, setMostrarModalProyecto] = useState(false);

    const proyectos = [

        {
            id: 1,
            nombre: "Sistema de asistencia GM",
            color: "#10b981"
        },

        {
            id: 2,
            nombre: "Portal Web",
            color: "#f43f5e"
        },

        {
            id: 3,
            nombre: "Aplicación móvil",
            color: "#8b5cf6"
        },

        {
            id: 4,
            nombre: "Migración Base de Datos",
            color: "#3b82f6"
        },

        {
            id: 5,
            nombre: "API Backend FastAPI",
            color: "#f59e0b"
        },

        {
            id: 6,
            nombre: "Diseño Dashboard",
            color: "#06b6d4"
        },

        {
            id: 7,
            nombre: "Control de Asistencia",
            color: "#ec4899"
        },

        {
            id: 8,
            nombre: "Pruebas del sistema",
            color: "#22c55e"
        },

        {
            id: 9,
            nombre: "Diseño del modulo Proyectos",
            color: "#f43f5e"
        },

        {
            id: 10,
            nombre: "Refactorización de Tareas",
            color: "#8b5cf6"
        },

        {
            id: 11,
            nombre: "Diseño de notificaciones",
            color: "#3b82f6"
        }

    ];




    const abrirCrearTarea = (e, proyecto) => {

        e.stopPropagation();

        setProyecto(proyecto);

        setProyectoSeleccionado(proyecto);

        setMostrarModalTarea(true);

    };



    return (

        <Popover className="project-selector">


            <Popover.Button className="project-btn">

                + Proyecto

            </Popover.Button>



            <Popover.Panel className="project-panel">



                <div className="project-search">


                    <Search size={17} />


                    <input

                        placeholder="Buscar Proyecto o Cliente"

                    />


                </div>





                <div className="project-list">



                    {
                        proyectos.map((proyecto) => (


                            <div

                                key={proyecto.id}

                                className="project-item"

                                onClick={() => setProyecto(proyecto)}

                            >



                                <div className="project-info">

                                    <span
                                        className="project-dot"
                                        style={{
                                            backgroundColor: proyecto.color
                                        }}
                                    ></span>


                                    <span
                                        className="project-name"
                                        style={{
                                            color: proyecto.color
                                        }}
                                    >
                                        {proyecto.nombre}
                                    </span>

                                </div>





                                <button

                                    className="create-task-btn"

                                    onClick={(e) =>
                                        abrirCrearTarea(e, proyecto)
                                    }

                                >

                                    Crear Tarea

                                </button>





                                <Star size={17} />



                            </div>



                        ))
                    }



                </div>






                <button

                    className="create-project"

                    onClick={() => setMostrarModalProyecto(true)}

                >

                    <Plus size={16} />

                    Crear nuevo Proyecto

                </button>





            </Popover.Panel>





            {
                mostrarModalTarea && (


                    <ModalTarea

                        cerrar={() => setMostrarModalTarea(false)}


                        guardar={(nuevaTarea) => {


                            const nueva = {


                                proyecto:
                                    proyectoSeleccionado.nombre,


                                nombre:
                                    nuevaTarea


                            };


                            setTareas([

                                ...tareas,

                                nueva

                            ]);



                            console.log(
                                "Tarea creada:",
                                nueva
                            );


                            setMostrarModalTarea(false);


                        }}

                    />


                )

            }{
                mostrarModalProyecto && (

                    <ModalProyecto

                        cerrar={() => setMostrarModalProyecto(false)}

                        guardar={(nuevoProyecto) => {

                            console.log(
                                "Proyecto creado:",
                                nuevoProyecto
                            );


                        }}

                    />

                )
            }



        </Popover>

    );

}


export default ProjectSelector;