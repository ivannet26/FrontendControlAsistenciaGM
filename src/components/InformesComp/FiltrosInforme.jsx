// src/components/InformesComp/FiltrosInforme.jsx
import { useState } from "react";
import "./FiltrosInforme.css";

const FiltrosInforme = ({ onAplicar }) => {
  const [equipo, setEquipo] = useState("");
  const [cliente, setCliente] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [tarea, setTarea] = useState("");
  const [etiqueta, setEtiqueta] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleAplicar = () => {
    onAplicar({ equipo, cliente, proyecto, tarea, etiqueta, descripcion });
  };

  const handleLimpiar = () => {
    setEquipo(""); setCliente(""); setProyecto("");
    setTarea(""); setEtiqueta(""); setDescripcion("");
    onAplicar({});
  };

  return (
    <div className="filtros-informe">
      <div className="filtros-fila">
        <div className="filtro">
          <label>Equipo</label>
          <select value={equipo} onChange={(e) => setEquipo(e.target.value)}>
            <option value="">Todos</option>
          </select>
        </div>

        <div className="filtro">
          <label>Cliente</label>
          <select value={cliente} onChange={(e) => setCliente(e.target.value)}>
            <option value="">Todos</option>
          </select>
        </div>

        <div className="filtro">
          <label>Proyecto</label>
          <select value={proyecto} onChange={(e) => setProyecto(e.target.value)}>
            <option value="">Todos</option>
          </select>
        </div>

        <div className="filtro">
          <label>Tarea</label>
          <select value={tarea} onChange={(e) => setTarea(e.target.value)}>
            <option value="">Todas</option>
          </select>
        </div>

        <div className="filtro">
          <label>Etiqueta</label>
          <select value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)}>
            <option value="">Todas</option>
          </select>
        </div>

        <div className="filtro">
          <label>Descripción</label>
          <input
            type="text"
            placeholder="Buscar..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
      </div>

      <div className="filtros-acciones">
        <button className="btn-limpiar" onClick={handleLimpiar}>Limpiar</button>
        <button className="btn-aplicar" onClick={handleAplicar}>APLICAR FILTRO</button>
      </div>
    </div>
  );
};

export default FiltrosInforme;