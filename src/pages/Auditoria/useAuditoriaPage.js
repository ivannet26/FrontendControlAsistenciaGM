import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAuditoria,
  getResumenAuditoria,
} from "../../services/auditoriaService";
import { getUsuarios } from "../../services/usuariosService";

const FILTROS_VACIOS = {
  usuario_id: "",
  accion: "",
  entidad: "",
  fecha_inicio: "",
  fecha_fin: "",
  buscar: "",
};

const POR_PAGINA = 10;

export const useAuditoriaPage = () => {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [filtrosConsulta, setFiltrosConsulta] = useState(FILTROS_VACIOS);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setFiltrosConsulta(filtros), 350);
    return () => clearTimeout(t);
  }, [filtros]);

  const registrosQuery = useQuery({
    queryKey: ["auditoria", "registros", filtrosConsulta],
    queryFn: () => getAuditoria(filtrosConsulta),
    placeholderData: keepPreviousData,
  });
  const usuariosQuery = useQuery({
    queryKey: ["usuarios", "lista"],
    queryFn: () => getUsuarios(),
  });
  const resumenQuery = useQuery({
    queryKey: ["auditoria", "resumen", 30],
    queryFn: () => getResumenAuditoria(30),
  });

  const cambiarFiltro = (campo) => (e) => {
    setFiltros((f) => ({ ...f, [campo]: e.target.value }));
    setPagina(1);
  };
  const limpiar = () => {
    setFiltros(FILTROS_VACIOS);
    setPagina(1);
  };
  const filtrosActivos = Object.values(filtros).some(Boolean);

  const registros = registrosQuery.data ?? [];
  const totalPaginas = Math.max(1, Math.ceil(registros.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = registros.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  return {
    filtros,
    registros: registrosPagina,
    paginaActual,
    totalPaginas,
    setPagina,
    usuarios: usuariosQuery.data ?? [],
    resumen: resumenQuery.data ?? null,
    cargando: registrosQuery.isPending,
    cambiarFiltro,
    limpiar,
    filtrosActivos,
  };
};
