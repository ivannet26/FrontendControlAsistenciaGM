import { useCallback, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { coincide } from "../../Catalogo/estadoCatalogo";
import PanelFlotante from "../../PanelFlotante/PanelFlotante";
import "./EncargadosPopover.css";

const nombre = (m) => m.nombre_usuario || [m.nombre, m.apellido].filter(Boolean).join(" ");

export default function EncargadosPopover({ tareaId, miembrosAsignados = [], todosLosMiembros, ocupado,
    deshabilitado, onAsignar, onDesasignar }) {
    const [ancla, setAncla] = useState(null);
    const [busqueda, buscar] = useState("");
    const cerrar = useCallback(() => setAncla(null), []);
    const asignados = new Set(miembrosAsignados.map((m) => m.id));
    const miembros = todosLosMiembros.filter((m) => coincide(nombre(m), busqueda) || coincide(m.email_usuario, busqueda));
    const texto = miembrosAsignados.length ? miembrosAsignados.map(nombre).join(", ") : "Sin asignar";

    return <>
        <button type="button" className="catalogo-boton encargados-btn" disabled={deshabilitado} aria-expanded={Boolean(ancla)}
            aria-label={"Encargados: " + texto} onClick={(e) => setAncla(ancla ? null : { elemento: e.currentTarget, teclado: e.detail === 0 })}>
            <span>{texto}</span><ChevronDown size={14} aria-hidden="true" />
        </button>
        {ancla && <PanelFlotante ancla={ancla.elemento} cerrar={cerrar} className="encargados-popover"
            alinearInicio reubicarAlDesplazar enfocarPrimerControl={ancla.teclado}>
            <label className="encargados-buscador">
                <Search size={16} aria-hidden="true" />
                <input type="search" aria-label="Buscar encargados" placeholder="Buscar encargados"
                    value={busqueda} onChange={(e) => buscar(e.target.value)} />
            </label>
            <div className="encargados-lista">
                {miembros.map((m) => <label key={m.id} className="encargados-item">
                    <input type="checkbox" checked={asignados.has(m.id)} disabled={ocupado} onChange={(event) => {
                        const actuar = event.target.checked ? onAsignar : onDesasignar;
                        actuar(tareaId, m.id);
                    }} />
                    <span>{nombre(m)}</span>
                </label>)}
                {!miembros.length && <p className="encargados-vacio">No se encontraron miembros.</p>}
            </div>
        </PanelFlotante>}
    </>;
}
