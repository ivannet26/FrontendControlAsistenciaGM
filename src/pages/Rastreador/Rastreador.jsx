import "./Rastreador.css";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

import TimerBar from "../../components/RastreadorComp/TimerBar/TimerBar";

import { obtenerEtiquetas } from "../../services/etiquetaService";

import {
    iniciarTiempoAPI,
    detenerTiempoAPI,
    obtenerHistorialTiemposAPI,
    eliminarTiempoAPI
} from "../../services/tareasService";


// =====================================
// HELPERS DE FECHA
// =====================================

const fechaKey = (fecha) => {
    const d = new Date(fecha);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dia}`;
};

const lunesDeSemana = (fecha) => {
    const d = new Date(fecha);
    const dia = d.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatearFechaGrupo = (fechaKeyStr) => {
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    if (fechaKeyStr === fechaKey(hoy)) return "Hoy";
    if (fechaKeyStr === fechaKey(ayer)) return "Ayer";

    const [y, m, d] = fechaKeyStr.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);

    return fecha.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
};

const formatearSemanaGrupo = (lunes) => {
    const hoy = new Date();
    const lunesActual = lunesDeSemana(hoy);
    const lunesAnterior = new Date(lunesActual);
    lunesAnterior.setDate(lunesActual.getDate() - 7);

    if (lunes.getTime() === lunesActual.getTime()) return "Esta semana";
    if (lunes.getTime() === lunesAnterior.getTime()) return "La semana pasada";

    return lunes.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long"
    });
};


function Rastreador() {

    const [actividad, setActividad] = useState("");
    const [activo, setActivo] = useState(false);
    const [proyecto, setProyecto] = useState(null);
    const [tarea, setTarea] = useState(null);
    const [segundos, setSegundos] = useState(0);
    const [horaInicio, setHoraInicio] = useState(null);
    const [bloqueado, setBloqueado] = useState(false);

    const [menuAbierto, setMenuAbierto] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const menuRef = useRef(null);

    const [registros, setRegistros] = useState([]);
    const [etiquetas, setEtiquetas] = useState([]);
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);


    // =====================================
    // CARGAR AL MONTAR
    // =====================================

    useEffect(() => {
        cargarHistorial();
        cargarEtiquetas();
        recuperarActividadActiva();
    }, []);


    // =====================================
    // CERRAR MENÚ AL HACER CLIC AFUERA
    // =====================================

    useEffect(() => {
        const cerrarMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAbierto(null);
            }
        };

        document.addEventListener("mousedown", cerrarMenu);
        return () => document.removeEventListener("mousedown", cerrarMenu);
    }, []);


    // =====================================
    // CARGAR HISTORIAL
    // =====================================

    const cargarHistorial = async () => {
        try {
            const data = await obtenerHistorialTiemposAPI();

            // Leemos las etiquetas guardadas localmente
            const etiquetasPorRegistro = JSON.parse(
                localStorage.getItem("etiquetas_por_registro") || "{}"
            );

            const transformados = data.map(r => {
                const etiquetasBackend = r.etiquetas || r.tags || [];
                const etiquetasLocal = etiquetasPorRegistro[r.id] || [];

                return {
                    id: r.id,
                    actividad: r.descripcion || "",
                    proyecto: {
                        id: r.proyecto_id,
                        nombre: r.nombre_proyecto || "Sin proyecto",
                        color: r.color_proyecto || "#10b981"
                    },
                    tarea: r.tarea_id
                        ? { id: r.tarea_id, nombre: r.titulo_tarea || "" }
                        : null,
                    etiquetas: etiquetasBackend.length > 0
                        ? etiquetasBackend
                        : etiquetasLocal,
                    horaInicio: r.inicio,
                    horaFin: r.fin,
                    tiempo: r.duracion_segundos || 0,
                    fecha: r.inicio
                };
            });

            setRegistros(transformados);
        } catch (error) {
            console.error("Error cargando historial", error);
        }
    };


    const cargarEtiquetas = async () => {
        try {
            const data = await obtenerEtiquetas();
            setEtiquetas(data);
        } catch (error) {
            console.error("Error cargando etiquetas", error);
        }
    };


    // =====================================
    // RECUPERAR ACTIVIDAD ACTIVA
    // =====================================

    const recuperarActividadActiva = () => {
        const guardado = localStorage.getItem("actividad_activa");

        if (!guardado) return;

        const data = JSON.parse(guardado);

        setActividad(data.actividad || "");
        setProyecto(data.proyecto || null);
        setTarea(data.tarea || null);
        setEtiquetasSeleccionadas(data.etiquetas || []);

        const inicio = new Date(data.horaInicio);
        setHoraInicio(inicio);

        const diferencia = Math.floor((new Date() - inicio) / 1000);
        setSegundos(diferencia);

        setActivo(true);
        setBloqueado(true);
    };


    // =====================================
    // CONTADOR (cada segundo)
    // =====================================

    useEffect(() => {
        if (!activo || !horaInicio) return;

        const intervalo = setInterval(() => {
            const ahora = new Date();
            const diferencia = Math.floor(
                (ahora - new Date(horaInicio)) / 1000
            );
            setSegundos(diferencia);
        }, 1000);

        return () => clearInterval(intervalo);
    }, [activo, horaInicio]);


    // =====================================
    // HEARTBEAT: verificar cada 15s si seguimos activos
    // =====================================

    useEffect(() => {
        if (!activo) return;

        const verificarSesion = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/me`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("actividad_activa");
                    localStorage.removeItem("token");
                    localStorage.removeItem("usuario");

                    setActivo(false);
                    setBloqueado(false);
                    setSegundos(0);
                    setHoraInicio(null);
                    setActividad("");
                    setProyecto(null);
                    setTarea(null);
                    setEtiquetasSeleccionadas([]);

                    toast.error("Tu sesión fue cerrada por un administrador");
                    window.location.href = "/login";
                }
            } catch (err) {
                console.error("Error en heartbeat:", err);
            }
        };

        const intervalo = setInterval(verificarSesion, 15000);
        verificarSesion();

        return () => clearInterval(intervalo);
    }, [activo]);


    // =====================================
    // INICIAR TIMER
    // =====================================

    const iniciarTiempo = async () => {

        if (!actividad.trim()) {
            toast.error("Ingrese una actividad");
            return;
        }
        if (!proyecto) {
            toast.error("Seleccione un proyecto");
            return;
        }
        if (!tarea) {
            toast.error("Seleccione una tarea");
            return;
        }

        try {
            const payload = {
                proyecto_id: proyecto.id,
                tarea_id: tarea.id,
                descripcion: actividad,
                etiquetas_ids: etiquetasSeleccionadas.map(e => e.id)
            };

            const registro = await iniciarTiempoAPI(payload);

            // Guardamos las etiquetas asociadas al ID del registro en localStorage
            if (etiquetasSeleccionadas.length > 0) {
                const etiquetasPorRegistro = JSON.parse(
                    localStorage.getItem("etiquetas_por_registro") || "{}"
                );
                etiquetasPorRegistro[registro.id] = etiquetasSeleccionadas;
                localStorage.setItem(
                    "etiquetas_por_registro",
                    JSON.stringify(etiquetasPorRegistro)
                );
            }

            const inicio = new Date(registro.inicio);

            setHoraInicio(inicio);
            setSegundos(0);
            setActivo(true);
            setBloqueado(true);

            localStorage.setItem(
                "actividad_activa",
                JSON.stringify({
                    registro_id: registro.id,
                    actividad,
                    proyecto,
                    tarea,
                    etiquetas: etiquetasSeleccionadas,
                    horaInicio: inicio.toISOString()
                })
            );

            toast.success("Temporizador iniciado");

        } catch (error) {
            console.error("Error iniciando tiempo", error);

            const status = error.response?.status;
            if (status === 401 || status === 403) {
                localStorage.removeItem("actividad_activa");
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                toast.error("Tu sesión fue cerrada por un administrador");
                window.location.href = "/login";
                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "No se pudo iniciar el temporizador"
            );
        }
    };


    // =====================================
    // DETENER TIMER
    // =====================================

    const detenerTiempo = async () => {

        const confirmar = window.confirm(
            "¿Está seguro que desea terminar esta actividad?"
        );

        if (!confirmar) return;

        try {
            await detenerTiempoAPI();
            await cargarHistorial();

            toast.success("Actividad detenida");

        } catch (error) {
            console.error("Error deteniendo tiempo", error);

            const status = error.response?.status;

            if (status === 401 || status === 403) {
                localStorage.removeItem("actividad_activa");
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                toast.error("Tu sesión fue cerrada por un administrador");
                window.location.href = "/login";
                return;
            }

            const mensajeError =
                error.response?.data?.detail ||
                "No se pudo detener el temporizador";

            if (status !== 404) {
                toast.error(mensajeError);
                return;
            }

            console.warn(
                "El temporizador ya no existía en el servidor. Limpiando estado local."
            );
        }

        localStorage.removeItem("actividad_activa");

        setActivo(false);
        setBloqueado(false);
        setSegundos(0);
        setHoraInicio(null);
        setActividad("");
        setProyecto(null);
        setTarea(null);
        setEtiquetasSeleccionadas([]);
    };


    // =====================================
    // CONTINUAR UN REGISTRO
    // =====================================

    const continuarRegistro = async (registro) => {

        if (activo) {
            toast.error("Ya tienes un temporizador activo");
            return;
        }

        try {
            const nuevo = await iniciarTiempoAPI({
                proyecto_id: registro.proyecto.id,
                tarea_id: registro.tarea?.id || null,
                descripcion: registro.actividad,
                etiquetas_ids: (registro.etiquetas || []).map(e => e.id)
            });

            // Guardamos las etiquetas del registro continuado
            if (registro.etiquetas && registro.etiquetas.length > 0) {
                const etiquetasPorRegistro = JSON.parse(
                    localStorage.getItem("etiquetas_por_registro") || "{}"
                );
                etiquetasPorRegistro[nuevo.id] = registro.etiquetas;
                localStorage.setItem(
                    "etiquetas_por_registro",
                    JSON.stringify(etiquetasPorRegistro)
                );
            }

            const inicio = new Date(nuevo.inicio);

            setActividad(registro.actividad);
            setProyecto(registro.proyecto);
            setTarea(registro.tarea);
            setEtiquetasSeleccionadas(registro.etiquetas || []);

            setHoraInicio(inicio);
            setSegundos(0);
            setActivo(true);
            setBloqueado(true);

            localStorage.setItem(
                "actividad_activa",
                JSON.stringify({
                    registro_id: nuevo.id,
                    actividad: registro.actividad,
                    proyecto: registro.proyecto,
                    tarea: registro.tarea,
                    etiquetas: registro.etiquetas || [],
                    horaInicio: inicio.toISOString()
                })
            );

            toast.success("Temporizador iniciado");

        } catch (error) {
            console.error("Error continuando registro", error);

            const status = error.response?.status;
            if (status === 401 || status === 403) {
                localStorage.removeItem("actividad_activa");
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                toast.error("Tu sesión fue cerrada por un administrador");
                window.location.href = "/login";
                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "No se pudo continuar el registro"
            );
        }
    };


    // =====================================
    // ELIMINAR REGISTRO
    // =====================================

    const eliminarRegistro = async (registroId) => {

        const confirmar = window.confirm(
            "¿Eliminar esta actividad? Esta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
            await eliminarTiempoAPI(registroId);

            // Borramos las etiquetas asociadas al registro eliminado
            const etiquetasPorRegistro = JSON.parse(
                localStorage.getItem("etiquetas_por_registro") || "{}"
            );
            delete etiquetasPorRegistro[registroId];
            localStorage.setItem(
                "etiquetas_por_registro",
                JSON.stringify(etiquetasPorRegistro)
            );

            setRegistros(prev => prev.filter(r => r.id !== registroId));
            setMenuAbierto(null);

            toast.success("Actividad eliminada");

        } catch (error) {
            console.error("Error eliminando registro", error);

            const status = error.response?.status;
            if (status === 401 || status === 403) {
                localStorage.removeItem("actividad_activa");
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                toast.error("Tu sesión fue cerrada por un administrador");
                window.location.href = "/login";
                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "No se pudo eliminar la actividad"
            );
        }
    };


    // =====================================
    // ABRIR MENÚ
    // =====================================

    const abrirMenu = (e, id) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();

        setMenuPos({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right
        });

        setMenuAbierto(menuAbierto === id ? null : id);
    };


    // =====================================
    // FORMATO TIEMPO
    // =====================================

    const formatoTiempo = (seg) => {
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        const s = seg % 60;

        return (
            String(h).padStart(2, "0") + ":" +
            String(m).padStart(2, "0") + ":" +
            String(s).padStart(2, "0")
        );
    };


    // =====================================
    // FORMATO HORA
    // =====================================

    const formatoHora = (fecha) => {
        if (!fecha) return "";

        return new Date(fecha).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };


    const totalTiempo = registros.reduce(
        (total, r) => total + (r.tiempo || 0),
        0
    );


    // =====================================
    // AGRUPAR REGISTROS POR SEMANA Y DÍA
    // =====================================

    const registrosAgrupados = (() => {
        const semanas = {};

        registros.forEach((r) => {
            const fecha = new Date(r.horaInicio);
            const lunes = lunesDeSemana(fecha);
            const semanaKey = fechaKey(lunes);

            if (!semanas[semanaKey]) {
                semanas[semanaKey] = {
                    lunes,
                    total: 0,
                    dias: {}
                };
            }

            const diaKey = fechaKey(fecha);

            if (!semanas[semanaKey].dias[diaKey]) {
                semanas[semanaKey].dias[diaKey] = {
                    fecha,
                    total: 0,
                    registros: []
                };
            }

            semanas[semanaKey].dias[diaKey].registros.push(r);
            semanas[semanaKey].dias[diaKey].total += r.tiempo || 0;
            semanas[semanaKey].total += r.tiempo || 0;
        });

        return Object.values(semanas).sort((a, b) => b.lunes - a.lunes);
    })();


    return (
        <div className="tracker-page">

            <TimerBar
                actividad={actividad}
                setActividad={setActividad}

                activo={activo}
                setActivo={setActivo}

                segundos={segundos}
                setSegundos={setSegundos}

                proyecto={proyecto}
                setProyecto={setProyecto}

                tarea={tarea}
                setTarea={setTarea}

                etiquetas={etiquetas}

                etiquetasSeleccionadas={etiquetasSeleccionadas}
                setEtiquetasSeleccionadas={setEtiquetasSeleccionadas}

                iniciarTiempo={iniciarTiempo}
                detenerTiempo={detenerTiempo}

                bloqueado={bloqueado}
            />


            {registrosAgrupados.map((semana) => (
                <div key={fechaKey(semana.lunes)} className="semana-bloque">

                    <div className="semana-header">
                        <span>{formatearSemanaGrupo(semana.lunes)}</span>
                        <div className="semana-total">
                            <span>Total semanal:</span>
                            <strong>{formatoTiempo(semana.total)}</strong>
                        </div>
                    </div>


                    {Object.entries(semana.dias)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([diaKey, dia]) => (
                            <div key={diaKey} className="registro-container">

                                <div className="registro-header">
                                    <span>{formatearFechaGrupo(diaKey)}</span>
                                    <div className="registro-total">
                                        <span>Total:</span>
                                        <strong>{formatoTiempo(dia.total)}</strong>
                                    </div>
                                </div>


                                {dia.registros.map(registro => (
                                    <div className="registro-row" key={registro.id}>

                                        <div className="registro-actividad">
                                            {registro.actividad}
                                        </div>

                                        <div className="registro-proyecto">
                                            <span
                                                className="punto"
                                                style={{
                                                    backgroundColor:
                                                        registro.proyecto?.color || "#10b981"
                                                }}
                                            />
                                            <span
                                                style={{
                                                    color:
                                                        registro.proyecto?.color || "#10b981"
                                                }}
                                            >
                                                {registro.proyecto?.nombre || "Sin proyecto"}

                                                {registro.tarea && (
                                                    <span className="registro-tarea">
                                                        {" - "}
                                                        {registro.tarea.nombre}
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="registro-tags">
                                            {registro.etiquetas?.map(e => (
                                                <span className="tag" key={e.id}>
                                                    {e.nombre}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="registro-hora">
                                            {formatoHora(registro.horaInicio)}
                                            {" - "}
                                            {formatoHora(registro.horaFin)}
                                        </div>

                                        <div className="registro-tiempo">
                                            {formatoTiempo(registro.tiempo)}
                                        </div>

                                        <div className="registro-actions">
                                            <button onClick={() => continuarRegistro(registro)}>
                                                ▶
                                            </button>
                                            <button onClick={(e) => abrirMenu(e, registro.id)}>
                                                ⋮
                                            </button>
                                        </div>

                                    </div>
                                ))}

                            </div>
                        ))
                    }

                </div>
            ))}


            {menuAbierto && createPortal(
                <div
                    className="menu-registro-portal"
                    ref={menuRef}
                    style={{
                        position: "fixed",
                        top: menuPos.top,
                        right: menuPos.right,
                        zIndex: 9999999
                    }}
                >
                    <button
                        onClick={() => eliminarRegistro(menuAbierto)}
                        className="menu-item-eliminar"
                    >
                        Eliminar
                    </button>
                </div>,
                document.body
            )}

        </div>
    );
}


export default Rastreador;