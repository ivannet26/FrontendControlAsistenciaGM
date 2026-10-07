import "./ModalProyecto.css";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { obtenerClientes } from "../../../services/clientesService";
import toast from "react-hot-toast";


function ModalProyecto({ cerrar, guardar }) {

    const [nombreProyecto, setNombreProyecto] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [clienteId, setClienteId] = useState("");
    const [estado, setEstado] = useState("ACTIVO");
    const [color, setColor] = useState("#344650");

    const [clientes, setClientes] = useState([]);
    const [cargandoClientes, setCargandoClientes] = useState(true);


    // Cargar clientes al montar
    useEffect(() => {
        obtenerClientes()
            .then((data) => {
                const activos = (data || []).filter(c => !c.archivado);
                setClientes(activos);
            })
            .catch((err) => console.error("Error cargando clientes:", err))
            .finally(() => setCargandoClientes(false));
    }, []);


    const crearProyecto = () => {
        if (!nombreProyecto.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        guardar({
            nombre: nombreProyecto,
            descripcion,
            cliente_id: clienteId || null,
            estado,
            color,
        });

        cerrar();
    };


    return (
        <div className="modal-overlay" onClick={cerrar}>
            <div className="modal-proyecto" onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className="modal-header">
                    <h2>Crear nuevo proyecto</h2>
                    <button className="modal-cerrar" onClick={cerrar} aria-label="Cerrar">
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="modal-body">

                    <div className="campo-grupo">
                        <label>Nombre *</label>
                        <input
                            type="text"
                            placeholder="Nombre del proyecto"
                            value={nombreProyecto}
                            onChange={(e) => setNombreProyecto(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="campo-grupo">
                        <label>Descripción</label>
                        <input
                            type="text"
                            placeholder="Descripción breve"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </div>

                    <div className="campo-grupo">
                        <label>Cliente</label>
                        <select
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                            disabled={cargandoClientes}
                        >
                            <option value="">Sin cliente</option>
                            {cargandoClientes ? (
                                <option disabled>Cargando...</option>
                            ) : clientes.length === 0 ? (
                                <option disabled>No hay clientes registrados</option>
                            ) : (
                                clientes.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="campo-grupo">
                        <label>Estado</label>
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                        >
                            <option value="ACTIVO">Activo</option>
                            <option value="PAUSADO">Pausado</option>
                            <option value="ARCHIVADO">Archivado</option>
                        </select>
                    </div>

                    <div className="campo-grupo">
                        <label>Color</label>
                        <input
                            type="color"
                            className="input-color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>

                </div>

                {/* FOOTER */}
                <div className="modal-footer">
                    <button className="cancelar" onClick={cerrar}>
                        Cancelar
                    </button>
                    <button className="crear" onClick={crearProyecto}>
                        Guardar
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ModalProyecto;