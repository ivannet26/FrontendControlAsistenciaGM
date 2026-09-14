import { useState } from "react";
import "../Equipo.css";                  // 👈 sube un nivel


function ModalGrupo({
    cerrar,
    guardar,
    grupoEditar
}) {

    const [nombre, setNombre] = useState(grupoEditar?.nombre || "");
    const [descripcion, setDescripcion] = useState(grupoEditar?.descripcion || "");


    const guardarGrupo = () => {
        if (!nombre.trim()) {
            alert("El nombre del grupo es obligatorio");
            return;
        }

        guardar({
            id: grupoEditar?.id,
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null
        });
    };


    return (
        <div className="modal-overlay">

            <div className="modal-miembro">

                <div className="modal-header">
                    <h2>
                        {grupoEditar ? "Editar grupo" : "Crear nuevo grupo"}
                    </h2>
                    <button onClick={cerrar}>×</button>
                </div>

                <div className="modal-body">

                    <label>Nombre *</label>
                    <input
                        type="text"
                        placeholder="Ej: SistemasGM202502"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />

                    <label>Descripción</label>
                    <input
                        type="text"
                        placeholder="Descripción del grupo"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />

                </div>

                <div className="modal-footer">
                    <button className="cancelar" onClick={cerrar}>
                        Cancelar
                    </button>
                    <button className="guardar" onClick={guardarGrupo}>
                        Guardar
                    </button>
                </div>

            </div>

        </div>
    );
}

export default ModalGrupo;