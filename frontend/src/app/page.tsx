"use client";

import { useRef } from "react";
import { useCalculator } from "@/hooks/useCalculator";
import LocationStep      from "@/components/steps/LocationStep";
import RoofStep          from "@/components/steps/RoofStep";
import BillStep          from "@/components/steps/BillStep";
import QualityStep       from "@/components/steps/QualityStep";
import RateEditor        from "@/components/RateEditor";
import ResultsDashboard  from "@/components/results/ResultsDashboard";

export default function Home() {
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    options, result, form, rate,
    loadingOptions, calculating, error,
    setIsland, setZone, setField,
    setRate, onDistributorChange,
    calculate, reset,
  } = useCalculator();

  async function handleCalculate() {
    await calculate();
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }

  const allSelected = !!(form.zone && form.roof_area && form.monthly_bill && form.quality_tier);

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0a3560] via-[#1E6B45] to-[#2D8B5A] px-6 py-16 text-center">
        {/* Sun glow */}
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full
                        bg-[radial-gradient(circle,rgba(255,204,92,0.22)_0%,transparent_65%)]" />
        <div className="relative z-10 mx-auto max-w-xl">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-sun-glow text-4xl
                          shadow-[0_0_0_14px_rgba(255,204,92,0.18),0_0_0_28px_rgba(255,204,92,0.09)]
                          animate-pulse-glow">
            ☀️
          </div>
          <span className="mb-4 inline-block rounded-full border border-sun-glow/30 bg-sun-glow/15
                           px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sun-glow">
            🇵🇭 For Filipino Homeowners
          </span>
          <h1 className="font-serif text-4xl font-normal leading-tight text-white md:text-5xl">
            Is Solar Worth It<br />for <em className="italic text-sun-glow">Your</em> Home?
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            Answer 4 simple questions, set your electricity rate,
            and get a personalised solar estimate in seconds.
          </p>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto max-w-2xl px-4 pb-20 -mt-10 relative z-10">

        {loadingOptions ? (
          <div className="rounded-2xl bg-white shadow-xl border border-gray-100 p-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-grove/20 border-t-grove" />
            <p className="text-sm text-gray-500">Loading options…</p>
          </div>
        ) : !options ? (
          <div className="rounded-2xl bg-white shadow-xl border border-red-100 p-8 text-center">
            <p className="text-sm text-red-500 mb-3">⚠️ Could not connect to the backend.</p>
            <p className="text-xs text-gray-400">Make sure the FastAPI server is running at{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded">
                {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
              </code>
            </p>
          </div>
        ) : (
          <>
            {/* ── Input card ── */}
            {!result && (
              <div className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">

                {/* Card header */}
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r
                                from-grove-light to-sun-light px-6 py-5">
                  <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-grove text-xl">📋</div>
                  <div>
                    <h2 className="font-serif text-lg text-soil">Tell Us About Your Home</h2>
                    <p className="text-xs text-gray-500 mt-0.5">No exact measurements needed — just pick the closest range</p>
                  </div>
                </div>

                <div className="p-6 space-y-8">

                  {/* Step 1 */}
                  <Section step={1} title="Your Location"
                    hint="First pick your island group, then select the climate zone. Sun hours vary significantly within islands.">
                    <LocationStep
                      options={options}
                      island={form.island}
                      zone={form.zone}
                      onIsland={setIsland}
                      onZone={setZone}
                    />
                  </Section>

                  {/* Step 2 */}
                  <Section step={2} title="Usable Roof Area"
                    hint="Estimate the flat or slightly-tilted portion of your roof that gets direct sun.">
                    <RoofStep
                      options={options.roof_areas}
                      value={form.roof_area}
                      onChange={(v) => setField("roof_area", v)}
                    />
                  </Section>

                  {/* Step 3 */}
                  <Section step={3} title="Average Monthly Bill"
                    hint="Check your last 3 Meralco / Discom bills and use the average.">
                    <BillStep
                      options={options.monthly_bills}
                      value={form.monthly_bill}
                      onChange={(v) => setField("monthly_bill", v)}
                    />
                  </Section>

                  {/* Step 4 */}
                  <Section step={4} title="System Quality"
                    hint="Higher tiers use better panels and inverters. Standard is the most popular in PH.">
                    <QualityStep
                      options={options.quality_tiers}
                      value={form.quality_tier}
                      onChange={(v) => setField("quality_tier", v)}
                    />
                  </Section>

                  {/* Rate editor */}
                  <Section step={5} title="Your Electricity Rate"
                    hint="Select your distributor for a pre-filled rate, or type your exact rate from your bill.">
                    <RateEditor
                      options={options}
                      rate={rate}
                      onRateChange={setRate}
                      onDistributorChange={onDistributorChange}
                    />
                  </Section>

                </div>

                {/* Error */}
                {error && (
                  <div className="mx-6 mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    ⚠️ {error}
                  </div>
                )}

                {/* Submit */}
                <div className="px-6 pb-6">
                  <button
                    onClick={handleCalculate}
                    disabled={calculating || !allSelected}
                    className="flex w-full items-center justify-center gap-3 rounded-xl
                               bg-gradient-to-r from-grove to-grove-mid py-5 text-base font-semibold
                               text-white shadow-lg shadow-grove/25 transition-all
                               hover:-translate-y-0.5 hover:shadow-xl hover:shadow-grove/30
                               disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
                  >
                    {calculating ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Calculating…
                      </>
                    ) : (
                      <>☀️ Calculate My Solar Potential</>
                    )}
                  </button>
                  {!allSelected && (
                    <p className="mt-2 text-center text-xs text-gray-400">Complete all 4 steps above to continue</p>
                  )}
                </div>

              </div>
            )}

            {/* ── Results ── */}
            {result && (
              <div ref={resultsRef}>
                <ResultsDashboard result={result} onReset={reset} />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="pb-10 text-center text-xs text-gray-400">
        Built with ☀️ for Filipino homeowners &nbsp;·&nbsp;
        Backend: FastAPI &nbsp;·&nbsp; Data: DOE PH · NASA POWER · Meralco · ERC
      </footer>
    </div>
  );
}

// ── Shared section wrapper ─────────────────────────────────────────────────────

function Section({
  step, title, hint, children,
}: {
  step: number; title: string; hint: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-2">
        <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-grove text-xs font-bold text-white">
          {step}
        </span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-soil">{title}</h3>
      </div>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{hint}</p>
      {children}
    </div>
  );
}
