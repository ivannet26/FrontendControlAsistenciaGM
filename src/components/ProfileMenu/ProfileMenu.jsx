import "./ProfileMenu.css";
import {
    UserRound,
    Settings,
    Download,
    LogOut
} from "lucide-react";

import { useNavigate } from "react-router-dom";


function ProfileMenu({usuario}){

    const navigate = useNavigate();


    const cerrarSesion = ()=>{

        localStorage.removeItem("token");
        sessionStorage.removeItem("usuario");

        navigate("/login");

    };


    return(

        <div className="profile-menu">


            <div className="profile-header">


                <div className="avatar-big">
                    {usuario?.nombre?.charAt(0)}
                    {usuario?.apellido?.charAt(0)}
                </div>


               <div className="profile-name">
    {usuario?.nombre}
    {" "}
    {usuario?.apellido}
</div>


                <p>
                    {usuario?.email}
                </p>


            </div>



            <button className="account-btn">
                Gestiona la cuenta
            </button>



            <div className="profile-option">

                <UserRound size={20}/>

                Mi perfil

            </div>



            <div className="profile-option">

                <Settings size={20}/>

                Preferencias

            </div>



            <div className="profile-option">

                <Download size={20}/>

                Descargar aplicaciones

            </div>



            <div 
                className="profile-option logout"
                onClick={cerrarSesion}
            >

                <LogOut size={20}/>

                Cerrar sesión

            </div>


        </div>

    )

}


export default ProfileMenu;