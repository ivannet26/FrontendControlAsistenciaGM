import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const ordenEspanol = new Intl.Collator("es", { sensitivity: "base", numeric: true });
const vacio = [];

export function textoAusente(error, alternativo) {
    const detalle = error.response?.data?.detail;
    if (typeof detalle === "string") return detalle;
    if (Array.isArray(detalle)) return detalle.map(({ msg }) => msg).filter(Boolean).join(". ") || alternativo;
    return error.mensajeAmigable || alternativo;
}

export function coincide(texto, busqueda) {
    const normalizar = (valor) => String(valor ?? "").normalize("NFD")
        .replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es");
    return normalizar(texto).includes(normalizar(busqueda.trim()));
}

export function useListado(cargar, clave) {
    const [intento, setIntento] = useState(0);
    const [resultado, setResultado] = useState(null);
    const actual = resultado?.intento === intento && resultado.clave === clave;

    useEffect(() => {
        let activo = true;
        cargar(clave).then(
            (datos) => { if (activo) setResultado({ intento, clave, datos }); },
            (error) => { if (activo) setResultado({ intento, clave, error }); },
        );
        return () => { activo = false; };
    }, [cargar, clave, intento]);

    function setDatos(actualizar) {
        setResultado((prev) => ({ ...prev, datos: actualizar(prev?.datos ?? vacio) }));
    }

    return {
        datos: actual ? resultado.datos ?? vacio : vacio,
        error: actual ? resultado.error : null,
        cargando: !actual,
        recargar: () => setIntento((valor) => valor + 1),
        setDatos,
    };
}

export function useOperacion() {
    const enCurso = useRef(false);
    const [ocupado, setOcupado] = useState(false);

    async function ejecutar(operacion, exito, alternativo, mostrarError = toast.error) {
        if (enCurso.current) return;
        enCurso.current = true;
        setOcupado(true);
        try {
            await operacion();
            if (exito) toast.success(exito);
        } catch (error) {
            mostrarError(textoAusente(error, alternativo));
        } finally {
            enCurso.current = false;
            setOcupado(false);
        }
    }

    return { ocupado, ejecutar };
}

export function reemplazar(filas, registro) {
    return filas.some(({ id }) => id === registro.id)
        ? filas.map((fila) => fila.id === registro.id ? registro : fila)
        : [...filas, registro];
}

export function usePaginacion(filas, columnas, criterio, inicial) {
    const [orden, setOrden] = useState({ id: inicial, descendente: false });
    const [seleccion, setSeleccion] = useState({ criterio, pagina: 1, tamano: 10 });
    const { tamano } = seleccion;
    const total = filas.length;
    const paginas = Math.max(1, Math.ceil(total / tamano));
    const pagina = seleccion.criterio === criterio ? Math.min(seleccion.pagina, paginas) : 1;
    if (pagina !== seleccion.pagina || seleccion.criterio !== criterio) {
        setSeleccion({ criterio, pagina, tamano });
    }
    const columna = columnas.find((item) => item.id === orden.id);
    const valor = columna?.ordenar;
    const ordenadas = valor ? filas.toSorted((a, b) => {
        const x = valor(a);
        const y = valor(b);
        const diferencia = typeof x === "number" && typeof y === "number"
            ? x - y
            : ordenEspanol.compare(x ?? "", y ?? "");
        return (orden.descendente ? -diferencia : diferencia) || a.id - b.id;
    }) : filas;
    const inicio = (pagina - 1) * tamano;

    function ordenar(id, descendente) {
        setOrden((prev) => ({ id, descendente: descendente ?? (prev.id === id && !prev.descendente) }));
        setSeleccion({ criterio, pagina: 1, tamano });
    }

    return {
        orden, ordenar, total, paginas, pagina, tamano,
        desde: total ? inicio + 1 : 0,
        hasta: Math.min(inicio + tamano, total),
        filas: ordenadas.slice(inicio, inicio + tamano),
        setPagina: (siguiente) => setSeleccion({ criterio, pagina: siguiente, tamano }),
        setTamano: (siguiente) => setSeleccion({ criterio, pagina: 1, tamano: siguiente }),
    };
}

export function nombreRequerido(datos, registros, id) {
    const nombre = datos.get("nombre").trim();
    if (!nombre) throw new Error("Ingresa un nombre.");
    if (registros?.find((registro) => registro.id === id)?.nombre !== nombre && registros?.some((registro) => registro.id !== id &&
        registro.nombre.localeCompare(nombre, "es", { sensitivity: "base" }) === 0)) {
        throw new Error("Ya existe un registro con ese nombre.");
    }
    return nombre;
}

export function esAdministrador(rol) {
    return ["ADMIN", "ADMINISTRADOR", "ADMINISTRACION", "SUPERADMIN"].includes(rol?.trim().toUpperCase());
}
