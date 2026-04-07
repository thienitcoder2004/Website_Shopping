import React from "react";

type InputProps = {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  error,
  className = "",
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-3 py-2 transition 
        focus:ring-2 focus:ring-orange-200
        ${error ? "border-red-400 focus:ring-red-200" : "border-gray-300"}
        ${className}`}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
