import "./Equipo.css";

function EquipoTabs({ tabActiva, setTabActiva }) {

    return (
        <div className="equipo-tabs">

            <button
                className={tabActiva === "MIEMBROS" ? "activo" : ""}
                onClick={() => setTabActiva("MIEMBROS")}
            >
                MIEMBROS
            </button>

            <button
                className={tabActiva === "GRUPOS" ? "activo" : ""}
                onClick={() => setTabActiva("GRUPOS")}
            >
                GRUPOS
            </button>

            <button
                className={tabActiva === "RECORDATORIOS" ? "activo" : ""}
                onClick={() => setTabActiva("RECORDATORIOS")}
            >
                RECORDATORIOS
            </button>

        </div>
    );
}

export default EquipoTabs;