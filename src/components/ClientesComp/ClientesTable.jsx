import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import "./ClientesTable.css";


function ClientesTable({
    clientes,
    archivarCliente,
    restaurarCliente,
    eliminarCliente,
    editarCliente
}) {

    const [menuAbierto, setMenuAbierto] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

    const menuRef = useRef(null);


    useEffect(() => {
        const cerrarMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAbierto(null);
            }
        };

        document.addEventListener("mousedown", cerrarMenu);

        return () => {
            document.removeEventListener("mousedown", cerrarMenu);
        };
    }, []);


    const abrirMenu = (e, id) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();

        setMenuPos({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right
        });

        setMenuAbierto(menuAbierto === id ? null : id);
    };


    const clienteMenu = clientes.find(c => c.id === menuAbierto);


    return (
        <div className="clientes-tabla-container">

            <div className="tabla-header">
                <span>Clientes</span>
                <button>Exportar ▾</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" /></th>
                        <th>NOMBRE</th>
                        <th>DIRECCIÓN</th>
                        <th>MONEDA</th>
                        
                        <th className="col-acciones"></th>
                    </tr>
                </thead>

                <tbody>
                    {clientes.map((cliente) => (
                        <tr
                            key={cliente.id}
                            className={
                                cliente.estado === "Archivado"
                                    ? "fila-archivada"
                                    : ""
                            }
                        >
                            <td><input type="checkbox" /></td>

                            <td>
                                <span
                                    className={
                                        cliente.estado === "Archivado"
                                            ? "cliente-nombre archivada"
                                            : "cliente-nombre"
                                    }
                                >
                                    {cliente.nombre}
                                </span>
                            </td>

                            <td>{cliente.direccion}</td>

                            <td>
                                <span className="moneda-badge">
                                    {cliente.moneda}
                                </span>
                            </td>

                            <td className="col-acciones">
                                <div className="cliente-acciones">

                                    <button
                                        className="btn-icono"
                                        onClick={() => editarCliente(cliente)}
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        className="btn-icono"
                                        onClick={(e) => abrirMenu(e, cliente.id)}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {menuAbierto && clienteMenu && createPortal(

                <div
                    className="menu-opciones-portal"
                    ref={menuRef}
                    style={{
                        position: "fixed",
                        top: menuPos.top,
                        right: menuPos.right,
                        zIndex: 9999999
                    }}
                >
                    {clienteMenu.estado === "Activo" ? (
                        <button
                            onClick={async () => {
                                try {
                                    await archivarCliente(clienteMenu.id);
                                    toast.success("Cliente archivado");
                                } catch (err) {
                                    toast.error(err.message || "No se pudo archivar");
                                }
                                setMenuAbierto(null);
                            }}
                        >
                            Archivar
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={async () => {
                                    try {
                                        await restaurarCliente(clienteMenu.id);
                                        toast.success("Cliente restaurado");
                                    } catch (err) {
                                        toast.error(err.message || "No se pudo restaurar");
                                    }
                                    setMenuAbierto(null);
                                }}
                            >
                                Restaurar
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        await eliminarCliente(clienteMenu.id);
                                        toast.success("Cliente eliminado");
                                    } catch (err) {
                                        toast.error(err.message || "No se pudo eliminar");
                                    }
                                    setMenuAbierto(null);
                                }}
                            >
                                Eliminar
                            </button>
                        </>
                    )}
                </div>,

                document.body
            )}

        </div>
    );
}


export default ClientesTable;