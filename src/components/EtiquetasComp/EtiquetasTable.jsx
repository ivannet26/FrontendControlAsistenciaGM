import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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


    const etiquetaMenu = etiquetas.find(e => e.id === menuAbierto);


    return (
        <div className="etiquetas-tabla-container">

            <div className="tabla-header">
                <span>Etiquetas</span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" /></th>
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
                            <td><input type="checkbox" /></td>

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

                                    <button
                                        className="btn-icono"
                                        onClick={(e) => abrirMenu(e, etiqueta.id)}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {/* ✅ MENÚ RENDERIZADO EN EL BODY */}
            {menuAbierto && etiquetaMenu && createPortal(

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
                    {etiquetaMenu.estado === "Activo" ? (
                        <button
                            onClick={() => {
                                archivarEtiqueta(etiquetaMenu.id);
                                setMenuAbierto(null);
                            }}
                        >
                            Archivar
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    restaurarEtiqueta(etiquetaMenu.id);
                                    setMenuAbierto(null);
                                }}
                            >
                                Restaurar
                            </button>

                            <button
                                onClick={() => {
                                    eliminarEtiqueta(etiquetaMenu.id);
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


export default EtiquetasTable;