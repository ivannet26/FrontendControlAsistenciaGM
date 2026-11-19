function celdaCSV(dato) {
    const texto = String(dato ?? "");
    // Evita que una planilla interprete nombres o direcciones como fórmulas.
    const plano = /^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(texto) ? "'" + texto : texto;
    return '"' + plano.replaceAll('"', '""') + '"';
}

export function exportarClientes(clientes) {
    const filas = [
        ["Nombre", "Dirección", "Moneda", "Estado"],
        ...clientes.map((c) => [c.nombre, c.direccion, c.moneda, c.archivado ? "Archivado" : "Activo"]),
    ];
    const csv = filas.map((fila) => fila.map(celdaCSV).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "clientes.csv";
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
