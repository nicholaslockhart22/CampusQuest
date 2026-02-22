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
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs text-white/50">Filter:</span>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${selected === null ? "bg-uri-keaney text-uri-navy font-medium" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
      >
        All
      </button>
      {options.slice(0, 12).map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(selected === tag ? null : tag)}
          className={`ram-mark text-xs ${selected === tag ? "ring-2 ring-uri-keaney ring-offset-1 ring-offset-uri-navy" : ""}`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
