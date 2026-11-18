import { useState } from "react";
import { Link } from "react-router-dom";
import { UsersRound } from "lucide-react";
import { AccionesFila, FilasCatalogo, Herramientas, ListadoRegistros, OrdenListado } from "../../components/Catalogo/Catalogo";
import { coincide, usePaginacion } from "../../components/Catalogo/estadoCatalogo";

function iniciales(nombre) {
    const palabras = nombre.trim().split(/\s+/);
    if (palabras.length === 1) return Array.from(palabras[0]).slice(0, 2).join("").toLocaleUpperCase("es");
    return palabras.slice(0, 2).map((palabra) => Array.from(palabra)[0]).join("").toLocaleUpperCase("es");
}

const opcionesOrden = [
    { id: "nombre", asc: "Nombre A–Z", desc: "Nombre Z–A" },
    { id: "miembros", asc: "Menos miembros", desc: "Más miembros" },
];

export default function EquiposCatalogo({ grupos, totalMiembros, editar, eliminar, ocupado }) {
    const [busqueda, buscar] = useState("");
    const filas = grupos.datos.filter((g) => coincide(g.nombre, busqueda) || coincide(g.descripcion, busqueda));
    const datos = usePaginacion(filas, [
        { id: "nombre", ordenar: (equipo) => equipo.nombre },
        { id: "miembros", ordenar: totalMiembros },
    ], busqueda, "nombre");

    const columnas = [
        { id: "nombre", titulo: "Equipo", ancho: "minmax(0, 1.15fr)", render: (equipo) =>
            <div className="equipo-identidad">
                <span className="equipo-iniciales" aria-hidden="true">{iniciales(equipo.nombre)}</span>
                <Link to={"?equipo=" + equipo.id} className="equipo-enlace">{equipo.nombre}</Link>
            </div> },
        { id: "descripcion", titulo: "Descripción", amplio: true, ancho: "minmax(0, 1fr)", render: (equipo) =>
            equipo.descripcion ? <span className="equipo-descripcion">{equipo.descripcion}</span> : null },
        { id: "miembros", titulo: "Integrantes", ancho: "minmax(7rem, 0.4fr)", render: (equipo) => {
            const total = totalMiembros(equipo);
            return <span className="equipo-total"><UsersRound size={16} aria-hidden="true" />
                {total} {total === 1 ? "miembro" : "miembros"}
            </span>;
        } },
        { id: "acciones", titulo: "Acciones", ancho: "4rem", render: (equipo) =>
            <AccionesFila nombre={equipo.nombre} ocupado={ocupado} opciones={[
                { texto: "Editar equipo", actuar: () => editar(equipo) },
                { texto: "Eliminar equipo", actuar: () => eliminar(equipo) },
            ]} /> },
    ];

    return <>
        <nav className="equipos-accesos" aria-label="Directorios de miembros">
            <Link className="catalogo-boton" to="?vista=miembros">Todos los miembros</Link>
            <Link className="catalogo-boton" to="?vista=sin-equipo">Sin equipo</Link>
        </nav>
        <Herramientas busqueda={busqueda} buscar={buscar} placeholder="Buscar equipos" activo={Boolean(busqueda)}
            limpiar={() => buscar("")}>
            <OrdenListado datos={datos} opciones={opcionesOrden} nombre="Ordenar equipos" />
            {!grupos.cargando && !grupos.error && (
                <span className="catalogo-recuento">{datos.total} {datos.total === 1 ? "equipo" : "equipos"}</span>
            )}
        </Herramientas>
        <ListadoRegistros nombre="Equipos" listado={grupos} datos={datos}
            vacio={busqueda ? "No hay equipos que coincidan." : "Aún no hay equipos."}>
            <FilasCatalogo nombre="Equipos" datos={datos} columnas={columnas} />
        </ListadoRegistros>
    </>;
}
