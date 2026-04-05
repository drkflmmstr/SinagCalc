"use client";
import clsx from "clsx";
import type { SystemResult, FinancialsResult } from "@/lib/types";

interface Props {
  system:     SystemResult;
  financials: FinancialsResult;
}

export default function SystemCard({ system, financials }: Props) {
  const isHybrid = financials.system_type === "hybrid";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-grove-light px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isHybrid ? "🔋" : "⚡"}</span>
          <h3 className="font-serif text-base text-soil">System Details</h3>
        </div>
        {/* System type badge */}
        <span className={clsx(
          "text-xs font-semibold px-2.5 py-1 rounded-full",
          isHybrid
            ? "bg-violet-100 text-violet-700"
            : "bg-grove-light text-grove border border-grove/20"
        )}>
          {isHybrid ? "🔋 Hybrid + Battery" : "⚡ Grid-Tied"}
        </span>
      </div>

      <div className="p-5 space-y-0">
        <Row label="Climate zone peak sun"
             value={`${system.peak_sun_hours} hrs/day`} />
        <Row label="Recommended system size"
             value={`${system.recommended_kwp} kWp`} highlight />
        <Row label="Estimated panel count"
             value={`~${system.panel_count_est} × ${system.panel_wattage}W panels`} />

        {/* Battery row — only for hybrid */}
        {isHybrid && (
          <Row label="Battery storage"
               value={`${financials.battery_kwh} kWh (LFP)`}
               highlight />
        )}

        <Row label="Annual generation"
             value={`${fmt(financials.annual_gen_kwh)} kWh/year`} />
        <Row label="Self-consumption"
             value={`${financials.self_consume_pct}%`} />
        <Row label="Bill coverage"
             value={`${system.coverage_pct}%`} highlight />

        {/* Coverage bar */}
        <div className="pt-2 pb-1">
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full transition-all duration-1000",
                isHybrid
                  ? "bg-gradient-to-r from-violet-500 to-grove"
                  : "bg-gradient-to-r from-grove to-sun-glow"
              )}
              style={{ width: `${system.coverage_pct}%` }}
            />
          </div>
        </div>

        {/* Self-consumption context note */}
        <p className={clsx(
          "text-xs rounded-lg px-3 py-2 mt-2 leading-relaxed",
          isHybrid
            ? "text-violet-700 bg-violet-50"
            : "text-sky text-sky-DEFAULT bg-sky-light"
        )}>
          {isHybrid
            ? "🔋 Battery stores daytime surplus for use at night, raising self-consumption to 90%."
            : "⚡ Grid-tied systems self-consume ~40% of generation. The rest earns net-metering credits at ₱7.86/kWh."}
        </p>

        {system.roof_limited && (
          <p className="text-xs text-amber-600 bg-sun-light rounded-lg px-3 py-2 mt-2">
            ⚠️ System size is limited by your available roof space. A larger roof could support{" "}
            {system.required_kwp} kWp and offset 100% of your bill.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-dashed border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-grove" : "text-soil"}`}>{value}</span>
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString("en-PH"); }
