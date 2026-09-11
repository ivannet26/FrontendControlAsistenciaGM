import { useState } from "react";
import "./Proyectos.css";


function ModalProyecto({
    cerrar,
    guardar,
    proyectoEditar,
    clientes = []
}) {

    const [nombre, setNombre] = useState(proyectoEditar?.nombre || "");
    const [descripcion, setDescripcion] = useState(proyectoEditar?.descripcion || "");
    const [clienteId, setClienteId] = useState(proyectoEditar?.cliente_id || "");
    const [estado, setEstado] = useState(proyectoEditar?.estado || "ACTIVO");
    const [color, setColor] = useState(proyectoEditar?.color || "#10b981");


    const guardarProyecto = () => {

        if (!nombre.trim()) {
            alert("El nombre es obligatorio");
            return;
        }

        const nuevoProyecto = {
            id: proyectoEditar?.id,
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            cliente_id: clienteId ? parseInt(clienteId) : null,
            estado,
            color
        };

        guardar(nuevoProyecto);
    };


    return (
        <div className="modal-overlay">

            <div className="modal-proyecto">

                <div className="modal-header">
                    <h2>
                        {proyectoEditar ? "Editar proyecto" : "Crear nuevo proyecto"}
                    </h2>
                    <button onClick={cerrar}>×</button>
                </div>

                <div className="modal-body">

                    <label>Nombre *</label>
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre del proyecto"
                    />

                    <label>Descripción</label>
                    <input
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción breve"
                    />

                    <label>Cliente</label>
                    <select
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                    >
                        <option value="">Sin cliente</option>
                        {clientes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>

                    <label>Estado</label>
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                    >
                        <option value="ACTIVO">Activo</option>
                        <option value="PAUSADO">Pausado</option>
                        <option value="FINALIZADO">Finalizado</option>
                    </select>

                    <label>Color</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />

                </div>

                <div className="modal-footer">

                    <button className="cancelar" onClick={cerrar}>
                        Cancelar
                    </button>

                    <button className="guardar" onClick={guardarProyecto}>
                        Guardar
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ModalProyecto;