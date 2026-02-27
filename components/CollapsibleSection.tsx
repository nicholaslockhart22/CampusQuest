"use client";

import { useState } from "react";

export function CollapsibleSection({
  title,
  defaultCollapsed = false,
  children,
  className = "",
}: {
  title: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between gap-2 py-2 text-left font-semibold text-white hover:text-uri-keaney transition-colors rounded-lg -mx-1 px-1"
        aria-expanded={!collapsed}
      >
        <span>{title}</span>
        <span className="text-uri-keaney/80 text-lg shrink-0" aria-hidden>
          {collapsed ? "▶" : "▼"}
        </span>
      </button>
      {!collapsed && <div className="mt-1">{children}</div>}
    </section>
  );
}
