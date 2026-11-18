import { useParams } from "react-router-dom";
import { Encabezado, EstadoListado } from "../../../components/Catalogo/Catalogo";
import { useListado } from "../../../components/Catalogo/estadoCatalogo";
import { estadoProyecto, formatearTiempo } from "../../../components/ProyectosComp/proyectoVista";
import ProyectoTareas from "../../../components/ProyectosComp/ProyectoTareas/ProyectoTareas";
import { obtenerProyectoPorId } from "../../../services/proyectosService";

export default function DetalleProyecto() {
    const { id } = useParams();
    const listado = useListado(obtenerProyectoPorId, id);
    const proyecto = listado.datos;
    return <section className="catalogo">
        <Encabezado titulo={proyecto.nombre ?? "Proyecto"}
            volver={{ destino: "/app/proyectos", texto: "Volver a proyectos" }}
            detalle={proyecto.id && <>
                <span>{proyecto.nombre_cliente || "Sin cliente"}</span>
                <span>{estadoProyecto(proyecto)}</span>
                <span>Registrado: {formatearTiempo(proyecto)}</span>
            </>} />
        {listado.cargando || listado.error
            ? <EstadoListado {...listado} />
            : <ProyectoTareas key={id} proyecto={proyecto} />}
    </section>;
}
