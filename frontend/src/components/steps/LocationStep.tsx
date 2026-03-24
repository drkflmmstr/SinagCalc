"use client";
import clsx from "clsx";
import type { Options } from "@/lib/types";

interface Props {
  options:   Options;
  island:    string | null;
  zone:      string | null;
  onIsland:  (v: string) => void;
  onZone:    (v: string) => void;
}

const ISLAND_ICONS: Record<string, string> = {
  luzon:    "🌾",
  visayas:  "🌊",
  mindanao: "🌴",
};

export default function LocationStep({ options, island, zone, onIsland, onZone }: Props) {
  const zonesForIsland = island ? options.zones_by_island[island] : {};

  return (
    <div className="space-y-4">
      {/* Island group tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(options.island_groups).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onIsland(key)}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
              island === key
                ? "border-grove bg-grove text-white shadow-sm"
                : "border-gray-200 bg-cream text-gray-500 hover:border-grove-mid hover:text-grove"
            )}
          >
            <span>{ISLAND_ICONS[key]}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Zone grid */}
      {island && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-up">
          {Object.entries(zonesForIsland).map(([key, info]) => (
            <button
              key={key}
              onClick={() => onZone(key)}
              className={clsx(
                "text-left p-3.5 rounded-xl border-2 transition-all",
                zone === key
                  ? "border-grove bg-grove-light shadow-sm"
                  : "border-gray-200 bg-cream hover:border-grove-mid hover:bg-grove-light"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={clsx("text-sm font-semibold", zone === key ? "text-grove" : "text-soil")}>
                  {info.name}
                </span>
                {zone === key && (
                  <span className="w-5 h-5 rounded-full bg-grove text-white text-xs grid place-items-center">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-snug mb-2">{info.areas}</p>
              <span className={clsx(
                "inline-block text-xs font-semibold px-2 py-0.5 rounded-full",
                zone === key ? "bg-grove text-white" : "bg-grove-light text-grove"
              )}>
                ☀️ {info.peak_sun_hours} hrs/day
              </span>
            </button>
          ))}
        </div>
      )}

      {!island && (
        <p className="text-sm text-gray-400 italic">Select an island group above to see climate zones.</p>
      )}
    </div>
  );
}
