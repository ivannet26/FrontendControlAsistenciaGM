import { Trash2, X } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const ModalUsuario = ({
  abierto,
  usuarioEditando,
  formData,
  setCampo,
  onCerrar,
  onGuardar,
  onEliminar,
}) => {
  if (!abierto) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-md border border-gm-700 bg-gm-900"
        role="dialog"
        aria-modal="true"
        aria-label={usuarioEditando ? "Editar usuario" : "Nuevo usuario"}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gm-800 p-4">
          <h2 className="m-0 text-lg font-semibold text-white">
            {usuarioEditando ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center text-gm-400 hover:text-white"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>
        <form onSubmit={onGuardar}>
          <div className="flex flex-col gap-3 p-4">
            <label className="flex flex-col gap-1 text-sm text-gm-300">
              Nombre
              <Input
                className="w-full"
                required
                value={formData.nombre}
                onChange={setCampo("nombre")}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gm-300">
              Apellido
              <Input
                className="w-full"
                required
                value={formData.apellido}
                onChange={setCampo("apellido")}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gm-300">
              Correo electrónico
              <Input
                className="w-full"
                type="email"
                required
                value={formData.email}
                onChange={setCampo("email")}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gm-300">
              {usuarioEditando ? "Nueva contraseña (opcional)" : "Contraseña"}
              <Input
                className="w-full"
                type="password"
                required={!usuarioEditando}
                value={formData.password}
                onChange={setCampo("password")}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gm-300">
              Rol
              <Select value={formData.rol} onChange={setCampo("rol")}>
                <option value="PRACTICANTE">Practicante</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </Select>
            </label>
            {usuarioEditando && (
              <label className="flex items-center gap-2 text-sm text-gm-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-sky-500"
                  checked={formData.activo}
                  onChange={setCampo("activo")}
                />
                Usuario activo
              </label>
            )}
          </div>
          <footer className="flex items-center justify-between gap-2 border-t border-gm-800 p-4">
            {usuarioEditando ? (
              <Button
                variant="danger"
                type="button"
                onClick={() => onEliminar(usuarioEditando)}
              >
                <Trash2 size={14} />
                Eliminar
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="secondary" type="button" onClick={onCerrar}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;
