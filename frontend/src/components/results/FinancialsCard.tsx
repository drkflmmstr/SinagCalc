"use client";
import type { FinancialsResult } from "@/lib/types";

interface Props { financials: FinancialsResult; }

export default function FinancialsCard({ financials: f }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-4">

      {/* Cost breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-sun-light px-5 py-4 flex items-center gap-2 border-b border-gray-100">
          <span className="text-lg">💰</span>
          <h3 className="font-serif text-base text-soil">Cost Breakdown</h3>
        </div>
        <div className="p-5">
          <Row label="Solar panels (50%)"       value={`₱${fmt(f.panels_php)}`} />
          <Row label="Inverter (20%)"           value={`₱${fmt(f.inverter_php)}`} />
          <Row label="Mounting system (10%)"    value={`₱${fmt(f.mounting_php)}`} />
          <Row label="Wiring & protection (8%)" value={`₱${fmt(f.wiring_php)}`} />
          <Row label="Labor & installation (12%)" value={`₱${fmt(f.labor_php)}`} />
          <Row label="Total estimate"           value={`₱${fmt(f.total_php)}`} highlight bold />
        </div>
      </div>

      {/* Returns */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-sky-light px-5 py-4 flex items-center gap-2 border-b border-gray-100">
          <span className="text-lg">📈</span>
          <h3 className="font-serif text-base text-soil">Financial Returns</h3>
        </div>
        <div className="p-5">
          <Row label="Total investment"         value={`₱${fmt(f.total_php)}`} />
          <Row label="Lifetime savings (25 yr)" value={`₱${fmt(f.lifetime_savings_php)}`} highlight />
          <Row label="Net profit"               value={`₱${fmt(f.net_profit_php)}`} highlight />
          <Row label="Break-even point"         value={`${f.payback_years} years`} />
          <Row label="Est. monthly savings"     value={`₱${fmt(f.monthly_savings_y1)}`} highlight />
          <Row label="New monthly bill"
            value={f.new_monthly_bill_est === 0 ? "₱0 — fully offset" : `₱${fmt(f.new_monthly_bill_est)}`}
            highlight
          />
        </div>
      </div>

    </div>
  );
}

function Row({ label, value, highlight, bold }: {
  label: string; value: string; highlight?: boolean; bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-dashed border-gray-100 last:border-0">
      <span className={`text-sm ${bold ? "font-semibold text-soil" : "text-gray-500"}`}>{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-grove" : bold ? "text-amber-600" : "text-soil"}`}>
        {value}
      </span>
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString("en-PH"); }
