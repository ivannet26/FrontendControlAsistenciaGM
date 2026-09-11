import "./ProyectoTabs.css";


const TABS = [
    "TAREAS",
    "ACCESO",
    "ESTADO",
    "PRONÓSTICO",
    "NOTA",
    "CONFIGURACIÓN"
];


function ProyectoTabs({ tabActiva, setTabActiva }) {

    return (
        <div className="proyecto-tabs">

            {TABS.map((tab) => (
                <button
                    key={tab}
                    className={
                        tabActiva === tab
                            ? "tab-btn activo"
                            : "tab-btn"
                    }
                    onClick={() => setTabActiva(tab)}
                >
                    {tab}
                </button>
            ))}

        </div>
    );
}


export default ProyectoTabs;