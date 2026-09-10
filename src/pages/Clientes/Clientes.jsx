import { useState, useEffect } from "react";
import "../Clientes/Clientes.css";
import ClientesFiltro from "../../components/ClientesComp/ClientesFiltro";
import ClientesTable from "../../components/ClientesComp/ClientesTable";
import ModalCliente from "../../components/ClientesComp/ModalClientes";

import {
    obtenerClientes,
    crearCliente,
    editarClienteAPI,
    archivarClienteAPI,
    restaurarClienteAPI,
    eliminarClienteAPI
} from "../../services/clientesService";


function Clientes() {

    const [mostrarModal, setMostrarModal] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("Todos");
    const [clienteEditar, setClienteEditar] = useState(null);
    const [clientes, setClientes] = useState([]);


    useEffect(() => {
        cargarClientes();
    }, []);


    const cargarClientes = async () => {
        try {
            const data = await obtenerClientes();

            console.log("Clientes backend:", data);

            setClientes(
                data.map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    email: c.email || "",
                    destinatarios_cc: c.destinatarios_cc || [],
                    direccion: c.direccion || "",
                    nota: c.nota || "",
                    moneda: c.moneda,
                    estado: c.archivado ? "Archivado" : "Activo"
                }))
            );
        } catch (error) {
            console.error("Error cargando clientes", error);
        }
    };


    // FILTROS

    const clientesFiltrados = clientes.filter((cliente) => {

        const texto = busqueda.toLowerCase();

        const coincideBusqueda =
            cliente.nombre.toLowerCase().includes(texto) ||
            (cliente.direccion || "").toLowerCase().includes(texto);

        const coincideEstado =
            estadoFiltro === "Todos" ||
            cliente.estado === estadoFiltro;

        return coincideBusqueda && coincideEstado;
    });


    // ARCHIVAR

    const archivarCliente = async (id) => {
        try {
            const actualizado = await archivarClienteAPI(id);

            setClientes(prev =>
                prev.map(c =>
                    c.id === id
                        ? { ...c, estado: actualizado.archivado ? "Archivado" : "Activo" }
                        : c
                )
            );
        } catch (error) {
            console.error("Error archivando cliente", error);
            alert(error.response?.data?.detail || "No se pudo archivar el cliente");
        }
    };


    // RESTAURAR

    const restaurarCliente = async (id) => {
        try {
            const actualizado = await restaurarClienteAPI(id);

            setClientes(prev =>
                prev.map(c =>
                    c.id === id
                        ? { ...c, estado: actualizado.archivado ? "Archivado" : "Activo" }
                        : c
                )
            );
        } catch (error) {
            console.error("Error restaurando cliente", error);
            alert(error.response?.data?.detail || "No se pudo restaurar el cliente");
        }
    };


    // ELIMINAR

    const eliminarCliente = async (id) => {

        const cliente = clientes.find(c => c.id === id);
        if (!cliente) return;

        if (cliente.estado !== "Archivado") {
            alert("Primero debes archivar el cliente");
            return;
        }

        try {
            await eliminarClienteAPI(id);

            setClientes(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error eliminando cliente", error);
            alert(error.response?.data?.detail || "No se pudo eliminar el cliente");
        }
    };


    // EDITAR

    const editarCliente = (cliente) => {
        setClienteEditar(cliente);
        setMostrarModal(true);
    };


    return (
        <div className="clientes-container">

            <div className="clientes-top">
                <h1>Clientes</h1>
            </div>

            <div className="clientes-contenedor">

                <div className="contenedor-header">
                    <button
                        className="crear-cliente"
                        onClick={() => {
                            setClienteEditar(null);
                            setMostrarModal(true);
                        }}
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
                    archivarCliente={archivarCliente}
                    restaurarCliente={restaurarCliente}
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

                    guardar={async (nuevoCliente) => {
                        try {
                            if (clienteEditar) {
                                const actualizado = await editarClienteAPI(
                                    nuevoCliente.id,
                                    {
                                        nombre: nuevoCliente.nombre,
                                        email: nuevoCliente.email || null,
                                        destinatarios_cc: nuevoCliente.destinatarios_cc,
                                        direccion: nuevoCliente.direccion,
                                        nota: nuevoCliente.nota,
                                        moneda: nuevoCliente.moneda
                                    }
                                );

                                setClientes(prev =>
                                    prev.map(c =>
                                        c.id === actualizado.id
                                            ? {
                                                ...c,
                                                nombre: actualizado.nombre,
                                                email: actualizado.email || "",
                                                destinatarios_cc: actualizado.destinatarios_cc || [],
                                                direccion: actualizado.direccion || "",
                                                nota: actualizado.nota || "",
                                                moneda: actualizado.moneda,
                                                estado: actualizado.archivado ? "Archivado" : "Activo"
                                              }
                                            : c
                                    )
                                );
                            } else {
                                const creado = await crearCliente({
                                    nombre: nuevoCliente.nombre,
                                    email: nuevoCliente.email || null,
                                    destinatarios_cc: nuevoCliente.destinatarios_cc,
                                    direccion: nuevoCliente.direccion,
                                    nota: nuevoCliente.nota,
                                    moneda: nuevoCliente.moneda
                                });

                                setClientes(prev => [
                                    ...prev,
                                    {
                                        id: creado.id,
                                        nombre: creado.nombre,
                                        email: creado.email || "",
                                        destinatarios_cc: creado.destinatarios_cc || [],
                                        direccion: creado.direccion || "",
                                        nota: creado.nota || "",
                                        moneda: creado.moneda,
                                        estado: "Activo"
                                    }
                                ]);
                            }

                            setMostrarModal(false);
                            setClienteEditar(null);
                        } catch (error) {
                            console.error("Error guardando cliente", error);
                            alert(error.response?.data?.detail || "No se pudo guardar el cliente");
                        }
                    }}
                />
            }
        </div>
    );
}


export default Clientes;