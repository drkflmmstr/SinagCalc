"use client";
import type { EnvironmentResult } from "@/lib/types";

interface Props { environment: EnvironmentResult; }

export default function EnvironmentCard({ environment: e }: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-grove-light to-sky-light border border-gray-100 shadow-sm p-5">
      <h3 className="font-serif text-base text-soil mb-4 flex items-center gap-2">
        🌍 Your Lifetime Environmental Impact
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatTile icon="🌳" value={fmt(e.trees_equivalent)}   label="Trees equivalent" />
        <StatTile icon="🚗" value={fmt(e.car_km_equivalent)}  label="Car km offset" />
        <StatTile icon="🏡" value={String(e.households_powered)} label="Homes powered" />
        <StatTile icon="☁️" value={`${e.co2_tonnes_avoided}t`} label="Tonnes CO₂ avoided" />
      </div>

      <div className="rounded-xl bg-white border border-gray-100 divide-y divide-dashed divide-gray-100">
        <DetailRow label="CO₂ avoided per year"   value={`${fmt(e.co2_kg_per_year)} kg`} />
        <DetailRow label="CO₂ over 25 years"      value={`${e.co2_tonnes_avoided} tonnes`} />
        <DetailRow label="Total energy generated" value={`${fmt(e.lifetime_gen_kwh)} kWh`} />
      </div>
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="bg-white rounded-xl p-3.5 text-center shadow-sm">
      <span className="text-2xl block mb-1.5">{icon}</span>
      <p className="font-serif text-xl text-grove leading-none mb-1">{value}</p>
      <p className="text-xs text-gray-500 leading-tight">{label}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline px-4 py-2.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-grove">{value}</span>
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString("en-PH"); }
