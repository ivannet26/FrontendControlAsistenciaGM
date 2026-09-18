const API_URL = import.meta.env.VITE_API_URL;


export async function obtenerResumenTiempo({
    fecha_inicio,
    fecha_fin,
    usuario_filtro = "yo"
}) {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    params.append("fecha_inicio", fecha_inicio);
    params.append("fecha_fin", fecha_fin);
    params.append("usuario_filtro", usuario_filtro);

    const url = `${API_URL}/panel/resumen-tiempo?${params.toString()}`;

    console.log("resumen-tiempo:", url);

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Error cargando el panel");
    }

    return data;
}


export async function obtenerActividadEquipo({
    fecha_inicio,
    fecha_fin
}) {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    params.append("fecha_inicio", fecha_inicio);
    params.append("fecha_fin", fecha_fin);

    const url = `${API_URL}/panel/equipo-actividad?${params.toString()}`;

    console.log("equipo-actividad:", url);

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Error cargando actividad del equipo");
    }

    return data;
}