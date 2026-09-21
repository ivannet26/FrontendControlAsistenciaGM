import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
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

        // Altura estimada del menú (2 opciones + padding)
        const alturaMenu = 100;

        // Detectar si el menú cabe abajo o hay que abrirlo arriba
        const espacioAbajo = window.innerHeight - rect.bottom;
        const abrirHaciaArriba = espacioAbajo < alturaMenu;

        setMenuPos({
            top: abrirHaciaArriba
                ? rect.top - alturaMenu - 4
                : rect.bottom + 4,
            right: window.innerWidth - rect.right
        });

        setAbierto(!abierto);
    };


    const handleEditar = () => {
        try {
            editar(miembro);
        } catch (err) {
            toast.error(err?.message || "No se pudo abrir el editor");
        }
        setAbierto(false);
    };


    const handleEliminar = async () => {
        const confirmar = window.confirm(
            `¿Eliminar a ${miembro.nombre || "este miembro"}?`
        );

        if (!confirmar) {
            setAbierto(false);
            return;
        }

        try {
            await eliminar(miembro.id);
            toast.success("Miembro eliminado");
        } catch (err) {
            toast.error(err?.message || "No se pudo eliminar el miembro");
        }

        setAbierto(false);
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
                        zIndex: 2147483647
                    }}
                >
                    <button onClick={handleEditar}>
                        Editar miembro
                    </button>

                    <button onClick={handleEliminar}>
                        Eliminar miembro
                    </button>
                </div>,

                document.body
            )}

        </div>
    );
}

export default EquipoAcciones;