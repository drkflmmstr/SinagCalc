"use client";
import clsx from "clsx";

interface Props {
  options:  Record<string, string>;
  value:    string | null;
  onChange: (v: string) => void;
}

const ICONS: Record<string, string> = {
  below_1000:   "💡",
  "1000_to_2000": "💡",
  "2000_to_3500": "🔌",
  "3500_to_6000": "🔌",
  above_6000:   "⚡",
};

export default function BillStep({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(options).map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={clsx(
            "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
            value === key
              ? "border-grove bg-grove-light"
              : "border-gray-200 bg-cream hover:border-grove-mid hover:bg-grove-light"
          )}
        >
          <span className="text-xl">{ICONS[key] ?? "⚡"}</span>
          <span className={clsx("text-sm font-medium", value === key ? "text-grove" : "text-soil")}>
            {label}
          </span>
          {value === key && (
            <span className="ml-auto w-5 h-5 rounded-full bg-grove text-white text-xs grid place-items-center flex-shrink-0">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}
