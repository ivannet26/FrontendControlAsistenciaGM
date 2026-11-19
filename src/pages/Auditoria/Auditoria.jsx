import { CalendarBlank, MagnifyingGlass } from "@phosphor-icons/react";
import Tabla from "../../components/Tabla/Tabla";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Paginacion from "../../components/ui/Paginacion";
import { useAuditoriaPage } from "./useAuditoriaPage";

const ENTIDADES_LABEL = {
  TIEMPO_REGISTRO: "Rastreador",
  TIEMPO: "Rastreador",
  USUARIO: "Usuario",
  MIEMBRO: "Miembro",
  PROYECTO: "Proyecto",
  TAREA: "Tarea",
  CLIENTE: "Cliente",
  ETIQUETA: "Etiqueta",
};

const ACCIONES_LABEL = {
  CREAR: "Creó",
  EDITAR: "Editó",
  ELIMINAR: "Eliminó",
  ASIGNAR: "Asignó",
  REMOVER: "Removió",
  ARCHIVAR: "Archivó",
  DESARCHIVAR: "Desarchivó",
  DESACTIVAR: "Desactivó",
  ACTIVAR: "Activó",
  EDITAR_TIEMPO: "Editó tiempo",
  CREAR_TIEMPO_ADMIN: "Creó tiempo",
};

const ACCIONES_VERBO = {
  CREAR: "Crear",
  EDITAR: "Editar",
  ELIMINAR: "Eliminar",
  ASIGNAR: "Asignar",
  REMOVER: "Remover",
  ARCHIVAR: "Archivar",
  DESARCHIVAR: "Desarchivar",
  DESACTIVAR: "Desactivar",
  ACTIVAR: "Activar",
};

const colorAccion = (accion) => {
  if (["CREAR", "ACTIVAR", "ASIGNAR"].includes(accion))
    return "text-emerald-400";
  if (["ELIMINAR", "DESACTIVAR", "REMOVER"].includes(accion))
    return "text-red-400";
  if (["EDITAR", "EDITAR_TIEMPO", "CREAR_TIEMPO_ADMIN"].includes(accion))
    return "text-sky-400";
  return "text-gm-300";
};

const Auditoria = () => {
  const {
    filtros,
    registros,
    paginaActual,
    totalPaginas,
    setPagina,
    usuarios,
    resumen,
    cargando,
    cambiarFiltro,
    limpiar,
    filtrosActivos,
  } = useAuditoriaPage();

  const fmt = (iso) =>
    new Date(iso).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const columnas = [
    {
      key: "fecha",
      header: "Fecha",
      render: (r) => (
        <span className="text-xs text-gm-500">{fmt(r.fecha)}</span>
      ),
    },
    {
      key: "usuario",
      header: "Usuario",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-sm text-gm-100">{r.usuario_nombre || "—"}</span>
          {r.usuario_email && (
            <span className="text-xs text-gm-500">{r.usuario_email}</span>
          )}
        </div>
      ),
    },
    {
      key: "accion",
      header: "Acción",
      render: (r) => (
        <span className={`text-xs font-semibold ${colorAccion(r.accion)}`}>
          {ACCIONES_LABEL[r.accion] || r.accion || "—"}
        </span>
      ),
    },
    {
      key: "entidad",
      header: "Módulo",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-xs text-gm-100">
            {ENTIDADES_LABEL[r.entidad] || r.entidad || "—"}
          </span>
          {r.entidad_nombre && (
            <span className="text-xs text-gm-500">{r.entidad_nombre}</span>
          )}
        </div>
      ),
    },
    {
      key: "detalle",
      header: "Descripción",
      render: (r) => (
        <span className="text-xs text-gm-300">{r.detalle || "—"}</span>
      ),
    },
    {
      key: "proyecto",
      header: "Proyecto",
      render: (r) => (
        <span className="text-xs text-gm-300">{r.proyecto_nombre || "—"}</span>
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4 p-4 text-gm-100 md:p-6">
      <header>
        <h1 className="m-0 text-2xl font-semibold text-white">
          Registro de auditoría
        </h1>
        <p className="m-0 mt-1 text-sm text-gm-500">
          Historial de actividades y eventos del sistema
        </p>
      </header>

      <section
        className="grid grid-cols-2 gap-3 md:grid-cols-5"
        aria-label="Resumen de auditoría"
      >
        {[
          ["Registros", resumen?.total],
          ["Usuarios activos", resumen?.usuarios_activos],
          ["Creaciones", resumen?.por_accion?.CREAR ?? 0],
          ["Ediciones", resumen?.por_accion?.EDITAR ?? 0],
          ["Eliminaciones", resumen?.por_accion?.ELIMINAR ?? 0],
        ].map(([etiqueta, valor]) => (
          <div
            key={etiqueta}
            className="flex flex-col gap-2 border border-gm-800 bg-gm-950 p-4"
          >
            <span className="text-xs font-semibold text-gm-500">
              {etiqueta}
            </span>
            <span className="text-2xl font-semibold text-white">
              {valor ?? "—"}
            </span>
          </div>
        ))}
      </section>

      <section
        className="flex flex-col gap-3 border border-gm-800 bg-gm-950 p-4 md:flex-row md:flex-wrap md:items-center"
        aria-label="Filtros de auditoría"
      >
        <Input
          className="w-full md:max-w-xs md:flex-1"
          icon={<MagnifyingGlass size={16} weight="bold" aria-hidden="true" />}
          type="text"
          placeholder="Buscar por usuario o detalle..."
          value={filtros.buscar}
          onChange={cambiarFiltro("buscar")}
        />
        <Input
          className="w-full md:w-auto"
          icon={<CalendarBlank size={14} weight="bold" aria-hidden="true" />}
          type="date"
          lang="es-PE"
          value={filtros.fecha_inicio}
          onChange={cambiarFiltro("fecha_inicio")}
          aria-label="Desde"
        />
        <Input
          className="w-full md:w-auto"
          icon={<CalendarBlank size={14} weight="bold" aria-hidden="true" />}
          type="date"
          lang="es-PE"
          value={filtros.fecha_fin}
          onChange={cambiarFiltro("fecha_fin")}
          aria-label="Hasta"
        />
        <Select
          aria-label="Filtrar por usuario"
          value={filtros.usuario_id}
          onChange={cambiarFiltro("usuario_id")}
          className="w-full md:w-48"
        >
          <option value="">Todos los usuarios</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre} {u.apellido}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filtrar por acción"
          value={filtros.accion}
          onChange={cambiarFiltro("accion")}
          className="w-full md:w-44"
        >
          <option value="">Todas las acciones</option>
          {Object.entries(ACCIONES_VERBO).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filtrar por módulo"
          value={filtros.entidad}
          onChange={cambiarFiltro("entidad")}
          className="w-full md:w-44"
        >
          <option value="">Todos los módulos</option>
          <option value="PROYECTO">Proyecto</option>
          <option value="TAREA">Tarea</option>
          <option value="USUARIO">Usuario</option>
          <option value="MIEMBRO">Miembro</option>
          <option value="CLIENTE">Cliente</option>
          <option value="ETIQUETA">Etiqueta</option>
          <option value="TIEMPO">Tiempo</option>
        </Select>
        <Button
          variant="secondary"
          className="md:ml-auto"
          onClick={limpiar}
          disabled={!filtrosActivos}
        >
          Limpiar
        </Button>
      </section>

      <section className="hidden border border-gm-800 bg-gm-950 md:block">
        <Tabla
          rowKey={(r) => `${r.origen}-${r.id}`}
          columns={columnas}
          data={registros}
          loading={cargando}
          loadingText="Cargando registros..."
          emptyText="No se encontraron eventos para estos filtros."
        />
      </section>

      <section
        className="flex flex-col gap-3 md:hidden"
        aria-label="Registros de auditoría"
      >
        {cargando ? (
          <p className="m-0 border border-gm-800 bg-gm-950 p-8 text-center text-sm text-gm-500">
            Cargando registros...
          </p>
        ) : registros.length === 0 ? (
          <p className="m-0 border border-gm-800 bg-gm-950 p-8 text-center text-sm text-gm-500">
            No se encontraron eventos para estos filtros.
          </p>
        ) : (
          registros.map((r) => (
            <article
              key={`${r.origen}-${r.id}`}
              className="flex flex-col gap-2 border border-gm-800 bg-gm-950 p-4"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-gm-500">{fmt(r.fecha)}</span>
                <span className={`font-semibold ${colorAccion(r.accion)}`}>
                  {ACCIONES_LABEL[r.accion] || r.accion}
                </span>
              </div>
              <p className="m-0 text-sm font-semibold text-white">
                {r.usuario_nombre || "Desconocido"}
              </p>
              <p className="m-0 text-xs text-gm-300">
                {r.detalle || "Sin descripción"}
              </p>
              <div className="flex items-center justify-between gap-2 border-t border-gm-800 pt-2 text-xs text-gm-500">
                <span>{ENTIDADES_LABEL[r.entidad] || r.entidad}</span>
                {r.proyecto_nombre && <span>{r.proyecto_nombre}</span>}
              </div>
            </article>
          ))
        )}
      </section>

      <Paginacion
        pagina={paginaActual}
        totalPaginas={totalPaginas}
        onChange={setPagina}
        label="Paginación de auditoría"
      />
    </div>
  );
};

export default Auditoria;
