import DialogoCatalogo from "../Catalogo/DialogoCatalogo";
import { nombreRequerido } from "../Catalogo/estadoCatalogo";

export default function ModalCliente({ cliente, clientes, cerrar, guardar }) {
    return <DialogoCatalogo titulo={cliente.id ? "Editar cliente" : "Nuevo cliente"} cerrar={cerrar}
        guardar={(datos) => guardar({
            nombre: nombreRequerido(datos, clientes, cliente.id),
            email: datos.get("email").trim() || null,
            destinatarios_cc: datos.getAll("cc").map((correo) => correo.trim()).filter(Boolean),
            direccion: datos.get("direccion").trim() || null,
            nota: datos.get("nota").trim() || null,
            moneda: datos.get("moneda"),
        })}>
        <label>Nombre<input name="nombre" placeholder="Nombre del cliente" defaultValue={cliente.nombre} maxLength={150} required /></label>
        <label>Correo electrónico<input type="email" name="email" defaultValue={cliente.email || ""} maxLength={150} /></label>
        <fieldset className="catalogo-cc">
            <legend>Destinatarios en copia</legend>
            {[0, 1, 2].map((i) => <label key={i}>Correo {i + 1}
                <input type="email" name="cc" defaultValue={cliente.destinatarios_cc?.[i] || ""} maxLength={150} />
            </label>)}
        </fieldset>
        <label>Dirección<textarea name="direccion" defaultValue={cliente.direccion || ""} /></label>
        <label>Nota<textarea name="nota" defaultValue={cliente.nota || ""} /></label>
        <label>Moneda<select name="moneda" aria-label="Moneda" defaultValue={cliente.moneda || "USD"}>
            {cliente.moneda && !["USD", "PEN", "EUR"].includes(cliente.moneda) && <option>{cliente.moneda}</option>}
            {["USD", "PEN", "EUR"].map((moneda) => <option key={moneda}>{moneda}</option>)}
        </select></label>
    </DialogoCatalogo>;
}
