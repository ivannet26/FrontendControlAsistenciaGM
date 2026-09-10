import { useState, useEffect } from "react";
import EquipoTabs from "../../components/EquipoComp/EquipoTabs";
import EquipoFiltros from "../../components/EquipoComp/EquipoFiltros";
import EquipoTable from "../../components/EquipoComp/EquipoTable";
import ModalMiembro from "../../components/EquipoComp/ModalMiembro";
 import "../../components/EquipoComp/Equipo.css";
import {
    obtenerMiembros,
    obtenerGrupos,
    crearMiembroAPI,
    editarMiembroAPI,
    eliminarMiembroAPI
} from "../../services/equipoService";


function Equipo() {

    const [mostrarModal, setMostrarModal] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [miembroEditar, setMiembroEditar] = useState(null);
    const [rolFiltro, setRolFiltro] = useState("Todos");
    const [grupoFiltro, setGrupoFiltro] = useState("Todos");
    const [estadoFiltro, setEstadoFiltro] = useState("Todos");
    const [filtroAbierto, setFiltroAbierto] = useState(null);
    const [tabActiva, setTabActiva] = useState("MIEMBROS");

    const [miembros, setMiembros] = useState([]);
    const [grupos, setGrupos] = useState([]);


    useEffect(() => {
        cargarMiembros();
        cargarGrupos();
    }, []);


    const cargarMiembros = async () => {
        try {
            const data = await obtenerMiembros();

            console.log("Miembros backend:", data);

            setMiembros(
                data.map(m => ({
                    id: m.id,
                    usuario_id: m.usuario_id,
                    nombre: m.nombre_usuario,
                    correo: m.email_usuario,
                    grupo_id: m.grupo_id,
                    grupo: m.nombre_grupo || "Sin grupo",
                    rol: m.tipo_usuario,          // MIEMBRO | ADMINISTRACION
                    estado: m.estado,             // ACTIVO | INACTIVO | INVITADO
                    tiene_clave_temp: m.tiene_clave_temp,
                    clave_temp_mascara: m.clave_temp_mascara,
                    etiquetas: m.etiquetas || []
                }))
            );
        } catch (error) {
            console.error("Error cargando miembros", error);
        }
    };


    const cargarGrupos = async () => {
        try {
            const data = await obtenerGrupos();
            setGrupos(data);
        } catch (error) {
            console.error("Error cargando grupos", error);
        }
    };


    // FILTROS

    const miembrosFiltrados = miembros.filter((miembro) => {

        const texto = busqueda.toLowerCase();

        const coincideBusqueda =
            miembro.nombre.toLowerCase().includes(texto) ||
            miembro.correo.toLowerCase().includes(texto);

        const coincideRol =
            rolFiltro === "Todos" ||
            miembro.rol === rolFiltro;

        const coincideGrupo =
            grupoFiltro === "Todos" ||
            miembro.grupo === grupoFiltro;

        const coincideEstado =
            estadoFiltro === "Todos" ||
            miembro.estado === estadoFiltro;

        return (
            coincideBusqueda &&
            coincideRol &&
            coincideGrupo &&
            coincideEstado
        );
    });


    // ELIMINAR

    const eliminarMiembro = async (id) => {
        if (!window.confirm("¿Eliminar este miembro del equipo?")) return;

        try {
            await eliminarMiembroAPI(id);
            setMiembros(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Error eliminando miembro", error);
            alert(error.response?.data?.detail || "No se pudo eliminar el miembro");
        }
    };


    // EDITAR

    const editarMiembro = (miembro) => {
        setMiembroEditar(miembro);
        setMostrarModal(true);
    };


    return (
        <div className="equipo-container">

            <div className="equipo-top">
                <h1>Equipo</h1>
            </div>

            <EquipoTabs
                tabActiva={tabActiva}
                setTabActiva={setTabActiva}
            />

            {tabActiva === "MIEMBROS" && (
                <div className="equipo-contenedor">

                    <div className="contenedor-header">
                        <button
                            className="crear-miembro"
                            onClick={() => {
                                setMiembroEditar(null);
                                setMostrarModal(true);
                            }}
                        >
                            AÑADIR NUEVO MIEMBRO
                        </button>
                    </div>

                    <EquipoFiltros
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        rolFiltro={rolFiltro}
                        setRolFiltro={setRolFiltro}
                        grupoFiltro={grupoFiltro}
                        setGrupoFiltro={setGrupoFiltro}
                        estadoFiltro={estadoFiltro}
                        setEstadoFiltro={setEstadoFiltro}
                        filtroAbierto={filtroAbierto}
                        setFiltroAbierto={setFiltroAbierto}
                        grupos={grupos}
                    />

                    <EquipoTable
                        miembros={miembrosFiltrados}
                        eliminarMiembro={eliminarMiembro}
                        editarMiembro={editarMiembro}
                    />
                </div>
            )}

            {tabActiva === "GRUPOS" && (
                <div className="equipo-contenedor">
                    <p style={{ color: "#b5c4cc", padding: 20 }}>
                        Vista de grupos (pendiente)
                    </p>
                </div>
            )}

            {tabActiva === "RECORDATORIOS" && (
                <div className="equipo-contenedor">
                    <p style={{ color: "#b5c4cc", padding: 20 }}>
                        Vista de recordatorios (pendiente)
                    </p>
                </div>
            )}

            {
                mostrarModal &&
                <ModalMiembro
                    cerrar={() => {
                        setMostrarModal(false);
                        setMiembroEditar(null);
                    }}

                    miembroEditar={miembroEditar}
                    grupos={grupos}

                    guardar={async (nuevoMiembro) => {
                        try {
                            if (miembroEditar) {
                                const actualizado = await editarMiembroAPI(
                                    nuevoMiembro.id,
                                    {
                                        grupo_id: nuevoMiembro.grupo_id,
                                        tipo_usuario: nuevoMiembro.tipo_usuario,
                                        estado: nuevoMiembro.estado,
                                        clave_temp: nuevoMiembro.clave_temp || null
                                    }
                                );

                                setMiembros(prev =>
                                    prev.map(m =>
                                        m.id === actualizado.id
                                            ? {
                                                ...m,
                                                grupo_id: actualizado.grupo_id,
                                                grupo: actualizado.nombre_grupo || "Sin grupo",
                                                rol: actualizado.tipo_usuario,
                                                estado: actualizado.estado,
                                                tiene_clave_temp: actualizado.tiene_clave_temp,
                                                clave_temp_mascara: actualizado.clave_temp_mascara
                                              }
                                            : m
                                    )
                                );
                            } else {
                                const creado = await crearMiembroAPI({
                                    usuario_id: nuevoMiembro.usuario_id,
                                    grupo_id: nuevoMiembro.grupo_id || null,
                                    tipo_usuario: nuevoMiembro.tipo_usuario,
                                    estado: nuevoMiembro.estado,
                                    clave_temp: nuevoMiembro.clave_temp || null
                                });

                                setMiembros(prev => [
                                    ...prev,
                                    {
                                        id: creado.id,
                                        usuario_id: creado.usuario_id,
                                        nombre: creado.nombre_usuario,
                                        correo: creado.email_usuario,
                                        grupo_id: creado.grupo_id,
                                        grupo: creado.nombre_grupo || "Sin grupo",
                                        rol: creado.tipo_usuario,
                                        estado: creado.estado,
                                        tiene_clave_temp: creado.tiene_clave_temp,
                                        clave_temp_mascara: creado.clave_temp_mascara,
                                        etiquetas: creado.etiquetas || []
                                    }
                                ]);
                            }

                            setMostrarModal(false);
                            setMiembroEditar(null);
                        } catch (error) {
                            console.error("Error guardando miembro", error);
                            alert(error.response?.data?.detail || "No se pudo guardar el miembro");
                        }
                    }}
                />
            }
        </div>
    );
}

export default Equipo;