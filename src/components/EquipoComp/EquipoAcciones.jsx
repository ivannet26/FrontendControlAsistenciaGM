import { useState } from "react";

import { MoreVertical } from "lucide-react";

import "./Equipo.css";


function EquipoAcciones({

    miembro,

    eliminar

}){


    const [abierto,setAbierto] = useState(false);



    return (

        <div className="equipo-acciones">


            <MoreVertical

                size={20}

                className="menu-icon"

                onClick={()=>setAbierto(!abierto)}

            />



            {
                abierto &&

                <div className="menu-opciones">


                    <button>
                        Editar miembro
                    </button>


                    <button>
                        Cambiar rol
                    </button>


                    <button

                        onClick={()=>eliminar(miembro.id)}

                    >
                        Eliminar miembro
                    </button>


                </div>

            }


        </div>

    );

}


export default EquipoAcciones;