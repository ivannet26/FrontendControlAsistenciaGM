import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Encabezado, EstadoListado } from "../../components/Catalogo/Catalogo";
import DialogoCatalogo, { ConfirmacionCatalogo } from "../../components/Catalogo/DialogoCatalogo";
import { reemplazar, useListado, useOperacion } from "../../components/Catalogo/estadoCatalogo";
import ModalMiembro from "../../components/EquipoComp/ModalMiembro";
import ModalGrupo from "../../components/EquipoComp/GrupoComp/ModalGrupo";
import { useUsuarioActual } from "../../hooks/useUsuarioActual";
import { obtenerGrupos, obtenerMiembros, crearGrupoAPI, editarGrupoAPI, eliminarGrupoAPI,
    crearMiembroAPI, editarMiembroAPI, eliminarMiembroAPI } from "../../services/equipoService";
import DirectorioMiembros from "./DirectorioMiembros";
import EquiposCatalogo from "./EquiposCatalogo";
import "./Equipo.css";

const tiposAdmin = ["ADMINISTRACION", "ADMINISTRADOR", "ADMIN"];

export default function Equipo() {
    const miembros = useListado(obtenerMiembros);
    const grupos = useListado(obtenerGrupos);
    const usuario = useUsuarioActual();
    const miembroActual = miembros.datos.find((m) => m.usuario_id === usuario.id);
    const admin = [usuario.rol, miembroActual?.tipo_usuario].some((rol) => tiposAdmin.includes(rol?.toUpperCase()));
    const [parametros] = useSearchParams();
    const equipoId = parametros.get("equipo");
    const vista = parametros.get("vista");
    const sinEquipo = !equipoId && vista === "sin-equipo";
    const esCatalogo = !equipoId && !sinEquipo && vista !== "miembros";
    const equipo = grupos.datos.find((g) => String(g.id) === equipoId);
    const [dialogo, setDialogo] = useState(null);
    const [confirmar, setConfirmar] = useState(null);
    const { ejecutar, ocupado } = useOperacion();

    const raiz = useRef(null);
    const tituloRef = useRef(null);
    const navegacion = equipoId ?? vista ?? "";
    useEffect(() => {
        raiz.current?.scrollIntoView({ block: "start" });
        tituloRef.current?.focus({ preventScroll: true });
    }, [navegacion]);

    const miembrosListos = !miembros.cargando && !miembros.error;
    const gruposListos = !grupos.cargando && !grupos.error;
    const totalPorEquipo = new Map();
    for (const miembro of miembros.datos) {
        if (miembro.grupo_id != null) {
            const total = totalPorEquipo.get(miembro.grupo_id) ?? 0;
            totalPorEquipo.set(miembro.grupo_id, total + 1);
        }
    }
    const totalMiembros = (g) => miembrosListos ? totalPorEquipo.get(g.id) ?? 0 : g.miembros_count ?? g.miembros?.length ?? 0;
    const totalDetalle = equipo ? totalMiembros(equipo) : 0;
    const asignables = equipo && admin ? miembros.datos.filter((m) => m.grupo_id !== equipo.id)
        .toSorted((a, b) => a.nombre_usuario.localeCompare(b.nombre_usuario, "es", { sensitivity: "base" })) : [];
    const titulo = esCatalogo ? "Equipos" : equipoId ? equipo?.nombre ?? "Equipo" : sinEquipo ? "Sin equipo" : "Todos los miembros";

    async function guardarMiembro(datos) {
        const id = dialogo.miembro.id;
        const registro = id ? await editarMiembroAPI(id, datos) : await crearMiembroAPI(datos);
        miembros.setDatos((prev) => reemplazar(prev, registro));
        toast.success(id ? "Miembro actualizado" : "Miembro añadido");
    }

    async function guardarGrupo(datos) {
        const anterior = dialogo.grupo;
        const confirmado = anterior.id ? await editarGrupoAPI(anterior.id, datos) : await crearGrupoAPI(datos);
        const registro = anterior.id
            ? { ...anterior, nombre: confirmado.nombre, descripcion: confirmado.descripcion }
            : confirmado;
        grupos.setDatos((prev) => reemplazar(prev, registro));
        toast.success(anterior.id ? "Equipo actualizado" : "Equipo creado");
    }

    async function asignarMiembro(datos) {
        const registro = await editarMiembroAPI(Number(datos.get("miembro")), { grupo_id: equipo.id });
        miembros.setDatos((prev) => reemplazar(prev, registro));
        toast.success("Miembro asignado");
    }

    function quitarMiembro(miembro) {
        setConfirmar({
            titulo: "Eliminar miembro",
            mensaje: "¿Eliminar a " + miembro.nombre_usuario + " del directorio de miembros?",
            eliminar: () => ejecutar(async () => {
                await eliminarMiembroAPI(miembro.id);
                miembros.setDatos((prev) => prev.filter(({ id }) => id !== miembro.id));
            }, "Miembro eliminado", "No se pudo eliminar el miembro."),
        });
    }

    function quitarGrupo(grupo) {
        setConfirmar({
            titulo: "Eliminar equipo",
            mensaje: "¿Eliminar “" + grupo.nombre + "”? Sus integrantes quedarán en «Sin equipo».",
            eliminar: () => ejecutar(async () => {
                await eliminarGrupoAPI(grupo.id);
                grupos.setDatos((prev) => prev.filter(({ id }) => id !== grupo.id));
                miembros.setDatos((prev) => prev.map((m) => m.grupo_id === grupo.id
                    ? { ...m, grupo_id: null, nombre_grupo: null }
                    : m));
            }, "Equipo eliminado", "No se pudo eliminar el equipo."),
        });
    }

    return <section className="catalogo" ref={raiz}>
        <Encabezado titulo={titulo} referenciaTitulo={tituloRef}
            volver={!esCatalogo && { destino: "/app/equipo", texto: "Volver a equipos" }}
            detalle={equipo && <>
                {equipo.descripcion && <p>{equipo.descripcion}</p>}
                <span>{totalDetalle} {totalDetalle === 1 ? "miembro" : "miembros"}</span>
            </>}>
            {esCatalogo && <button type="button" className="catalogo-boton catalogo-primario"
                disabled={!gruposListos || ocupado}
                onClick={() => setDialogo({ grupo: {} })}>Nuevo equipo</button>}
            {equipo && <button type="button" className="catalogo-boton" disabled={ocupado}
                onClick={() => setDialogo({ grupo: equipo })}>Editar equipo</button>}
            {equipo && admin && <button type="button" className="catalogo-boton" disabled={!asignables.length || ocupado}
                onClick={() => setDialogo({ asignar: true })}>Asignar miembro</button>}
            {!esCatalogo && (!equipoId || equipo) && admin && (
                <button type="button" className="catalogo-boton catalogo-primario" disabled={!miembrosListos || ocupado}
                    onClick={() => setDialogo({ miembro: { grupo_id: equipo?.id } })}>Nuevo miembro</button>
            )}
        </Encabezado>
        {esCatalogo && <EquiposCatalogo grupos={grupos} totalMiembros={totalMiembros}
            editar={(grupo) => setDialogo({ grupo })} eliminar={quitarGrupo} ocupado={ocupado} />}
        {equipoId && !equipo && <EstadoListado {...grupos} vacio="No se encontró este equipo." />}
        {!esCatalogo && (!equipoId || equipo) && <>
            <DirectorioMiembros key={navegacion} miembros={miembros} grupos={grupos} equipo={equipo} sinEquipo={sinEquipo}
                admin={admin} editar={(miembro) => setDialogo({ miembro })} eliminar={quitarMiembro} ocupado={ocupado} />
        </>}
        {dialogo?.miembro && admin && <ModalMiembro miembro={dialogo.miembro} miembros={miembros.datos} grupos={grupos}
            cerrar={() => setDialogo(null)} guardar={guardarMiembro} />}
        {dialogo?.grupo && <ModalGrupo grupo={dialogo.grupo} grupos={grupos.datos}
            cerrar={() => setDialogo(null)} guardar={guardarGrupo} />}
        {dialogo?.asignar && equipo && admin && (
            <DialogoCatalogo titulo="Asignar miembro" cerrar={() => setDialogo(null)} guardar={asignarMiembro}>
                <label>Miembro
                    <select name="miembro" aria-label="Miembro a asignar" required defaultValue="">
                        <option value="" disabled>Elige un miembro</option>
                        {asignables.map((m) => <option key={m.id} value={m.id}>
                            {m.nombre_usuario} · {m.email_usuario} · {grupos.datos.find((grupo) => grupo.id === m.grupo_id)?.nombre ?? "Sin equipo"}
                        </option>)}
                    </select>
                </label>
                <p>La asignación cambia el equipo del miembro seleccionado.</p>
            </DialogoCatalogo>
        )}
        <ConfirmacionCatalogo confirmar={confirmar} cerrar={() => setConfirmar(null)} />
    </section>;
}
