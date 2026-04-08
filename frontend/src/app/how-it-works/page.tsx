import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It's Calculated — SinagCalc PH",
  description:
    "Full methodology behind SinagCalc PH: system sizing, cost breakdown, financial returns, and environmental impact formulas.",
};

// ── Reusable sub-components ───────────────────────────────────────────────────

function Section({
  icon, title, children,
}: {
  icon: string; title: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-grove-light to-sun-light px-6 py-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="font-serif text-lg text-soil">{title}</h2>
      </div>
      <div className="p-6 space-y-5 text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Formula({ label, formula, note }: { label: string; formula: string; note?: string }) {
  return (
    <div className="rounded-xl border border-grove/15 bg-grove-light px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-widest text-grove mb-1.5">{label}</p>
      <p className="font-mono text-sm text-soil font-semibold leading-snug">{formula}</p>
      {note && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{note}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-dashed border-gray-100 py-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-soil text-right ml-4">{value}</span>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-sun-light border border-sun/20 px-4 py-3 text-xs text-gray-600 leading-relaxed">
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-cream">

      {/* ── Header ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0a3560] via-[#1E6B45] to-[#2D8B5A] px-6 py-12 text-center">
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full
                        bg-[radial-gradient(circle,rgba(255,204,92,0.18)_0%,transparent_65%)]" />
        <div className="relative z-10 mx-auto max-w-xl">
          {/* Wordmark */}
          <Link href="/" className="mb-4 inline-flex items-center gap-1.5 group">
            <span className="font-serif text-xl text-white group-hover:text-sun-glow transition-colors">Sinag</span>
            <span className="font-serif text-xl text-sun-glow">Calc</span>
            <span className="rounded border border-white/25 bg-white/10 px-1.5 py-0.5
                             text-[10px] font-bold uppercase tracking-widest text-white/75">PH</span>
          </Link>
          <h1 className="font-serif text-3xl font-normal text-white mt-2">
            How It&apos;s Calculated
          </h1>
          <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-md mx-auto">
            Every number in your estimate comes from a formula, not a guess.
            Here&apos;s the complete methodology — no black boxes.
          </p>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto max-w-2xl px-4 py-10 pb-20 space-y-6">

        {/* 1 — System Sizing */}
        <Section icon="⚡" title="Step 1 — System Sizing">
          <p>
            We calculate how large a solar system you need to cover your electricity
            consumption, then cap it by your available roof space.
          </p>

          <Formula
            label="Required system size"
            formula="Required kWp = Monthly kWh ÷ (PSH × 30 days × 0.80 efficiency)"
            note="PSH = Peak Sun Hours per day for your climate zone (from NASA POWER / DOE Philippines data)."
          />

          <Formula
            label="Actual system size (roof-limited)"
            formula="Recommended kWp = min(Required kWp, Roof max kWp)"
            note="If your roof can't fit the full system, coverage drops below 100%."
          />

          <p className="font-semibold text-soil">Climate zone peak sun hours (PSH/day):</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Row label="Metro Manila (NCR)" value="5.0 hrs" />
            <Row label="Central & South Luzon" value="5.1 hrs" />
            <Row label="Ilocos / Batanes" value="5.6 hrs" />
            <Row label="Cordillera (CAR)" value="4.5 hrs" />
            <Row label="Bicol / Eastern Visayas" value="4.7 hrs" />
            <Row label="Western & Central Visayas" value="5.4 hrs" />
            <Row label="Eastern Visayas" value="4.8 hrs" />
            <Row label="Western Mindanao" value="4.9 hrs" />
            <Row label="Northern & Central Mindanao" value="5.2 hrs" />
            <Row label="Davao / SOCCSKSARGEN" value="5.5 hrs" />
          </div>

          <p className="font-semibold text-soil">Roof area caps:</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Row label="Small (< 20 sqm)" value="Max 2.0 kWp" />
            <Row label="Medium (20–50 sqm)" value="Max 5.0 kWp" />
            <Row label="Large (50–80 sqm)" value="Max 8.0 kWp" />
            <Row label="Very Large (> 80 sqm)" value="Max 12.0 kWp" />
          </div>

          <Formula
            label="Panel count"
            formula="Panel count = ⌈System kWp × 1,000 ÷ 550W⌉"
            note="SinagCalc assumes 550W monocrystalline panels — the current standard for residential installs in the Philippines."
          />
        </Section>

        {/* 2 — Cost Breakdown */}
        <Section icon="💰" title="Step 2 — Cost Breakdown">
          <p>
            The total installed cost is built from a base cost (cost/Wp × system size)
            then split across components using fixed allocation ratios.
          </p>

          <Formula
            label="Base system cost"
            formula="Base = System kWp × 1,000 × Cost per Wp (PHP)"
          />

          <p className="font-semibold text-soil">Cost per watt-peak by quality tier (2026 market):</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Row label="Basic — entry-level, ~10yr warranty" value="₱55 / Wp" />
            <Row label="Standard — most popular, ~15yr warranty" value="₱65 / Wp" />
            <Row label="Premium — top-tier, ~25yr warranty" value="₱85 / Wp" />
          </div>

          <p className="font-semibold text-soil">Cost allocation ratios (applied to base):</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Row label="Solar panels" value="50%" />
            <Row label="Inverter" value="20%" />
            <Row label="Mounting system" value="10%" />
            <Row label="Wiring & protection" value="8%" />
            <Row label="Labor & installation" value="12%" />
          </div>

          <Note>
            <strong>Hybrid systems</strong> use a more capable inverter. A <strong>+15% premium</strong> is
            applied to the inverter portion only. A battery sized at{" "}
            <strong>2× your system kWp in kWh</strong> (e.g. 5 kWp → 10 kWh battery) is added at{" "}
            <strong>₱25,000/kWh</strong> (LFP lithium iron phosphate, 2026 installed price).
          </Note>

          <Formula
            label="Permitting & net-metering fees"
            formula="Flat ₱15,000 per installation"
            note="Covers ERC net-metering application, local government permit, and inspection fees."
          />
        </Section>

        {/* 3 — Energy Generation */}
        <Section icon="🔆" title="Step 3 — Annual Energy Generation">
          <Formula
            label="Year 0 annual generation"
            formula="Annual kWh = System kWp × PSH × 365 days × 0.80 system efficiency"
            note="The 0.80 efficiency factor accounts for inverter losses, wiring losses, temperature derating, and soiling."
          />

          <Formula
            label="Year N generation (panel degradation)"
            formula="Year N kWh = Year 0 kWh × (1 − 0.005)^N"
            note="Panels degrade at 0.5% per year — a conservative industry standard for quality panels."
          />
        </Section>

        {/* 4 — Self-Consumption & Net Metering */}
        <Section icon="🔌" title="Step 4 — Self-Consumption & Net Metering">
          <p>
            Not all solar generation directly offsets your bill at the retail rate.
            The split between <em>self-consumed</em> and <em>exported</em> energy
            depends on whether you have a battery.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-grove-light p-4">
              <p className="font-semibold text-grove text-sm mb-2">⚡ Grid-Tied</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Solar only covers daytime usage. Approximately <strong>40%</strong> of generation
                is consumed directly. The other <strong>60%</strong> is exported to the grid and
                earns a net-metering credit.
              </p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
              <p className="font-semibold text-violet-700 text-sm mb-2">🔋 Hybrid + Battery</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Battery stores daytime surplus for night use. Approximately <strong>90%</strong> of
                generation is self-consumed. Only <strong>10%</strong> overflows to the grid.
              </p>
            </div>
          </div>

          <Formula
            label="Net-metering export credit rate (ERC 2026)"
            formula="₱7.86 / kWh (Generation Charge only)"
            note="Under ERC rules, the credit equals the generation charge of your discom — not the full retail rate. This is why self-consumption saves more than exporting."
          />
        </Section>

        {/* 5 — Financial Returns */}
        <Section icon="📈" title="Step 5 — Financial Returns (25-Year Projection)">
          <p>
            Each year is projected individually, accounting for electricity rate escalation
            and panel degradation.
          </p>

          <Formula
            label="Retail rate in Year N"
            formula="Rate_N = Base rate × (1 + 0.04)^N"
            note="4% annual electricity tariff escalation — based on historical DOE PH Meralco rate growth."
          />

          <Formula
            label="Annual savings in Year N"
            formula={
              "Savings_N = (Gen_N × self-consume ratio × Rate_N)\n" +
              "          + (Gen_N × export ratio × ₱7.86)\n" +
              "          − ₱3,000 annual O&M"
            }
            note="Annual O&M covers panel cleaning, inverter health check, and minor maintenance."
          />

          <Formula
            label="Payback period (fractional years)"
            formula="Payback = interpolated year when cumulative savings ≥ total cost"
          />

          <Formula
            label="25-year net profit"
            formula="Net Profit = Total Lifetime Savings − Total Installation Cost"
          />

          <Formula
            label="Return on investment"
            formula="ROI % = (Net Profit ÷ Total Cost) × 100"
          />
        </Section>

        {/* 6 — New Monthly Bill */}
        <Section icon="🧾" title="Step 6 — New Monthly Bill Estimate">
          <p>
            After solar, your residual grid draw shrinks — but a minimum utility fee always applies.
          </p>

          <Formula
            label="Grid-tied residual bill"
            formula={
              "Monthly solar gen = Annual gen ÷ 12\n" +
              "Residual kWh = max(0, Monthly kWh − Solar gen × 40%)\n" +
              "Bill = max(Residual kWh × rate, 30% of original bill, ₱300)"
            }
            note="₱300 is the minimum fixed connection/metering fee for grid-tied customers."
          />

          <Formula
            label="Hybrid residual bill"
            formula={
              "Residual kWh = max(0, Monthly kWh − Solar gen × 90%)\n" +
              "Bill = max(Residual kWh × rate, ₱200)"
            }
            note="₱200 minimum reflects the lower fixed utility fee for near-off-grid hybrid customers."
          />
        </Section>

        {/* 7 — Environmental Impact */}
        <Section icon="🌍" title="Step 7 — Environmental Impact">
          <Formula
            label="Lifetime CO₂ avoided"
            formula="CO₂ (kg) = Lifetime generation (kWh) × 0.709 kg/kWh"
            note="0.709 kg/kWh is the DOE Philippines Grid Emission Factor (2023). This is the CO₂ intensity of the Philippine grid — how much carbon each kWh of grid power produces."
          />

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Row label="Tree equivalent" value="CO₂ total ÷ (22 kg/tree/yr × 25 yrs)" />
            <Row label="Car km equivalent" value="CO₂ total (kg) ÷ 0.21 kg/km" />
            <Row label="Homes powered" value="Lifetime kWh ÷ 3,000 kWh/home/yr" />
          </div>

          <Note>
            Environmental equivalencies use widely accepted Philippine averages:
            22 kg CO₂ absorbed per tree per year, 0.21 kg CO₂ per km of car travel,
            and 3,000 kWh average annual household consumption.
          </Note>
        </Section>

        {/* 8 — Data Sources */}
        <Section icon="📚" title="Data Sources & Assumptions">
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Row label="Peak sun hours" value="NASA POWER / DOE Philippines" />
            <Row label="Grid emission factor" value="DOE PH, 2023 (0.709 kg/kWh)" />
            <Row label="Net-metering credit rate" value="ERC Generation Charge, 2026 (₱7.86/kWh)" />
            <Row label="Electricity rate escalation" value="4% per year (historical average)" />
            <Row label="Panel degradation" value="0.5% per year" />
            <Row label="System lifetime" value="25 years" />
            <Row label="System efficiency" value="80% (inverter + wiring + temp losses)" />
            <Row label="Panel wattage assumed" value="550W monocrystalline" />
            <Row label="Battery cost" value="₱25,000/kWh LFP (2026 installed)" />
            <Row label="Annual O&M" value="₱3,000/year" />
            <Row label="Permitting fees" value="₱15,000 flat" />
            <Row label="Installed cost range" value="₱55–₱85/Wp (2026 market)" />
          </div>

          <Note>
            <strong>This is a planning tool, not a quote.</strong> Actual costs vary by installer,
            panel brand, roof type, and local permit requirements. Always get 2–3 quotes from
            accredited solar installers before deciding.
          </Note>
        </Section>

        {/* Back link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-grove
                       px-6 py-3 text-sm font-semibold text-grove hover:bg-grove-light transition-colors"
          >
            ← Back to Calculator
          </Link>
        </div>

      </main>

      <footer className="pb-10 text-center text-xs text-gray-400">
        <p className="flex items-center justify-center gap-1.5 font-medium text-gray-500 mb-1">
          <span className="font-serif text-sm text-soil">Sinag</span>
          <span className="font-serif text-sm text-grove">Calc</span>
          <span className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-bold
                           uppercase tracking-widest text-gray-400">PH</span>
        </p>
        <p className="opacity-80">2026 Residential Solar Estimates · Sources: DOE PH · Meralco · ERC</p>
      </footer>
    </div>
  );
}