"use client";
import clsx from "clsx";
import type { FinancialsResult } from "@/lib/types";

interface Props { financials: FinancialsResult; }

export default function FinancialsCard({ financials: f }: Props) {
  const isHybrid = f.system_type === "hybrid";

  return (
    <div className="grid md:grid-cols-2 gap-4">

      {/* ── Cost breakdown ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-sun-light px-5 py-4 flex items-center gap-2 border-b border-gray-100">
          <span className="text-lg">💰</span>
          <h3 className="font-serif text-base text-soil">Cost Breakdown</h3>
        </div>
        <div className="p-5">
          <Row label="Solar panels (50%)"
               value={`₱${fmt(f.panels_php)}`} />
          <Row label={isHybrid ? "Hybrid inverter (×1.15 premium)" : "Inverter (20%)"}
               value={`₱${fmt(f.inverter_php)}`} />
          <Row label="Mounting system (10%)"
               value={`₱${fmt(f.mounting_php)}`} />
          <Row label="Wiring & protection (8%)"
               value={`₱${fmt(f.wiring_php)}`} />
          <Row label="Labor & installation (12%)"
               value={`₱${fmt(f.labor_php)}`} />

          {/* Battery — only for hybrid */}
          {isHybrid && f.battery_php > 0 && (
            <Row label={`Battery storage (${f.battery_kwh} kWh LFP)`}
                 value={`₱${fmt(f.battery_php)}`}
                 accent="violet" />
          )}

          <Row label="Permitting & net-metering fees"
               value={`₱${fmt(f.permitting_php)}`} />
          <Row label="Total estimate"
               value={`₱${fmt(f.total_php)}`}
               highlight bold />
        </div>
      </div>

      {/* ── Financial returns ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-sky-light px-5 py-4 flex items-center gap-2 border-b border-gray-100">
          <span className="text-lg">📈</span>
          <h3 className="font-serif text-base text-soil">Financial Returns</h3>
        </div>
        <div className="p-5">
          <Row label="Total investment"
               value={`₱${fmt(f.total_php)}`} />
          <Row label="Annual savings (Year 1)"
               value={`₱${fmt(f.annual_savings_y1)}`}
               highlight />
          <Row label="Lifetime savings (25 yr)"
               value={`₱${fmt(f.lifetime_savings_php)}`}
               highlight />
          <Row label="Net profit"
               value={`₱${fmt(f.net_profit_php)}`}
               highlight />
          <Row label="Break-even point"
               value={`${f.payback_years} years`} />
          <Row label="Est. monthly savings"
               value={`₱${fmt(f.monthly_savings_y1)}`}
               highlight />

          {/* Bill impact section */}
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <Row label="Original monthly bill"
                 value={`₱${fmt(f.original_monthly_bill)}`} />
            <Row label="New est. monthly bill"
                 value={
                   f.new_monthly_bill_est <= (isHybrid ? 200 : 300)
                     ? `₱${fmt(f.new_monthly_bill_est)} (minimum fee)`
                     : `₱${fmt(f.new_monthly_bill_est)}`
                 }
                 highlight />

            {/* Bill reduction bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Bill reduction</span>
                <span className="font-semibold text-grove">{f.bill_reduction_pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-1000",
                    isHybrid
                      ? "bg-gradient-to-r from-violet-500 to-grove"
                      : "bg-gradient-to-r from-grove to-sun-glow"
                  )}
                  style={{ width: `${f.bill_reduction_pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Floor note */}
          <p className="mt-3 text-xs text-gray-400 leading-relaxed">
            {isHybrid
              ? "* ₱200 minimum utility connection fee applies regardless of generation."
              : "* ₱300 minimum connection fee applies. Grid-tied bill floor is 30% of original."}
          </p>
        </div>
      </div>

    </div>
  );
}

function Row({ label, value, highlight, bold, accent }: {
  label:    string;
  value:    string;
  highlight?: boolean;
  bold?:      boolean;
  accent?:    "violet";
}) {
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-dashed border-gray-100 last:border-0">
      <span className={`text-sm ${bold ? "font-semibold text-soil" : "text-gray-500"}`}>
        {label}
      </span>
      <span className={clsx(
        "text-sm font-semibold",
        accent === "violet" ? "text-violet-600"
          : highlight       ? "text-grove"
          : bold            ? "text-amber-600"
          : "text-soil"
      )}>
        {value}
      </span>
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString("en-PH"); }
