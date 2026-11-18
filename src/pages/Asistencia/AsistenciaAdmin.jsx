import { CalendarBlank, MagnifyingGlass } from "@phosphor-icons/react";
import { CalendarClock, FileText } from "lucide-react";
import Tabla from "../../components/Tabla/Tabla";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ModalVerHorarioAdmin from "../../components/ModalVerHorarioAdmin/ModalVerHorarioAdmin";
import ModalVerJustificacion from "../../components/ModalVerJustificacion/ModalVerJustificacion";
import { useAsistenciaAdmin } from "./useAsistenciaAdmin";

const estadoClase = { trabajando: "bg-emerald-900/40 border-emerald-600 text-emerald-400", "en-break": "bg-amber-900/40 border-amber-600 text-amber-400", finalizado: "bg-gm-800 border-gm-600 text-gm-300", "sin-entrada": "bg-red-900/30 border-red-700 text-red-400" };

const Avatar = ({ fila, construirUrlAvatar }) => {
  const url = construirUrlAvatar(fila.avatar_url, fila.avatarVersion);
  const iniciales = `${(fila.nombre[0] || "?").toUpperCase()}${(fila.apellido[0] || "").toUpperCase()}`;
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-gm-700 bg-gm-900 text-xs font-semibold text-gm-100">
      {url ? <img src={url} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.textContent = iniciales; }} /> : iniciales}
    </div>
  );
};

const Estado = ({ fila, claseEstado, textoEstado }) => (
  <span className={`inline-block border px-2 py-1 text-xs font-semibold ${estadoClase[claseEstado(fila.estado)] || "border-gm-700 text-gm-300"}`}>{textoEstado(fila.estado)}</span>
);

const AsistenciaAdmin = () => {
  const c = useAsistenciaAdmin();

  const verJustificacion = (fila) => {
    const justificacion = c.buscarJustificacion(fila);
    if (["PENDIENTE", "ACEPTADA"].includes(justificacion?.estado)) c.setJustificacionVer(fila);
  };

  const columnas = [
    {
      key: "usuario", header: "Usuario",
      render: (f) => (
        <div className="flex items-center gap-2">
          <Avatar fila={f} construirUrlAvatar={c.construirUrlAvatar} />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{f.nombre} {f.apellido}</span>
            <span className="text-xs text-gm-500">{f.email}</span>
          </div>
        </div>
      ),
    },
    { key: "horario", header: "Horario", render: (f) => <Button variant="secondary" className="px-2" onClick={() => c.verHorario(f.id, `${f.nombre} ${f.apellido}`)} aria-label={`Ver horario de ${f.nombre} ${f.apellido}`} title="Ver horario"><CalendarClock size={16} aria-hidden="true" /></Button> },
    { key: "inicioRastreo", header: "Inicio rastreo", render: (f) => <span className="text-xs text-gm-300">{c.formatearFechaTabla(f.inicioRastreo)}</span> },
    { key: "inicioPracticas", header: "Inicio prácticas", render: (f) => <span className="text-xs text-gm-300">{c.formatearFechaTabla(f.inicioPracticas)}</span> },
    { key: "horas", header: "Tiempo acumulado", render: (f) => <span className="text-xs text-gm-100">{c.formatearTiempoAcumulado(f.horasAcumuladas)}</span> },
    { key: "entrada", header: "Entrada", align: "center", render: (f) => <span className="text-xs text-gm-100">{c.formatearHora(f.entrada)}</span> },
    { key: "breakInicio", header: "Inicio desc.", align: "center", render: (f) => <span className="text-xs text-gm-100">{c.formatearHora(f.breakInicio)}</span> },
    { key: "breakFin", header: "Fin desc.", align: "center", render: (f) => <span className="text-xs text-gm-100">{c.formatearHora(f.breakFin)}</span> },
    { key: "duracion", header: "Duración", align: "center", render: (f) => <span className="text-xs font-semibold text-sky-400">{f.duracion}</span> },
    { key: "salida", header: "Salida", align: "center", render: (f) => <span className="text-xs text-gm-100">{c.formatearHora(f.salida)}</span> },
    { key: "estado", header: "Estado", render: (f) => <Estado fila={f} claseEstado={c.claseEstado} textoEstado={c.textoEstado} /> },
    {
      key: "justificacion", header: "Justificación",
      render: (f) => {
        const j = c.buscarJustificacion(f);
        return ["PENDIENTE", "ACEPTADA"].includes(j?.estado)
          ? <Button variant="secondary" className="px-2" onClick={() => c.setJustificacionVer(f)} aria-label={`Ver justificación de ${f.nombre} ${f.apellido}`} title="Ver justificación"><FileText size={16} aria-hidden="true" /></Button>
          : <span className="text-xs text-gm-600">—</span>;
      },
    },
    {
      key: "comentario", header: "Comentario admin",
      render: (f) => {
        const j = c.buscarJustificacion(f);
        const txt = j?.estado === "PENDIENTE" ? "Pendiente de revisión" : ["ACEPTADA", "RECHAZADA", "INJUSTIFICADA"].includes(j?.estado) ? (j.comentario_admin?.trim() || "—") : "—";
        return <span className="text-xs text-gm-400" title={j?.comentario_admin?.trim() || ""}>{txt}</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 border border-gm-800 bg-gm-950 p-4 md:flex-row md:flex-wrap md:items-center" aria-label="Filtros de control de asistencia">
        <Input className="w-full md:max-w-xs md:flex-1" icon={<MagnifyingGlass size={16} weight="bold" aria-hidden="true" />} placeholder="Buscar nombre o correo..." value={c.busqueda} onChange={(e) => c.setBusqueda(e.target.value)} />
        <Input className="w-full md:w-auto" icon={<CalendarBlank size={14} weight="bold" />} type="date" lang="es-PE" value={c.fecha} onChange={(e) => c.setFecha(e.target.value)} />
        <Select value={c.filtroRol} onChange={(e) => c.setFiltroRol(e.target.value)} className="w-full md:w-44">
          <option value="">Todos los roles</option>
          <option value="Administrador">Administrador</option>
          <option value="Practicante">Practicante</option>
        </Select>
        <Select value={c.filtroEstado} onChange={(e) => c.setFiltroEstado(e.target.value)} className="w-full md:w-44">
          <option value="">Todos los estados</option>
          <option value="SIN_ENTRADA">Sin entrada</option>
          <option value="TRABAJANDO">Trabajando</option>
          <option value="EN_BREAK">En descanso</option>
          <option value="FINALIZADO">Finalizado</option>
        </Select>
        <Button variant="secondary" className="md:ml-auto" onClick={c.limpiar}>Limpiar</Button>
      </section>

      <section className="hidden border border-gm-800 bg-gm-950 md:block">
        <Tabla rowKey="id" data={c.filasFiltradas} loading={c.cargandoInicial} loadingText="Cargando registros..." emptyText="No hay usuarios con esos filtros." columns={columnas} />
      </section>

      <section className="flex flex-col gap-3 md:hidden" aria-label="Control de asistencia">
        {c.cargandoInicial ? (
          <p className="m-0 border border-gm-800 bg-gm-950 p-8 text-center text-sm text-gm-500">Cargando registros...</p>
        ) : c.filasFiltradas.length === 0 ? (
          <p className="m-0 border border-gm-800 bg-gm-950 p-8 text-center text-sm text-gm-500">No hay usuarios con esos filtros.</p>
        ) : (
          c.filasFiltradas.map((f) => {
            const j = c.buscarJustificacion(f);
            const tieneJustificacion = ["PENDIENTE", "ACEPTADA"].includes(j?.estado);
            return (
              <article key={f.id} className="flex flex-col gap-3 border border-gm-800 bg-gm-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar fila={f} construirUrlAvatar={c.construirUrlAvatar} />
                    <div className="min-w-0">
                      <p className="m-0 truncate text-sm font-semibold text-white">{f.nombre} {f.apellido}</p>
                      <p className="m-0 mt-1 truncate text-xs text-gm-500">{f.email}</p>
                    </div>
                  </div>
                  <Estado fila={f} claseEstado={c.claseEstado} textoEstado={c.textoEstado} />
                </div>
                <dl className="m-0 grid grid-cols-2 gap-3 border-t border-gm-800 pt-3 text-xs">
                  <div><dt className="text-gm-500">Entrada</dt><dd className="m-0 text-gm-100">{c.formatearHora(f.entrada)}</dd></div>
                  <div><dt className="text-gm-500">Salida</dt><dd className="m-0 text-gm-100">{c.formatearHora(f.salida)}</dd></div>
                  <div><dt className="text-gm-500">Descanso</dt><dd className="m-0 text-sky-400">{f.duracion}</dd></div>
                  <div><dt className="text-gm-500">Acumulado</dt><dd className="m-0 text-gm-100">{c.formatearTiempoAcumulado(f.horasAcumuladas)}</dd></div>
                </dl>
                <div className="flex justify-end gap-2 border-t border-gm-800 pt-3">
                  <Button variant="secondary" className="px-2" onClick={() => c.verHorario(f.id, `${f.nombre} ${f.apellido}`)} aria-label={`Ver horario de ${f.nombre} ${f.apellido}`} title="Ver horario"><CalendarClock size={16} aria-hidden="true" /></Button>
                  {tieneJustificacion && (
                    <Button variant="secondary" className="px-2" onClick={() => verJustificacion(f)} aria-label={`Ver justificación de ${f.nombre} ${f.apellido}`} title="Ver justificación"><FileText size={16} aria-hidden="true" /></Button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {c.modalHorario.abierto && (
        <ModalVerHorarioAdmin abierto={c.modalHorario.abierto} usuarioNombre={c.modalHorario.nombre} imagenUrl={c.modalHorario.imagenUrl} cargando={c.modalHorario.cargando} onCerrar={c.cerrarHorario} />
      )}
      {c.justificacionVer && (
        <ModalVerJustificacion abierto={Boolean(c.justificacionVer)} justificacion={c.justificacionVer} onCerrar={() => c.setJustificacionVer(null)} />
      )}
    </div>
  );
};

export default AsistenciaAdmin;
