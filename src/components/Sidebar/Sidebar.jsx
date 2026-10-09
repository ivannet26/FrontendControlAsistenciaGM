import { useState, useEffect } from "react";
import {
    Sidebar as ProSidebar,
    Menu,
    MenuItem,
} from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";

import {
    Clock3,
    LayoutDashboard,
    ChartNoAxesColumnIncreasing,
    Users,
    ChevronsLeft,
    ChevronsRight,
    CircleUserRound,
    Tag,
    FileText,
    UserCog,
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

function Sidebar({ usuario }) {
    const width = useWindowWidth();
    const esTablet = width <= 1200 && width > 768;
    const esMovil = width <= 768;

    const [collapsed, setCollapsed] = useState(esTablet);
    const [movilAbierto, setMovilAbierto] = useState(false);

    const rol = usuario?.rol;
    const esAdmin = rol === "ADMINISTRADOR" || rol === "ADMINISTRACION";
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-colapsar en tablet
    useEffect(() => {
        if (esTablet) setCollapsed(true);
        else if (!esMovil) setCollapsed(false);
    }, [esTablet, esMovil]);

    // Detectar si una ruta está activa (soporta sub-rutas)
    const esActivo = (ruta) => location.pathname.startsWith(ruta);

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
                        icon={<Clock3 size={22} />}
                        onClick={() => irA("/app/rastreador")}
                        active={esActivo("/app/rastreador")}
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
                        icon={<LayoutDashboard size={22} />}
                        onClick={() => irA("/app/panel")}
                        active={esActivo("/app/panel")}
                    >
                        PANEL
                    </MenuItem>

                    {/* INFORMES */}
                    <MenuItem
                        icon={<ChartNoAxesColumnIncreasing size={22} />}
                        onClick={() => irA("/app/informes")}
                        active={esActivo("/app/informes")}
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
                        icon={<LayoutDashboard size={22} />}
                        onClick={() => irA("/app/proyectos")}
                        active={esActivo("/app/proyectos")}
                    >
                        PROYECTOS
                    </MenuItem>

                    {/* EQUIPO */}
                    <MenuItem
                        icon={<Users size={22} />}
                        onClick={() => irA("/app/equipo")}
                        active={esActivo("/app/equipo")}
                    >
                        EQUIPO
                    </MenuItem>

                    {/* CLIENTES */}
                    <MenuItem
                        icon={<CircleUserRound size={22} />}
                        onClick={() => irA("/app/clientes")}
                        active={esActivo("/app/clientes")}
                    >
                        CLIENTES
                    </MenuItem>

                    {/* ETIQUETAS */}
                    <MenuItem
                        icon={<Tag size={22} />}
                        onClick={() => irA("/app/etiquetas")}
                        active={esActivo("/app/etiquetas")}
                    >
                        ETIQUETAS
                    </MenuItem>

                    {/* GESTIÓN DE USUARIOS (SOLO ADMINISTRADORES) */}
                    {esAdmin && (
                        <MenuItem
                            icon={<UserCog size={22} />}
                            onClick={() => irA("/app/gestion-usuarios")}
                            active={esActivo("/app/gestion-usuarios")}
                        >
                            USUARIOS
                        </MenuItem>
                    )}

                    {esAdmin && (
                        <MenuItem
                            icon={<FileText size={22} />}
                            onClick={() => irA("/app/auditoria")}
                            active={esActivo("/app/auditoria")}
                        >
                            AUDITORÍA
                        </MenuItem>
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