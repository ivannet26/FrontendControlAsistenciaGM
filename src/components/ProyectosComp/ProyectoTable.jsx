import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Star, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Proyectos.css";


function ProyectoTable({
    proyectos,
    archivarProyecto,
    restaurarProyecto,
    eliminarProyecto,
    editarProyecto
}) {

    const [favoritos, setFavoritos] = useState({});
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

    const navigate = useNavigate();
    const menuRef = useRef(null);


    useEffect(() => {
        const cerrarMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAbierto(null);
            }
        };

        document.addEventListener("mousedown", cerrarMenu);
        return () => document.removeEventListener("mousedown", cerrarMenu);
    }, []);


    const cambiarFavorito = (id) => {
        setFavoritos(prev => ({ ...prev, [id]: !prev[id] }));
    };


    const abrirMenu = (e, id) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();

        setMenuPos({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right
        });

        setMenuAbierto(menuAbierto === id ? null : id);
    };


    const proyectoMenu = proyectos.find(p => p.id === menuAbierto);


    return (
        <div className="tabla-container">
            <div className="tabla-header-tareas">
                    <span>Proyectos</span>
                </div>
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" /></th>
                        <th>NOMBRE ⇅</th>
                        <th>CLIENTE ⇅</th>
                        <th>REGISTRADO ⇅</th>
                        <th>PROGRESO ⇅</th>
                        <th>ACCESO</th>
                        <th className="col-acciones"></th>
                    </tr>
                </thead>

                <tbody>
                    {proyectos.map((proyecto) => (
                        <tr
                            key={proyecto.id}
                            className={proyecto.archivado ? "fila-archivada" : ""}
                        >
                            <td><input type="checkbox" /></td>

                            <td>
                                <span
                                    className="nombre-proyecto"
                                    onClick={() => navigate(`/app/proyectos/${proyecto.id}`)}
                                    style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                                >
                                    <span
                                        className="punto"
                                        style={{ background: proyecto.color || "#10b981" }}
                                    />
                                    {proyecto.nombre}
                                </span>
                            </td>

                            <td>{proyecto.cliente}</td>

                            <td>{proyecto.horas || "0.00h"}</td>

                            <td>{proyecto.progreso || "—"}</td>

                            <td>{proyecto.acceso || "Público"}</td>

                            <td className="col-acciones">
                                <div className="acciones">

                                    <Star
                                        size={20}
                                        className={favoritos[proyecto.id] ? "star activo" : "star"}
                                        onClick={() => cambiarFavorito(proyecto.id)}
                                    />

                                    <MoreVertical
                                        size={20}
                                        className="menu-icon"
                                        onClick={(e) => abrirMenu(e, proyecto.id)}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {menuAbierto && proyectoMenu && createPortal(

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
                    <button
                        onClick={() => {
                            editarProyecto(proyectoMenu);
                            setMenuAbierto(null);
                        }}
                    >
                        Editar
                    </button>

                    {!proyectoMenu.archivado ? (
                        <button
                            onClick={() => {
                                archivarProyecto(proyectoMenu.id);
                                setMenuAbierto(null);
                            }}
                        >
                            Archivar
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    restaurarProyecto(proyectoMenu.id);
                                    setMenuAbierto(null);
                                }}
                            >
                                Restaurar
                            </button>

                            <button
                                onClick={() => {
                                    eliminarProyecto(proyectoMenu.id);
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

export default ProyectoTable;