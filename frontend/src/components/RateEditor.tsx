"use client";
// RateEditor.tsx
// Lets the user pick their electricity distributor (which pre-fills the rate)
// and fine-tune the exact PHP/kWh value. This is the key new feature in v4.

import { useState } from "react";
import clsx from "clsx";
import type { Options } from "@/lib/types";

interface Props {
  options:             Options;
  rate:                number;
  onRateChange:        (r: number) => void;
  onDistributorChange: (key: string) => void;
}

export default function RateEditor({ options, rate, onRateChange, onDistributorChange }: Props) {
  const [selectedDist, setSelectedDist] = useState<string>("other");
  const [inputVal,     setInputVal]     = useState<string>(String(rate));

  const { min_php, max_php } = options.rate_config;

  function handleDistChange(key: string) {
    setSelectedDist(key);
    onDistributorChange(key);
    const newRate = options.distributors[key].default_rate_php;
    setInputVal(String(newRate));
  }

  function handleRateInput(val: string) {
    setInputVal(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= min_php && parsed <= max_php) {
      onRateChange(parsed);
    }
  }

  const isCustom = rate !== options.distributors[selectedDist]?.default_rate_php;

  return (
    <div className="rounded-2xl border-2 border-sun/40 bg-sun-light p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚡</span>
        <div>
          <h3 className="text-sm font-semibold text-soil">Your Electricity Rate</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            Select your distributor for a default rate, or type your exact rate from your bill.
          </p>
        </div>
      </div>

      {/* Distributor selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-soil mb-1.5">
          Distributor
        </label>
        <select
          value={selectedDist}
          onChange={(e) => handleDistChange(e.target.value)}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-soil
                     focus:outline-none focus:border-grove transition-colors"
        >
          {Object.entries(options.distributors).map(([key, dist]) => (
            <option key={key} value={key}>
              {dist.name} — ₱{dist.default_rate_php}/kWh
            </option>
          ))}
        </select>
      </div>

      {/* Rate input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-soil mb-1.5">
          Rate (PHP / kWh)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-grove">₱</span>
          <input
            type="number"
            step="0.1"
            min={min_php}
            max={max_php}
            value={inputVal}
            onChange={(e) => handleRateInput(e.target.value)}
            className={clsx(
              "w-full rounded-xl border-2 bg-white pl-8 pr-16 py-2.5 text-sm font-semibold text-soil",
              "focus:outline-none transition-colors",
              isCustom ? "border-sun focus:border-sun" : "border-gray-200 focus:border-grove"
            )}
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ kWh</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-gray-400">Range: ₱{min_php} – ₱{max_php}</p>
          {isCustom && (
            <span className="text-xs font-medium text-sun-DEFAULT bg-sun/10 px-2 py-0.5 rounded-full">
              Custom rate
            </span>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-xl bg-white border border-gray-100 px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">Using in calculation</span>
        <span className="text-base font-bold text-grove">₱{rate.toFixed(2)} / kWh</span>
      </div>
    </div>
  );
}
