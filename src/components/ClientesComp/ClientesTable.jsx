import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil } from "lucide-react";
import "./ClientesTable.css";


function ClientesTable({
    clientes,
    archivarCliente,
    restaurarCliente,
    eliminarCliente,
    editarCliente
}) {

    const [menuAbierto, setMenuAbierto] = useState(null);
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
                                        onClick={() =>
                                            setMenuAbierto(
                                                menuAbierto === cliente.id
                                                    ? null
                                                    : cliente.id
                                            )
                                        }
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                {menuAbierto === cliente.id && (
                                    <div className="menu-opciones" ref={menuRef}>
                                        {cliente.estado === "Activo" ? (
                                            <button
                                                onClick={() => {
                                                    archivarCliente(cliente.id);
                                                    setMenuAbierto(null);
                                                }}
                                            >
                                                Archivar
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        restaurarCliente(cliente.id);
                                                        setMenuAbierto(null);
                                                    }}
                                                >
                                                    Restaurar
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        eliminarCliente(cliente.id);
                                                        setMenuAbierto(null);
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ClientesTable;