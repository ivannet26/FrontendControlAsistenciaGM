import { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";
import "./Equipo.css";


function EquipoAcciones({
    miembro,
    eliminar,
    editar
}) {

    const [abierto, setAbierto] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const cerrarMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };

        document.addEventListener("mousedown", cerrarMenu);

        return () => {
            document.removeEventListener("mousedown", cerrarMenu);
        };
    }, []);

    return (
        <div className="equipo-acciones" ref={menuRef}>

            <MoreVertical
                size={20}
                className="menu-icon"
                onClick={() => setAbierto(!abierto)}
            />

            {abierto && (
                <div className="menu-opciones">

                    <button
                        onClick={() => {
                            editar(miembro);
                            setAbierto(false);
                        }}
                    >
                        Editar miembro
                    </button>

                    <button
                        onClick={() => {
                            editar(miembro);
                            setAbierto(false);
                        }}
                    >
                        Cambiar rol / estado
                    </button>

                    <button
                        onClick={() => {
                            eliminar(miembro.id);
                            setAbierto(false);
                        }}
                    >
                        Eliminar miembro
                    </button>

                </div>
            )}
        </div>
    );
}

export default EquipoAcciones;