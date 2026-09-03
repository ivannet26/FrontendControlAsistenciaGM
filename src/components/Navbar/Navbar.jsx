import "./Navbar.css";
import logoGM from "../../assets/logo-mg.png";
import { useState } from "react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
function Navbar({ usuario }) {


  const [profileOpen, setProfileOpen] = useState(false);



  return (

    <header className="navbar-principal">


      <div className="navbar-logo">

        <img
          src={logoGM}
          alt="GM Ingenieros y Consultores"
        />

      </div>



      <div className="navbar-info">


        <span>
          {usuario?.nombre}
        </span>



        <div className="profile-container">


          <button
            className="navbar-avatar"
            onClick={() => setProfileOpen(!profileOpen)}
          >

            {usuario?.nombre?.charAt(0)}
            {usuario?.apellido?.charAt(0)}

          </button>



          {
            profileOpen && (

              <ProfileMenu
                usuario={usuario}
              />

            )
          }



        </div>


      </div>


    </header>

  );

}


export default Navbar;