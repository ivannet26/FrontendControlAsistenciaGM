const Input = ({ icon, className = "", inputClassName = "", ...props }) => {
  if (icon) {
    return (
      <div
        className={`flex h-9 items-center gap-2 border border-gm-800 bg-gm-900 px-3 ${className}`}
      >
        <span className="flex items-center text-gm-500">{icon}</span>
        <input
          className={`h-full w-full border-0 bg-transparent p-0 text-sm text-gm-100 outline-none ${inputClassName}`}
          {...props}
        />
      </div>
    );
  }
  return (
    <input
      className={`h-9 border border-gm-800 bg-gm-900 px-3 text-sm text-gm-100 outline-none ${className} ${inputClassName}`}
      {...props}
    />
  );
};

export default Input;
