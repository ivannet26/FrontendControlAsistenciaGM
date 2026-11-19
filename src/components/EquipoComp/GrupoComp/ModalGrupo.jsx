import DialogoCatalogo from "../../Catalogo/DialogoCatalogo";
import { nombreRequerido } from "../../Catalogo/estadoCatalogo";

export default function ModalGrupo({ grupo, grupos, cerrar, guardar }) {
    return <DialogoCatalogo titulo={grupo.id ? "Editar equipo" : "Nuevo equipo"} cerrar={cerrar}
        guardar={(datos) => guardar({
            nombre: nombreRequerido(datos, grupos, grupo.id),
            descripcion: datos.get("descripcion").trim(),
        })}>
        <label>Nombre<input name="nombre" defaultValue={grupo.nombre} maxLength={100} required /></label>
        <label>Descripción<textarea name="descripcion" defaultValue={grupo.descripcion || ""} maxLength={255} /></label>
    </DialogoCatalogo>;
}
