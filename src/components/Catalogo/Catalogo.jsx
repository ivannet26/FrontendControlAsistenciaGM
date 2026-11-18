import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, MoreVertical, Pencil, Search } from "lucide-react";
import PanelFlotante from "../PanelFlotante/PanelFlotante";
import { textoAusente } from "./estadoCatalogo";
import "./Catalogo.css";

export function Encabezado({ titulo, referenciaTitulo, volver, detalle, children }) {
    return <header className="catalogo-encabezado">
        <div className="catalogo-contexto">
            {volver && <Link className="catalogo-boton catalogo-regresar" to={volver.destino}>
                <ArrowLeft size={16} aria-hidden="true" />{volver.texto}
            </Link>}
            <h1 ref={referenciaTitulo} tabIndex={referenciaTitulo ? -1 : undefined}>{titulo}</h1>
            {detalle && <div className="catalogo-metadata">{detalle}</div>}
        </div>
        {children && <div className="catalogo-acciones-encabezado">{children}</div>}
    </header>;
}

export function Herramientas({ busqueda, buscar, placeholder, limpiar, activo, limpiarJuntoBusqueda = false, children }) {
    const botonLimpiar = <button type="button" className="catalogo-boton" onClick={limpiar} disabled={!activo}>Limpiar</button>;
    return (
        <div className="catalogo-herramientas">
            <label className="catalogo-busqueda">
                <Search size={17} aria-hidden="true" />
                <input type="search" aria-label={placeholder} placeholder={placeholder} value={busqueda}
                    onChange={(event) => buscar(event.target.value)} />
            </label>
            {limpiarJuntoBusqueda && botonLimpiar}
            {children}
            {!limpiarJuntoBusqueda && botonLimpiar}
        </div>
    );
}

export function EstadoListado({ cargando, error, recargar, vacio }) {
    if (cargando) return <p className="catalogo-aviso" role="status">Cargando…</p>;
    if (error) return (
        <div className="catalogo-aviso" role="alert">
            <p>{textoAusente(error, "No se pudo cargar el listado.")}</p>
            <button type="button" className="catalogo-boton" onClick={recargar}>Reintentar</button>
        </div>
    );
    return <p className="catalogo-aviso" role="status">{vacio}</p>;
}

function PieListado({ datos, nombre }) {
    const { total, desde, hasta, pagina, paginas, tamano, setTamano, setPagina } = datos;

    return (
        <footer className="catalogo-pie">
            <span role="status">{total ? `${desde}–${hasta} de ${total}` : "0 resultados"}</span>
            <label>
                Por página
                <select value={tamano} onChange={(event) => setTamano(Number(event.target.value))}>
                    {[10, 25, 50].map((cantidad) => <option key={cantidad}>{cantidad}</option>)}
                </select>
            </label>
            <nav aria-label={`Paginación de ${nombre}`}>
                <button type="button" className="catalogo-boton" aria-label="Página anterior" disabled={pagina === 1}
                    onClick={() => setPagina(pagina - 1)}><ChevronLeft size={18} aria-hidden="true" /></button>
                <span>Página {pagina} de {paginas}</span>
                <button type="button" className="catalogo-boton" aria-label="Página siguiente" disabled={pagina === paginas}
                    onClick={() => setPagina(pagina + 1)}><ChevronRight size={18} aria-hidden="true" /></button>
            </nav>
        </footer>
    );
}

export function OrdenListado({ datos, opciones, nombre, className }) {
    const valor = datos.orden.id + (datos.orden.descendente ? ":desc" : ":asc");
    return <select className={className} aria-label={nombre} value={valor} onChange={(event) => {
        const [id, direccion] = event.target.value.split(":");
        datos.ordenar(id, direccion === "desc");
    }}>
        {opciones.flatMap(({ id, asc, desc }) => [
            <option key={id + ":asc"} value={id + ":asc"}>{asc}</option>,
            <option key={id + ":desc"} value={id + ":desc"}>{desc}</option>,
        ])}
    </select>;
}

export function ListadoRegistros({ nombre, listado, datos, vacio, children }) {
    return <section className="catalogo-registros" aria-label={nombre}>
        {(listado.cargando || listado.error || !datos.total)
            ? <EstadoListado {...listado} vacio={vacio} />
            : children}
        {!listado.cargando && !listado.error && <PieListado datos={datos} nombre={nombre} />}
    </section>;
}

export function FilasCatalogo({ nombre, datos, columnas, ordenarPorCabecera = false }) {
    const pistas = columnas.map(({ ancho }) => ancho ?? "minmax(0, 1fr)").join(" ");
    return <div className="catalogo-filas" style={{ "--catalogo-columnas": pistas }}>
        <div className="catalogo-fila catalogo-cabecera" aria-label={"Columnas de " + nombre}>
            {columnas.map(({ id, titulo, ordenar }) => {
                const seleccionada = datos.orden.id === id;
                const Icono = seleccionada ? (datos.orden.descendente ? ArrowDown : ArrowUp) : ArrowUpDown;
                return <div key={id} className={id === "acciones" ? "catalogo-fila-acciones" : undefined}>
                    {ordenarPorCabecera && ordenar ?
                        <button type="button" onClick={() => datos.ordenar(id)}
                            aria-label={titulo + (seleccionada ? datos.orden.descendente ? ", descendente" : ", ascendente" : "")}>
                            {titulo}<Icono size={13} aria-hidden="true" />
                        </button> : titulo}
                </div>;
            })}
        </div>
        <ul className="catalogo-filas-lista" aria-label={nombre}>
            {datos.filas.map((fila) => <li className="catalogo-fila" key={fila.id}>
                {columnas.map(({ id, titulo, render, amplio }, indice) => {
                    const contenido = render ? render(fila) : fila[id];
                    const clase = id === "acciones" ? "catalogo-fila-acciones" : indice === 0
                        ? "catalogo-fila-identidad" : amplio ? "catalogo-dato catalogo-dato-amplio" : "catalogo-dato";
                    return <div className={contenido == null ? clase + " catalogo-dato-vacio" : clase} key={id}>
                        {indice > 0 && id !== "acciones" && <span className="catalogo-etiqueta">{titulo}</span>}
                        {contenido}
                    </div>;
                })}
            </li>)}
        </ul>
    </div>;
}

export function OrdenCompacto({ nombre, datos, columnas }) {
    const opciones = columnas.filter((columna) => columna.ordenar).map(({ id, titulo, orden }) => ({
        id,
        asc: orden?.asc ?? titulo + " A–Z",
        desc: orden?.desc ?? titulo + " Z–A",
    }));
    return <OrdenListado nombre={"Ordenar " + nombre.toLowerCase()} datos={datos} opciones={opciones}
        className="catalogo-orden-compacto" />;
}

export function AccionesFila({ nombre, editar, opciones = [], ocupado, reubicarAlDesplazar = true }) {
    const [menu, setMenu] = useState(null);
    const cerrarMenu = useCallback(() => setMenu(null), []);
    if (!editar && !opciones.length) return null;

    return (
        <div className="catalogo-acciones">
            {editar && <button type="button" className="catalogo-editar" aria-label={`Editar ${nombre}`}
                disabled={ocupado} onClick={editar}><Pencil size={16} aria-hidden="true" /></button>}
            {opciones.length > 0 && <>
                <button type="button" className="catalogo-mas" aria-label={`Acciones de ${nombre}`} aria-expanded={Boolean(menu)}
                    disabled={ocupado} onClick={(event) => setMenu(menu ? null : { ancla: event.currentTarget })}>
                    <MoreVertical size={18} aria-hidden="true" />
                </button>
                {menu && <PanelFlotante ancla={menu.ancla} cerrar={cerrarMenu} enfocarPrimerControl
                    reubicarAlDesplazar={reubicarAlDesplazar} className="catalogo-menu">
                    {opciones.map(({ texto, actuar }) => (
                        <button type="button" key={texto} onClick={() => { menu.ancla.focus({ preventScroll: true }); cerrarMenu(); actuar(); }}>{texto}</button>
                    ))}
                </PanelFlotante>}
            </>}
        </div>
    );
}
