import { MagnifyingGlass } from "@phosphor-icons/react";
import { Pencil, Power } from "lucide-react";
import Tabla from "../../components/Tabla/Tabla";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ModalConfirm from "../../components/ModalConfirm/ModalConfirm";
import Paginacion from "../../components/ui/Paginacion";
import ModalUsuario from "./ModalUsuario";
import { useGestionUsuarios } from "./useGestionUsuarios";

const Estado = ({ activo }) => (
  <span
    className={`inline-flex items-center gap-2 text-xs font-medium ${activo ? "text-emerald-400" : "text-gm-500"}`}
  >
    <span
      className={`h-2 w-2 rounded-full ${activo ? "bg-emerald-400" : "bg-gm-600"}`}
    />
    {activo ? "Activo" : "Inactivo"}
  </span>
);

const Rol = ({ rol }) => (
  <span className="border border-gm-700 bg-gm-900 px-2 py-1 text-xs text-gm-100">
    {rol}
  </span>
);

const Acciones = ({ usuario, abrirEditar, toggleActivo }) => (
  <div className="flex items-center gap-2">
    <Button
      variant="secondary"
      className="px-2"
      onClick={() => abrirEditar(usuario)}
      aria-label={`Editar a ${usuario.nombre}`}
      title="Editar"
    >
      <Pencil size={16} aria-hidden="true" />
    </Button>
    <Button
      variant={usuario.activo ? "danger" : "secondary"}
      className="px-2"
      onClick={() => toggleActivo(usuario)}
      aria-label={
        usuario.activo
          ? `Desactivar a ${usuario.nombre}`
          : `Activar a ${usuario.nombre}`
      }
      title={usuario.activo ? "Desactivar" : "Activar"}
    >
      <Power size={16} aria-hidden="true" />
    </Button>
  </div>
);

const GestionUsuarios = () => {
  const u = useGestionUsuarios();

  const columnas = [
    {
      key: "nombre",
      header: "Nombre",
      render: (x) => (
        <span className="text-sm text-gm-100">
          <span className="font-semibold text-white">{x.nombre}</span>{" "}
          {x.apellido}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (x) => <span className="text-sm text-gm-300">{x.email}</span>,
    },
    { key: "rol", header: "Rol", render: (x) => <Rol rol={x.rol} /> },
    {
      key: "estado",
      header: "Estado",
      render: (x) => <Estado activo={x.activo} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (x) => (
        <Acciones
          usuario={x}
          abrirEditar={u.abrirEditar}
          toggleActivo={u.toggleActivo}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 border border-gm-800 bg-gm-950 p-4 md:flex-row md:items-center">
        <Input
          className="w-full md:max-w-xs md:flex-1"
          icon={<MagnifyingGlass size={16} weight="bold" aria-hidden="true" />}
          placeholder="Buscar por nombre o correo..."
          value={u.busqueda}
          onChange={(e) => u.setBusqueda(e.target.value)}
        />
        <Select
          value={u.filtroRol}
          onChange={(e) => u.setFiltroRol(e.target.value)}
          className="w-full md:w-48"
        >
          <option value="">Todos los roles</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="PRACTICANTE">Practicante</option>
        </Select>
        <Button
          variant="secondary"
          onClick={u.limpiarFiltros}
          disabled={!u.filtrosActivos}
        >
          Limpiar
        </Button>
        <Button variant="primary" className="md:ml-auto" onClick={u.abrirCrear}>
          + Crear usuario
        </Button>
      </div>

      <section className="hidden border border-gm-800 bg-gm-950 md:block">
        <Tabla
          rowKey="id"
          columns={columnas}
          data={u.usuarios}
          loading={u.cargando}
          loadingText="Cargando usuarios..."
          emptyText="No hay usuarios para estos filtros."
        />
      </section>

      <section className="flex flex-col gap-3 md:hidden" aria-label="Usuarios">
        {u.cargando ? (
          <p className="m-0 border border-gm-800 bg-gm-950 p-8 text-center text-sm text-gm-500">
            Cargando usuarios...
          </p>
        ) : u.usuarios.length === 0 ? (
          <p className="m-0 border border-gm-800 bg-gm-950 p-8 text-center text-sm text-gm-500">
            No hay usuarios para estos filtros.
          </p>
        ) : (
          u.usuarios.map((x) => (
            <article
              key={x.id}
              className="flex flex-col gap-3 border border-gm-800 bg-gm-950 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-semibold text-white">
                    {x.nombre} {x.apellido}
                  </p>
                  <p className="m-0 mt-1 truncate text-xs text-gm-500">
                    {x.email}
                  </p>
                </div>
                <Estado activo={x.activo} />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-gm-800 pt-3">
                <Rol rol={x.rol} />
                <Acciones
                  usuario={x}
                  abrirEditar={u.abrirEditar}
                  toggleActivo={u.toggleActivo}
                />
              </div>
            </article>
          ))
        )}
      </section>

      <Paginacion
        pagina={u.paginaActual}
        totalPaginas={u.totalPaginas}
        onChange={u.setPagina}
        label="Paginación de usuarios"
      />

      <ModalUsuario
        abierto={u.modalAbierto}
        usuarioEditando={u.usuarioEditando}
        formData={u.formData}
        setCampo={u.setCampo}
        onCerrar={u.cerrarModal}
        onGuardar={u.guardar}
        onEliminar={u.eliminarDesdeModal}
      />
      <ModalConfirm
        abierto={u.confirm.abierto}
        titulo={u.confirm.titulo}
        mensaje={u.confirm.mensaje}
        textoConfirmar={u.confirm.textoConfirmar}
        tipo={u.confirm.tipo}
        onConfirmar={u.ejecutarConfirm}
        onCancelar={u.cerrarConfirm}
      />
    </div>
  );
};

export default GestionUsuarios;
