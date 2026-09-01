import "./LayoutPrincipal.css";

import Navbar from "../Navbar/Navbar.jsx";
import Sidebar from "../Sidebar/Sidebar.jsx";

import { Outlet } from "react-router-dom";


function LayoutPrincipal() {


  const usuarioGuardado = sessionStorage.getItem("usuario");


  const usuario = usuarioGuardado

    ? JSON.parse(usuarioGuardado)

    : null;



  return (


    <div className="app-container">


      {/* NAVBAR */}

      <Navbar usuario={usuario} />



      {/* CONTENIDO DEBAJO */}

      <div className="app-body">


        <Sidebar usuario={usuario} />



        <main className="contenido-principal">


          <Outlet />


        </main>



      </div>



    </div>


  );


}


export default LayoutPrincipal;