import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const FilterSelect = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="btn btn-sm btn-outline flex items-center gap-2 min-w-[120px] justify-between"
      >
        <span>{selected ? selected.label : label}</span>
        <ChevronDown size={16} />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-full bg-base-100 border rounded-xl shadow z-50">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value === value ? "" : option.value);
                setOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 hover:bg-base-200 cursor-pointer"
            >
              <span>{option.label}</span>

              {value === option.value && (
                <Check size={16} className="text-success" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;