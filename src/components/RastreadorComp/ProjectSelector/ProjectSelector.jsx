import { Search, Star, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ModalProyecto from "../ModalProyecto/ModalProyecto";
import ModalTarea from "../ModalTarea/ModalTarea";

import { obtenerProyectos } from "../../../services/proyectosService";
import { obtenerTareasProyecto, crearTarea } from "../../../services/tareasService";

import "./ProjectSelector.css";


function ProjectSelector({
    proyecto,
    setProyecto,
    tarea,
    setTarea,
    bloqueado
}) {

    const [mostrarModalTarea, setMostrarModalTarea] = useState(false);
    const [mostrarProyectos, setMostrarProyectos] = useState(false);
    const [mostrarModalProyecto, setMostrarModalProyecto] = useState(false);

    const projectRef = useRef(null);

    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

    const [proyectosAbiertos, setProyectosAbiertos] = useState([]);

    const [busqueda, setBusqueda] = useState("");
    const [favoritos, setFavoritos] = useState([]);
    const [tareasFavoritas, setTareasFavoritas] = useState([]);

    const [proyectos, setProyectos] = useState([]);
    const [tareasPorProyecto, setTareasPorProyecto] = useState({});


    // Cargar proyectos del backend
    useEffect(() => {
        cargarProyectos();
    }, []);

    const cargarProyectos = async () => {
        try {
            const data = await obtenerProyectos({ estado: "todo" });

            // Cargar tareas de TODOS los proyectos al inicio
            const proyectosConTareas = await Promise.all(
                data.map(async (p) => {
                    try {
                        const tareas = await obtenerTareasProyecto(p.id);
                        return {
                            id: p.id,
                            nombre: p.nombre,
                            color: p.color || "#10b981",
                            cliente: p.nombre_cliente || null,
                            tareas: tareas.map(t => ({ id: t.id, nombre: t.titulo }))
                        };
                    } catch {
                        return {
                            id: p.id,
                            nombre: p.nombre,
                            color: p.color || "#10b981",
                            cliente: p.nombre_cliente || null,
                            tareas: []
                        };
                    }
                })
            );

            setProyectos(proyectosConTareas);
        } catch (error) {
            console.error("Error cargando proyectos", error);
        }
    };


    const proyectosFiltrados = proyectos.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );


    // Cerrar panel al hacer clic afuera
    useEffect(() => {
        const cerrarPanel = (e) => {
            if (projectRef.current && !projectRef.current.contains(e.target)) {
                setMostrarProyectos(false);
            }
        };

        document.addEventListener("mousedown", cerrarPanel);
        return () => document.removeEventListener("mousedown", cerrarPanel);
    }, []);


    
    const abrirCrearTarea = (e, proyecto) => {
        e.stopPropagation();
        setProyecto(proyecto);
        setProyectoSeleccionado(proyecto);
        setMostrarModalTarea(true);
    };


    
    const handleCrearTarea = async (nombreTarea) => {
        try {
            const creada = await crearTarea({
                titulo: nombreTarea,
                proyecto_id: proyectoSeleccionado.id,
                estado: "PENDIENTE",
                prioridad: "MEDIA"
            });

            setProyectos(prev =>
                prev.map(p =>
                    p.id === proyectoSeleccionado.id
                        ? {
                            ...p,
                            tareas: [...p.tareas, { id: creada.id, nombre: creada.titulo }]
                          }
                        : p
                )
            );

            setMostrarModalTarea(false);
        } catch (error) {
            console.error("Error creando tarea", error);
            alert(error.response?.data?.detail || "No se pudo crear la tarea");
        }
    };


    //  Toggle: solo despliega si el proyecto tiene tareas
    const toggleProyecto = (proyecto) => {
        if (bloqueado) return;

        setProyecto(proyecto);
        setTarea(null);

        // Si NO tiene tareas → no despliega nada
        if (proyecto.tareas.length === 0) {
            return;
        }

        // Si tiene tareas → toggle
        setProyectosAbiertos(prev =>
            prev.includes(proyecto.id)
                ? prev.filter(id => id !== proyecto.id)
                : [...prev, proyecto.id]
        );
    };


    // Truncar nombres largos a 25 caracteres
    const truncar = (texto, max = 25) =>
        texto.length > max ? texto.slice(0, max) + "..." : texto;


    return (
        <div className="project-selector" ref={projectRef}>

            <button
                className="project-btn"
                onClick={() => setMostrarProyectos(!mostrarProyectos)}
            >
                {proyecto ? truncar(proyecto.nombre) : "+ Proyecto"}
            </button>


            {mostrarProyectos && (
                <div className="project-panel">

                    <div className="project-search">
                        <Search size={17} />
                        <input
                            placeholder="Buscar Proyecto o Cliente"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>


                    <div className="project-list">

                        {proyectosFiltrados.map((proyecto) => {

                            const abierto = proyectosAbiertos.includes(proyecto.id);
                            const tieneTareas = proyecto.tareas.length > 0;

                            return (
                                <div key={proyecto.id} className="project-container">

                                    {/* PROYECTO */}
                                    <div
                                        className="project-item"
                                        onClick={() => toggleProyecto(proyecto)}
                                    >

                                        <div className="project-info">
                                            <span
                                                className="project-dot"
                                                style={{ backgroundColor: proyecto.color }}
                                            />
                                            <span
                                                className="project-name"
                                                style={{ color: proyecto.color }}
                                                title={proyecto.nombre}
                                            >
                                                {truncar(proyecto.nombre)}
                                            </span>
                                        </div>


                                        {/* Si tiene tareas → contador + chevron */}
                                        {tieneTareas ? (
                                            <div className="task-control">
                                                <span className="task-count">
                                                    {proyecto.tareas.length} Tareas
                                                </span>

                                                {abierto
                                                    ? <ChevronUp size={16} />
                                                    : <ChevronDown size={16} />
                                                }
                                            </div>
                                        ) : (
                                            /* Si NO tiene tareas → botón "Crear Tarea" */
                                            <button
                                                className="create-task-btn"
                                                onClick={(e) => abrirCrearTarea(e, proyecto)}
                                            >
                                                Crear Tarea
                                            </button>
                                        )}


                                        <Star
                                            size={17}
                                            className={
                                                favoritos.includes(proyecto.id)
                                                    ? "star active"
                                                    : "star"
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (favoritos.includes(proyecto.id)) {
                                                    setFavoritos(favoritos.filter(id => id !== proyecto.id));
                                                } else {
                                                    setFavoritos([...favoritos, proyecto.id]);
                                                }
                                            }}
                                        />
                                    </div>


                                    {/*  Solo despliega si tiene tareas Y está abierto */}
                                    {tieneTareas && abierto && (
                                        <div className="task-list">

                                            {proyecto.tareas.map((tarea) => (
                                                <div
                                                    key={tarea.id}
                                                    className="task-item"
                                                    onClick={() => {
                                                        if (bloqueado) return;
                                                        setProyecto(proyecto);
                                                        setTarea(tarea);
                                                        setMostrarProyectos(false);
                                                    }}
                                                >
                                                    <span>{tarea.nombre}</span>

                                                    <Star
                                                        size={16}
                                                        className={
                                                            tareasFavoritas.includes(tarea.id)
                                                                ? "task-star active"
                                                                : "task-star"
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (tareasFavoritas.includes(tarea.id)) {
                                                                setTareasFavoritas(
                                                                    tareasFavoritas.filter(id => id !== tarea.id)
                                                                );
                                                            } else {
                                                                setTareasFavoritas([...tareasFavoritas, tarea.id]);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ))}


                                            {/* Botón crear nueva tarea (con icono +) */}
                                            <div
                                                className="new-task"
                                                onClick={(e) => abrirCrearTarea(e, proyecto)}
                                            >
                                                <Plus size={16} />
                                                Crear nueva Tarea
                                            </div>

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>


                    <button
                        className="create-project"
                        onClick={() => setMostrarModalProyecto(true)}
                    >
                        <Plus size={16} />
                        Crear nuevo Proyecto
                    </button>

                </div>
            )}


            {mostrarModalTarea && (
                <ModalTarea
                    cerrar={() => setMostrarModalTarea(false)}
                    guardar={handleCrearTarea}
                />
            )}


            {mostrarModalProyecto && (
                <ModalProyecto
                    cerrar={() => setMostrarModalProyecto(false)}
                    guardar={async () => {
                        await cargarProyectos();
                        setMostrarModalProyecto(false);
                    }}
                />
            )}

        </div>
    );
}

export default ProjectSelector;