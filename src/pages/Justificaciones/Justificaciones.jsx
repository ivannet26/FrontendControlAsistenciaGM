import { createPortal } from "react-dom";
import {
  CalendarBlank,
  MagnifyingGlass,
  Paperclip,
  X,
} from "@phosphor-icons/react";
import { Check, Image as ImageIcon, X as XIcon } from "lucide-react";
import Tabla from "../../components/Tabla/Tabla";
import ModalConfirm from "../../components/ModalConfirm/ModalConfirm";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Paginacion from "../../components/ui/Paginacion";
import {
  OPCIONES_ESTADO,
  TEXTO_ESTADO,
  formatearFecha,
  obtenerCorreoUsuario,
  obtenerNombreUsuario,
  textoTipo,
  useJustificacionesPage,
} from "./useJustificacionesPage";

const Justificaciones = () => {
  const {
    vistaHistorial,
    cargando,
    error,
    usuarios,
    listaPagina,
    paginaActual,
    totalPaginas,
    filtrosActivos,
    usuarioFiltro,
    estadoFiltro,
    fechaFiltro,
    busqueda,
    confirmacion,
    imagenAmpliada,
    setImagenAmpliada,
    setPagina,
    setBusqueda,
    setFechaFiltro,
    setUsuarioFiltro,
    setEstadoFiltro,
    cambiarFiltro,
    limpiarFiltros,
    cambiarPestana,
    abrirConfirmacion,
    confirmarResolucion,
    cerrarConfirmacion,
    intentosDe,
  } = useJustificacionesPage();

  const Estado = ({ justificacion }) => {
    const estado = justificacion.estado || "PENDIENTE";
    const intentos = intentosDe(justificacion);
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="border border-gm-800 bg-gm-900 px-2 py-1 text-xs font-semibold text-gm-100">
          {TEXTO_ESTADO[estado] || estado}
        </span>
        {estado === "PENDIENTE" && intentos > 1 && (
          <span className="border border-amber-600 px-2 py-1 text-xs text-amber-300">
            {intentos} intentos · Actualización
          </span>
        )}
      </div>
    );
  };

  const Acciones = ({ justificacion }) => {
    const estado = justificacion.estado || "PENDIENTE";
    const revisada = estado !== "PENDIENTE";
    return (
      <div className="flex items-center gap-2">
        {justificacion.evidencia_url && (
          <Button
            variant="secondary"
            className="px-2"
            onClick={() => setImagenAmpliada(justificacion)}
            aria-label={`Ver adjunto de ${obtenerNombreUsuario(justificacion)}`}
            title="Ver imagen"
          >
            <ImageIcon size={16} aria-hidden="true" />
            {revisada && <span className="text-xs">Revisada</span>}
          </Button>
        )}
        {estado === "PENDIENTE" ? (
          <>
            <Button
              variant="primary"
              className="px-2"
              onClick={() => abrirConfirmacion(justificacion, "ACEPTADA")}
              aria-label={`Aceptar justificación de ${obtenerNombreUsuario(justificacion)}`}
              title="Aceptar"
            >
              <Check size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="danger"
              className="px-2"
              onClick={() => abrirConfirmacion(justificacion, "RECHAZADA")}
              aria-label={`Rechazar justificación de ${obtenerNombreUsuario(justificacion)}`}
              title="Rechazar"
            >
              <XIcon size={16} aria-hidden="true" />
            </Button>
          </>
        ) : (
          !justificacion.evidencia_url && (
            <span className="text-xs text-gm-500">
              {justificacion.revisado_por
                ? `Por ${justificacion.revisado_por}`
                : "Revisada"}
            </span>
          )
        )}
      </div>
    );
  };

  const columnas = [
    {
      key: "usuario",
      header: "Usuario",
      render: (j) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-white">
            {obtenerNombreUsuario(j)}
          </span>
          {obtenerCorreoUsuario(j) && (
            <span className="text-xs text-gm-500">
              {obtenerCorreoUsuario(j)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (j) => (
        <span className="text-xs text-gm-100">{textoTipo(j)}</span>
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (j) => (
        <span className="text-xs text-gm-500">{formatearFecha(j.fecha)}</span>
      ),
    },
    {
      key: "asunto",
      header: "Asunto",
      render: (j) => (
        <span className="text-sm font-semibold text-white">
          {j.asunto || "Sin asunto"}
        </span>
      ),
    },
    {
      key: "mensaje",
      header: "Mensaje",
      render: (j) => (
        <p className="m-0 text-xs text-gm-300">{j.mensaje || "Sin mensaje"}</p>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (j) => <Estado justificacion={j} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (j) => <Acciones justificacion={j} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="inline-flex w-fit border border-gm-800 bg-gm-900 p-1"
        role="tablist"
        aria-label="Vistas de justificaciones"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!vistaHistorial}
          className={`h-9 px-4 text-sm font-medium ${!vistaHistorial ? "bg-gm-950 text-white" : "bg-transparent text-gm-500"}`}
          onClick={() => cambiarPestana("PENDIENTES")}
        >
          Pendientes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={vistaHistorial}
          className={`h-9 px-4 text-sm font-medium ${vistaHistorial ? "bg-gm-950 text-white" : "bg-transparent text-gm-500"}`}
          onClick={() => cambiarPestana("HISTORIAL")}
        >
          Historial
        </button>
      </div>

      <section
        className="flex flex-col gap-3 border border-gm-800 bg-gm-950 p-4 md:flex-row md:flex-wrap md:items-center"
        aria-label="Filtros de justificaciones"
      >
        <Input
          className="w-full md:flex-1"
          icon={<MagnifyingGlass size={16} weight="bold" aria-hidden="true" />}
          type="text"
          placeholder="Buscar justificación..."
          value={busqueda}
          onChange={cambiarFiltro(setBusqueda)}
        />
        <Input
          className="w-full md:w-auto"
          icon={<CalendarBlank size={14} weight="bold" />}
          type="date"
          lang="es-PE"
          value={fechaFiltro}
          onChange={cambiarFiltro(setFechaFiltro)}
        />
        <Select
          aria-label="Filtrar por usuario"
          value={usuarioFiltro}
          onChange={cambiarFiltro(setUsuarioFiltro)}
          className="w-full md:w-48"
        >
          <option value="">Todos los usuarios</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </Select>
        {vistaHistorial && (
          <Select
            aria-label="Filtrar por estado"
            value={estadoFiltro}
            onChange={cambiarFiltro(setEstadoFiltro)}
            className="w-full md:w-44"
          >
            {OPCIONES_ESTADO.map((op) => (
              <option key={op.valor} value={op.valor}>
                {op.texto}
              </option>
            ))}
          </Select>
        )}
        <Button
          variant="secondary"
          className="md:ml-auto"
          onClick={limpiarFiltros}
          disabled={!filtrosActivos}
        >
          Limpiar
        </Button>
      </section>

      {error && (
        <p
          className="m-0 border border-red-700 bg-gm-950 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      <section
        className="hidden border border-gm-800 bg-gm-950 md:block"
        aria-busy={cargando}
        aria-label={
          vistaHistorial
            ? "Historial de justificaciones"
            : "Justificaciones pendientes"
        }
      >
        <Tabla
          tableClassName="w-full table-fixed"
          rowKey="id"
          columns={columnas}
          data={listaPagina}
          loading={cargando}
          loadingText="Cargando justificaciones..."
          emptyText={
            vistaHistorial
              ? "No hay justificaciones procesadas para estos filtros."
              : "No hay justificaciones para estos filtros."
          }
        />
      </section>

      <section
        className="flex flex-col gap-3 md:hidden"
        aria-label={
          vistaHistorial
            ? "Historial de justificaciones"
            : "Justificaciones pendientes"
        }
      >
        {cargando ? (
          <p className="m-0 border border-gm-800 bg-gm-950 p-8 text-center text-sm text-gm-500">
            Cargando justificaciones...
          </p>
        ) : listaPagina.length === 0 ? (
          <p className="m-0 border border-gm-800 bg-gm-950 p-8 text-center text-sm text-gm-500">
            {vistaHistorial
              ? "No hay justificaciones procesadas para estos filtros."
              : "No hay justificaciones para estos filtros."}
          </p>
        ) : (
          listaPagina.map((j) => (
            <article
              key={j.id}
              className="flex flex-col gap-3 border border-gm-800 bg-gm-950 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-semibold text-white">
                    {obtenerNombreUsuario(j)}
                  </p>
                  {obtenerCorreoUsuario(j) && (
                    <p className="m-0 mt-1 truncate text-xs text-gm-500">
                      {obtenerCorreoUsuario(j)}
                    </p>
                  )}
                </div>
                <Estado justificacion={j} />
              </div>
              <div>
                <p className="m-0 text-sm font-semibold text-white">
                  {j.asunto || "Sin asunto"}
                </p>
                <p className="m-0 mt-1 text-xs text-gm-300">
                  {j.mensaje || "Sin mensaje"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-gm-800 pt-3">
                <span className="text-xs text-gm-500">
                  {textoTipo(j)} · {formatearFecha(j.fecha)}
                </span>
                <Acciones justificacion={j} />
              </div>
            </article>
          ))
        )}
      </section>

      <Paginacion
        pagina={paginaActual}
        totalPaginas={totalPaginas}
        onChange={setPagina}
        label="Paginación de justificaciones"
      />

      <ModalConfirm
        abierto={Boolean(confirmacion)}
        titulo={
          confirmacion?.estado === "ACEPTADA"
            ? "Aceptar justificación"
            : "Rechazar justificación"
        }
        mensaje={
          confirmacion
            ? `¿Confirmas que deseas ${confirmacion.estado === "ACEPTADA" ? "aceptar" : "rechazar"} la justificación de ${confirmacion.usuario}?`
            : ""
        }
        textoConfirmar={
          confirmacion?.estado === "ACEPTADA" ? "Aceptar" : "Rechazar"
        }
        textoCancelar="Cancelar"
        tipo="info"
        onConfirmar={confirmarResolucion}
        onCancelar={cerrarConfirmacion}
        requiereComentario
      />

      {imagenAmpliada &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="presentation"
            onClick={() => setImagenAmpliada(null)}
          >
            <div
              className="w-full max-w-2xl overflow-hidden border border-gm-700 bg-gm-950"
              role="dialog"
              aria-modal="true"
              aria-label={`Adjunto de ${obtenerNombreUsuario(imagenAmpliada)}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-4/3 w-full bg-black">
                <img
                  src={imagenAmpliada.evidencia_url}
                  alt={`Adjunto de ${obtenerNombreUsuario(imagenAmpliada)}`}
                  className="block h-full w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between border-t border-gm-800 px-4 py-3 text-sm text-white">
                <span className="inline-flex items-center gap-2">
                  <Paperclip size={15} weight="bold" aria-hidden="true" />
                  {obtenerNombreUsuario(imagenAmpliada)}
                </span>
                <Button
                  variant="ghost"
                  className="px-2"
                  onClick={() => setImagenAmpliada(null)}
                  aria-label="Cerrar adjunto"
                  title="Cerrar"
                >
                  <X size={18} weight="bold" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Justificaciones;
