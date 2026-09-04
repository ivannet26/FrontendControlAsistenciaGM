import { useState, useEffect, useRef } from "react";
import {
    Sidebar as ProSidebar,
    Menu,
    SubMenu,
    MenuItem,
} from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";

import {
    Clock3,
    CalendarDays,
    CalendarCheck,
    LayoutDashboard,
    ChartNoAxesColumnIncreasing,
    FolderKanban,
    Users,
    Settings,
    ChevronsLeft,
    ChevronsRight,
    CircleUserRound,
    Tag,
    ChevronDown,
    ChevronUp,
    FileText,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ usuario }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mostrarMas, setMostrarMas] = useState(false);
    const [informesOpen, setInformesOpen] = useState(false);
    const rol = usuario?.rol;
    const navigate = useNavigate();
    const informesRef = useRef(null);
    useEffect(() => {

        const cerrarMenu = (e) => {

            if (
                informesRef.current &&
                !informesRef.current.contains(e.target)
            ) {

                setInformesOpen(false);

            }

        };


        document.addEventListener(
            "mousedown",
            cerrarMenu
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                cerrarMenu
            );

        };


    }, []);
    return (
        <div className="sidebar-container">

            <ProSidebar
                collapsed={collapsed}
                width="200px"
                collapsedWidth="60px"
                backgroundColor="#111c22"
                rootStyles={{
                    height: "100vh",
                    borderRight: "none",
                }}
            >


                <Menu
                    menuItemStyles={{
                        button: {
                            color: "#a9bcc7",
                            fontSize: "19px",
                            paddingLeft: "20px",

                            "&:hover": {
                                backgroundColor: "#24343d",
                                color: "#ffffff",
                            },
                        },
                    }}
                >

                    {/* MODULOS PARA TODOS */}
                    <MenuItem
                        icon={<Clock3 size={20} />}
                        onClick={() => navigate("/app/rastreador")}
                    >
                        RASTREADOR
                    </MenuItem>
                    {!collapsed && (
                        <div className="menu-section">
                            ANALIZAR
                        </div>
                    )}
                    <MenuItem
                        icon={<LayoutDashboard size={20} />}
                        onClick={() => navigate("/app/panel")}
                    >
                        PANEL
                    </MenuItem>

                    <MenuItem
                        icon={<ChartNoAxesColumnIncreasing size={19} />}
                        onClick={() => setInformesOpen(!informesOpen)}
                    >
                        INFORMES
                    </MenuItem>


                    {!collapsed && (
                        <div className="menu-section">
                            GESTIONAR
                        </div>
                    )}
                    <MenuItem
                        icon={<LayoutDashboard size={20} />}
                        onClick={() => navigate("/app/proyectos")}
                    >
                        PROYECTOS
                    </MenuItem>

                    <MenuItem icon={<Users size={20} />}>
                        EQUIPO
                    </MenuItem>

                    <MenuItem icon={<CircleUserRound size={20} />}>
                        CLIENTES
                    </MenuItem>
                    <MenuItem icon={<Tag size={20} />}>
                        ETIQUETAS
                    </MenuItem>

                    {/* SOLO ADMIN */}
                    {rol === "ADMINISTRADOR" && (
                        <>
                            <MenuItem
                                icon={
                                    mostrarMas
                                        ? <ChevronUp size={18} />
                                        : <ChevronDown size={18} />
                                }
                                onClick={() => setMostrarMas(!mostrarMas)}
                            >
                                {mostrarMas ? "MOSTRAR MENOS" : "MOSTRAR MÁS"}
                            </MenuItem>
                            {mostrarMas && (
                                <>
                                    {/*<MenuItem icon={<LayoutDashboard size={19} />}>
                                        QUIOSCOS
                                    </MenuItem>

                                    <MenuItem icon={<FolderKanban size={19} />}>
                                        PLAN
                                    </MenuItem>
                                    
                                    <MenuItem icon={<ChartNoAxesColumnIncreasing size={19} />}>
                                        GASTOS
                                    </MenuItem>

                                    <MenuItem icon={<Clock3 size={19} />}>
                                        BAJAS
                                    </MenuItem>

                                    <MenuItem icon={<ChartNoAxesColumnIncreasing size={19} />}>
                                        ACTIVIDAD
                                    </MenuItem>*/ }
                                    <MenuItem icon={<CalendarCheck size={19} />}>
                                        APROBACIONES
                                    </MenuItem>
                                    <MenuItem icon={<FileText size={19} />}>
                                        FACTURAS
                                    </MenuItem>
                                </>
                            )}
                        </>
                    )}

                </Menu>

                {/* BOTON PARA CONTRAER */}
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? (
                        <ChevronsRight size={16} />
                    ) : (
                        <ChevronsLeft size={16} />
                    )}
                </button>

            </ProSidebar>
            {informesOpen && (

                <div
                    className="informes-panel"
                    ref={informesRef}
                >

                    <div className="informes-title">
                        TIEMPO
                    </div>

                    <div className="informes-item active">
                        Resumido
                    </div>

                    <div className="informes-item">
                        Detallado
                    </div>

                    <div className="informes-item">
                        Semanal
                    </div>

                    <div className="informes-item">
                        Compartido
                    </div>


                    <div className="informes-title">
                        EQUIPO
                    </div>


                    <div className="informes-item">
                        Asistencia
                    </div>

                    <div className="informes-item">
                        Asignaciones
                    </div>


                    <div className="informes-title">
                        GASTO
                    </div>


                    <div className="informes-item">
                        Detallado
                    </div>


                </div>

            )}
        </div>
    );
}

export default Sidebar;