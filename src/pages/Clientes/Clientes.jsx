import { useState } from "react";
import "../Clientes/Clientes.css";
import ClientesFiltro from "../../components/ClientesComp/ClientesFiltro";
import ClientesTable from "../../components/ClientesComp/ClientesTable";
import ModalCliente from "../../components/ClientesComp/ModalClientes";


function Clientes() {


    const [mostrarModal, setMostrarModal] = useState(false);

    const [busqueda, setBusqueda] = useState("");

    const [estadoFiltro, setEstadoFiltro] = useState("Todos");


    const [clienteEditar, setClienteEditar] = useState(null);



    const [clientes, setClientes] = useState([

    {
        id:1,
        nombre:"CESEL",
        direccion:"Av. República de Panamá 3410 - San Isidro",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:2,
        nombre:"CONSORCIO LURIN",
        direccion:"Lurín - Lima",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:3,
        nombre:"GM INGENIEROS Y CONSULTORES",
        direccion:"Av. Javier Prado Este 1234",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:4,
        nombre:"Municipalidad Provincial de Ayacucho",
        direccion:"Portal Municipal N° 100 - Ayacucho",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:5,
        nombre:"MINERA DEISI SAC",
        direccion:"Calle Los Minerales 450 - Arequipa",
        moneda:"USD",
        estado:"Activo"
    },

    {
        id:6,
        nombre:"NIVARGO PERÚ",
        direccion:"Av. Industrial 890 - Callao",
        moneda:"USD",
        estado:"Activo"
    },

    {
        id:7,
        nombre:"TRANSPORTES DEL SUR SAC",
        direccion:"Jr. Comercio 230 - Cusco",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:8,
        nombre:"CONSTRUCTORA ANDINA",
        direccion:"Av. Primavera 780 - Surco",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:9,
        nombre:"TECNOLOGÍAS DEL PACÍFICO",
        direccion:"Av. Arequipa 1520 - Lima",
        moneda:"USD",
        estado:"Activo"
    },

    {
        id:10,
        nombre:"INVERSIONES DEL NORTE",
        direccion:"Trujillo - La Libertad",
        moneda:"SOL",
        estado:"Archivado"
    },

    {
        id:11,
        nombre:"SERVICIOS GENERALES ROMA",
        direccion:"Av. Brasil 560 - Lima",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:12,
        nombre:"GRUPO EMPRESARIAL ALFA",
        direccion:"Miraflores - Lima",
        moneda:"USD",
        estado:"Activo"
    },

    {
        id:13,
        nombre:"CLIENTE DEMO",
        direccion:"Sin dirección registrada",
        moneda:"SOL",
        estado:"Archivado"
    },

    {
        id:14,
        nombre:"UNIVERSIDAD TECNOLÓGICA DEL PERÚ",
        direccion:"Av. Petit Thouars 116 - Lima",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:15,
        nombre:"MUNICIPALIDAD DISTRITAL DE CHORRILLOS",
        direccion:"Plaza Central Chorrillos",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:16,
        nombre:"CONSULTORA SMART SOLUTIONS",
        direccion:"Av. La Marina 900 - San Miguel",
        moneda:"USD",
        estado:"Activo"
    },

    {
        id:17,
        nombre:"AGROEXPORTACIONES DEL VALLE",
        direccion:"Ica - Perú",
        moneda:"USD",
        estado:"Activo"
    },

    {
        id:18,
        nombre:"IMPORTACIONES GLOBAL SAC",
        direccion:"Av. Argentina 3200 - Lima",
        moneda:"USD",
        estado:"Archivado"
    },

    {
        id:19,
        nombre:"CLÍNICA SAN MARTÍN",
        direccion:"Av. Brasil 1200 - Lima",
        moneda:"SOL",
        estado:"Activo"
    },

    {
        id:20,
        nombre:"EMPRESA LOGÍSTICA EXPRESS",
        direccion:"Callao - Perú",
        moneda:"SOL",
        estado:"Activo"
    }

]);





    const clientesFiltrados = clientes.filter((cliente) => {


        const texto = busqueda.toLowerCase();



        const coincideBusqueda =

            cliente.nombre
                .toLowerCase()
                .includes(texto)

            ||

            cliente.direccion
                .toLowerCase()
                .includes(texto);



        const coincideEstado =

            estadoFiltro === "Todos"

            ||

            cliente.estado === estadoFiltro;



        return (

            coincideBusqueda

            &&

            coincideEstado

        );


    });







    const eliminarCliente = (id) => {


        setClientes(

            clientes.filter(

                cliente => cliente.id !== id

            )

        );


    };







    const editarCliente = (cliente) => {


        setClienteEditar(cliente);

        setMostrarModal(true);


    };









    return (

        <div className="clientes-container">



            <div className="clientes-top">


                <h1>

                    Clientes

                </h1>



            </div>







            <div className="clientes-contenedor">


                <div className="contenedor-header">

                    <button

                        className="crear-cliente"

                        onClick={() => setMostrarModal(true)}

                    >

                        AÑADIR NUEVO CLIENTE

                    </button>


                </div>



                <ClientesFiltro

                    busqueda={busqueda}

                    setBusqueda={setBusqueda}

                    estadoFiltro={estadoFiltro}

                    setEstadoFiltro={setEstadoFiltro}

                />



                <ClientesTable

                    clientes={clientesFiltrados}

                    eliminarCliente={eliminarCliente}

                    editarCliente={editarCliente}

                />


            </div>









            {

                mostrarModal &&


                <ModalCliente


                    cerrar={() => {

                        setMostrarModal(false);

                        setClienteEditar(null);

                    }}



                    clienteEditar={clienteEditar}



                    guardar={(nuevo) => {


                        if (clienteEditar) {


                            setClientes(

                                clientes.map(c =>

                                    c.id === nuevo.id

                                        ?

                                        nuevo

                                        :

                                        c

                                )

                            );


                        }

                        else {


                            setClientes([

                                ...clientes,

                                nuevo

                            ]);


                        }



                        setMostrarModal(false);


                    }}



                />


            }




        </div>

    );


}



export default Clientes;