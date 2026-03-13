"use client";

import { useState } from "react";

export default function PasswordField({
  value,
  onChange,
  placeholder,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  name: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-lg hover:bg-gray-100"
        aria-label="Toggle password visibility"
        title="Show/Hide"
      >
        👁
      </button>
    </div>
  );
}