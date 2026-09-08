import { useState } from "react";

import EtiquetasFiltro from "../../components/EtiquetasComp/EtiquetasFiltro";

import EtiquetasTable from "../../components/EtiquetasComp/EtiquetasTable";

import ModalEtiqueta from "../../components/EtiquetasComp/ModalEtiqueta";

import "./Etiquetas.css";



function Etiquetas() {


    const [mostrarModal, setMostrarModal] = useState(false);


    const [busqueda, setBusqueda] = useState("");


    const [estadoFiltro, setEstadoFiltro] = useState([
        "Activo"
    ]);


    const [etiquetaEditar, setEtiquetaEditar] = useState(null);





    const [etiquetas, setEtiquetas] = useState([


        {
            id: 1,
            nombre: "Análisis",
            estado: "Activo"
        },


        {
            id: 2,
            nombre: "CHAGUAL",
            estado: "Activo"
        },


        {
            id: 3,
            nombre: "Corral Quemado",
            estado: "Activo"
        },


        {
            id: 4,
            nombre: "SQL",
            estado: "Activo"
        },


        {
            id: 5,
            nombre: "Migraciones PostgreSQL",
            estado: "Archivado"
        }


    ]);









    // FILTROS

    const etiquetasFiltradas = etiquetas.filter((etiqueta) => {


        const coincideNombre =

            etiqueta.nombre

                .toLowerCase()

                .includes(

                    busqueda.toLowerCase()

                );




        const coincideEstado =

            estadoFiltro.includes("Todos")

            ||

            estadoFiltro.includes(etiqueta.estado);




        return (

            coincideNombre

            &&

            coincideEstado

        );


    });









    // ARCHIVAR

    const archivarEtiqueta = (id) => {


        setEtiquetas(

            etiquetas.map(e =>

                e.id === id

                    ?

                    {

                        ...e,

                        estado: "Archivado"

                    }

                    :

                    e

            )

        );


    };

    const restaurarEtiqueta = (id) => {


    setEtiquetas(

        etiquetas.map(e =>

            e.id === id

            ?

            {
                ...e,
                estado:"Activo"
            }

            :

            e

        )

    );


};







    // ELIMINAR SOLO ARCHIVADAS

    const eliminarEtiqueta = (id) => {


        const etiqueta = etiquetas.find(

            e => e.id === id

        );



        if (!etiqueta) {

            return;

        }



        if (etiqueta.estado !== "Archivado") {


            alert(

                "Primero debes archivar la etiqueta"

            );


            return;


        }




        setEtiquetas(

            etiquetas.filter(

                e => e.id !== id

            )

        );


    };









    // EDITAR

    const editarEtiqueta = (etiqueta) => {


        setEtiquetaEditar(etiqueta);


        setMostrarModal(true);


    };









    return (


        <div className="etiquetas-container">





            <div className="etiquetas-top">


                <h1>

                    Etiquetas

                </h1>


            </div>









            <div className="etiquetas-contenedor">





                <div className="contenedor-header">



                    <button

                        className="crear-etiqueta"

                        onClick={() => {

                            setEtiquetaEditar(null);

                            setMostrarModal(true);

                        }}

                    >

                        AÑADIR NUEVA ETIQUETA


                    </button>



                </div>









                <EtiquetasFiltro


                    busqueda={busqueda}

                    setBusqueda={setBusqueda}


                    estadoFiltro={estadoFiltro}

                    setEstadoFiltro={setEstadoFiltro}


                />









                <EtiquetasTable


                    etiquetas={etiquetasFiltradas}


                    archivarEtiqueta={archivarEtiqueta}

                    restaurarEtiqueta={restaurarEtiqueta}

                    eliminarEtiqueta={eliminarEtiqueta}


                    editarEtiqueta={editarEtiqueta}


                />




            </div>












            {


                mostrarModal &&



                <ModalEtiqueta



                    cerrar={() => {


                        setMostrarModal(false);


                        setEtiquetaEditar(null);


                    }}





                    etiquetaEditar={etiquetaEditar}





                    guardar={(nuevaEtiqueta) => {



                        if (etiquetaEditar) {



                            setEtiquetas(


                                etiquetas.map(e =>

                                    e.id === nuevaEtiqueta.id

                                        ?

                                        nuevaEtiqueta

                                        :

                                        e

                                )


                            );



                        }

                        else {



                            setEtiquetas([

                                ...etiquetas,

                                nuevaEtiqueta

                            ]);



                        }



                        setMostrarModal(false);


                        setEtiquetaEditar(null);



                    }}




                />


            }





        </div>


    );


}



export default Etiquetas;