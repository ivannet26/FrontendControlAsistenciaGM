const API_URL = import.meta.env.VITE_API_URL;

export async function login(usuario, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      usuario,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Usuario o contraseña incorrectos.");
  }

  return data;
}

export async function register(datosUsuario) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(datosUsuario),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al registrar usuario.");
  }

  return data;
}
