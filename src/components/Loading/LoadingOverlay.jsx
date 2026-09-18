import "./LoadingOverlay.css";

function LoadingOverlay({
    visible,
    texto = "Cargando",
    subtexto = "Por favor, espere"
}) {

    if (!visible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-card">
                {/* Ícono circular de carga con dos arcos */}
                <div className="loading-icono">
                    <svg viewBox="0 0 50 50" width="44" height="44">
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3d4a52" stopOpacity="1" />
                                <stop offset="100%" stopColor="#3d4a52" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="#1a2831"
                            strokeWidth="3"
                        />
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="url(#grad1)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="40 86"
                            className="loading-arco-1"
                        />
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="#3d4a52"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="15 111"
                            className="loading-arco-2"
                        />
                    </svg>
                </div>

                {/* Texto a la derecha */}
                <div className="loading-texto">
                    <strong>{texto}</strong>
                    {subtexto && <span>{subtexto}</span>}
                </div>
            </div>
        </div>
    );
}

export default LoadingOverlay;