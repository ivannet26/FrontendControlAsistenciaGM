function PanelPrincipal() {
  const usuarioGuardado = sessionStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  return (
    <div>
      <h1>Panel Principal</h1>

      {usuario ? (
        <>
          <p>Bienvenido, {usuario.nombre}</p>
          <p>Rol: {usuario.rol}</p>
        </>
      ) : (
        <p>No hay usuario autenticado.</p>
      )}
    </div>
  );
}

export default PanelPrincipal;