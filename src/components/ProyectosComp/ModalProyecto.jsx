import DialogoCatalogo from "../Catalogo/DialogoCatalogo";
import { nombreRequerido } from "../Catalogo/estadoCatalogo";

export default function ModalProyecto({ proyecto, clientes, proyectos, cerrar, guardar }) {
    const catalogoListo = !clientes.cargando && !clientes.error;
    const estados = { ACTIVO: "Activo", PAUSADO: "Pausado", FINALIZADO: "Finalizado" };

    return <DialogoCatalogo titulo={proyecto.id ? "Editar proyecto" : "Nuevo proyecto"} cerrar={cerrar}
        guardar={(datos) => {
            const cuerpo = {
                nombre: nombreRequerido(datos, proyectos, proyecto.id),
                descripcion: datos.get("descripcion").trim(),
                color: datos.get("color") || null,
            };
            if (catalogoListo) cuerpo.cliente_id = Number(datos.get("cliente")) || null;
            if (!proyecto.archivado) cuerpo.estado = datos.get("estado");
            return guardar(cuerpo);
        }}>
        <label>Nombre<input name="nombre" defaultValue={proyecto.nombre} placeholder="Nombre del proyecto" required maxLength={200} /></label>
        <label>Descripción<textarea name="descripcion" defaultValue={proyecto.descripcion ?? ""} placeholder="Descripción breve" /></label>
        <label>Cliente
            <select name="cliente" aria-label="Cliente" defaultValue={proyecto.cliente_id ?? ""} disabled={!catalogoListo}>
                <option value="">Sin cliente</option>
                {clientes.datos.filter((c) => !c.archivado || c.id === proyecto.cliente_id).map((c) =>
                    <option key={c.id} value={c.id}>{c.nombre}{c.archivado ? " (archivado)" : ""}</option>)}
                {!catalogoListo && proyecto.cliente_id && <option value={proyecto.cliente_id}>{proyecto.nombre_cliente}</option>}
            </select>
        </label>
        {clientes.error && <button className="catalogo-boton" type="button" onClick={clientes.recargar}>Reintentar cargar clientes</button>}
        <label>Estado
            <select name="estado" aria-label="Estado" defaultValue={proyecto.archivado ? "ARCHIVADO" : proyecto.estado ?? "ACTIVO"} disabled={proyecto.archivado}>
                {proyecto.archivado && <option value="ARCHIVADO">Archivado</option>}
                {proyecto.estado && !proyecto.archivado && !estados[proyecto.estado] && <option>{proyecto.estado}</option>}
                {Object.entries(estados).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
            </select>
        </label>
        <label>Color<input name="color" type="color" defaultValue={proyecto.color || "#10b981"} /></label>
    </DialogoCatalogo>;
}
