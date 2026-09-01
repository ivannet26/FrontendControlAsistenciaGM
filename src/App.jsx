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

        </Route>


      </Routes>

    </BrowserRouter>

  );

}


export default App;