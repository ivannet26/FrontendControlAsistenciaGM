import { useState, useMemo } from "react";
import { Pencil, X, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import "./GruposTable.css";


function GruposTable({
    grupos,
    editarGrupo,
    eliminarGrupo
}) {

    const [orden, setOrden] = useState({ columna: null, direccion: null });


    const cambiarOrden = (columna) => {
        setOrden(prev => {
            if (prev.columna === columna) {
                if (prev.direccion === "asc") {
                    return { columna, direccion: "desc" };
                }
                if (prev.direccion === "desc") {
                    return { columna: null, direccion: null };
                }
            }
            return { columna, direccion: "asc" };
        });
    };


    const gruposOrdenados = useMemo(() => {
        if (!orden.columna) return grupos;

        const copia = [...grupos];

        copia.sort((a, b) => {
            let valorA, valorB;

            if (orden.columna === "nombre") {
                valorA = a.nombre.toLowerCase();
                valorB = b.nombre.toLowerCase();
            } else if (orden.columna === "acceso") {
                valorA = (a.miembros || []).join(", ").toLowerCase();
                valorB = (b.miembros || []).join(", ").toLowerCase();
            }

            if (valorA < valorB) return orden.direccion === "asc" ? -1 : 1;
            if (valorA > valorB) return orden.direccion === "asc" ? 1 : -1;
            return 0;
        });

        return copia;
    }, [grupos, orden]);


    const iconoOrden = (columna) => {
        if (orden.columna !== columna) {
            return <ChevronsUpDown size={14} className="icono-sort" />;
        }
        if (orden.direccion === "asc") {
            return <ChevronUp size={14} className="icono-sort activo" />;
        }
        return <ChevronDown size={14} className="icono-sort activo" />;
    };


    return (
        <div className="grupos-tabla-container">

            <div className="tabla-header">
                <span>Grupos</span>
                <button>Exportar ▾</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th
                            className="th-ordenable"
                            onClick={() => cambiarOrden("nombre")}
                        >
                            <span>NOMBRE</span>
                            {iconoOrden("nombre")}
                        </th>

                        <th
                            className="th-ordenable"
                            onClick={() => cambiarOrden("acceso")}
                        >
                            <span>ACCESO</span>
                            {iconoOrden("acceso")}
                        </th>

                        <th className="col-acciones-grupo"></th>
                    </tr>
                </thead>

                <tbody>
                    {gruposOrdenados.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: "center", padding: 30 }}>
                                No hay grupos creados
                            </td>
                        </tr>
                    ) : (
                        gruposOrdenados.map((grupo) => (
                            <tr key={grupo.id}>
                                <td>
                                    <span className="grupo-nombre">
                                        {grupo.nombre}
                                    </span>
                                </td>

                                <td>
                                    <span className="grupo-miembros">
                                        {grupo.miembros && grupo.miembros.length > 0
                                            ? grupo.miembros.join(", ")
                                            : "Sin miembros"}
                                    </span>
                                </td>

                                <td className="col-acciones-grupo">
                                    <div className="grupo-acciones">
                                        <button
                                            className="btn-icono"
                                            onClick={() => editarGrupo(grupo)}
                                            title="Editar grupo"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            className="btn-icono"
                                            onClick={() => eliminarGrupo(grupo.id)}
                                            title="Eliminar grupo"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

        </div>
    );
}

export default GruposTable;