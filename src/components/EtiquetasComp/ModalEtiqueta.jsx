import { useState } from "react";
import DialogoCatalogo from "../Catalogo/DialogoCatalogo";
import { nombreRequerido } from "../Catalogo/estadoCatalogo";

export default function ModalEtiqueta({ etiqueta, etiquetas, cerrar, guardar }) {
    const [sinColor, setSinColor] = useState(!etiqueta.color);
    return <DialogoCatalogo titulo={etiqueta.id ? "Editar etiqueta" : "Nueva etiqueta"} cerrar={cerrar}
        guardar={(datos) => guardar({
            nombre: nombreRequerido(datos, etiquetas, etiqueta.id),
            color: sinColor ? null : datos.get("color"),
        })}>
        <label>Nombre<input name="nombre" defaultValue={etiqueta.nombre} required maxLength={80} /></label>
        <label className="catalogo-opcion"><input type="checkbox" checked={sinColor}
            onChange={(event) => setSinColor(event.target.checked)} /> Sin color</label>
        <label>Color<input name="color" type="color" defaultValue={etiqueta.color || "#10a5f5"} disabled={sinColor} /></label>
    </DialogoCatalogo>;
}
