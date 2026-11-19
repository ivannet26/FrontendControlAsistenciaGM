import { useState } from "react";
import { AccionesFila, FilasCatalogo, Herramientas, ListadoRegistros, OrdenCompacto } from "../../Catalogo/Catalogo";
import { ConfirmacionCatalogo } from "../../Catalogo/DialogoCatalogo";
import { coincide, reemplazar, useListado, useOperacion, usePaginacion } from "../../Catalogo/estadoCatalogo";
import { obtenerMiembros } from "../../../services/equipoService";
import { obtenerTareasProyecto, crearTarea, eliminarTareaAPI, asignarMiembroTareaAPI, desasignarMiembroTareaAPI }
    from "../../../services/tareasService";
import EncargadosPopover from "./EncargadosPopover";

const estados = { PENDIENTE: "Pendiente", EN_PROGRESO: "En progreso", COMPLETADA: "Completada" };

export default function ProyectoTareas({ proyecto }) {
    const tareas = useListado(obtenerTareasProyecto, proyecto.id);
    const miembros = useListado(obtenerMiembros);
    const { ejecutar, ocupado } = useOperacion();
    const [busqueda, buscar] = useState("");
    const [estado, filtrarEstado] = useState("");
    const [titulo, setTitulo] = useState("");
    const [errorAlta, setErrorAlta] = useState("");
    const [confirmar, setConfirmar] = useState(null);
    const activo = Boolean(busqueda || estado);
    const filas = tareas.datos.filter((t) => coincide(t.titulo, busqueda) && (!estado || t.estado === estado));
    const columnas = [
        { id: "titulo", titulo: "Tarea", ancho: "minmax(0, 1.5fr)", ordenar: (t) => t.titulo },
        { id: "estado", titulo: "Estado", ancho: "minmax(7rem, 0.5fr)", ordenar: (t) => estados[t.estado] || t.estado,
            render: (t) => estados[t.estado] || t.estado },
        { id: "miembros", titulo: "Encargados", amplio: true, render: (t) => <EncargadosPopover tareaId={t.id}
            miembrosAsignados={t.miembros} todosLosMiembros={miembros.datos} ocupado={ocupado}
            deshabilitado={miembros.cargando || Boolean(miembros.error)}
            onAsignar={(id, m) => actualizarEncargado(asignarMiembroTareaAPI, id, m)}
            onDesasignar={(id, m) => actualizarEncargado(desasignarMiembroTareaAPI, id, m)} /> },
        { id: "acciones", titulo: "Acciones", ancho: "5.25rem", render: (t) =>
            <AccionesFila nombre={t.titulo} ocupado={ocupado}
                opciones={[{ texto: "Eliminar", actuar: () => eliminar(t) }]} /> },
    ];
    const datos = usePaginacion(filas, columnas, JSON.stringify([busqueda, estado]), "titulo");

    function actualizarEncargado(peticion, id, miembro) {
        return ejecutar(async () => {
            const actualizada = await peticion(id, miembro);
            tareas.setDatos((prev) => reemplazar(prev, actualizada));
        }, null, "No se pudo actualizar el encargado.");
    }

    function eliminar(tarea) {
        setConfirmar({
            titulo: "Eliminar tarea",
            mensaje: "¿Eliminar “" + tarea.titulo + "”?",
            eliminar: () => ejecutar(async () => {
                await eliminarTareaAPI(tarea.id);
                tareas.setDatos((prev) => prev.filter((t) => t.id !== tarea.id));
            }, "Tarea eliminada", "No se pudo eliminar la tarea."),
        });
    }

    function agregar(event) {
        event.preventDefault();
        const nombre = titulo.trim();
        setErrorAlta("");
        if (!nombre) return setErrorAlta("Ingresa un nombre para la tarea.");
        return ejecutar(async () => {
            const creada = await crearTarea({ titulo: nombre, proyecto_id: proyecto.id });
            tareas.setDatos((prev) => reemplazar(prev, creada));
            setTitulo("");
        }, "Tarea creada", "No se pudo crear la tarea.", setErrorAlta);
    }

    return <section className="catalogo-tareas" aria-label="Tareas del proyecto">
        <h2 className="catalogo-subtitulo">Mis tareas</h2>
        {!proyecto.archivado && <form className="catalogo-alta-rapida" onSubmit={agregar}>
            <input aria-label="Nombre de la nueva tarea" placeholder="Nombre de la nueva tarea" value={titulo}
                onChange={(event) => setTitulo(event.target.value)} required maxLength={200} disabled={ocupado} />
            <button type="submit" className="catalogo-boton catalogo-primario"
                disabled={ocupado || tareas.cargando || Boolean(tareas.error)}>Añadir tarea</button>
        </form>}
        {errorAlta && <p className="catalogo-error" role="alert">{errorAlta}</p>}
        {miembros.error && <button type="button" className="catalogo-boton" onClick={miembros.recargar}>Recargar encargados</button>}
        <Herramientas busqueda={busqueda} buscar={buscar} placeholder="Buscar tarea" activo={activo}
            limpiar={() => { buscar(""); filtrarEstado(""); }}>
            <select aria-label="Estado de la tarea" value={estado} onChange={(e) => filtrarEstado(e.target.value)}>
                <option value="">Estado</option>
                {Object.entries(estados).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
            </select>
            <OrdenCompacto nombre="Tareas" datos={datos} columnas={columnas} />
        </Herramientas>
        <ListadoRegistros nombre="Tareas" listado={tareas} datos={datos}
            vacio={activo ? "No hay tareas que coincidan." : "Aún no tienes tareas en este proyecto."}>
            <FilasCatalogo nombre="Tareas" datos={datos} columnas={columnas} ordenarPorCabecera />
        </ListadoRegistros>
        <ConfirmacionCatalogo confirmar={confirmar} cerrar={() => setConfirmar(null)} />
    </section>;
}
