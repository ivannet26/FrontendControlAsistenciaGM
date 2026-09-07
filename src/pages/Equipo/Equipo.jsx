import EquipoTabs from "../../components/EquipoComp/EquipoTabs";
import EquipoFiltros from "../../components/EquipoComp/EquipoFiltros";
import EquipoTable from "../../components/EquipoComp/EquipoTable";
import ModalMiembro from "../../components/EquipoComp/ModalMiembro";
import { useState } from "react";


function Equipo() {


    const [mostrarModal, setMostrarModal] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [miembroEditar, setMiembroEditar] = useState(null);
    const [rolFiltro, setRolFiltro] = useState("Todos");
    const [grupoFiltro, setGrupoFiltro] = useState("Todos");
    const [estadoFiltro, setEstadoFiltro] = useState("Todos");
    const [filtroAbierto, setFiltroAbierto] = useState(null);




    const [miembros, setMiembros] = useState([

        {
            id: 1,
            nombre: "Cristopher Baldeón",
            correo: "baldeoncristopher@gmail.com",
            rol: "Administrador",
            grupo: "Sistemas",
            estado: "Activo"
        },

        {
            id: 2,
            nombre: "Frank Corilla",
            correo: "frankcorilla2015@gmail.com",
            rol: "Administrador",
            grupo: "Sistemas",
            estado: "Activo"
        },

        {
            id: 3,
            nombre: "Roberto Gómez",
            correo: "giosttin1404@gmail.com",
            rol: "Administrador",
            grupo: "Área técnica",
            estado: "Activo"
        },

        {
            id: 4,
            nombre: "Ivan Atanacio",
            correo: "ivan.atanacio@gmail.com",
            rol: "Propietario",
            grupo: "Sistemas",
            estado: "Activo"
        },

        {
            id: 5,
            nombre: "Pedro Pairazaman",
            correo: "pairazamanpedro84@gmail.com",
            rol: "Administrador",
            grupo: "Desarrollo",
            estado: "Activo"
        },

        {
            id: 6,
            nombre: "Abraham Mendez",
            correo: "menpal2004@gmail.com",
            rol: "Miembro",
            grupo: "Área técnica",
            estado: "Activo"
        },

        {
            id: 7,
            nombre: "Juan Perez",
            correo: "juan.perez@gmail.com",
            rol: "Miembro",
            grupo: "Diseño",
            estado: "Activo"
        },

        {
            id: 8,
            nombre: "María López",
            correo: "maria.lopez@gmail.com",
            rol: "Miembro",
            grupo: "Marketing",
            estado: "Activo"
        },

        {
            id: 9,
            nombre: "Carlos Ramírez",
            correo: "carlos.ramirez@gmail.com",
            rol: "Miembro",
            grupo: "Desarrollo",
            estado: "Inactivo"
        },

        {
            id: 10,
            nombre: "Andrea Torres",
            correo: "andrea.torres@gmail.com",
            rol: "Miembro",
            grupo: "Recursos Humanos",
            estado: "Activo"
        },

        {
            id: 11,
            nombre: "Luis Fernández",
            correo: "luis.fernandez@gmail.com",
            rol: "Administrador",
            grupo: "Desarrollo",
            estado: "Activo"
        },

        {
            id: 12,
            nombre: "Sofía Castillo",
            correo: "sofia.castillo@gmail.com",
            rol: "Miembro",
            grupo: "Diseño",
            estado: "Invitado"
        },

        {
            id: 13,
            nombre: "Miguel Herrera",
            correo: "miguel.herrera@gmail.com",
            rol: "Miembro",
            grupo: "Sistemas",
            estado: "Activo"
        },

        {
            id: 14,
            nombre: "Daniela Vargas",
            correo: "daniela.vargas@gmail.com",
            rol: "Miembro",
            grupo: "Marketing",
            estado: "Invitado"
        },

        {
            id: 15,
            nombre: "José Quispe",
            correo: "jose.quispe@gmail.com",
            rol: "Miembro",
            grupo: "Área técnica",
            estado: "Inactivo"
        }
    ]);





    const miembrosFiltrados = miembros.filter((miembro) => {


        const texto = busqueda.toLowerCase();


        const coincideBusqueda =
            miembro.nombre
                .toLowerCase()
                .includes(texto)

            ||

            miembro.correo
                .toLowerCase()
                .includes(texto);



        const coincideRol =
            rolFiltro === "Todos"
            ||
            miembro.rol === rolFiltro;



        const coincideGrupo =
            grupoFiltro === "Todos"
            ||
            miembro.grupo === grupoFiltro;

        const coincideEstado =
            estadoFiltro === "Todos"
            ||
            miembro.estado === estadoFiltro;



        return (
            coincideBusqueda &&
            coincideRol &&
            coincideGrupo &&
            coincideEstado
        );


    });






    const eliminarMiembro = (id) => {


        setMiembros(

            miembros.filter(

                miembro => miembro.id !== id

            )

        );


    };





    const editarMiembro = (miembro) => {


        setMiembroEditar(miembro);

        setMostrarModal(true);


    };





    return (

        <div className="equipo-container">


            <div className="equipo-top">

                <h1>
                    Equipo
                </h1>

            </div>



            <EquipoTabs />



            <div className="equipo-contenedor">


                <div className="contenedor-header">

                    <button
                        className="crear-miembro"
                        onClick={() => setMostrarModal(true)}
                    >
                        AÑADIR NUEVO MIEMBRO
                    </button>

                </div>



                <EquipoFiltros

                    busqueda={busqueda}

                    setBusqueda={setBusqueda}


                    rolFiltro={rolFiltro}

                    setRolFiltro={setRolFiltro}


                    grupoFiltro={grupoFiltro}

                    setGrupoFiltro={setGrupoFiltro}

                    estadoFiltro={estadoFiltro}

                    setEstadoFiltro={setEstadoFiltro}


                    filtroAbierto={filtroAbierto}

                    setFiltroAbierto={setFiltroAbierto}

                />



                <EquipoTable

                    miembros={miembrosFiltrados}

                    eliminarMiembro={eliminarMiembro}

                    editarMiembro={editarMiembro}

                />


            </div>





            {
                mostrarModal &&

                <ModalMiembro

                    cerrar={() => {

                        setMostrarModal(false);

                        setMiembroEditar(null);

                    }}


                    miembroEditar={miembroEditar}


                    enviarInvitacion={(correo) => {


                        console.log("Invitación enviada a:", correo);


                    }}

                />

            }



        </div>

    );


}



export default Equipo;