export const MENSAJES_ENTRADA = [
    "Jornada iniciada. Buen comienzo.",
    "En marcha. Mantén el foco.",
    "Día por delante. Vamos con orden.",
    "Registro listo. A trabajar.",
    "Arrancamos. Buen día.",
    "Todo en orden. Comienza la jornada.",
    "Comienza el día. Buen enfoque.",
    "Jornada en curso. Buen ritmo.",
    "Listo para avanzar con tus tareas.",
    "Buen inicio. Prioridades claras.",
    "Una nueva jornada comienza.",
    "En marcha. Paso a paso.",
    "Inicio registrado. A concentrarse.",
    "Buen comienzo. Sigue con el plan.",
    "Jornada activa. Enfócate en lo importante.",
    "A trabajar con buen ritmo.",
    "Día iniciado. Vamos con claridad.",
    "Todo listo para empezar.",
];

export const MENSAJES_SALIDA = [
    "Jornada completada. Buen trabajo.",
    "Cerrando el día. Descansa.",
    "Registro final. Hasta mañana.",
    "Día cerrado. Buen descanso.",
    "Fin de jornada. Nos vemos.",
    "Todo listo. Buen cierre de día.",
    "Salida registrada. Que descanses.",
    "Jornada finalizada. Buen trabajo hoy.",
    "Buen cierre. Hasta la próxima jornada.",
    "Por hoy, trabajo completado.",
    "Tareas cerradas. Descansa.",
    "Jornada concluida. Nos vemos mañana.",
    "Buen trabajo. Fin de jornada.",
    "Día terminado. Que tengas buen descanso.",
    "Cierre registrado. Hasta mañana.",
    "Trabajo de hoy completado.",
    "Jornada cerrada. Buen descanso.",
    "Nos vemos en la próxima jornada.",
];

export function obtenerMensajeAleatorio(lista) {
    if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error("Se requiere una lista de mensajes para elegir uno al azar.");
    }

    return lista[Math.floor(Math.random() * lista.length)];
}
