import { useState } from "react";

import EtiquetasFiltro from "../../components/EtiquetasComp/EtiquetasFiltro";

import EtiquetasTable from "../../components/EtiquetasComp/EtiquetasTable";

import ModalEtiqueta from "../../components/EtiquetasComp/ModalEtiqueta";
import { useEffect } from "react";

import {
    obtenerEtiquetas,
    crearEtiqueta,
    editarEtiquetaAPI,
    archivarEtiquetaAPI,
    restaurarEtiquetaAPI,
    eliminarEtiquetaAPI
} from "../../services/etiquetaService";
import "./Etiquetas.css";



function Etiquetas() {


    const [mostrarModal, setMostrarModal] = useState(false);


    const [busqueda, setBusqueda] = useState("");


    const [estadoFiltro, setEstadoFiltro] = useState([
        "Todos"
    ]);

    const [etiquetas, setEtiquetas] = useState([]);
    const [etiquetaEditar, setEtiquetaEditar] = useState(null);


    useEffect(() => {

        cargarEtiquetas();

    }, []);



    const cargarEtiquetas = async () => {

        try {

            const data = await obtenerEtiquetas();


            console.log(
                "Etiquetas backend:",
                data
            );


            setEtiquetas(
                data.map(e => ({

                    id: e.id,

                    nombre: e.nombre,

                    estado:
                        e.archivado
                            ?
                            "Archivado"
                            :
                            "Activo"

                }))
            );


        } catch (error) {

            console.error(
                "Error cargando etiquetas",
                error
            );

        }

    };












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
    const archivarEtiqueta = async (id) => {
        try {
            const actualizada = await archivarEtiquetaAPI(id);

            setEtiquetas(prev =>
                prev.map(e =>
                    e.id === id
                        ? { ...e, estado: actualizada.archivado ? "Archivado" : "Activo" }
                        : e
                )
            );
        } catch (error) {
            console.error("Error archivando etiqueta", error);
            alert("No se pudo archivar la etiqueta");
        }
    };

    // RESTAURAR
    const restaurarEtiqueta = async (id) => {
        try {
            const actualizada = await restaurarEtiquetaAPI(id);

            setEtiquetas(prev =>
                prev.map(e =>
                    e.id === id
                        ? { ...e, estado: actualizada.archivado ? "Archivado" : "Activo" }
                        : e
                )
            );
        } catch (error) {
            console.error("Error restaurando etiqueta", error);
            alert("No se pudo restaurar la etiqueta");
        }
    };

    // ELIMINAR
    const eliminarEtiqueta = async (id) => {
        const etiqueta = etiquetas.find(e => e.id === id);

        if (!etiqueta) return;

        if (etiqueta.estado !== "Archivado") {
            alert("Primero debes archivar la etiqueta");
            return;
        }

        try {
            await eliminarEtiquetaAPI(id);

            setEtiquetas(prev =>
                prev.filter(e => e.id !== id)
            );
        } catch (error) {
            console.error("Error eliminando etiqueta", error);
            alert("No se pudo eliminar la etiqueta");
        }
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





                    guardar={async (nuevaEtiqueta) => {


                        try {


                            if (etiquetaEditar) {


                                const actualizada = await editarEtiquetaAPI(

                                    nuevaEtiqueta.id,

                                    {
                                        nombre: nuevaEtiqueta.nombre
                                    }

                                );


                                // EDITAR
                                setEtiquetas(prev =>
                                    prev.map(e =>
                                        e.id === actualizada.id
                                            ? {
                                                ...e,
                                                nombre: actualizada.nombre,
                                                estado: actualizada.archivado ? "Archivado" : "Activo"
                                            }
                                            : e
                                    )
                                );


                            }

                            else {


                                const creada = await crearEtiqueta({

                                    nombre: nuevaEtiqueta.nombre,

                                    color: "#10A5F5"

                                });



                                setEtiquetas(prev => [
                                    ...prev,
                                    {
                                        id: creada.id,
                                        nombre: creada.nombre,
                                        estado: "Activo"
                                    }
                                ]);

                            }



                            setMostrarModal(false);

                            setEtiquetaEditar(null);



                        }

                        catch (error) {


                            console.error(
                                "Error guardando etiqueta",
                                error
                            );


                        }



                    }}




                />


            }





        </div>


    );


}



export default Etiquetas;