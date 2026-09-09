import { useState, useEffect, useRef } from "react";

import { Tag, Search } from "lucide-react";

import "./EtiquetaSelector.css";



function EtiquetaSelector({

    etiquetas = [],

    etiquetasSeleccionadas = [],

    setEtiquetasSeleccionadas,

    bloqueado

}) {


    const [abierto, setAbierto] = useState(false);

    const [busqueda, setBusqueda] = useState("");

    const menuRef = useRef(null);





    // CERRAR CUANDO HACE CLICK AFUERA

    useEffect(() => {


        const cerrar = (e) => {


            if (

                menuRef.current &&

                !menuRef.current.contains(e.target)

            ) {

                setAbierto(false);

            }


        };



        document.addEventListener(
            "mousedown",
            cerrar
        );



        return () => {

            document.removeEventListener(
                "mousedown",
                cerrar
            );

        };


    }, []);







    // CERRAR PANEL CUANDO SE BLOQUEA

    useEffect(() => {


        if (bloqueado) {

            setAbierto(false);

        }


    }, [bloqueado]);









    const seleccionarEtiqueta = (etiqueta) => {


        // BLOQUEO DE SEGURIDAD

        if (bloqueado) {

            return;

        }





        const existe = etiquetasSeleccionadas.some(

            e => e.id === etiqueta.id

        );






        if (existe) {


            setEtiquetasSeleccionadas(

                etiquetasSeleccionadas.filter(

                    e => e.id !== etiqueta.id

                )

            );



        }

        else {


            setEtiquetasSeleccionadas([

                ...etiquetasSeleccionadas,

                etiqueta

            ]);


        }


    };









    const etiquetasFiltradas = etiquetas.filter(e =>

        e.nombre

            .toLowerCase()

            .includes(

                busqueda.toLowerCase()

            )

    );









    return (


        <div

            className="etiqueta-selector"

            ref={menuRef}

        >






            <button

                className="etiqueta-btn"

                disabled={bloqueado}

                onClick={() => setAbierto(!abierto)}

            >

                <Tag size={21} />


            </button>











            {

                abierto &&


                <div className="etiqueta-panel">





                    <div className="etiqueta-search">


                        <Search size={17} />



                        <input


                            placeholder="Añadir/Buscar etiquetas"


                            value={busqueda}


                            onChange={(e) =>

                                setBusqueda(

                                    e.target.value

                                )

                            }


                        />


                    </div>









                    <div className="lista-etiquetas">



                        {

                            etiquetasFiltradas.map(e => (


                                <label

                                    key={e.id}

                                    className="etiqueta-item"

                                >




                                    <input


                                        type="checkbox"


                                        disabled={bloqueado}



                                        checked={

                                            etiquetasSeleccionadas.some(

                                                x => x.id === e.id

                                            )

                                        }



                                        onChange={() =>


                                            seleccionarEtiqueta(e)


                                        }


                                    />







                                    <span>

                                        {e.nombre}

                                    </span>





                                </label>



                            ))


                        }



                    </div>





                </div>


            }




        </div>


    );


}


export default EtiquetaSelector;