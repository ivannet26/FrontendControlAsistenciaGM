import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Edit2 } from "lucide-react"; // Agregamos Edit2 para el botón
import toast from "react-hot-toast";
import { actualizarPerfil, cambiarPassword } from "../../services/perfilService";
import "./ModalPerfil.css";

function ModalPerfil({ usuario, onCerrar, onActualizado }) {

    const [editando, setEditando] = useState(false); // Nuevo estado

    const [form, setForm] = useState({
        nombre: usuario?.nombre || "",
        apellido: usuario?.apellido || "",
        dni: usuario?.dni || ""
    });

    const [cambiarPass, setCambiarPass] = useState(false);
    const [pass, setPass] = useState({ actual: "", nueva: "", confirmar: "" });
    const [guardando, setGuardando] = useState(false);

    // Cerrar con Escape
    useEffect(() => {
        const cerrarEsc = (e) => {
            if (e.key === "Escape") onCerrar();
        };
        document.addEventListener("keydown", cerrarEsc);
        return () => document.removeEventListener("keydown", cerrarEsc);
    }, [onCerrar]);

    const cambiarCampo = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const cambiarCampoPass = (campo, valor) => {
        setPass((prev) => ({ ...prev, [campo]: valor }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ── Validaciones ──────────────────────────────
        if (!form.nombre.trim() || !form.apellido.trim()) {
            toast.error("El nombre y el apellido son obligatorios.");
            return;
        }

        if (form.dni && !/^\d{8}$/.test(form.dni)) {
            toast.error("El DNI debe tener 8 dígitos.");
            return;
        }

        if (cambiarPass) {
            if (!pass.actual) {
                toast.error("Ingresa tu contraseña actual.");
                return;
            }
            if (pass.nueva.length < 6) {
                toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
                return;
            }
            if (pass.nueva !== pass.confirmar) {
                toast.error("Las contraseñas nuevas no coinciden.");
                return;
            }
        }

        // ── Guardar ───────────────────────────────────
        setGuardando(true);
        try {
            const actualizado = await actualizarPerfil({
                nombre: form.nombre.trim(),
                apellido: form.apellido.trim(),
                dni: form.dni || null
            });

            if (cambiarPass) {
                await cambiarPassword({
                    password_actual: pass.actual,
                    password_nueva: pass.nueva
                });
            }

            // Mantener la sesión guardada al día
            try {
                const guardado = JSON.parse(localStorage.getItem("usuario") || "{}");
                localStorage.setItem(
                    "usuario",
                    JSON.stringify({ ...guardado, ...actualizado })
                );
            } catch {
                /* si no hay usuario guardado, no pasa nada */
            }

            toast.success("Perfil actualizado correctamente.");
            if (onActualizado) onActualizado(actualizado);
            
            // Volver a la vista de solo lectura tras guardar
            setEditando(false); 
            setCambiarPass(false);
            setPass({ actual: "", nueva: "", confirmar: "" });

        } catch (error) {
            const detalle = error.response?.data?.detail;
            toast.error(
                typeof detalle === "string"
                    ? detalle
                    : "No se pudo actualizar el perfil."
            );
        } finally {
            setGuardando(false);
        }
    };

    // Iniciales para el avatar
    const iniciales = (
        (usuario?.nombre?.charAt(0) || "?") +
        (usuario?.apellido?.charAt(0) || "")
    ).toUpperCase();

    return createPortal(

        <div className="perfil-overlay">
            <div className="perfil-modal">

                <div className="perfil-header">
                    <h2>Mi perfil</h2>
                    <button type="button" onClick={onCerrar} aria-label="Cerrar">
                        <X size={18} />
                    </button>
                </div>

                {/* CONDICIÓN: Si NO estamos editando, mostramos la vista de lectura */}
                {!editando ? (
                    <div className="perfil-body perfil-vista">
                        
                        <div className="perfil-avatar-grande">
                            {iniciales}
                        </div>
                        
                        <h3 className="perfil-nombre-completo">
                            {usuario?.nombre} {usuario?.apellido}
                        </h3>
                        <span className="perfil-rol-tag">{usuario?.rol || "Usuario"}</span>

                        <div className="perfil-datos-lista">
                            <div className="perfil-dato">
                                <span className="perfil-label">DNI</span>
                                <span className="perfil-valor">{usuario?.dni || "No especificado"}</span>
                            </div>
                            <div className="perfil-dato">
                                <span className="perfil-label">Correo electrónico</span>
                                <span className="perfil-valor">{usuario?.email || "Sin email"}</span>
                            </div>
                        </div>

                        <div className="perfil-footer">
                            <button 
                                type="button" 
                                className="perfil-btn-guardar" 
                                onClick={() => setEditando(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Edit2 size={16} />
                                Editar perfil
                            </button>
                        </div>
                    </div>
                ) : (
                    /* SI ESTAMOS EDITANDO, mostramos el formulario original */
                    <form onSubmit={handleSubmit}>
                        <div className="perfil-body">
                            <div className="perfil-fila">
                                <div className="perfil-campo">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        value={form.nombre}
                                        onChange={(e) => cambiarCampo("nombre", e.target.value)}
                                    />
                                </div>
                                <div className="perfil-campo">
                                    <label>Apellido</label>
                                    <input
                                        type="text"
                                        value={form.apellido}
                                        onChange={(e) => cambiarCampo("apellido", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="perfil-campo">
                                <label>
                                    DNI <span className="perfil-opcional">(opcional)</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={8}
                                    placeholder="Ingresa tu DNI"
                                    value={form.dni}
                                    onChange={(e) =>
                                        cambiarCampo("dni", e.target.value.replace(/\D/g, ""))
                                    }
                                />
                            </div>

                            <div className="perfil-campo">
                                <label>Correo electrónico</label>
                                <input
                                    type="email"
                                    value={usuario?.email || ""}
                                    disabled
                                />
                            </div>

                            {/* ── CAMBIAR CONTRASEÑA ── */}
                            <div className="perfil-pass-bloque">
                                <button
                                    type="button"
                                    className="perfil-pass-toggle"
                                    onClick={() => setCambiarPass(!cambiarPass)}
                                >
                                    {cambiarPass ? "− Cancelar cambio de contraseña" : "+ Cambiar contraseña"}
                                </button>

                                {cambiarPass && (
                                    <div className="perfil-pass-campos">
                                        <div className="perfil-campo">
                                            <label>Contraseña actual</label>
                                            <input
                                                type="password"
                                                autoComplete="current-password"
                                                value={pass.actual}
                                                onChange={(e) => cambiarCampoPass("actual", e.target.value)}
                                            />
                                        </div>
                                        <div className="perfil-campo">
                                            <label>Nueva contraseña</label>
                                            <input
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="Mínimo 6 caracteres"
                                                value={pass.nueva}
                                                onChange={(e) => cambiarCampoPass("nueva", e.target.value)}
                                            />
                                        </div>
                                        <div className="perfil-campo">
                                            <label>Confirmar nueva contraseña</label>
                                            <input
                                                type="password"
                                                autoComplete="new-password"
                                                value={pass.confirmar}
                                                onChange={(e) => cambiarCampoPass("confirmar", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="perfil-footer">
                            <button
                                type="button"
                                className="perfil-btn-cancelar"
                                onClick={() => setEditando(false)} // Vuelve a la vista de lectura
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="perfil-btn-guardar"
                                disabled={guardando}
                            >
                                {guardando ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>,

        document.body
    );
}

export default ModalPerfil;