import DialogoCatalogo from "../Catalogo/DialogoCatalogo";

export default function ModalMiembro({ miembro, miembros, grupos, cerrar, guardar }) {
    const gruposListos = !grupos.error && !grupos.cargando;
    return <DialogoCatalogo titulo={miembro.id ? "Editar miembro" : "Nuevo miembro"} cerrar={cerrar}
        guardar={(datos) => {
            const email = datos.get("email")?.trim().toLowerCase();
            if (!miembro.id && (!email || miembros.some((m) => m.email_usuario.toLowerCase() === email))) {
                throw new Error(email ? "Ese usuario ya es miembro del equipo." : "Ingresa el correo del usuario.");
            }
            const rol = datos.get("tipo_usuario");
            const estado = datos.get("estado");
            const grupo = Number(datos.get("grupo")) || null;
            const clave = datos.get("clave_temp").trim();
            const cuerpo = miembro.id ? {} : { email };
            if (gruposListos && (!miembro.id || grupo !== miembro.grupo_id)) cuerpo.grupo_id = grupo;
            if (!miembro.id || rol !== miembro.tipo_usuario) cuerpo.tipo_usuario = rol;
            if (!miembro.id || estado !== miembro.estado) cuerpo.estado = estado;
            if (clave) cuerpo.clave_temp = clave;
            return guardar(cuerpo);
        }}>
        {miembro.id ? <>
            <p><strong>{miembro.nombre_usuario}</strong><br />{miembro.email_usuario}</p>
            {typeof miembro.cuenta_activa === "boolean" &&
                <p>Cuenta de usuario {miembro.cuenta_activa ? "habilitada" : "deshabilitada"}</p>}
        </> : <label>Correo del usuario registrado<input name="email" type="email" required /></label>}
        <label>Rol de equipo
            <select name="tipo_usuario" aria-label="Rol de equipo" defaultValue={miembro.tipo_usuario || "MIEMBRO"}>
                {miembro.tipo_usuario && !["ADMINISTRACION", "MIEMBRO"].includes(miembro.tipo_usuario) && <option>{miembro.tipo_usuario}</option>}
                <option value="MIEMBRO">Miembro</option><option value="ADMINISTRACION">Administración</option>
            </select>
        </label>
        <label>Equipo
            <select name="grupo" aria-label="Equipo" defaultValue={miembro.grupo_id ?? ""} disabled={!gruposListos}>
                <option value="">Sin equipo</option>
                {grupos.datos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                {!gruposListos && miembro.grupo_id && <option value={miembro.grupo_id}>{miembro.nombre_grupo}</option>}
            </select>
        </label>
        {grupos.error && <button type="button" className="catalogo-boton" onClick={grupos.recargar}>Recargar equipos</button>}
        <label>Estado en el equipo
            <select name="estado" aria-label="Estado en el equipo" defaultValue={miembro.estado || "ACTIVO"}>
                <option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option><option value="INVITADO">Invitado</option>
            </select>
        </label>
        <p>El estado en el equipo se gestiona por separado del acceso a la cuenta.</p>
        <label>Clave temporal opcional<input name="clave_temp" type="password" autoComplete="new-password" maxLength={255} /></label>
    </DialogoCatalogo>;
}
