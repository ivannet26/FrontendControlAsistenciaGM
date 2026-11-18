import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

function PanelFlotante({ ancla, cerrar, className, alinearInicio = false, enfocarPrimerControl = false,
    reubicarAlDesplazar = false, children }) {
    const panelRef = useRef(null);

    useLayoutEffect(() => {
        const panel = panelRef.current;
        const viewport = window.visualViewport;
        const margen = 8;
        const separacion = 4;

        function posicionar() {
            const rect = ancla.getBoundingClientRect();
            const izquierda = (viewport?.offsetLeft ?? 0) + margen;
            const arriba = (viewport?.offsetTop ?? 0) + margen;
            const ancho = (viewport?.width ?? document.documentElement.clientWidth) - margen * 2;
            const alto = (viewport?.height ?? document.documentElement.clientHeight) - margen * 2;
            const abajo = arriba + alto;

            panel.style.maxWidth = `${ancho}px`;
            panel.style.maxHeight = `${alto}px`;
            const pref = alinearInicio ? rect.left : rect.right - panel.offsetWidth;
            const cabeDebajo = rect.bottom + separacion + panel.offsetHeight <= abajo;
            const espacioEncima = rect.top - separacion - arriba;
            const espacioDebajo = abajo - rect.bottom - separacion;
            const y = cabeDebajo || espacioDebajo >= espacioEncima
                ? rect.bottom + separacion
                : rect.top - panel.offsetHeight - separacion;

            panel.style.left = `${Math.max(izquierda, Math.min(pref, izquierda + ancho - panel.offsetWidth))}px`;
            panel.style.top = `${Math.max(arriba, Math.min(y, abajo - panel.offsetHeight))}px`;
        }

        function cerrarFuera(event) {
            if (!panel.contains(event.target) && !ancla.contains(event.target)) cerrar();
        }

        function volverAlAncla() {
            ancla.focus({ preventScroll: true });
            cerrar();
        }

        function manejarTecla(event) {
            if (event.key === "Escape") {
                volverAlAncla();
            } else if (event.key === "Tab" && panel.contains(event.target)) {
                const controles = [...panel.querySelectorAll("button:not(:disabled), input:not(:disabled)")];
                const limite = event.shiftKey ? controles[0] : controles.at(-1);
                if (event.target === limite) {
                    if (event.shiftKey) event.preventDefault();
                    volverAlAncla();
                }
            }
        }

        function cerrarAlDesplazar(event) {
            if (panel.contains(event.target)) return;
            if (reubicarAlDesplazar) {
                const rect = ancla.getBoundingClientRect();
                const region = ancla.closest("main")?.getBoundingClientRect();
                if (rect.bottom > (region?.top ?? 0) && rect.top < (region?.bottom ?? window.innerHeight)) {
                    posicionar();
                    return;
                }
            }
            cerrar();
        }

        posicionar();
        if (enfocarPrimerControl) panel.querySelector("button, input")?.focus({ preventScroll: true });
        const observer = new ResizeObserver(posicionar);
        observer.observe(panel);
        document.addEventListener("pointerdown", cerrarFuera);
        document.addEventListener("keydown", manejarTecla);
        window.addEventListener("scroll", cerrarAlDesplazar, true);
        window.addEventListener("resize", cerrar);
        viewport?.addEventListener("scroll", posicionar);
        viewport?.addEventListener("resize", posicionar);

        return () => {
            observer.disconnect();
            document.removeEventListener("pointerdown", cerrarFuera);
            document.removeEventListener("keydown", manejarTecla);
            window.removeEventListener("scroll", cerrarAlDesplazar, true);
            window.removeEventListener("resize", cerrar);
            viewport?.removeEventListener("scroll", posicionar);
            viewport?.removeEventListener("resize", posicionar);
        };
    }, [ancla, cerrar, alinearInicio, enfocarPrimerControl, reubicarAlDesplazar]);

    return createPortal(
        <div className={`panel-flotante ${className}`} ref={panelRef}>{children}</div>,
        document.body
    );
}

export default PanelFlotante;
