import { useState, useEffect, useRef } from "react";
import {
    HelpCircle,
    BookOpen,
    PlayCircle,
    Headphones,
    MessageCircle
} from "lucide-react";
import "./HelpMenu.css";

/* Cambia aquí a dónde lleva cada opción */
const OPCIONES = [
    { id: "ayuda",    texto: "Centro de ayuda",      icono: BookOpen,      url: "#" },
    { id: "tutorial", texto: "Tutoriales",           icono: PlayCircle,    url: "https://rumble.com/user/sistemasnet26?e9s=src_v1_cmd" },
    { id: "soporte",  texto: "Contacta con soporte", icono: Headphones,    url: "#" },
    { id: "feedback", texto: "Compartir feedback",   icono: MessageCircle, url: "#" }
];

function HelpMenu() {

    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {

        const cerrarFuera = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setAbierto(false);
            }
        };

        const cerrarEsc = (e) => {
            if (e.key === "Escape") setAbierto(false);
        };

        document.addEventListener("mousedown", cerrarFuera);
        document.addEventListener("keydown", cerrarEsc);

        return () => {
            document.removeEventListener("mousedown", cerrarFuera);
            document.removeEventListener("keydown", cerrarEsc);
        };

    }, []);

    const elegir = (opcion) => {
        setAbierto(false);
        if (opcion.url && opcion.url !== "#") {
            window.open(opcion.url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="help-menu" ref={ref}>

            <button
                type="button"
                className={"help-btn" + (abierto ? " activo" : "")}
                title="Ayuda"
                onClick={() => setAbierto(!abierto)}
            >
                <HelpCircle size={18} />
            </button>

            {abierto && (
                <div className="help-dropdown">

                    <div className="help-titulo">Ayuda</div>

                    {OPCIONES.map((op) => {
                        const Icono = op.icono;
                        return (
                            <button
                                key={op.id}
                                type="button"
                                className="help-item"
                                onClick={() => elegir(op)}
                            >
                                <Icono size={14} />
                                <span>{op.texto}</span>
                            </button>
                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default HelpMenu;