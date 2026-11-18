const styles = {
  primary: "bg-sky-500 text-white hover:bg-sky-600",
  secondary:
    "border border-gm-700 bg-transparent text-gm-300 hover:border-sky-500 hover:text-sky-500",
  danger:
    "border border-gm-700 bg-transparent text-gm-300 hover:border-red-500 hover:text-red-500",
  ghost: "bg-transparent text-gm-300 hover:text-white",
};

const Button = ({
  variant = "secondary",
  type = "button",
  className = "",
  children,
  ...props
}) => {
  const base =
    "inline-flex h-9 cursor-pointer items-center justify-center gap-2 px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <button
      type={type}
      className={`${base} ${styles[variant] || styles.secondary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
