import style from "./Tabla.module.css";

const cn = (...names) => names.filter(Boolean).join(" ");

const keyOf = (row, index, rowKey) => {
  if (typeof rowKey === "function") return rowKey(row, index);
  return rowKey ? row?.[rowKey] : index;
};

const getAlign = (col) => col.align || col.posicion || "left";

function Tabla({
  columns = [],
  data = [],
  rowKey,
  loading = false,
  loadingText = "Cargando...",
  emptyText = "Sin registros",
  className = "",
  tableClassName = "",
  headClassName = "",
  rowClassName = "",
  variant = "table",
}) {
  const rows = Array.isArray(data) ? data : [];
  const state = loading ? loadingText : emptyText;
  const getRowClass = (row, index) =>
    cn(
      style.row,
      typeof rowClassName === "function"
        ? rowClassName(row, index)
        : rowClassName,
    );

  if (variant === "grid") {
    return (
      <div className={cn(style.grid, className)}>
        <div className={cn(style.gridHead, headClassName)}>
          {columns.map((col) => {
            const align = getAlign(col);
            return (
              <div
                key={col.key || col.header}
                className={cn(style.gridHeadCell, col.headClassName)}
                style={{ textAlign: align, ...col.headStyle }}
              >
                {col.header}
              </div>
            );
          })}
        </div>

        {loading || rows.length === 0 ? (
          <div className={style.state}>{state}</div>
        ) : (
          rows.map((row, index) => (
            <div
              key={keyOf(row, index, rowKey)}
              className={cn(
                style.gridRow,
                typeof rowClassName === "function"
                  ? rowClassName(row, index)
                  : rowClassName,
              )}
            >
              {columns.map((col) => {
                const align = getAlign(col);
                return (
                  <div
                    key={col.key || col.header}
                    className={col.className}
                    style={{ textAlign: align, ...col.style }}
                  >
                    {col.render ? col.render(row, index) : row?.[col.key]}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className={cn(style.wrapper, className)}>
      <table className={cn(style.table, tableClassName)}>
        <thead className={cn(style.head, headClassName)}>
          <tr>
            {columns.map((col) => {
              const align = getAlign(col);
              return (
                <th
                  key={col.key || col.header}
                  className={cn(style.headCell, col.headClassName)}
                  style={{ textAlign: align, ...col.headStyle }}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading || rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length || 1} className={style.state}>
                {state}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={keyOf(row, index, rowKey)}
                className={getRowClass(row, index)}
              >
                {columns.map((col) => {
                  const align = getAlign(col);
                  return (
                    <td
                      key={col.key || col.header}
                      className={cn(style.cell, col.className)}
                      style={{ textAlign: align, ...col.style }}
                    >
                      {col.render ? col.render(row, index) : row?.[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Tabla;
