import React from "react";
import Login from "./pages/Login/Login.jsx";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import LayoutPrincipal from "./components/LayoutPrincipal/LayoutPrincipal.jsx";

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
          path="/app"
          element={<LayoutPrincipal />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;