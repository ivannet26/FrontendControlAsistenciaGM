import { useEffect } from "react";
import "./ModalVerHorarioAdmin.css";

const ModalVerHorarioAdmin = ({
    abierto,
    usuarioNombre,
    imagenUrl,
    cargando,
    onCerrar,
}) => {
    useEffect(() => {
        if (!abierto) return undefined;

        const overflowOriginal = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const manejarTecla = (evento) => {
            if (evento.key === "Escape") onCerrar();
        };
        window.addEventListener("keydown", manejarTecla);
        return () => {
            document.body.style.overflow = overflowOriginal;
            window.removeEventListener("keydown", manejarTecla);
        };
    }, [abierto, onCerrar]);

    if (!abierto) return null;

    return (
        <div
            className="horario-admin-overlay"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) onCerrar();
            }}
        >
            <section
                className="horario-admin-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="horario-admin-titulo"
            >
                <header className="horario-admin-header">
                    <div>
                        <h2 id="horario-admin-titulo">Horario de {usuarioNombre}</h2>
                        <p>Solo lectura</p>
                    </div>
                    <button
                        type="button"
                        className="horario-admin-cerrar"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                        title="Cerrar"
                    >
                        ×
                    </button>
                </header>
                <div className="horario-admin-cuerpo">
                    {cargando ? (
                        <p className="horario-admin-mensaje">Cargando horario...</p>
                    ) : imagenUrl ? (
                        <img
                            src={imagenUrl}
                            alt={`Horario de ${usuarioNombre}`}
                            className="horario-admin-imagen"
                        />
                    ) : (
                        <p className="horario-admin-mensaje">No hay imagen disponible.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ModalVerHorarioAdmin;
