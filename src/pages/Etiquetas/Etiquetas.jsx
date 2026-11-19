import { useState } from "react";
import toast from "react-hot-toast";
import { AccionesFila, Encabezado, FilasCatalogo, Herramientas, ListadoRegistros, OrdenListado } from "../../components/Catalogo/Catalogo";
import { coincide, esAdministrador, reemplazar, useListado, usePaginacion } from "../../components/Catalogo/estadoCatalogo";
import { ConfirmacionCatalogo } from "../../components/Catalogo/DialogoCatalogo";
import useArchivo from "../../components/Catalogo/useArchivo";
import ModalEtiqueta from "../../components/EtiquetasComp/ModalEtiqueta";
import { useUsuarioActual } from "../../hooks/useUsuarioActual";
import { obtenerEtiquetas, crearEtiqueta, editarEtiquetaAPI, archivarEtiquetaAPI,
    restaurarEtiquetaAPI, eliminarEtiquetaAPI } from "../../services/etiquetaService";

const endpoints = { archivar: archivarEtiquetaAPI, restaurar: restaurarEtiquetaAPI, eliminar: eliminarEtiquetaAPI };
const opcionesOrden = [{ id: "nombre", asc: "Nombre A–Z", desc: "Nombre Z–A" }];

export default function Etiquetas() {
    const admin = esAdministrador(useUsuarioActual().rol);
    const etiquetas = useListado(obtenerEtiquetas);
    const archivo = useArchivo(etiquetas, endpoints, "Se quitarán sus asociaciones con miembros, tareas y registros de tiempo.");
    const [editar, setEditar] = useState(null);
    const [busqueda, buscar] = useState("");
    const [estado, filtrarEstado] = useState("");
    const activo = Boolean(busqueda || estado);
    const filas = etiquetas.datos.filter((e) => coincide(e.nombre, busqueda) &&
        (!estado || e.archivado === (estado === "Archivado")));
    const datos = usePaginacion(filas, [{ id: "nombre", ordenar: (e) => e.nombre }],
        JSON.stringify([busqueda, estado]), "nombre");

    const columnas = [
        { id: "nombre", titulo: "Etiqueta", ancho: "minmax(0, 1fr)", render: (e) =>
            <span className="catalogo-nombre-color">
                <span className="catalogo-color" style={{ backgroundColor: e.color || "transparent" }} role="img"
                    aria-label={e.color ? "Color " + e.color : "Sin color"} />
                <span>{e.nombre}</span>
            </span> },
        { id: "estado", titulo: "Estado", ancho: "minmax(6.5rem, 0.25fr)", render: (e) =>
            <span className={e.archivado ? "catalogo-etiqueta-archivada" : "catalogo-etiqueta-activa"}>
                {e.archivado ? "Archivada" : "Activa"}
            </span> },
    ];
    if (admin) columnas.push({ id: "acciones", titulo: "Acciones", ancho: "4rem", render: (e) =>
        <AccionesFila nombre={e.nombre} ocupado={archivo.ocupado}
            opciones={[{ texto: "Editar etiqueta", actuar: () => setEditar(e) }, ...archivo.opciones(e)]} /> });

    async function guardar(datos) {
        const confirmado = editar.id ? await editarEtiquetaAPI(editar.id, datos) : await crearEtiqueta(datos);
        etiquetas.setDatos((prev) => reemplazar(prev, confirmado));
        toast.success(editar.id ? "Etiqueta actualizada" : "Etiqueta creada");
    }

    return <section className="catalogo catalogo-etiquetas">
        <Encabezado titulo="Etiquetas">
            {admin && <button type="button" className="catalogo-boton catalogo-primario"
                disabled={etiquetas.cargando || Boolean(etiquetas.error) || archivo.ocupado}
                onClick={() => setEditar({})}>Nueva etiqueta</button>}
        </Encabezado>
        <Herramientas busqueda={busqueda} buscar={buscar} placeholder="Buscar etiqueta" activo={activo} limpiarJuntoBusqueda
            limpiar={() => { buscar(""); filtrarEstado(""); }}>
            <select aria-label="Estado de la etiqueta" value={estado} onChange={(e) => filtrarEstado(e.target.value)}>
                <option value="">Estado</option><option value="Activo">Activas</option><option value="Archivado">Archivadas</option>
            </select>
            <OrdenListado datos={datos} opciones={opcionesOrden} nombre="Ordenar etiquetas" />
        </Herramientas>
        <ListadoRegistros nombre="Etiquetas" listado={etiquetas} datos={datos}
            vacio={activo ? "No hay etiquetas que coincidan." : "Aún no hay etiquetas."}>
            <FilasCatalogo nombre="Etiquetas" datos={datos} columnas={columnas} />
        </ListadoRegistros>
        {admin && editar && <ModalEtiqueta etiqueta={editar} etiquetas={etiquetas.datos}
            cerrar={() => setEditar(null)} guardar={guardar} />}
        <ConfirmacionCatalogo confirmar={archivo.confirmar} cerrar={archivo.cerrarConfirmacion} />
    </section>;
}
