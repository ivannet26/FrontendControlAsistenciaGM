import { useState } from "react";

import ProyectoTable from "./ProyectoTable";
import ProyectoFiltros from "./ProyectoFiltros";
import ModalProyecto from "./ModalProyecto";

import "./Proyectos.css";


function ProyectosComp() {


    const [mostrarModal, setMostrarModal] = useState(false);


    const [proyectos, setProyectos] = useState([

        {
            id: 1,
            nombre: "Sistema de asistencia GM",
            cliente: "sistema_asistencia_gm",
            horas: "1.94h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 2,
            nombre: "Portal Web Empresarial",
            cliente: "GM Ingenieros",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 3,
            nombre: "Aplicación móvil Android",
            cliente: "Área Tecnología",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 4,
            nombre: "Migración Base de Datos",
            cliente: "Sistema Interno",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 5,
            nombre: "API Backend FastAPI",
            cliente: "Desarrollo Backend",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 6,
            nombre: "Sistema de Inventario",
            cliente: "Logística GM",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 7,
            nombre: "Aplicación Recursos Humanos",
            cliente: "RRHH",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 8,
            nombre: "Portal de Empleados",
            cliente: "Gestión Interna",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 9,
            nombre: "Sistema de Facturación",
            cliente: "Área Comercial",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },

        {
            id: 10,
            nombre: "Dashboard Empresarial",
            cliente: "Gerencia General",
            horas: "0.00h",
            progreso: "-",
            acceso: "Público",
            favorito: false
        },{
    id:11,
    nombre:"Sistema de Gestión Documentaria",
    cliente:"Administración",
    horas:"0.00h",
    progreso:"-",
    acceso:"Público",
    favorito:false
},

{
    id:12,
    nombre:"Módulo de Usuarios y Roles",
    cliente:"Seguridad del Sistema",
    horas:"0.00h",
    progreso:"-",
    acceso:"Público",
    favorito:false
},

{
    id:13,
    nombre:"Diseño del módulo Proyectos",
    cliente:"Gestión de Proyectos",
    horas:"0.00h",
    progreso:"-",
    acceso:"Público",
    favorito:false
},

{
    id:14,
    nombre:"Refactorización de Tareas",
    cliente:"Optimización Plataforma",
    horas:"0.00h",
    progreso:"-",
    acceso:"Público",
    favorito:false
},

{
    id:15,
    nombre:"Sistema de Notificaciones",
    cliente:"Comunicación Interna",
    horas:"0.00h",
    progreso:"-",
    acceso:"Público",
    favorito:false
}


    ]);



    return (

        <div className="proyectos-container">


            <div className="proyectos-header">


                <h1>
                    Proyectos
                </h1>


                <button
                    onClick={() =>
                        setMostrarModal(true)
                    }
                >

                    CREAR NUEVO PROYECTO

                </button>


            </div>



            <ProyectoFiltros />



            <ProyectoTable

                proyectos={proyectos}

                setProyectos={setProyectos}

            />



            {
                mostrarModal && (

                    <ModalProyecto

                        cerrar={() =>
                            setMostrarModal(false)
                        }

                        guardar={(nuevo) => {


                            setProyectos([

                                ...proyectos,

                                nuevo

                            ]);


                            setMostrarModal(false);


                        }}

                    />

                )
            }



        </div>

    );

}


export default ProyectosComp;