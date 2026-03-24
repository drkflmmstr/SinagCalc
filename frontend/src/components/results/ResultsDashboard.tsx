"use client";
import type { CalculationResponse } from "@/lib/types";
import SystemCard      from "./SystemCard";
import FinancialsCard  from "./FinancialsCard";
import EnvironmentCard from "./EnvironmentCard";

interface Props {
  result: CalculationResponse;
  onReset: () => void;
}

export default function ResultsDashboard({ result, onReset }: Props) {
  const { recommendation, system, financials, environment, inputs } = result;

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Recommendation banner */}
      <div className="rounded-2xl bg-gradient-to-br from-grove to-[#1a5c3a] text-white p-6 flex gap-4 items-start shadow-lg">
        <span className="text-3xl flex-shrink-0 mt-0.5">✅</span>
        <div>
          <h3 className="font-serif text-lg mb-1.5">Our Assessment</h3>
          <p className="text-sm opacity-90 leading-relaxed">{recommendation}</p>
          <p className="text-xs opacity-60 mt-2">
            Based on {inputs.zone_name} · {inputs.monthly_kwh} kWh/month · ₱{inputs.electricity_rate_php}/kWh
          </p>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard icon="⚡" label="System Size"     value={`${system.recommended_kwp} kWp`}       color="grove" />
        <MetricCard icon="💰" label="Total Cost"      value={`₱${fmt(financials.total_php)}`}         color="sun"   />
        <MetricCard icon="📅" label="Payback Period"  value={`${financials.payback_years} yrs`}        color="sky"   />
        <MetricCard icon="📈" label="25-Year ROI"     value={`${financials.roi_pct}%`}                color="grove" />
        <MetricCard icon="💸" label="Monthly Savings" value={`₱${fmt(financials.monthly_savings_y1)}`} color="sun"   />
        <MetricCard icon="🌿" label="CO₂ Avoided"     value={`${environment.co2_tonnes_avoided}t`}    color="sky"   />
      </div>

      {/* Detail cards */}
      <SystemCard     system={system} financials={financials} />
      <FinancialsCard financials={financials} />
      <EnvironmentCard environment={environment} />

      {/* Disclaimer */}
      <div className="rounded-xl bg-sun-light border border-sun/20 p-4 text-xs text-gray-500 leading-relaxed">
        <strong className="text-soil">Disclaimer:</strong> Estimates based on typical Philippine conditions
        and 2024 market prices. Actual results vary by installer, location, shading, and roof orientation.
        Always get 2–3 quotes from accredited installers. Net-metering export credit assumed at ₱5/kWh
        (ERC rules). Electricity escalation at 4%/year. CO₂ factor: 0.709 kg/kWh (DOE PH 2023).
      </div>

      {/* Reset */}
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
  icon:  string;
  label: string;
  value: string;
  color: "grove" | "sun" | "sky";
}

const colorMap = {
  grove: "text-grove",
  sun:   "text-amber-600",
  sky:   "text-sky",
};

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:-translate-y-0.5 transition-transform">
      <span className="text-xl block mb-2">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className={`font-serif text-2xl leading-none ${colorMap[color]}`}>{value}</p>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("en-PH");
}
