import { useState } from "react";
import toast from "react-hot-toast";
import { AccionesFila, Encabezado, FilasCatalogo, Herramientas, ListadoRegistros, OrdenCompacto } from "../../components/Catalogo/Catalogo";
import { coincide, esAdministrador, reemplazar, useListado, usePaginacion } from "../../components/Catalogo/estadoCatalogo";
import { ConfirmacionCatalogo } from "../../components/Catalogo/DialogoCatalogo";
import useArchivo from "../../components/Catalogo/useArchivo";
import ModalCliente from "../../components/ClientesComp/ModalClientes";
import { exportarClientes } from "./exportarClientes";
import { useUsuarioActual } from "../../hooks/useUsuarioActual";
import { obtenerClientes, crearCliente, editarClienteAPI, archivarClienteAPI, restaurarClienteAPI, eliminarClienteAPI }
    from "../../services/clientesService";

const endpoints = { archivar: archivarClienteAPI, restaurar: restaurarClienteAPI, eliminar: eliminarClienteAPI };

export default function Clientes() {
    const usuario = useUsuarioActual();
    const admin = esAdministrador(usuario.rol);
    const clientes = useListado(obtenerClientes);
    const archivo = useArchivo(clientes, endpoints);
    const [editar, setEditar] = useState(null);
    const [busqueda, buscar] = useState("");
    const [estado, filtrarEstado] = useState("");
    const activo = Boolean(busqueda || estado);
    const filas = clientes.datos.filter((cliente) =>
        (coincide(cliente.nombre, busqueda) || coincide(cliente.direccion, busqueda)) &&
        (!estado || cliente.archivado === (estado === "Archivado"))
    );
    const columnas = [
        { id: "nombre", titulo: "Cliente", ancho: "minmax(0, 1.5fr)", ordenar: (c) => c.nombre },
        { id: "direccion", titulo: "Dirección", amplio: true, ordenar: (c) => c.direccion, render: (c) => c.direccion || "—" },
        { id: "moneda", titulo: "Moneda", ancho: "minmax(5rem, 0.4fr)", ordenar: (c) => c.moneda },
        { id: "estado", titulo: "Estado", ancho: "minmax(7rem, 0.5fr)", render: (c) => c.archivado ? "Archivado" : "Activo" },
    ];
    if (admin) columnas.push({ id: "acciones", titulo: "Acciones", ancho: "5.25rem",
        render: (c) => <AccionesFila nombre={c.nombre} editar={() => setEditar(c)}
            opciones={archivo.opciones(c)} ocupado={archivo.ocupado} /> });
    const datos = usePaginacion(filas, columnas, JSON.stringify([busqueda, estado]), "nombre");

    async function guardar(datos) {
        const actualizado = editar.id ? await editarClienteAPI(editar.id, datos) : await crearCliente(datos);
        clientes.setDatos((prev) => reemplazar(prev, actualizado));
        toast.success(editar.id ? "Cliente actualizado" : "Cliente creado");
    }

    return <section className="catalogo">
        <Encabezado titulo="Clientes">
            {admin && <button type="button" className="catalogo-boton catalogo-primario"
                disabled={clientes.cargando || Boolean(clientes.error)} onClick={() => setEditar({})}>Nuevo cliente</button>}
        </Encabezado>
        <Herramientas busqueda={busqueda} buscar={buscar} placeholder="Buscar cliente" activo={activo}
            limpiar={() => { buscar(""); filtrarEstado(""); }}>
            <select aria-label="Estado del cliente" value={estado} onChange={(e) => filtrarEstado(e.target.value)}>
                <option value="">Estado</option><option value="Activo">Activo</option><option value="Archivado">Archivado</option>
            </select>
            <button type="button" className="catalogo-boton"
                disabled={!filas.length || clientes.cargando || Boolean(clientes.error)}
                onClick={() => exportarClientes(filas)}>Exportar CSV</button>
            <OrdenCompacto nombre="Clientes" datos={datos} columnas={columnas} />
        </Herramientas>
        <ListadoRegistros nombre="Clientes" listado={clientes} datos={datos}
            vacio={activo ? "No hay clientes que coincidan." : "Aún no hay clientes."}>
            <FilasCatalogo nombre="Clientes" datos={datos} columnas={columnas} ordenarPorCabecera />
        </ListadoRegistros>
        {admin && editar && <ModalCliente cliente={editar} clientes={clientes.datos}
            cerrar={() => setEditar(null)} guardar={guardar} />}
        <ConfirmacionCatalogo confirmar={archivo.confirmar} cerrar={archivo.cerrarConfirmacion} />
    </section>;
}
