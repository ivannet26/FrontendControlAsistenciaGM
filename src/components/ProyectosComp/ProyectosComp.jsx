import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AccionesFila, Encabezado, FilasCatalogo, Herramientas, ListadoRegistros, OrdenCompacto } from "../Catalogo/Catalogo";
import { coincide, esAdministrador, reemplazar, useListado, usePaginacion } from "../Catalogo/estadoCatalogo";
import { ConfirmacionCatalogo } from "../Catalogo/DialogoCatalogo";
import useArchivo from "../Catalogo/useArchivo";
import ModalProyecto from "./ModalProyecto";
import { obtenerClientes } from "../../services/clientesService";
import { obtenerProyectos, crearProyectoAPI, editarProyectoAPI, archivarProyectoAPI,
    restaurarProyectoAPI, eliminarProyectoAPI } from "../../services/proyectosService";
import { useUsuarioActual } from "../../hooks/useUsuarioActual";
import { estadoProyecto, formatearTiempo } from "./proyectoVista";

const cargarProyectos = () => obtenerProyectos({ estado: "todo" });
const endpoints = { archivar: archivarProyectoAPI, restaurar: restaurarProyectoAPI, eliminar: eliminarProyectoAPI };

export default function ProyectosComp() {
    const admin = esAdministrador(useUsuarioActual().rol);
    const proyectos = useListado(cargarProyectos);
    const clientes = useListado(obtenerClientes);
    const archivo = useArchivo(proyectos, endpoints, "También podrían eliminarse sus tareas y registros de tiempo asociados.");
    const [editar, setEditar] = useState(null);
    const [busqueda, buscar] = useState("");
    const [estado, filtrarEstado] = useState("");
    const [cliente, filtrarCliente] = useState("");
    const activo = Boolean(busqueda || estado || cliente);

    const filas = proyectos.datos.filter((proyecto) =>
        coincide(proyecto.nombre, busqueda) &&
        (!cliente || String(proyecto.cliente_id) === cliente) &&
        (!estado || (proyecto.archivado ? estado === "ARCHIVADO" : proyecto.estado === estado))
    );
    const columnas = [
        { id: "nombre", titulo: "Proyecto", ancho: "minmax(0, 1.5fr)", ordenar: (p) => p.nombre,
            render: (p) => <span className="catalogo-nombre-color">
                {p.color && <span className="catalogo-color" style={{ backgroundColor: p.color }} aria-hidden="true" />}
                <Link to={`/app/proyectos/${p.id}`}>{p.nombre}</Link>
            </span> },
        { id: "cliente", titulo: "Cliente", ordenar: (p) => p.nombre_cliente,
            render: (p) => p.nombre_cliente || "Sin cliente" },
        { id: "estado", titulo: "Estado", ancho: "minmax(7rem, 0.5fr)",
            ordenar: (p) => estadoProyecto(p),
            render: (p) => estadoProyecto(p) },
        { id: "tiempo", titulo: "Registrado", ancho: "minmax(7rem, 0.5fr)", orden: { asc: "Menor tiempo", desc: "Mayor tiempo" },
            ordenar: (p) => p.segundos_registrados ?? (p.horas_registradas ?? 0) * 3600,
            render: (p) => formatearTiempo(p) },
    ];
    if (admin) columnas.push({ id: "acciones", titulo: "Acciones", ancho: "5.25rem",
        render: (p) => <AccionesFila nombre={p.nombre} editar={() => setEditar(p)}
            opciones={archivo.opciones(p)} ocupado={archivo.ocupado || proyectos.cargando} /> });
    const datos = usePaginacion(filas, columnas, JSON.stringify([busqueda, estado, cliente]), "nombre");

    async function guardar(datos) {
        const confirmado = editar.id ? await editarProyectoAPI(editar.id, datos) : await crearProyectoAPI(datos);
        proyectos.setDatos((prev) => reemplazar(prev, confirmado));
        toast.success(editar.id ? "Proyecto actualizado" : "Proyecto creado");
    }

    return (
        <section className="catalogo">
            <Encabezado titulo="Proyectos">
                {admin && <button type="button" className="catalogo-boton catalogo-primario"
                    disabled={proyectos.cargando || Boolean(proyectos.error)} onClick={() => setEditar({})}>Nuevo proyecto</button>}
            </Encabezado>
            <Herramientas busqueda={busqueda} buscar={buscar} placeholder="Buscar proyecto" activo={activo}
                limpiar={() => { buscar(""); filtrarEstado(""); filtrarCliente(""); }}>
                <select aria-label="Estado del proyecto" value={estado} onChange={(e) => filtrarEstado(e.target.value)}>
                    <option value="">Estado</option>
                    <option value="ACTIVO">Activo</option><option value="PAUSADO">Pausado</option>
                    <option value="FINALIZADO">Finalizado</option><option value="ARCHIVADO">Archivado</option>
                </select>
                <select aria-label="Cliente del proyecto" value={cliente} onChange={(e) => filtrarCliente(e.target.value)}
                    disabled={clientes.cargando || Boolean(clientes.error)}>
                    <option value="">Cliente</option>
                    {clientes.datos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                {clientes.error && <button className="catalogo-boton" type="button" onClick={clientes.recargar}>Recargar clientes</button>}
                <OrdenCompacto nombre="Proyectos" datos={datos} columnas={columnas} />
            </Herramientas>
            <ListadoRegistros nombre="Proyectos" listado={proyectos} datos={datos}
                vacio={activo ? "No hay proyectos que coincidan." : "Aún no hay proyectos."}>
                <FilasCatalogo nombre="Proyectos" datos={datos} columnas={columnas} ordenarPorCabecera />
            </ListadoRegistros>
            {admin && editar && <ModalProyecto proyecto={editar} clientes={clientes} proyectos={proyectos.datos}
                cerrar={() => setEditar(null)} guardar={guardar} />}
            <ConfirmacionCatalogo confirmar={archivo.confirmar} cerrar={archivo.cerrarConfirmacion} />
        </section>
    );
}
