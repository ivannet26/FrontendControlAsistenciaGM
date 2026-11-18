import { ChevronDown } from "lucide-react";

const Select = ({ className = "", children, ...props }) => {
  return (
    <div className={`relative ${className}`}>
      <select
        className="h-9 w-full appearance-none border border-gm-800 bg-gm-900 px-3 pr-8 text-sm text-gm-100 outline-none"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gm-500"
      />
    </div>
  );
};

export default Select;
