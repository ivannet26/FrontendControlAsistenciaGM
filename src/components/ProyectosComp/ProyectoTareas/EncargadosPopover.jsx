import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown } from "lucide-react";
import "./EncargadosPopover.css";


function EncargadosPopover({
    tareaId,                        
    miembrosAsignados = [],
    todosLosMiembros = [],
    onAsignar,                    
    onDesasignar                    
}) {

    const [abierto, setAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const btnRef = useRef(null);
    const popoverRef = useRef(null);


    useEffect(() => {
        const cerrar = (e) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setAbierto(false);
            }
        };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, []);


    const abrir = () => {
    if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();

        // Altura estimada del popover (buscador + header + lista)
        const alturaPopover = 400;

        // Detectar si cabe abajo o hay que abrir hacia arriba
        const espacioAbajo = window.innerHeight - rect.bottom;
        const abrirHaciaArriba = espacioAbajo < alturaPopover;

        setPos({
            top: abrirHaciaArriba
                ? rect.top - alturaPopover - 6   
                : rect.bottom + 6,               
            left: rect.left
        });
    }
    setAbierto(!abierto);
};


    // Filtros
    const texto = busqueda.toLowerCase();

    const miembrosFiltrados = useMemo(() => {
        if (!texto) return todosLosMiembros;
        return todosLosMiembros.filter(m =>
            (m.nombre_usuario || m.nombre || "").toLowerCase().includes(texto) ||
            (m.email_usuario || m.correo || "").toLowerCase().includes(texto)
        );
    }, [todosLosMiembros, texto]);


    const miembrosPorGrupo = useMemo(() => {
        const mapa = {};
        miembrosFiltrados.forEach(m => {
            const grupo = m.nombre_grupo || m.grupo || "Sin grupo";
            if (!mapa[grupo]) mapa[grupo] = [];
            mapa[grupo].push(m);
        });
        return mapa;
    }, [miembrosFiltrados]);


    const estaAsignado = (miembroId) =>
        miembrosAsignados.some(m => m.id === miembroId);


    const textoBoton = () => {
        if (miembrosAsignados.length === 0) return "Cualquiera";
        if (miembrosAsignados.length === 1) {
            return miembrosAsignados[0].nombre_usuario || miembrosAsignados[0].nombre;
        }
        return `${miembrosAsignados.length} encargados`;
    };


    return (
        <>
            <button ref={btnRef} className="encargados-btn" onClick={abrir}>
                <span>{textoBoton()}</span>
                <ChevronDown size={14} />
            </button>


            {abierto && createPortal(
                <div
                    className="encargados-popover"
                    ref={popoverRef}
                    style={{
                        position: "fixed",
                        top: pos.top,
                        left: pos.left,
                        zIndex: 9999999
                    }}
                >
                    <div className="encargados-buscador">
                        <Search size={16} />
                        <input
                            placeholder="Buscar usuarios"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            autoFocus
                        />
                    </div>


                    <div className="encargados-header">
                        <span>MOSTRAR</span>
                        <span className="encargados-filtro">Activo ▾</span>
                    </div>


                    <div className="encargados-lista">

                        {/* USUARIOS - ✅ ACTIVOS */}
                        <div className="encargados-seccion">USUARIOS</div>

                        {Object.entries(miembrosPorGrupo).map(([grupo, miembros]) => (
                            <div key={grupo}>
                                {miembros.map(m => {
                                    const activo = estaAsignado(m.id);
                                    return (
                                        <label
                                            key={m.id}
                                            className={
                                                activo
                                                    ? "encargados-item activo"
                                                    : "encargados-item"
                                            }
                                        >
                                            <input
                                                type="checkbox"
                                                checked={activo}
                                                onChange={() => {                     /* 👈 CLAVE */
                                                    if (activo) {
                                                        onDesasignar(tareaId, m.id);
                                                    } else {
                                                        onAsignar(tareaId, m.id);
                                                    }
                                                }}
                                            />
                                            <span>
                                                {m.nombre_usuario || m.nombre}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ))}

                        {miembrosFiltrados.length === 0 && (
                            <div className="encargados-vacio">
                                No se encontraron resultados
                            </div>
                        )}

                    </div>
                </div>,

                document.body
            )}
        </>
    );
}

export default EncargadosPopover;