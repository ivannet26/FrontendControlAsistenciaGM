import { Popover } from "@headlessui/react";
import { Search, Star, Plus } from "lucide-react";

import "./ProjectSelector.css";


function ProjectSelector({ setProyecto }) {


    const proyectos = [

        {
            id:1,
            nombre:"Sistema de asistencia GM"
        },

        {
            id:2,
            nombre:"Portal Web"
        },

        {
            id:3,
            nombre:"Aplicación móvil"
        }

    ];



    return (

        <Popover className="project-selector">


            <Popover.Button className="project-btn">

                + Proyecto

            </Popover.Button>



            <Popover.Panel className="project-panel">


                <div className="project-search">


                    <Search size={17}/>


                    <input

                        placeholder="Buscar proyecto"

                    />


                </div>




                <div className="project-list">


                    {
                        proyectos.map((proyecto)=>(


                            <div

                                key={proyecto.id}

                                className="project-item"

                                onClick={()=>setProyecto(proyecto)}

                            >


                                <div>


                                    <span>

                                        {proyecto.nombre}

                                    </span>


                                    <small>

                                        Crear tarea

                                    </small>


                                </div>


                                <Star size={17}/>


                            </div>


                        ))

                    }


                </div>





                <button className="create-project">


                    <Plus size={16}/>

                    Crear proyecto


                </button>




            </Popover.Panel>


        </Popover>

    );

}


export default ProjectSelector;