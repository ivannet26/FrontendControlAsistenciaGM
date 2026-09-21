import React from "react";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login/Login.jsx";

import {
  BrowserRouter,
  Navigate,
  Routes,
  Route
} from "react-router-dom";

import LayoutPrincipal from "./components/LayoutPrincipal/LayoutPrincipal.jsx";

import Register from "./pages/Register/Register.jsx";

import Rastreador from "./pages/Rastreador/Rastreador.jsx";
import Panel from "./pages/Modulo-Panel/Panel.jsx";
import Proyectos from "./pages/Proyectos/Proyectos.jsx";
import DetalleProyecto from "./pages/Proyectos/DetalleProyecto/DetalleProyecto.jsx";
import Equipo from "./pages/Equipo/Equipo.jsx";
import Clientes from "./pages/Clientes/Clientes.jsx";
import Etiquetas from "./pages/Etiquetas/Etiquetas.jsx";
import InformesPage from "./pages/Informes/InformesPage.jsx";

function App() {

  return (

    <BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#162630",
            color: "#d3dde3",
            border: "1px solid #344650",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "4px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)"
          },
          success: {
            iconTheme: {
              primary: "#10a878",
              secondary: "#162630"
            }
          },
          error: {
            iconTheme: {
              primary: "#f56c6c",
              secondary: "#162630"
            }
          }
        }}
      />

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Register />}
        />

        <Route
          path="/app"
          element={<LayoutPrincipal />}
        >
          
          <Route
            index
            element={<Navigate to="/app/rastreador" replace />}
          />

          <Route
            path="rastreador"
            element={<Rastreador />}
          />

          <Route
            path="panel"
            element={<Panel />}
          />

          <Route
            path="informes"
            element={<InformesPage />}
          />

          <Route
            path="proyectos"
            element={<Proyectos />}
          />

          <Route
            path="proyectos/:id"
            element={<DetalleProyecto />}
          />

          <Route
            path="equipo"
            element={<Equipo />}
          />

          <Route
            path="clientes"
            element={<Clientes />}
          />

          <Route
            path="etiquetas"
            element={<Etiquetas />}
          />

        </Route>

        
        <Route
          path="*"
          element={<Navigate to="/app/rastreador" replace />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;