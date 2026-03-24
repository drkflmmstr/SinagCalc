"use client";
import clsx from "clsx";

interface Props {
  options:  Record<string, string>;
  value:    string | null;
  onChange: (v: string) => void;
}

const ICONS: Record<string, string> = {
  small:  "🏠",
  medium: "🏡",
  large:  "🏘️",
  xlarge: "🏗️",
};

export default function RoofStep({ options, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
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
          <span className="text-2xl">{ICONS[key]}</span>
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
