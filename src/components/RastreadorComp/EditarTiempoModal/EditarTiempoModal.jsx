import { useState } from "react";
import toast from "react-hot-toast";
import { editarTiempoAdmin } from "../../../services/tareasService";
import "./EditarTiempoModal.css";


const toLocalInput = (iso) => {
    if (!iso) return "";
    
    let isoConZona = iso;
    if (!iso.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(iso)) {
        isoConZona = iso + "Z";
    }
    
    const d = new Date(isoConZona);
    const pad = (n) => String(n).padStart(2, "0");
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
};
function EditarTiempoModal({ registro, onClose, onGuardado }) {
    const [inicio, setInicio] = useState(toLocalInput(registro.horaInicio));
    const [fin, setFin] = useState(toLocalInput(registro.horaFin));
    const [descripcion, setDescripcion] = useState(registro.actividad || "");
    const [motivo, setMotivo] = useState("");
    const [guardando, setGuardando] = useState(false);

    const guardar = async () => {
    if (motivo.trim().length < 10) {
        toast.error("El motivo debe tener al menos 10 caracteres");
        return;
    }

    if (new Date(fin) <= new Date(inicio)) {
        toast.error("La hora de fin debe ser mayor que la de inicio");
        return;
    }

    if (!window.confirm("¿Confirmas la edición? Quedará registrada en auditoría.")) {
        return;
    }

    setGuardando(true);
    try {
        await editarTiempoAdmin(registro.id, {
            inicio: `${inicio}:00-05:00`,
            fin: `${fin}:00-05:00`,
            descripcion,
            motivo,
        });
        toast.success("Registro actualizado");
        onGuardado();
        onClose();
    } catch (err) {
        toast.error(err.message);
    } finally {
        setGuardando(false);
    }
};

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-editar-tiempo"
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Editar tiempo</h3>

                <p className="modal-advertencia">
                    Esta acción quedará registrada en auditoría.
                </p>

                <label>Inicio:</label>
                <input
                    type="datetime-local"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                />

                <label>Fin:</label>
                <input
                    type="datetime-local"
                    value={fin}
                    onChange={(e) => setFin(e.target.value)}
                />

                <label>Descripción:</label>
                <input
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />

                <label>Motivo de la edición: *</label>
                <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej: Usuario olvidó detener el timer al salir a almorzar"
                    rows={3}
                />

                <div className="modal-botones">
                    <button onClick={onClose}>Cancelar</button>
                    <button
                        onClick={guardar}
                        disabled={guardando || motivo.trim().length < 10}
                    >
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditarTiempoModal;