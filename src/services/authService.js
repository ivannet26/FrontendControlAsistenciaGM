const API_URL = import.meta.env.VITE_API_URL;


export async function login(email, password) {

  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );


  const data = await response.json();


  if (!response.ok) {
    throw new Error(
      data.detail || "Email o contraseña incorrectos"
    );
  }


  // ✅ Guardar token y usuario en localStorage
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));


  return data;
}



export async function register(datosUsuario) {

  const response = await fetch(
    `${API_URL}/auth/registro`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosUsuario),
    }
  );


  const data = await response.json();


  if (!response.ok) {
    throw new Error(
      data.detail || "Error al registrar usuario"
    );
  }


  return data;
}



// ✅ NUEVO: función para cerrar sesión
export function logout() {

  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

}