import React, { useState } from "react";

export default function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl shadow-md bg-white mb-4 border border-gray-100">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-3 bg-purple-50 font-semibold text-purple-700 rounded-t-2xl"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-xl leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}
