import React from "react";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  error?: string;
};

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  required,
  error,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-3 py-2 bg-white transition
        focus:ring-2 focus:ring-orange-200
        ${error ? "border-red-400 focus:ring-red-200" : "border-gray-300"}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
