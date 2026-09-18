import { useState, useEffect } from "react";
import {
    Sidebar as ProSidebar,
    Menu,
    MenuItem,
} from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";

import {
    Clock3,
    CalendarCheck,
    LayoutDashboard,
    ChartNoAxesColumnIncreasing,
    Users,
    ChevronsLeft,
    ChevronsRight,
    CircleUserRound,
    Tag,
    ChevronDown,
    ChevronUp,
    FileText,
} from "lucide-react";

import "./Sidebar.css";


// Hook para detectar el ancho de pantalla
function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return width;
}


// 
const estilosBase = {
    button: {
        backgroundColor: "transparent",
        color: "#a9bcc7",
        height: "32px",              // 
        paddingLeft: "18px",
        "&:hover": {
            backgroundColor: "#1a2a32",
            color: "#ffffff",
        },
    },
    icon: {
        color: "#a9bcc7",
    },
    label: {
        color: "inherit",
        fontSize: "11px",            // 
        letterSpacing: "0.5px",
    },
};

// 
const estilosActivo = {
    button: {
        backgroundColor: "#2a3a42",
        color: "#ffffff",
        height: "38px",
        paddingLeft: "18px",
        "&:hover": {
            backgroundColor: "#2a3a42",
            color: "#ffffff",
        },
    },
    icon: {
        color: "#ffffff",
    },
    label: {
        color: "#ffffff",
        fontSize: "11px",            // 
        letterSpacing: "0.5px",
    },
};


function Sidebar({ usuario }) {

    const width = useWindowWidth();
    const esTablet = width <= 1200 && width > 768;
    const esMovil = width <= 768;

    const [collapsed, setCollapsed] = useState(esTablet);
    const [mostrarMas, setMostrarMas] = useState(false);
    const [movilAbierto, setMovilAbierto] = useState(false);

    const rol = usuario?.rol;
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-colapsar en tablet
    useEffect(() => {
        if (esTablet) setCollapsed(true);
        else if (!esMovil) setCollapsed(false);
    }, [esTablet, esMovil]);


    // Detectar si una ruta está activa
    const esActivo = (ruta) => location.pathname === ruta;

    // Devuelve los estilos según si el item está activo
    const estilos = (ruta) => esActivo(ruta) ? estilosActivo : estilosBase;


    const irA = (ruta) => {
        navigate(ruta);
        if (esMovil) setMovilAbierto(false);
    };


    return (
        <div className={`sidebar-container ${esMovil && movilAbierto ? "sidebar-movil-abierto" : ""}`}>

            {/* Overlay móvil */}
            {esMovil && movilAbierto && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMovilAbierto(false)}
                />
            )}

            <ProSidebar
                collapsed={esMovil ? false : collapsed}
                width="180px"
                collapsedWidth="52px"
                backgroundColor="#111c22"
                rootStyles={{
                    height: "100vh",
                    borderRight: "none",
                    transition: "width 1.3s ease",
                }}
            >
                <Menu>

                    {/* RASTREADOR */}
                    <MenuItem
                        icon={<Clock3 size={22} />}              // 
                        onClick={() => irA("/app/rastreador")}
                        menuItemStyles={estilos("/app/rastreador")}
                    >
                        RASTREADOR
                    </MenuItem>

                    {!collapsed && !esMovil && (
                        <div className="menu-section">ANALIZAR</div>
                    )}
                    {esMovil && (
                        <div className="menu-section">ANALIZAR</div>
                    )}

                    {/* PANEL */}
                    <MenuItem
                        icon={<LayoutDashboard size={22} />}     // 
                        onClick={() => irA("/app/panel")}
                        menuItemStyles={estilos("/app/panel")}
                    >
                        PANEL
                    </MenuItem>

                    {/* INFORMES */}
                    <MenuItem
                        icon={<ChartNoAxesColumnIncreasing size={22} />}   // 
                        onClick={() => irA("/app/informes")}
                        menuItemStyles={estilos("/app/informes")}
                    >
                        INFORMES
                    </MenuItem>

                    {!collapsed && !esMovil && (
                        <div className="menu-section">GESTIONAR</div>
                    )}
                    {esMovil && (
                        <div className="menu-section">GESTIONAR</div>
                    )}

                    {/* PROYECTOS */}
                    <MenuItem
                        icon={<LayoutDashboard size={22} />}     // 
                        onClick={() => irA("/app/proyectos")}
                        menuItemStyles={estilos("/app/proyectos")}
                    >
                        PROYECTOS
                    </MenuItem>

                    {/* EQUIPO */}
                    <MenuItem
                        icon={<Users size={22} />}               // 
                        onClick={() => irA("/app/equipo")}
                        menuItemStyles={estilos("/app/equipo")}
                    >
                        EQUIPO
                    </MenuItem>

                    {/* CLIENTES */}
                    <MenuItem
                        icon={<CircleUserRound size={22} />}     // 
                        onClick={() => irA("/app/clientes")}
                        menuItemStyles={estilos("/app/clientes")}
                    >
                        CLIENTES
                    </MenuItem>

                    {/* ETIQUETAS */}
                    <MenuItem
                        icon={<Tag size={22} />}                 // 
                        onClick={() => irA("/app/etiquetas")}
                        menuItemStyles={estilos("/app/etiquetas")}
                    >
                        ETIQUETAS
                    </MenuItem>


                    {/* SOLO ADMIN */}
                    {rol === "ADMINISTRADOR" && (
                        <>
                            <MenuItem
                                icon={
                                    mostrarMas
                                        ? <ChevronUp size={20} />     // 
                                        : <ChevronDown size={20} />   // 
                                }
                                onClick={() => setMostrarMas(!mostrarMas)}
                                menuItemStyles={estilosBase}
                            >
                                {mostrarMas ? "MOSTRAR MENOS" : "MOSTRAR MÁS"}
                            </MenuItem>
                            {mostrarMas && (
                                <>
                                    <MenuItem
                                        icon={<CalendarCheck size={20} />}    // 0
                                        menuItemStyles={estilosBase}
                                    >
                                        APROBACIONES
                                    </MenuItem>
                                    <MenuItem
                                        icon={<FileText size={20} />}         // 
                                        menuItemStyles={estilosBase}
                                    >
                                        FACTURAS
                                    </MenuItem>
                                </>
                            )}
                        </>
                    )}

                </Menu>

                {/* BOTÓN CONTRAER */}
                {!esMovil && (
                    <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
                    </button>
                )}
            </ProSidebar>

            {/* BOTÓN FLOTANTE MÓVIL */}
            {esMovil && (
                <button
                    className="sidebar-toggle-movil"
                    onClick={() => setMovilAbierto(!movilAbierto)}
                    aria-label="Abrir menú"
                >
                    {movilAbierto ? "‹‹" : "››"}
                </button>
            )}

        </div>
    );
}

export default Sidebar;