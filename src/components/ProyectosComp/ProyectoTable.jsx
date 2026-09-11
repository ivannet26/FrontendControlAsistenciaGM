import { useState, useEffect, useRef } from "react";
import { Star, MoreVertical } from "lucide-react";
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


    const cambiarFavorito = (id) => {
        setFavoritos(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };


    return (
        <div className="tabla-container">

            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" /></th>
                        <th>NOMBRE</th>
                        <th>CLIENTE</th>
                        <th>ESTADO</th>
                        <th className="col-acciones"></th>
                    </tr>
                </thead>

                <tbody>
                    {proyectos.map((proyecto) => (
                        <tr
                            key={proyecto.id}
                            className={
                                proyecto.archivado ? "fila-archivada" : ""
                            }
                        >
                            <td><input type="checkbox" /></td>

                            <td>
                                <span className="nombre-proyecto">
                                    <span
                                        className="punto"
                                        style={{ background: proyecto.color }}
                                    />
                                    {proyecto.nombre}
                                </span>
                            </td>

                            <td>{proyecto.cliente}</td>

                            <td>
                                <span
                                    className={
                                        "estado-badge estado-" +
                                        (proyecto.estado || "").toLowerCase()
                                    }
                                >
                                    {proyecto.estado}
                                </span>
                            </td>

                            <td className="col-acciones">
                                <div className="acciones">

                                    <Star
                                        size={20}
                                        className={
                                            favoritos[proyecto.id]
                                                ? "star activo"
                                                : "star"
                                        }
                                        onClick={() => cambiarFavorito(proyecto.id)}
                                    />

                                    <MoreVertical
                                        size={20}
                                        className="menu-icon"
                                        onClick={() =>
                                            setMenuAbierto(
                                                menuAbierto === proyecto.id
                                                    ? null
                                                    : proyecto.id
                                            )
                                        }
                                    />
                                </div>

                                {menuAbierto === proyecto.id && (
                                    <div className="menu-opciones" ref={menuRef}>

                                        <button
                                            onClick={() => {
                                                editarProyecto(proyecto);
                                                setMenuAbierto(null);
                                            }}
                                        >
                                            Editar
                                        </button>

                                        {!proyecto.archivado ? (
                                            <button
                                                onClick={() => {
                                                    archivarProyecto(proyecto.id);
                                                    setMenuAbierto(null);
                                                }}
                                            >
                                                Archivar
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        restaurarProyecto(proyecto.id);
                                                        setMenuAbierto(null);
                                                    }}
                                                >
                                                    Restaurar
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        eliminarProyecto(proyecto.id);
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

export default ProyectoTable;