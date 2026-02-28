"use client";

export function RamMarkFilter({
  selected,
  onSelect,
  options,
}: {
  selected: string | null;
  onSelect: (tag: string | null) => void;
  options: string[];
}) {
  if (options.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-xl border border-white/15 bg-white/5 p-1.5 shadow-inner"
      role="group"
      aria-label="Filter by tag"
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
          selected === null
            ? "bg-uri-keaney/25 text-uri-keaney border border-uri-keaney/40 shadow-sm"
            : "text-white/85 hover:bg-white/10 hover:text-white border border-transparent"
        }`}
      >
        All
      </button>
      {options.slice(0, 12).map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(selected === tag ? null : tag)}
          className={`ram-mark text-xs ${selected === tag ? "ring-2 ring-uri-keaney/60 ring-offset-1 ring-offset-[#041E42]" : ""}`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
