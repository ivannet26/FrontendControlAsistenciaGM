import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

const Paginacion = ({ pagina, totalPaginas, onChange, label = "Paginación" }) => {
  if (totalPaginas <= 1) return null;
  return (
    <footer className="flex items-center justify-center gap-2" aria-label={label}>
      <Button
        variant="secondary"
        className="px-2"
        onClick={() => onChange(pagina - 1)}
        disabled={pagina <= 1}
        aria-label="Página anterior"
        title="Anterior"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </Button>
      <span className="px-2 text-sm text-gm-400">
        {pagina} / {totalPaginas}
      </span>
      <Button
        variant="secondary"
        className="px-2"
        onClick={() => onChange(pagina + 1)}
        disabled={pagina >= totalPaginas}
        aria-label="Página siguiente"
        title="Siguiente"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </footer>
  );
};

export default Paginacion;
