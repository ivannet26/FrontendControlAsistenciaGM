import { useState } from "react";
import { AccionesFila, FilasCatalogo, Herramientas, ListadoRegistros, OrdenListado } from "../../components/Catalogo/Catalogo";
import { coincide, usePaginacion } from "../../components/Catalogo/estadoCatalogo";

const roles = { ADMINISTRACION: "Administración", MIEMBRO: "Miembro" };
const estados = { ACTIVO: "Activo", INACTIVO: "Inactivo", INVITADO: "Invitado" };
const opcionesOrden = [
    { id: "nombre", asc: "Nombre A–Z", desc: "Nombre Z–A" },
    { id: "correo", asc: "Correo A–Z", desc: "Correo Z–A" },
    { id: "rol", asc: "Rol A–Z", desc: "Rol Z–A" },
    { id: "estado", asc: "Estado A–Z", desc: "Estado Z–A" },
];
const ordenEquipo = { id: "equipo", asc: "Equipo A–Z", desc: "Equipo Z–A" };

export default function DirectorioMiembros({ miembros, grupos, equipo, sinEquipo, admin, editar, eliminar, ocupado }) {
    const [busqueda, buscar] = useState("");
    const [rol, filtrarRol] = useState("");
    const [estado, filtrarEstado] = useState("");
    const [filtroEquipo, filtrarEquipo] = useState("");
    const mostrarEquipo = !equipo && !sinEquipo;
    const activo = Boolean(busqueda || rol || estado || filtroEquipo);
    const miembrosVista = miembros.datos.filter((m) => equipo ? m.grupo_id === equipo.id : !sinEquipo || m.grupo_id == null);
    const nombresEquipo = new Map(grupos.datos.map((grupo) => [grupo.id, grupo.nombre]));
    const equipoDe = (m) => nombresEquipo.get(m.grupo_id) ?? m.nombre_grupo ?? "Sin equipo";
    const filas = miembrosVista.filter((m) =>
        (coincide(m.nombre_usuario, busqueda) || coincide(m.email_usuario, busqueda)) &&
        (!rol || m.tipo_usuario === rol) && (!estado || m.estado === estado) &&
        (!filtroEquipo || String(m.grupo_id ?? "sin-equipo") === filtroEquipo));
    const tipos = [...new Set(miembrosVista.map((m) => m.tipo_usuario))];
    const datos = usePaginacion(filas, [
        { id: "nombre", ordenar: (m) => m.nombre_usuario },
        { id: "correo", ordenar: (m) => m.email_usuario },
        { id: "rol", ordenar: (m) => roles[m.tipo_usuario] ?? m.tipo_usuario },
        { id: "estado", ordenar: (m) => estados[m.estado] ?? m.estado },
        { id: "equipo", ordenar: equipoDe },
    ], JSON.stringify([busqueda, rol, estado, filtroEquipo]), "nombre");
    const columnas = [
        { id: "nombre", titulo: "Miembro", ancho: "minmax(0, 1.7fr)", render: (m) =>
            <div className="miembro-identidad">
                <span>{m.nombre_usuario}</span><span className="catalogo-secundario">{m.email_usuario}</span>
            </div> },
        { id: "rol", titulo: "Rol", ancho: "minmax(8rem, 0.55fr)", render: (m) => roles[m.tipo_usuario] ?? m.tipo_usuario },
        { id: "estado", titulo: "Estado", ancho: "minmax(6rem, 0.45fr)", render: (m) => estados[m.estado] ?? m.estado },
    ];
    if (mostrarEquipo) columnas.push({ id: "equipo", titulo: "Equipo", ancho: "minmax(0, 0.75fr)", render: equipoDe });
    if (admin) columnas.push({ id: "acciones", titulo: "Acciones", ancho: "4rem",
        render: (m) => <AccionesFila nombre={m.nombre_usuario} ocupado={ocupado} opciones={[
            { texto: "Editar miembro", actuar: () => editar(m) },
            { texto: "Eliminar miembro", actuar: () => eliminar(m) },
        ]} /> });

    function limpiar() {
        buscar("");
        filtrarRol("");
        filtrarEstado("");
        filtrarEquipo("");
    }

    return <>
        <Herramientas busqueda={busqueda} buscar={buscar} placeholder="Buscar por nombre o correo" activo={activo} limpiar={limpiar}>
            <select aria-label="Estado del miembro" value={estado} onChange={(e) => filtrarEstado(e.target.value)}>
                <option value="">Estado</option>
                {Object.entries(estados).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
            </select>
            <select aria-label="Rol de equipo" value={rol} onChange={(e) => filtrarRol(e.target.value)}>
                <option value="">Cualquier rol</option>
                {tipos.map((valor) => <option key={valor} value={valor}>{roles[valor] ?? valor}</option>)}
            </select>
            {mostrarEquipo && <select aria-label="Equipo del miembro" value={filtroEquipo} onChange={(e) => filtrarEquipo(e.target.value)}
                disabled={grupos.cargando || Boolean(grupos.error)}>
                <option value="">Todos los equipos</option>
                <option value="sin-equipo">Sin equipo</option>
                {grupos.datos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>}
            {mostrarEquipo && grupos.error && (
                <button type="button" className="catalogo-boton" onClick={grupos.recargar}>Recargar equipos</button>
            )}
            <OrdenListado datos={datos} opciones={mostrarEquipo ? [...opcionesOrden, ordenEquipo] : opcionesOrden}
                nombre="Ordenar miembros" />
        </Herramientas>
        <ListadoRegistros nombre="Miembros" listado={miembros} datos={datos}
            vacio={activo ? "No hay miembros que coincidan." : equipo ? "Este equipo aún no tiene miembros." : sinEquipo
                ? "No hay miembros sin equipo." : "Aún no hay miembros."}>
            <FilasCatalogo nombre="Miembros" datos={datos} columnas={columnas} />
        </ListadoRegistros>
    </>;
}
