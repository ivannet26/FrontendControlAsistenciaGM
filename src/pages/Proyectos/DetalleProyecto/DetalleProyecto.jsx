import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MoreVertical } from "lucide-react";

import ProyectoTabs from "../../../components/ProyectosComp/ProyectoTabs/ProyectoTabs";
import ProyectoTareas from "../../../components/ProyectosComp/ProyectoTareas/ProyectoTareas";

import { obtenerProyectoPorId } from "../../../services/proyectosService";

import "./DetalleProyecto.css";


function DetalleProyecto() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [proyecto, setProyecto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [tabActiva, setTabActiva] = useState("TAREAS");


    useEffect(() => {
        cargarProyecto();
    }, [id]);


    const cargarProyecto = async () => {
        try {
            setCargando(true);
            const data = await obtenerProyectoPorId(id);
            setProyecto(data);
        } catch (error) {
            console.error("Error cargando proyecto", error);
        } finally {
            setCargando(false);
        }
    };


    if (cargando) {
        return (
            <div className="detalle-proyecto-container">
                <p style={{ color: "#b5c4cc", padding: 20 }}>Cargando...</p>
            </div>
        );
    }


    if (!proyecto) {
        return (
            <div className="detalle-proyecto-container">
                <p style={{ color: "#f87171", padding: 20 }}>
                    Proyecto no encontrado
                </p>
                <button onClick={() => navigate("/app/proyectos")}>
                    Volver a Proyectos
                </button>
            </div>
        );
    }


    return (
        <div className="detalle-proyecto-container">

            <div className="detalle-breadcrumb">
                <span
                    className="breadcrumb-link"
                    onClick={() => navigate("/app/proyectos")}
                >
                    Proyectos
                </span>
            </div>


            <div className="detalle-header">

                <div className="detalle-header-izq">
                    <h1>{proyecto.nombre}</h1>
                    <p>{proyecto.nombre_cliente || "Sin cliente"}</p>
                </div>

                <div className="detalle-header-der">
                    <button className="btn-header-icon">
                        <Star size={18} />
                    </button>
                    <button className="btn-header-icon">
                        <MoreVertical size={18} />
                    </button>
                </div>

            </div>


            <ProyectoTabs
                tabActiva={tabActiva}
                setTabActiva={setTabActiva}
            />


            {tabActiva === "TAREAS" && (
                <ProyectoTareas proyectoId={proyecto.id} />
            )}

            {tabActiva === "ACCESO" && (
                <div className="tab-vacia">Acceso (pendiente)</div>
            )}

            {tabActiva === "ESTADO" && (
                <div className="tab-vacia">Estado (pendiente)</div>
            )}

            {tabActiva === "PRONÓSTICO" && (
                <div className="tab-vacia">Pronóstico (pendiente)</div>
            )}

            {tabActiva === "NOTA" && (
                <div className="tab-vacia">Nota (pendiente)</div>
            )}

            {tabActiva === "CONFIGURACIÓN" && (
                <div className="tab-vacia">Configuración (pendiente)</div>
            )}

        </div>
    );
}


export default DetalleProyecto;