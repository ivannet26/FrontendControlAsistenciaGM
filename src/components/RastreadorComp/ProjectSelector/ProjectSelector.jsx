import { Search, Star, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import ModalProyecto from "../ModalProyecto/ModalProyecto";
import ModalTarea from "../ModalTarea/ModalTarea";
import toast from "react-hot-toast";
import { obtenerProyectos, crearProyectoAPI } from "../../../services/proyectosService";
import { obtenerTareasProyecto, crearTarea } from "../../../services/tareasService";

import "./ProjectSelector.css";
import useDropdownMovil from "../useDropdownMovil";


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
    const projectBtnRef = useRef(null);
    const projectPanelRef = useRef(null);

    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

    const [proyectosAbiertos, setProyectosAbiertos] = useState([]);

    const [busqueda, setBusqueda] = useState("");
    const [favoritos, setFavoritos] = useState([]);
    const [tareasFavoritas, setTareasFavoritas] = useState([]);

    const [proyectos, setProyectos] = useState([]);
    const [tareasPorProyecto, setTareasPorProyecto] = useState({});


    // En móvil mantiene el panel dentro del viewport
    useDropdownMovil(mostrarProyectos, projectBtnRef, projectPanelRef);


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


    // Toggle de la fila: selecciona el proyecto y despliega sus tareas.
    const toggleProyecto = (proyecto) => {
        if (bloqueado) return;

        const estaAbierto = proyectosAbiertos.includes(proyecto.id);

        // Al contraer solo se cierra la lista: no se cambia la selección.
        if (estaAbierto) {
            setProyectosAbiertos(prev =>
                prev.filter(id => id !== proyecto.id)
            );
            return;
        }

        setProyecto(proyecto);
        setTarea(null);

        // Si NO tiene tareas → no despliega nada
        if (proyecto.tareas.length === 0) {
            return;
        }

        setProyectosAbiertos(prev => [...prev, proyecto.id]);
    };


    // El chevron solo expande/contrae: no debe seleccionar el proyecto
    // ni disparar el onClick de la fila (event.stopPropagation).
    const toggleTareas = (e, proyecto) => {
        e.stopPropagation();

        if (bloqueado) return;

        setProyectosAbiertos(prev =>
            prev.includes(proyecto.id)
                ? prev.filter(id => id !== proyecto.id)
                : [...prev, proyecto.id]
        );
    };


    return (
        <div className="project-selector" ref={projectRef}>

            <button
                ref={projectBtnRef}
                className="project-btn"
                style={{
                    color: proyecto?.color || "#10a5f5"
                }}
                onClick={() => setMostrarProyectos(!mostrarProyectos)}
                title={proyecto?.nombre}
            >
                <span className="project-btn-text">
                    {proyecto ? proyecto.nombre : "+ Proyecto"}
                </span>
            </button>


            {mostrarProyectos && (
                <div className="project-panel" ref={projectPanelRef}>

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
                                                {proyecto.nombre}
                                            </span>
                                        </div>


                                        {/* Si tiene tareas → contador + chevron */}
                                        {tieneTareas ? (
                                            <div className="task-control">
                                                <span className="task-count">
                                                    {proyecto.tareas.length} Tareas
                                                </span>

                                                <button
                                                    type="button"
                                                    className="toggle-tasks-btn"
                                                    aria-label={
                                                        abierto
                                                            ? "Contraer tareas"
                                                            : "Expandir tareas"
                                                    }
                                                    aria-expanded={abierto}
                                                    onClick={(e) => toggleTareas(e, proyecto)}
                                                >
                                                    <ChevronDown
                                                        size={16}
                                                        className={
                                                            abierto
                                                                ? "chevron open"
                                                                : "chevron"
                                                        }
                                                    />
                                                </button>
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


                                    {/* Se mantiene montado para animar apertura y cierre */}
                                    {tieneTareas && (
                                        <div className={`task-list${abierto ? " abierto" : ""}`}>

                                            <div className="task-list-inner">

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
                    guardar={async (datos) => {
                        try {
                            await crearProyectoAPI(datos);
                            toast.success("Proyecto creado");
                            await cargarProyectos();
                            setMostrarModalProyecto(false);
                        } catch (error) {
                            console.error("Error creando proyecto", error);
                            toast.error(
                                error.response?.data?.detail ||
                                "No se pudo crear el proyecto"
                            );
                        }
                    }}
                />
            )}

        </div>
    );
}

export default ProjectSelector;