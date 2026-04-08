"use client";
import Link from "next/link";
import clsx from "clsx";
import type { CalculationResponse } from "@/lib/types";
import SystemCard      from "./SystemCard";
import FinancialsCard  from "./FinancialsCard";
import EnvironmentCard from "./EnvironmentCard";
import ExplainerCard   from "./ExplainerCard";

interface Props {
  result:  CalculationResponse;
  onReset: () => void;
}

export default function ResultsDashboard({ result, onReset }: Props) {
  const { recommendation, system, financials, environment, inputs } = result;
  const isHybrid = financials.system_type === "hybrid";

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ── Recommendation banner ── */}
      <div className={clsx(
        "rounded-2xl text-white p-6 flex gap-4 items-start shadow-lg",
        isHybrid
          ? "bg-gradient-to-br from-violet-700 to-grove"
          : "bg-gradient-to-br from-grove to-[#1a5c3a]"
      )}>
        <span className="text-3xl flex-shrink-0 mt-0.5">
          {isHybrid ? "🔋" : "✅"}
        </span>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-serif text-lg">Our Assessment</h3>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              {isHybrid ? "Hybrid + Battery" : "Grid-Tied"}
            </span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">{recommendation}</p>
          <p className="text-xs opacity-60 mt-2">
            {inputs.zone_name} · {inputs.monthly_kwh} kWh/month ·
            ₱{inputs.electricity_rate_php}/kWh ·
            {isHybrid
              ? ` ${financials.battery_kwh} kWh battery`
              : " Net metering @ ₱7.86/kWh"}
          </p>
        </div>
      </div>

      {/* ── Key metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          icon="⚡"
          label="System Size"
          value={`${system.recommended_kwp} kWp`}
          sub={isHybrid ? `+ ${financials.battery_kwh} kWh battery` : undefined}
          color="grove"
        />
        <MetricCard
          icon="💰"
          label="Total Cost"
          value={`₱${fmt(financials.total_php)}`}
          sub={isHybrid ? "incl. battery & permits" : "incl. permits"}
          color="sun"
        />
        <MetricCard
          icon="📅"
          label="Payback Period"
          value={`${financials.payback_years} yrs`}
          color="sky"
        />
        <MetricCard
          icon="📈"
          label="25-Year ROI"
          value={`${financials.roi_pct}%`}
          color="grove"
        />
        <MetricCard
          icon="💸"
          label="Monthly Savings"
          value={`₱${fmt(financials.monthly_savings_y1)}`}
          sub="est. Year 1"
          color="sun"
        />
        <MetricCard
          icon="🌿"
          label="CO₂ Avoided"
          value={`${environment.co2_tonnes_avoided}t`}
          sub="over 25 years"
          color="sky"
        />
      </div>

      {/* ── Bill impact highlight ── */}
      <div className={clsx(
        "rounded-2xl p-5 flex items-center justify-between gap-4",
        isHybrid ? "bg-violet-50 border border-violet-100" : "bg-grove-light border border-grove/15"
      )}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Monthly Bill Impact
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif text-gray-400 line-through">
              ₱{fmt(financials.original_monthly_bill)}
            </span>
            <span className="text-3xl font-serif text-grove">
              ₱{fmt(financials.new_monthly_bill_est)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isHybrid ? "₱200 minimum utility fee" : "₱300 minimum connection fee"}
          </p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className={clsx(
            "text-4xl font-serif font-bold",
            isHybrid ? "text-violet-600" : "text-grove"
          )}>
            {financials.bill_reduction_pct}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">reduction</p>
        </div>
      </div>

      {/* ── Detail cards ── */}
      <SystemCard     system={system} financials={financials} />
      <FinancialsCard financials={financials} />
      <EnvironmentCard environment={environment} />

      {/* ── AI Explainer ── */}
      <ExplainerCard result={result} />

      {/* ── Disclaimer + methodology link ── */}
      <div className="rounded-xl bg-sun-light border border-sun/20 p-4 text-xs text-gray-500 leading-relaxed">
        <strong className="text-soil">Disclaimer:</strong> Estimates based on 2026 Philippine market
        conditions. Electricity rates: Meralco ₱13.82/kWh, others adjusted ~15% from 2024 values.
        Net-metering credit: ₱7.86/kWh (ERC generation charge). Installed costs: ₱55–₱85/Wp.
        Battery storage: ₱25,000/kWh (LFP). Annual rate escalation: 4%. Panel degradation: 0.5%/yr.
        Annual O&M: ₱3,000. CO₂ factor: 0.709 kg/kWh (DOE PH 2023).
        Always get 2–3 quotes from accredited installers.{" "}
        <Link
          href="/how-it-works"
          className="font-semibold text-grove hover:underline underline-offset-2"
        >
          See full calculation methodology →
        </Link>
      </div>

      {/* ── Reset ── */}
      <button
        onClick={onReset}
        className="w-full py-3.5 rounded-xl border-2 border-grove text-grove font-semibold text-sm
                   hover:bg-grove-light transition-colors"
      >
        ↩ Start a New Calculation
      </button>
    </div>
  );
}

// ── Shared metric card ────────────────────────────────────────────────────────

interface MetricCardProps {
  icon:   string;
  label:  string;
  value:  string;
  sub?:   string;
  color:  "grove" | "sun" | "sky";
}

const colorMap = {
  grove: "text-grove",
  sun:   "text-amber-600",
  sky:   "text-sky",
};

function MetricCard({ icon, label, value, sub, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:-translate-y-0.5 transition-transform">
      <span className="text-xl block mb-2">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className={`font-serif text-2xl leading-none ${colorMap[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString("en-PH"); }