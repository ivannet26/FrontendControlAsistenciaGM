import { useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { textoAusente } from "./estadoCatalogo";
import "./Catalogo.css";

export default function DialogoCatalogo({ titulo, cerrar, guardar, children, confirmarEliminacion = false }) {
    const pendiente = useRef(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    async function enviar(event) {
        event.preventDefault();
        if (pendiente.current) return;
        pendiente.current = true;
        setEnviando(true);
        setError("");
        try {
            await guardar(new FormData(event.currentTarget));
            cerrar();
        } catch (causa) {
            setError(textoAusente(causa, causa.response ? "No se pudo guardar. Vuelve a intentarlo." : causa.message || "No se pudo guardar."));
            pendiente.current = false;
            setEnviando(false);
        }
    }

    function solicitarCierre() {
        if (!pendiente.current) cerrar();
    }

    return (
        <Dialog open onClose={solicitarCierre} className="catalogo-dialogo">
            <DialogPanel as="form" onSubmit={enviar} className="catalogo-formulario">
                <header>
                    <DialogTitle>{titulo}</DialogTitle>
                    <button type="button" className="catalogo-boton" aria-label="Cerrar" onClick={solicitarCierre} disabled={enviando}>
                        <X size={20} aria-hidden="true" />
                    </button>
                </header>
                <div className="catalogo-campos">
                    <fieldset disabled={enviando}>{children}</fieldset>
                    {error && <p role="alert" className="catalogo-error">{error}</p>}
                </div>
                <footer>
                    <button type="button" className="catalogo-boton" disabled={enviando}
                        data-autofocus={confirmarEliminacion || undefined} onClick={solicitarCierre}>Cancelar</button>
                    <button type="submit" className={confirmarEliminacion ? "catalogo-boton catalogo-destructivo" : "catalogo-boton catalogo-primario"} disabled={enviando}>
                        {confirmarEliminacion ? (enviando ? "Eliminando…" : "Eliminar") : (enviando ? "Guardando…" : "Guardar")}
                    </button>
                </footer>
            </DialogPanel>
        </Dialog>
    );
}

export function ConfirmacionCatalogo({ confirmar, cerrar }) {
    if (!confirmar) return null;
    return <DialogoCatalogo titulo={confirmar.titulo} cerrar={cerrar} guardar={confirmar.eliminar} confirmarEliminacion>
        <p>{confirmar.mensaje}</p>
    </DialogoCatalogo>;
}
