import "./EtiquetasFiltro.css";
import { Search } from "lucide-react";
import { useState,useEffect, useRef} from "react";


function EtiquetasFiltro({

    busqueda,

    setBusqueda,

    estadoFiltro,

    setEstadoFiltro

}) {


    const [abierto, setAbierto] = useState(false);
    const filtroRef = useRef();
    useEffect(()=>{


    const cerrarMenu = (e)=>{


        if(

            filtroRef.current &&

            !filtroRef.current.contains(e.target)

        ){

            setAbierto(false);

        }


    };



    document.addEventListener(
        "mousedown",
        cerrarMenu
    );



    return ()=>{


        document.removeEventListener(
            "mousedown",
            cerrarMenu
        );


    };


},[]);


    const cambiarEstado = (estado)=>{


        let nuevosEstados = [...estadoFiltro];



        if(nuevosEstados.includes(estado)){


            nuevosEstados = nuevosEstados.filter(
                item => item !== estado
            );


        }else{


            nuevosEstados.push(estado);


        }



        setEstadoFiltro(nuevosEstados);


    };





    const textoFiltro = ()=>{


        if(estadoFiltro.includes("Todos")){

            return "Mostrar todo";

        }


        if(estadoFiltro.length === 1){


            return `Mostrar ${estadoFiltro[0].toLowerCase()}`;


        }


        if(estadoFiltro.length > 1){


            return "Estados seleccionados";


        }


        return "Mostrar activo";


    };







    return (


        <div className="etiquetas-filtros">



            <div className="filtros-izquierda">



                <span className="filtro-titulo">

                    FILTRAR

                </span>






                <div 
    className="filtro-dropdown"
    ref={filtroRef}
>



                    <button

                        className="filtro-btn"

                        onClick={() => setAbierto(!abierto)}

                    >


                        {textoFiltro()}

                        ▾


                    </button>







                    {

                        abierto &&


                        <div className="dropdown-panel">





                            <label>


                                <input


                                    type="checkbox"


                                    checked={
                                        estadoFiltro.includes("Activo")
                                    }


                                    onChange={()=>{

                                        cambiarEstado("Activo");

                                    }}


                                />


                                Mostrar activo



                            </label>









                            <label>


                                <input


                                    type="checkbox"


                                    checked={
                                        estadoFiltro.includes("Archivado")
                                    }


                                    onChange={()=>{

                                        cambiarEstado("Archivado");

                                    }}



                                />


                                Mostrar archivado



                            </label>









                            <label>


                                <input


                                    type="checkbox"


                                    checked={
                                        estadoFiltro.includes("Todos")
                                    }


                                    onChange={()=>{


                                        cambiarEstado("Todos");


                                    }}



                                />


                                Mostrar todo



                            </label>





                        </div>


                    }




                </div>





            </div>









            <div className="filtros-derecha">





                <div className="etiquetas-buscador">



                    <Search size={18}/>



                    <input


                        placeholder="Buscar por nombre"


                        value={busqueda}


                        onChange={(e)=>

                            setBusqueda(
                                e.target.value
                            )

                        }


                    />


                </div>







                <button className="aplicar-btn">


                    APLICAR FILTRO


                </button>





            </div>






        </div>



    );


}



export default EtiquetasFiltro;