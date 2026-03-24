"use client";
import clsx from "clsx";
import type { QualityTierInfo } from "@/lib/types";

interface Props {
  options:  Record<string, QualityTierInfo>;
  value:    string | null;
  onChange: (v: string) => void;
}

const ICONS: Record<string, string> = {
  basic:    "🌱",
  standard: "⭐",
  premium:  "💎",
};

export default function QualityStep({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(options).map(([key, info]) => (
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
          <span className="text-2xl flex-shrink-0">{ICONS[key] ?? "🔧"}</span>
          <div className="flex-1 min-w-0">
            <p className={clsx("text-sm font-semibold", value === key ? "text-grove" : "text-soil")}>
              {info.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{info.description}</p>
          </div>
          {value === key && (
            <span className="w-5 h-5 rounded-full bg-grove text-white text-xs grid place-items-center flex-shrink-0">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}
