import { useState, useEffect } from "react";
import { obtenerTareasPorProyecto } from "../../services/informesService";
import "./FiltrosInforme.css";

const FILTROS_VACIOS = {
    equipo: "",
    cliente: "",
    proyecto: "",
    tarea: "",
    etiqueta: ""
};

const FiltrosInforme = ({ opciones = {}, onAplicar }) => {
    const [valores, setValores] = useState(FILTROS_VACIOS);
    const [tareas, setTareas] = useState([]);

    useEffect(() => {
        let cancelado = false;
        setTareas([]);
        setValores((prev) => (prev.tarea ? { ...prev, tarea: "" } : prev));

        if (!valores.proyecto) return undefined;

        obtenerTareasPorProyecto(valores.proyecto).then((lista) => {
            if (!cancelado) setTareas(lista);
        });

        return () => {
            cancelado = true;
        };
    }, [valores.proyecto]);

    const cambiar = (campo) => (e) =>
        setValores((prev) => ({ ...prev, [campo]: e.target.value }));

    const handleAplicar = () => {
        const limpios = {};
        Object.entries(valores).forEach(([clave, valor]) => {
            if (valor !== "") limpios[clave] = valor;
        });
        onAplicar(limpios);
    };

    const handleLimpiar = () => {
        setValores(FILTROS_VACIOS);
        onAplicar({});
    };

    const renderOpciones = (lista = []) =>
        lista.map((o) => (
            <option key={o.id} value={o.id}>
                {o.nombre}
            </option>
        ));

    return (
        <div className="filtros-informe">
            <div className="filtros-fila">
                <div className="filtro">
                    <label>Equipo</label>
                    <select value={valores.equipo} onChange={cambiar("equipo")}>
                        <option value="">Todos</option>
                        {renderOpciones(opciones.equipo)}
                    </select>
                </div>

                <div className="filtro">
                    <label>Cliente</label>
                    <select value={valores.cliente} onChange={cambiar("cliente")}>
                        <option value="">Todos</option>
                        {renderOpciones(opciones.clientes)}
                    </select>
                </div>

                <div className="filtro">
                    <label>Proyecto</label>
                    <select value={valores.proyecto} onChange={cambiar("proyecto")}>
                        <option value="">Todos</option>
                        {renderOpciones(opciones.proyectos)}
                    </select>
                </div>

                <div className="filtro">
                    <label>Tarea</label>
                    <select
                        value={valores.tarea}
                        onChange={cambiar("tarea")}
                        disabled={!valores.proyecto}
                    >
                        <option value="">
                            {valores.proyecto ? "Todas" : "Elige un proyecto"}
                        </option>
                        {renderOpciones(tareas)}
                    </select>
                </div>

                <div className="filtro">
                    <label>Etiqueta</label>
                    <select value={valores.etiqueta} onChange={cambiar("etiqueta")}>
                        <option value="">Todas</option>
                        {renderOpciones(opciones.etiquetas)}
                    </select>
                </div>
            </div>

            <div className="filtros-acciones">
                <button type="button" className="btn-limpiar" onClick={handleLimpiar}>
                    Limpiar
                </button>
                <button type="button" className="btn-aplicar" onClick={handleAplicar}>
                    APLICAR FILTRO
                </button>
            </div>
        </div>
    );
};

export default FiltrosInforme;