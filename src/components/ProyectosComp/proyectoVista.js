export function formatearTiempo(proyecto) {
    const segundos = proyecto.segundos_registrados ?? Math.round((proyecto.horas_registradas ?? 0) * 3600);
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor(segundos % 3600 / 60);
    const resto = segundos % 60;
    if (horas) return minutos ? `${horas} h ${minutos} min` : `${horas} h`;
    if (minutos) return resto ? `${minutos} min ${resto} s` : `${minutos} min`;
    return resto ? `${resto} s` : "0 min";
}

export function estadoProyecto(proyecto) {
    if (proyecto.archivado) return "Archivado";
    return { ACTIVO: "Activo", PAUSADO: "Pausado", FINALIZADO: "Finalizado" }[proyecto.estado] || proyecto.estado;
}
