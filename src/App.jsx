import React from "react";

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
import Equipo from "./pages/Equipo/Equipo.jsx";
import Clientes from "./pages/Clientes/Clientes.jsx";
import Etiquetas from "./pages/Etiquetas/Etiquetas.jsx";
function App() {

  return (

    <BrowserRouter>

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


        {/* LAYOUT PRINCIPAL */}

        <Route
          path="/app"
          element={<LayoutPrincipal />}
        >

          <Route
            path="rastreador"
            element={<Rastreador />}
          />
          
          <Route
            path="panel"
            element={<Panel />}
          />
          
          <Route
            path="proyectos"
            element={<Proyectos />}
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
      

      </Routes>

    </BrowserRouter>

  );

}


export default App;