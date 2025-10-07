import React from "react";

export default function FieldRow({ label, suffix = "", value, onChange, type = "number", min = 0, step = "any" }) {
  return (
    <label className="grid grid-cols-[1fr_auto_auto] gap-3 items-center mb-2">
      <span className="text-gray-700">{label}</span>
      <input
        className="px-3 py-2 border border-gray-300 rounded-lg text-right w-40"
        type={type}
        min={type === "number" ? min : undefined}
        step={type === "number" ? step : undefined}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      />
      <span className="text-gray-500 w-16">{suffix}</span>
    </label>
  );
}
