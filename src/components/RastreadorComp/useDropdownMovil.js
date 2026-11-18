import { useLayoutEffect } from "react";

/* Ancho máximo (px) a partir del cual deja de aplicarse el modo móvil.
   Debe coincidir con la @media de ProjectSelector.css y EtiquetaSelector.css. */
const MEDIA_MOVIL = "(max-width: 768px)";

/* Margen de seguridad por defecto contra los bordes del viewport. */
const MARGEN_POR_DEFECTO = 10;

/* Separación entre el botón que abre el menú y el panel. */
const SEPARACION = 8;

/**
 * Mantiene un dropdown dentro de la pantalla en móviles.
 *
 * En escritorio no toca nada: el panel sigue usando su posición absoluta
 * definida en el CSS (anclado con right: 0).
 *
 * En móvil el panel pasa a position: fixed y este hook calcula
 * `top`, `left` y el ancho reales para que:
 *   - nunca se salga por la izquierda ni por la derecha,
 *   - se abra debajo del botón o, si no hay espacio, encima de él,
 *   - no supere el 60% de la altura de la pantalla (con scroll interno).
 *
 * @param {boolean} abierto  Indica si el panel está montado.
 * @param {object}  botonRef Ref al botón que abre el menú.
 * @param {object}  panelRef Ref al panel desplegable.
 * @param {number}  [margen] Margen lateral contra los bordes (10px por defecto).
 */
export default function useDropdownMovil(
  abierto,
  botonRef,
  panelRef,
  margen = MARGEN_POR_DEFECTO
) {
  useLayoutEffect(() => {
    if (!abierto) return;

    const panel = panelRef.current;
    const boton = botonRef.current;

    if (!panel || !boton) return;

    const esMovil = () => window.matchMedia(MEDIA_MOVIL).matches;

    /* Al volver a escritorio, quitar los estilos en línea y dejar que
       mande el CSS base (position: absolute; right: 0). */
    const limpiarEstilos = () => {
      panel.style.position = "";
      panel.style.top = "";
      panel.style.left = "";
      panel.style.right = "";
      panel.style.width = "";
      panel.style.maxWidth = "";
      panel.style.maxHeight = "";
    };

    const posicionar = () => {
      if (!esMovil()) {
        limpiarEstilos();
        return;
      }

      const anchoViewport = document.documentElement.clientWidth;
      const altoViewport = window.innerHeight;

      /* Ancho adaptable: 100% del viewport menos el margen por lado. */
      const anchoPanel = Math.max(160, anchoViewport - margen * 2);

      /* Primero fijar el ancho, para poder medir la altura real del panel. */
      panel.style.position = "fixed";
      panel.style.left = `${margen}px`;
      panel.style.right = "auto";
      panel.style.width = `${anchoPanel}px`;
      panel.style.maxWidth = "100vw";
      panel.style.maxHeight = `${Math.min(
        altoViewport * 0.6,
        altoViewport - margen * 2
      )}px`;

      const rectBoton = boton.getBoundingClientRect();
      const altoPanel = panel.offsetHeight;

      const espacioAbajo =
        altoViewport - rectBoton.bottom - SEPARACION - margen;
      const espacioArriba = rectBoton.top - SEPARACION - margen;

      /* Abrir debajo del botón; si no cabe y arriba hay más espacio,
         abrir encima. */
      let top;
      if (altoPanel <= espacioAbajo || espacioAbajo >= espacioArriba) {
        top = rectBoton.bottom + SEPARACION;
      } else {
        top = rectBoton.top - SEPARACION - altoPanel;
      }

      /* Clamp final: nunca por encima del margen ni por debajo del borde. */
      const topMaximo = altoViewport - altoPanel - margen;
      top = Math.max(margen, Math.min(top, topMaximo));

      panel.style.top = `${top}px`;
    };

    posicionar();

    window.addEventListener("resize", posicionar);
    /* Captura el scroll de cualquier contenedor para que el panel
       acompañe al botón. */
    window.addEventListener("scroll", posicionar, true);
    window.visualViewport?.addEventListener("resize", posicionar);

    return () => {
      window.removeEventListener("resize", posicionar);
      window.removeEventListener("scroll", posicionar, true);
      window.visualViewport?.removeEventListener("resize", posicionar);
    };
  }, [abierto, botonRef, panelRef, margen]);
}
