import { useState } from "react";
import { reemplazar, useOperacion } from "./estadoCatalogo";

export default function useArchivo(listado, endpoints, aviso = "") {
    const [confirmar, setConfirmar] = useState(null);
    const { ejecutar, ocupado } = useOperacion();

    function opciones(registro) {
        const { id, nombre, archivado } = registro;
        const actualizar = (peticion) => async () => {
            const actualizado = await peticion(id);
            listado.setDatos((filas) => reemplazar(filas, actualizado));
        };

        if (!archivado) return [{
            texto: "Archivar",
            actuar: () => ejecutar(actualizar(endpoints.archivar), "Registro archivado", "No se pudo archivar."),
        }];

        return [
            { texto: "Restaurar", actuar: () => ejecutar(actualizar(endpoints.restaurar), "Registro restaurado", "No se pudo restaurar.") },
            {
                texto: "Eliminar",
                actuar: () => {
                    const mensaje = `¿Eliminar permanentemente “${nombre}”?`;
                    setConfirmar({
                        titulo: "Eliminar registro",
                        mensaje: [mensaje, aviso].filter(Boolean).join(" "),
                        eliminar: () => ejecutar(async () => {
                            await endpoints.eliminar(id);
                            listado.setDatos((filas) => filas.filter((fila) => fila.id !== id));
                        }, "Registro eliminado", "No se pudo eliminar."),
                    });
                },
            },
        ];
    }

    return { opciones, ocupado, confirmar, cerrarConfirmacion: () => setConfirmar(null) };
}
