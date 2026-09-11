import { useState } from "react";
import "../ClientesComp/ModalClientes.css";


function ModalCliente({
    cerrar,
    guardar,
    clienteEditar
}) {

    const [nombre, setNombre] = useState(clienteEditar?.nombre || "");
    const [email, setEmail] = useState(clienteEditar?.email || "");
    const [direccion, setDireccion] = useState(clienteEditar?.direccion || "");
    const [nota, setNota] = useState(clienteEditar?.nota || "");
    const [moneda, setMoneda] = useState(clienteEditar?.moneda || "USD");

    // ✅ Un solo destinatario CC
    const [cc1, setCc1] = useState(clienteEditar?.destinatarios_cc?.[0] || "");


    const guardarCliente = () => {

        if (!nombre.trim()) {
            alert("El nombre es obligatorio");
            return;
        }

        // Construir lista de CC sin vacíos
        const destinatarios_cc = cc1.trim() ? [cc1.trim()] : [];

        const nuevoCliente = {
            id: clienteEditar?.id,
            nombre: nombre.trim(),
            email: email.trim() || null,
            destinatarios_cc,
            direccion: direccion.trim() || null,
            nota: nota.trim() || null,
            moneda
        };

        guardar(nuevoCliente);
    };


    return (
        <div className="modal-overlay">

            <div className="modal-cliente">

                <div className="modal-header">
                    <h2>
                        {clienteEditar ? "Editar cliente" : "Añadir nuevo cliente"}
                    </h2>
                    <button onClick={cerrar}>×</button>
                </div>

                <div className="modal-body">

                    <label>Nombre *</label>
                    <input
                        placeholder="Nombre del cliente"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />

                    <label>Email</label>
                    <input
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label>Destinatario en copia (CC)</label>
                    <input
                        placeholder="cc@ejemplo.com"
                        value={cc1}
                        onChange={(e) => setCc1(e.target.value)}
                    />

                    <label>Dirección</label>
                    <input
                        placeholder="Dirección"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                    />

                    <label>Nota</label>
                    <input
                        placeholder="Nota interna"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                    />

                    <label>Moneda</label>
                    <select
                        value={moneda}
                        onChange={(e) => setMoneda(e.target.value)}
                    >
                        <option value="USD">USD</option>
                        <option value="PEN">PEN</option>
                        <option value="EUR">EUR</option>
                    </select>

                </div>

                <div className="modal-footer">
                    <button className="cancelar" onClick={cerrar}>
                        Cancelar
                    </button>
                    <button className="guardar" onClick={guardarCliente}>
                        Guardar
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ModalCliente;