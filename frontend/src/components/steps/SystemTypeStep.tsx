"use client";
// components/steps/SystemTypeStep.tsx
// Lets the user choose between grid-tied and hybrid (battery) systems.
// Two large cards — one per option — with clear descriptions of the
// practical difference and the cost/benefit tradeoff.

import clsx from "clsx";
import type { SystemType } from "@/lib/types";

interface Props {
  value:    SystemType;
  onChange: (v: SystemType) => void;
}

const OPTIONS: {
  value:       SystemType;
  icon:        string;
  label:       string;
  tagline:     string;
  bullets:     string[];
  badge:       string;
  badgeColor:  string;
}[] = [
  {
    value:   "grid_tied",
    icon:    "⚡",
    label:   "Grid-Tied",
    tagline: "Solar + grid backup, export surplus",
    bullets: [
      "~40% of generation used directly (daytime)",
      "Surplus exported to grid at ₱7.86/kWh credit",
      "Grid covers your night-time usage",
      "Lower upfront cost",
      "₱300 minimum monthly connection fee applies",
    ],
    badge:      "Most Popular",
    badgeColor: "bg-grove text-white",
  },
  {
    value:   "hybrid",
    icon:    "🔋",
    label:   "Hybrid + Battery",
    tagline: "Solar + battery storage, near energy independence",
    bullets: [
      "~90% of generation self-consumed (day + night)",
      "Battery sized at 2× your system kWp",
      "Only minimal surplus exported",
      "Higher upfront cost — shorter grid dependency",
      "₱200 minimum monthly utility fee applies",
    ],
    badge:      "Best Savings",
    badgeColor: "bg-violet-600 text-white",
  },
];

export default function SystemTypeStep({ value, onChange }: Props) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "relative text-left p-4 rounded-2xl border-2 transition-all",
              active
                ? "border-grove bg-grove-light shadow-md"
                : "border-gray-200 bg-cream hover:border-grove-mid hover:bg-grove-light"
            )}
          >
            {/* Badge */}
            <span className={clsx(
              "absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full",
              opt.badgeColor
            )}>
              {opt.badge}
            </span>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3 pr-20">
              <span className="text-2xl">{opt.icon}</span>
              <div>
                <p className={clsx(
                  "text-sm font-bold leading-tight",
                  active ? "text-grove" : "text-soil"
                )}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.tagline}</p>
              </div>
            </div>

            {/* Bullet list */}
            <ul className="space-y-1.5">
              {opt.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={clsx(
                    "mt-0.5 flex-shrink-0 text-xs",
                    active ? "text-grove" : "text-gray-400"
                  )}>
                    {active ? "✓" : "·"}
                  </span>
                  <span className="text-xs text-gray-600 leading-snug">{b}</span>
                </li>
              ))}
            </ul>

            {/* Active indicator */}
            {active && (
              <div className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-grove
                              grid place-items-center text-white text-xs font-bold">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
