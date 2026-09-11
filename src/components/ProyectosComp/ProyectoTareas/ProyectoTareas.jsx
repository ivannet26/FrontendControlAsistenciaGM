import { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";

import {
    obtenerTareasProyecto,
    crearTarea,
    eliminarTareaAPI
} from "../../../services/tareasService";

import "./ProyectoTareas.css";


function ProyectoTareas({ proyectoId }) {

    const [tareas, setTareas] = useState([]);
    const [nuevaTarea, setNuevaTarea] = useState("");
    const [cargando, setCargando] = useState(true);


    useEffect(() => {
        cargarTareas();
    }, [proyectoId]);


    const cargarTareas = async () => {
        try {
            setCargando(true);
            const data = await obtenerTareasProyecto(proyectoId);
            setTareas(data);
        } catch (error) {
            console.error("Error cargando tareas", error);
        } finally {
            setCargando(false);
        }
    };


    const handleCrearTarea = async () => {
        if (!nuevaTarea.trim()) return;

        try {
            const creada = await crearTarea({
                titulo: nuevaTarea.trim(),
                proyecto_id: parseInt(proyectoId),
                estado: "PENDIENTE",
                prioridad: "MEDIA"
            });

            setTareas(prev => [...prev, creada]);
            setNuevaTarea("");
        } catch (error) {
            console.error("Error creando tarea", error);
            alert(error.response?.data?.detail || "No se pudo crear la tarea");
        }
    };


    const handleEliminarTarea = async (id) => {
        if (!window.confirm("¿Eliminar esta tarea?")) return;

        try {
            await eliminarTareaAPI(id);
            setTareas(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error eliminando tarea", error);
        }
    };


    return (
        <div className="proyecto-tareas-container">

            <div className="tareas-toolbar">

                <select className="filtro-tareas">
                    <option>Mostrar todo</option>
                </select>

                <input
                    className="buscador-tareas"
                    placeholder="Buscar por nombre"
                />

                <div className="tareas-toolbar-der">

                    <input
                        className="input-nueva-tarea"
                        placeholder="Añadir nuevo Tarea"
                        value={nuevaTarea}
                        onChange={(e) => setNuevaTarea(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCrearTarea();
                        }}
                    />

                    <button
                        className="btn-anadir-tarea"
                        onClick={handleCrearTarea}
                    >
                        AÑADIR
                    </button>

                </div>

            </div>


            <div className="tareas-tabla-container">

                <div className="tabla-header-tareas">
                    <span>Tareas</span>
                </div>

                <table>

                    <thead>
                        <tr>
                            <th>NOMBRE ⇅</th>
                            <th>ENCARGADOS</th>
                            <th className="col-acciones-tareas"></th>
                        </tr>
                    </thead>

                    <tbody>

                        {cargando ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center", padding: 30 }}>
                                    Cargando...
                                </td>
                            </tr>
                        ) : tareas.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center", padding: 30 }}>
                                    No hay tareas en este proyecto
                                </td>
                            </tr>
                        ) : (
                            tareas.map((tarea) => (
                                <tr key={tarea.id}>

                                    <td className="td-nombre-tarea">
                                        {tarea.titulo}
                                    </td>

                                    <td>
                                        <button className="encargados-btn">
                                            Cualquiera ▾
                                        </button>
                                    </td>

                                    <td className="col-acciones-tareas">
                                        <MoreVertical
                                            size={18}
                                            className="menu-icon-tarea"
                                            onClick={() => handleEliminarTarea(tarea.id)}
                                        />
                                    </td>

                                </tr>
                            ))
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}


export default ProyectoTareas;