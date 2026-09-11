import loadingGif from "../../assets/loadleave-leave.gif";
import "./LoadingOverlay.css";


function LoadingOverlay({
    visible,
    texto = "Un momento",
    subtexto = "por favor"
}) {

    if (!visible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-card">

                <img
                    src={loadingGif}
                    alt="Cargando"
                    className="loading-gif"
                />

                <div className="loading-texto">
                    <strong>{texto}</strong>
                    {subtexto && <span>{subtexto}</span>}
                </div>

            </div>
        </div>
    );
}

export default LoadingOverlay;