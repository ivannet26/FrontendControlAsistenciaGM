import { useState, useEffect } from "react";

import ProyectoTable from "./ProyectoTable";
import ProyectoFiltros from "./ProyectoFiltros";
import ModalProyecto from "./ModalProyecto";
import LoadingOverlay from "../Loading/LoadingOverlay";   // 👈 OVERLAY

import {
    obtenerProyectos,
    crearProyectoAPI,
    editarProyectoAPI,
    archivarProyectoAPI,
    restaurarProyectoAPI,
    eliminarProyectoAPI
} from "../../services/proyectosService";

import { obtenerClientes } from "../../services/clientesService";

import "./Proyectos.css";


function ProyectosComp() {

    const [mostrarModal, setMostrarModal] = useState(false);
    const [proyectoEditar, setProyectoEditar] = useState(null);

    const [proyectos, setProyectos] = useState([]);
    const [clientes, setClientes] = useState([]);

    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("TODO");
    const [clienteFiltro, setClienteFiltro] = useState("TODOS");

    const [cargando, setCargando] = useState(true);


    useEffect(() => {
        cargarTodo();
    }, []);


    const cargarTodo = async () => {
        try {
            setCargando(true);

            await Promise.all([
                cargarProyectos(),
                cargarClientes()
            ]);
        } finally {
            setCargando(false);
        }
    };


    const cargarProyectos = async () => {
        try {
            const data = await obtenerProyectos({ estado: "todo" });

            console.log("Proyectos backend:", data);

            setProyectos(
                data.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    descripcion: p.descripcion || "",
                    cliente_id: p.cliente_id,
                    cliente: p.nombre_cliente || "Sin cliente",
                    estado: p.estado,
                    color: p.color || "#10b981",
                    archivado: p.archivado,
                    favorito: false
                }))
            );
        } catch (error) {
            console.error("Error cargando proyectos", error);
        }
    };


    const cargarClientes = async () => {
        try {
            const data = await obtenerClientes();
            setClientes(data);
        } catch (error) {
            console.error("Error cargando clientes", error);
        }
    };


    const proyectosFiltrados = proyectos.filter((p) => {

        const texto = busqueda.toLowerCase();

        const coincideBusqueda =
            p.nombre.toLowerCase().includes(texto);

        const coincideEstado =
            estadoFiltro === "TODO" ||
            p.estado === estadoFiltro;

        const coincideCliente =
            clienteFiltro === "TODOS" ||
            String(p.cliente_id) === String(clienteFiltro);

        return coincideBusqueda && coincideEstado && coincideCliente;
    });


    const archivarProyecto = async (id) => {
        try {
            const actualizado = await archivarProyectoAPI(id);
            setProyectos(prev =>
                prev.map(p =>
                    p.id === id
                        ? { ...p, estado: actualizado.estado, archivado: actualizado.archivado }
                        : p
                )
            );
        } catch (error) {
            console.error("Error archivando proyecto", error);
            alert(error.response?.data?.detail || "No se pudo archivar");
        }
    };


    const restaurarProyecto = async (id) => {
        try {
            const actualizado = await restaurarProyectoAPI(id);
            setProyectos(prev =>
                prev.map(p =>
                    p.id === id
                        ? { ...p, estado: actualizado.estado, archivado: actualizado.archivado }
                        : p
                )
            );
        } catch (error) {
            console.error("Error restaurando proyecto", error);
            alert(error.response?.data?.detail || "No se pudo restaurar");
        }
    };


    const eliminarProyecto = async (id) => {
        if (!window.confirm("¿Eliminar este proyecto permanentemente?")) return;

        try {
            await eliminarProyectoAPI(id);
            setProyectos(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error eliminando proyecto", error);
            alert(error.response?.data?.detail || "No se pudo eliminar");
        }
    };


    const editarProyecto = (proyecto) => {
        setProyectoEditar(proyecto);
        setMostrarModal(true);
    };


    return (
        <div className="proyectos-container">

            {/* ✅ OVERLAY: aparece ENCIMA, no reemplaza */}
            <LoadingOverlay visible={cargando} />

            <div className="proyectos-contenedor">

                <div className="proyectos-header">
                    <h1>Proyectos</h1>

                    <button
                        onClick={() => {
                            setProyectoEditar(null);
                            setMostrarModal(true);
                        }}
                    >
                        CREAR NUEVO PROYECTO
                    </button>
                </div>

                <ProyectoFiltros
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    estadoFiltro={estadoFiltro}
                    setEstadoFiltro={setEstadoFiltro}
                    clienteFiltro={clienteFiltro}
                    setClienteFiltro={setClienteFiltro}
                    clientes={clientes}
                />

                <ProyectoTable
                    proyectos={proyectosFiltrados}
                    archivarProyecto={archivarProyecto}
                    restaurarProyecto={restaurarProyecto}
                    eliminarProyecto={eliminarProyecto}
                    editarProyecto={editarProyecto}
                />

            </div>

            {
                mostrarModal && (
                    <ModalProyecto
                        cerrar={() => {
                            setMostrarModal(false);
                            setProyectoEditar(null);
                        }}
                        proyectoEditar={proyectoEditar}
                        clientes={clientes}
                        guardar={async (nuevoProyecto) => {
                            try {
                                if (proyectoEditar) {
                                    const actualizado = await editarProyectoAPI(
                                        nuevoProyecto.id,
                                        {
                                            nombre: nuevoProyecto.nombre,
                                            descripcion: nuevoProyecto.descripcion,
                                            cliente_id: nuevoProyecto.cliente_id,
                                            estado: nuevoProyecto.estado,
                                            color: nuevoProyecto.color
                                        }
                                    );

                                    setProyectos(prev =>
                                        prev.map(p =>
                                            p.id === actualizado.id
                                                ? {
                                                    ...p,
                                                    nombre: actualizado.nombre,
                                                    descripcion: actualizado.descripcion || "",
                                                    cliente_id: actualizado.cliente_id,
                                                    cliente: actualizado.nombre_cliente || "Sin cliente",
                                                    estado: actualizado.estado,
                                                    color: actualizado.color || "#10b981",
                                                    archivado: actualizado.archivado
                                                  }
                                                : p
                                        )
                                    );
                                } else {
                                    const creado = await crearProyectoAPI({
                                        nombre: nuevoProyecto.nombre,
                                        descripcion: nuevoProyecto.descripcion || null,
                                        cliente_id: nuevoProyecto.cliente_id || null,
                                        estado: nuevoProyecto.estado,
                                        color: nuevoProyecto.color
                                    });

                                    setProyectos(prev => [
                                        ...prev,
                                        {
                                            id: creado.id,
                                            nombre: creado.nombre,
                                            descripcion: creado.descripcion || "",
                                            cliente_id: creado.cliente_id,
                                            cliente: creado.nombre_cliente || "Sin cliente",
                                            estado: creado.estado,
                                            color: creado.color || "#10b981",
                                            archivado: creado.archivado,
                                            favorito: false
                                        }
                                    ]);
                                }

                                setMostrarModal(false);
                                setProyectoEditar(null);
                            } catch (error) {
                                console.error("Error guardando proyecto", error);
                                alert(error.response?.data?.detail || "No se pudo guardar el proyecto");
                            }
                        }}
                    />
                )
            }
        </div>
    );
}

export default ProyectosComp;