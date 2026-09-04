import { Popover } from "@headlessui/react";
import { Search, Star, Plus } from "lucide-react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ModalProyecto from "../ModalProyecto/ModalProyecto";
import ModalTarea from "../ModalTarea/ModalTarea";

import "./ProjectSelector.css";


function ProjectSelector({ setProyecto }) {


    const [mostrarModalTarea, setMostrarModalTarea] = useState(false);

    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

    const [proyectosAbiertos, setProyectosAbiertos] = useState([]);

    const [mostrarModalProyecto, setMostrarModalProyecto] = useState(false);

    const [favoritos, setFavoritos] = useState([]);
    const [tareasFavoritas, setTareasFavoritas] = useState([]);

    const [proyectos, setProyectos] = useState([

        {
            id: 1,
            nombre: "Sistema de asistencia GM",
            color: "#10b981",
            tareas: [
                {
                    id: 1,
                    nombre: "Validaciones"
                },
                {
                    id: 2,
                    nombre: "Diseño frontend"
                },
                {
                    id: 3,
                    nombre: "Configuración base de datos"
                },
                {
                    id: 4,
                    nombre: "Pruebas unitarias"
                },
                {
                    id: 5,
                    nombre: "Corrección de errores"
                },
                {
                    id: 6,
                    nombre: "Documentación técnica"
                },
                {
                    id: 7,
                    nombre: "Integración API"
                },
                {
                    id: 8,
                    nombre: "Pruebas finales"
                },
                {
                    id: 9,
                    nombre: "Despliegue producción"
                },
                {
                    id: 10,
                    nombre: "Mantenimiento"
                }
            ]
        },


        {
            id: 2,
            nombre: "Portal Web",
            color: "#f43f5e",
            tareas: []
        },


        {
            id: 3,
            nombre: "Aplicación móvil",
            color: "#8b5cf6",
            tareas: []
        },


        {
            id: 4,
            nombre: "Migración Base de Datos",
            color: "#3b82f6",
            tareas: []
        },


        {
            id: 5,
            nombre: "API Backend FastAPI",
            color: "#f59e0b",
            tareas: []
        },
        {
            id: 6,
            nombre: "Sistema de Inventario",
            color: "#14b8a6",
            tareas: [
                {
                    id: 11,
                    nombre: "Diseño de módulos"
                },
                {
                    id: 12,
                    nombre: "Registro de productos"
                }
            ]
        },

        {
            id: 7,
            nombre: "Aplicación Recursos Humanos",
            color: "#6366f1",
            tareas: [
                {
                    id: 13,
                    nombre: "Gestión de usuarios"
                },
                {
                    id: 14,
                    nombre: "Control de permisos"
                }
            ]
        },

        {
            id: 8,
            nombre: "Portal de Empleados",
            color: "#ec4899",
            tareas: [
                {
                    id: 15,
                    nombre: "Diseño interfaz"
                },
                {
                    id: 16,
                    nombre: "Módulo solicitudes"
                }
            ]
        },

        {
            id: 9,
            nombre: "Sistema de Facturación",
            color: "#22c55e",
            tareas: [
                {
                    id: 17,
                    nombre: "Generación de comprobantes"
                },
                {
                    id: 18,
                    nombre: "Integración SUNAT"
                }
            ]
        },

        {
            id: 10,
            nombre: "Dashboard Empresarial",
            color: "#eab308",
            tareas: [
                {
                    id: 19,
                    nombre: "Creación de gráficos"
                },
                {
                    id: 20,
                    nombre: "Reportes estadísticos"
                }
            ]
        },

        {
            id: 11,
            nombre: "Migración Servidores",
            color: "#ef4444",
            tareas: [
                {
                    id: 21,
                    nombre: "Configuración servidor"
                },
                {
                    id: 22,
                    nombre: "Migración de datos"
                }
            ]
        },

        {
            id: 12,
            nombre: "Aplicación Mobile Android",
            color: "#06b6d4",
            tareas: [
                {
                    id: 23,
                    nombre: "Diseño pantallas"
                },
                {
                    id: 24,
                    nombre: "Pruebas aplicación"
                }
            ]
        },

        {
            id: 13,
            nombre: "Sistema de Seguridad",
            color: "#a855f7",
            tareas: [
                {
                    id: 25,
                    nombre: "Autenticación usuarios"
                },
                {
                    id: 26,
                    nombre: "Control accesos"
                }
            ]
        },

        {
            id: 14,
            nombre: "Gestión Documentaria",
            color: "#f97316",
            tareas: [
                {
                    id: 27,
                    nombre: "Carga de documentos"
                },
                {
                    id: 28,
                    nombre: "Clasificación archivos"
                }
            ]
        },

        {
            id: 15,
            nombre: "Sistema de Reportes",
            color: "#0ea5e9",
            tareas: [
                {
                    id: 29,
                    nombre: "Exportar reportes"
                },
                {
                    id: 30,
                    nombre: "Filtros avanzados"
                }
            ]
        }


    ]);





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
                                className="project-container"
                            >




                                {/* PROYECTO */}

                                <div

                                    className="project-item"

                                    onClick={() => {


                                        setProyecto(proyecto);


                                        setProyectosAbiertos((prev) => {


                                            if (prev.includes(proyecto.id)) {


                                                return prev.filter(
                                                    id => id !== proyecto.id
                                                );


                                            }


                                            return [
                                                ...prev,
                                                proyecto.id
                                            ];


                                        });


                                    }}

                                >



                                    <div className="project-info">


                                        <span

                                            className="project-dot"

                                            style={{

                                                backgroundColor:
                                                    proyecto.color

                                            }}

                                        />



                                        <span

                                            className="project-name"

                                            style={{

                                                color:
                                                    proyecto.color

                                            }}

                                        >

                                            {proyecto.nombre}


                                        </span>


                                    </div>





                                    {
                                        proyecto.tareas.length > 0

                                            ?

                                            <div className="task-control">

                                                <span className="task-count">

                                                    {proyecto.tareas.length} Tareas

                                                </span>


                                                {
                                                    proyectosAbiertos.includes(proyecto.id)

                                                        ?

                                                        <ChevronUp size={16} />

                                                        :

                                                        <ChevronDown size={16} />

                                                }

                                            </div>


                                            :

                                            <button

                                                className="create-task-btn"

                                                onClick={(e) =>
                                                    abrirCrearTarea(
                                                        e,
                                                        proyecto
                                                    )
                                                }

                                            >

                                                Crear Tarea


                                            </button>

                                    }






                                    <Star

                                        size={17}

                                        className={

                                            favoritos.includes(proyecto.id)

                                                ?

                                                "star active"

                                                :

                                                "star"

                                        }


                                        onClick={(e) => {


                                            e.stopPropagation();



                                            if (
                                                favoritos.includes(
                                                    proyecto.id
                                                )
                                            ) {


                                                setFavoritos(

                                                    favoritos.filter(

                                                        id =>
                                                            id !== proyecto.id

                                                    )

                                                );


                                            } else {


                                                setFavoritos([

                                                    ...favoritos,

                                                    proyecto.id

                                                ]);


                                            }



                                        }}


                                    />



                                </div>







                                {/* TAREAS */}

                                {
                                    proyectosAbiertos.includes(proyecto.id) && (


                                        <div className="task-list">



                                            {
                                                proyecto.tareas.map((tarea) => (


                                                    <div
                                                        key={tarea.id}
                                                        className="task-item"
                                                    >

                                                        <span>
                                                            {tarea.nombre}
                                                        </span>


                                                        <Star

                                                            size={16}

                                                            className={

                                                                tareasFavoritas.includes(tarea.id)

                                                                    ?

                                                                    "task-star active"

                                                                    :

                                                                    "task-star"

                                                            }


                                                            onClick={(e) => {


                                                                e.stopPropagation();


                                                                if (
                                                                    tareasFavoritas.includes(tarea.id)
                                                                ) {

                                                                    setTareasFavoritas(

                                                                        tareasFavoritas.filter(

                                                                            id => id !== tarea.id

                                                                        )

                                                                    );


                                                                } else {


                                                                    setTareasFavoritas([

                                                                        ...tareasFavoritas,

                                                                        tarea.id

                                                                    ]);

                                                                }


                                                            }}

                                                        />

                                                    </div>


                                                ))
                                            }




                                            <div

                                                className="new-task"

                                                onClick={(e) =>

                                                    abrirCrearTarea(
                                                        e,
                                                        proyecto
                                                    )

                                                }

                                            >

                                                + Crear nueva Tarea


                                            </div>



                                        </div>


                                    )
                                }




                            </div>



                        ))
                    }



                </div>






                <button

                    className="create-project"

                    onClick={() =>

                        setMostrarModalProyecto(true)

                    }

                >

                    <Plus size={16} />

                    Crear nuevo Proyecto


                </button>






            </Popover.Panel>









            {
                mostrarModalTarea && (


                    <ModalTarea


                        cerrar={() => setMostrarModalTarea(false)}



                        guardar={(nombreTarea) => {


                            setProyectos(

                                proyectos.map((proyecto) => {


                                    if (
                                        proyecto.id ===
                                        proyectoSeleccionado.id
                                    ) {


                                        return {


                                            ...proyecto,


                                            tareas: [

                                                ...proyecto.tareas,


                                                {

                                                    id: Date.now(),

                                                    nombre:
                                                        nombreTarea

                                                }


                                            ]

                                        };


                                    }


                                    return proyecto;


                                })

                            );



                            setMostrarModalTarea(false);


                        }}


                    />


                )
            }








            {
                mostrarModalProyecto && (


                    <ModalProyecto


                        cerrar={() => setMostrarModalProyecto(false)}


                        guardar={(nuevoProyecto) => {


                            setProyectos([

                                ...proyectos,

                                {

                                    ...nuevoProyecto,

                                    id: Date.now(),

                                    tareas: []

                                }

                            ]);


                            setMostrarModalProyecto(false);


                        }}


                    />


                )
            }



        </Popover>

    );

}


export default ProjectSelector;