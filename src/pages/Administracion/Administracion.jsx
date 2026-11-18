import { useState } from "react";
import GestionUsuarios from "../GestionUsuarios/GestionUsuarios";
import AsistenciaAdmin from "../Asistencia/AsistenciaAdmin";
import Justificaciones from "../Justificaciones/Justificaciones";

const TABS = [
  { id: "usuarios", label: "Usuarios" },
  { id: "control", label: "Control de asistencia" },
  { id: "justificaciones", label: "Justificaciones" },
];

const Administracion = () => {
  const [tab, setTab] = useState("usuarios");
  const [montadas, setMontadas] = useState({ usuarios: true });

  const cambiarTab = (id) => {
    setTab(id);
    setMontadas((m) => ({ ...m, [id]: true }));
  };

  return (
    <div className="w-full p-4 text-gm-100 md:p-6">
      <header className="mb-4 flex flex-col gap-3">
        <div>
          <h1 className="m-0 text-2xl font-semibold text-white">
            Administración
          </h1>
          <p className="m-0 mt-1 text-sm text-gm-500">
            Gestiona usuarios, asistencia y justificaciones
          </p>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Módulos de administración"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`h-9 border px-4 text-sm font-medium ${tab === t.id ? "border-sky-500 bg-sky-500 text-white" : "border-gm-700 bg-transparent text-gm-300 hover:border-gm-400 hover:text-white"}`}
              onClick={() => cambiarTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {montadas.usuarios && (
        <div className={tab === "usuarios" ? "" : "hidden"}>
          <GestionUsuarios />
        </div>
      )}
      {montadas.control && (
        <div className={tab === "control" ? "" : "hidden"}>
          <AsistenciaAdmin />
        </div>
      )}
      {montadas.justificaciones && (
        <div className={tab === "justificaciones" ? "" : "hidden"}>
          <Justificaciones />
        </div>
      )}
    </div>
  );
};

export default Administracion;
