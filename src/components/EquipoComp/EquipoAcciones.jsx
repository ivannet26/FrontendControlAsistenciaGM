import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import "./Equipo.css";


function EquipoAcciones({
    miembro,
    eliminar,
    editar
}) {

    const [abierto, setAbierto] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

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


    const abrirMenu = (e) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();

        setMenuPos({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right
        });

        setAbierto(!abierto);
    };


    return (
        <div className="equipo-acciones">

            <MoreVertical
                size={20}
                className="menu-icon"
                onClick={abrirMenu}
            />

            {abierto && createPortal(

                <div
                    className="menu-opciones-portal"
                    ref={menuRef}
                    style={{
                        position: "fixed",
                        top: menuPos.top,
                        right: menuPos.right,
                        zIndex: 9999999
                    }}
                >
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
                </div>,

                document.body
            )}

        </div>
    );
}

export default EquipoAcciones;