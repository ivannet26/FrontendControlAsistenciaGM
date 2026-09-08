import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil } from "lucide-react";
import "./EtiquetasTable.css";

function EtiquetasTable({
    etiquetas,
    editarEtiqueta,
    archivarEtiqueta,
    restaurarEtiqueta,
    eliminarEtiqueta
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
        <div className="etiquetas-tabla-container">
            <div className="tabla-header">
                <span>Etiquetas</span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" />
                        </th>
                        <th>NOMBRE</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {etiquetas.map((etiqueta) => (
                        <tr
                            key={etiqueta.id}
                            className={
                                etiqueta.estado === "Archivado"
                                    ? "fila-archivada"
                                    : ""
                            }
                        >
                            <td>
                                <input type="checkbox" />
                            </td>

                            <td>
                                <span
                                    className={
                                        etiqueta.estado === "Archivado"
                                            ? "etiqueta-nombre archivada"
                                            : "etiqueta-nombre"
                                    }
                                >
                                    {etiqueta.nombre}
                                </span>
                            </td>

                            <td className="col-acciones">
                                <div className="acciones">
                                    <button
                                        className="btn-icono"
                                        onClick={() => editarEtiqueta(etiqueta)}
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <div className="menu-container" ref={menuRef}>
                                        <button
                                            className="btn-icono"
                                            onClick={() =>
                                                setMenuAbierto(
                                                    menuAbierto === etiqueta.id
                                                        ? null
                                                        : etiqueta.id
                                                )
                                            }
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {menuAbierto === etiqueta.id && (
                                            <div className="menu-opciones">
                                                {etiqueta.estado === "Activo" ? (
                                                    <button
                                                        onClick={() => {
                                                            archivarEtiqueta(etiqueta.id);
                                                            setMenuAbierto(null);
                                                        }}
                                                    >
                                                        Archivar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                restaurarEtiqueta(etiqueta.id);
                                                                setMenuAbierto(null);
                                                            }}
                                                        >
                                                            Restaurar
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                eliminarEtiqueta(etiqueta.id);
                                                                setMenuAbierto(null);
                                                            }}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default EtiquetasTable;