// src/components/InformesComp/BotonExportar.jsx
import { useState, useRef, useEffect } from "react";
import {
  exportarInformeTiempo,
  exportarInformePDF,
} from "../../services/informesService";
import "./BotonExportar.css";

const BotonExportar = ({ fechaDesde, fechaHasta, filtros = {} }) => {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleExportar = async (formato) => {
    if (formato === "personalizacion") {
      alert("Personalización próximamente.");
      return;
    }

    try {
      setCargando(true);

      if (formato === "pdf") {
        await exportarInformePDF({ fechaDesde, fechaHasta, ...filtros });
      } else {
        await exportarInformeTiempo(formato, {
          fechaDesde,
          fechaHasta,
          ...filtros,
        });
      }

      setAbierto(false);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("No se pudo exportar el informe");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="boton-exportar-container" ref={ref}>
      <button
        className="boton-exportar"
        onClick={() => setAbierto(!abierto)}
        disabled={cargando}
      >
        {cargando ? "Exportando..." : "EXPORTAR"} <span>▾</span>
      </button>

      {abierto && (
        <div className="menu-exportar">
          <button onClick={() => handleExportar("pdf")}>Guardar como PDF</button>
          <button onClick={() => handleExportar("csv")}>Guardar como CSV</button>
          <button onClick={() => handleExportar("excel")}>Guardar como Excel</button>
          {/*<button
            className="menu-exportar-ultimo"
            onClick={() => handleExportar("personalizacion")}
          >
            Personalización
          </button>*/}
        </div>
      )}
    </div>
  );
};

export default BotonExportar;