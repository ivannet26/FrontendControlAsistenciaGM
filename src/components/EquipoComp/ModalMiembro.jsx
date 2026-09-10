import { useState } from "react";
import "./Equipo.css";


function ModalMiembro({
    cerrar,
    guardar,
    miembroEditar,
    grupos = []
}) {

    const [grupoId, setGrupoId] = useState(
        miembroEditar?.grupo_id || ""
    );

    const [tipoUsuario, setTipoUsuario] = useState(
        miembroEditar?.rol || "MIEMBRO"
    );

    const [estado, setEstado] = useState(
        miembroEditar?.estado || "ACTIVO"
    );

    const [claveTemp, setClaveTemp] = useState("");

    // Solo para crear
    const [usuarioId, setUsuarioId] = useState("");


    const guardarMiembro = () => {

        if (miembroEditar) {
            // Editar
            guardar({
                id: miembroEditar.id,
                grupo_id: grupoId ? parseInt(grupoId) : null,
                tipo_usuario: tipoUsuario,
                estado: estado,
                clave_temp: claveTemp || null
            });
        } else {
            // Crear
            if (!usuarioId) {
                alert("Debes ingresar el ID del usuario");
                return;
            }

            guardar({
                usuario_id: parseInt(usuarioId),
                grupo_id: grupoId ? parseInt(grupoId) : null,
                tipo_usuario: tipoUsuario,
                estado: estado,
                clave_temp: claveTemp || null
            });
        }
    };


    return (
        <div className="modal-overlay">

            <div className="modal-miembro">

                <div className="modal-header">
                    <h2>
                        {miembroEditar ? "Editar miembro" : "Añadir nuevo miembro"}
                    </h2>
                    <button onClick={cerrar}>×</button>
                </div>

                <div className="modal-body">

                    {!miembroEditar && (
                        <>
                            <label>ID de usuario *</label>
                            <input
                                type="number"
                                placeholder="Ej: 8"
                                value={usuarioId}
                                onChange={(e) => setUsuarioId(e.target.value)}
                            />
                            <p className="mensaje-invitacion">
                                Ingresa el ID del usuario registrado que deseas agregar al equipo.
                            </p>
                        </>
                    )}

                    {miembroEditar && (
                        <>
                            <label>Nombre</label>
                            <input
                                type="text"
                                value={miembroEditar.nombre}
                                disabled
                            />

                            <label>Correo</label>
                            <input
                                type="text"
                                value={miembroEditar.correo}
                                disabled
                            />
                        </>
                    )}

                    <label>Grupo</label>
                    <select
                        value={grupoId}
                        onChange={(e) => setGrupoId(e.target.value)}
                    >
                        <option value="">Sin grupo</option>
                        {grupos.map(g => (
                            <option key={g.id} value={g.id}>
                                {g.nombre}
                            </option>
                        ))}
                    </select>

                    <label>Tipo de usuario</label>
                    <select
                        value={tipoUsuario}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                    >
                        <option value="MIEMBRO">Miembro</option>
                        <option value="ADMINISTRACION">Administración</option>
                    </select>

                    <label>Estado</label>
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                    >
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                        <option value="INVITADO">Invitado</option>
                    </select>

                    <label>Clave temporal (opcional)</label>
                    <input
                        type="text"
                        placeholder="Si la dejas vacía, no se cambia"
                        value={claveTemp}
                        onChange={(e) => setClaveTemp(e.target.value)}
                    />

                </div>

                <div className="modal-footer">

                    <button className="cancelar" onClick={cerrar}>
                        Cancelar
                    </button>

                    <button className="guardar" onClick={guardarMiembro}>
                        Guardar
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ModalMiembro;