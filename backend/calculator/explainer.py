"""
calculator/explainer.py
───────────────────────
Builds the Gemini prompt from a calculation result.

Pure Python — no framework dependency, fully unit-testable.
The prompt is the most important part of the AI feature; keeping it
here means it can be iterated on, version-controlled, and tested
independently of the HTTP layer.
"""

from typing import Literal


def build_prompt(result: dict, language: Literal["english", "filipino"]) -> str:
    """
    Build a rich, context-aware prompt for Gemini.
    """
    inputs      = result["inputs"]
    system      = result["system"]
    financials  = result["financials"]
    environment = result["environment"]

    # ── Formatted data points ──────────────────────────────────────────────────
    zone_name    = inputs["zone_name"]
    monthly_kwh  = inputs["monthly_kwh"]
    rate         = inputs["electricity_rate_php"]
    quality      = inputs["quality_tier"].capitalize()

    kwp          = system["recommended_kwp"]
    panels       = system["panel_count_est"]
    coverage     = system["coverage_pct"]
    roof_limited = system["roof_limited"]

    total_cost   = f"₱{financials['total_php']:,}"
    payback      = financials["payback_years"]
    roi          = financials["roi_pct"]
    monthly_sav  = f"₱{financials['monthly_savings_y1']:,}"
    lifetime_sav = f"₱{financials['lifetime_savings_php']:,}"
    net_profit   = f"₱{financials['net_profit_php']:,}"
    new_bill     = financials["new_monthly_bill_est"]
    self_consume = financials["self_consume_pct"]

    co2_yr       = environment["co2_kg_per_year"]
    co2_total    = environment["co2_tonnes_avoided"]
    trees        = environment["trees_equivalent"]
    car_km       = f"{environment['car_km_equivalent']:,}"
    homes        = environment["households_powered"]

    new_bill_str = (
        "₱0 — your solar system fully offsets your electricity bill"
        if new_bill == 0
        else f"₱{new_bill:,} per month (down from ₱{round(monthly_kwh * rate):,})"
    )

    roof_note = (
        "Note: your system size is limited by your available roof space. "
        f"A larger roof could support a bigger system and cover 100% of your bill."
        if roof_limited else ""
    )

    # ── Language-specific instructions ─────────────────────────────
    if language == "filipino":
        persona = (
            "Ikaw ay isang mapagkakatiwalaang at friendly na solar energy advisor na nagpapaliwanag "
            "sa isang ordinaryong Pilipinong may-ari ng bahay. Magsalita nang simple, mainit, at direkta. "
            "Gamitin ang Filipino (Tagalog-based). Pwede mong gamitin ang ilang English terms tulad ng 'kWp', "
            "'solar panels', at 'net metering' pero ipaliwanag kung kinakailangan. "
            "Huwag magmungkahi ng site visit, installer, o anumang serbisyo. Ito ay purong calculator lamang."
        )
        structure = (
            "Gumawa ng sagot na may malinaw na istraktura gamit ang mga sumusunod na seksyon, "
            "pero gamitin ang simpleng text lamang (walang ### o markdown):\n\n"
            "Unang bahagi: Ano ang ibig sabihin ng solar system na ito para sa kanilang bahay "
            "(bilang ng panels, bagong bill, at monthly savings).\n\n"
            "Pangalawang bahagi: Bakit ito magandang investment (payback period at ROI sa madaling salita).\n\n"
            "Pangatlong bahagi: Ang epekto nito sa kapaligiran sa madaling paraan.\n\n"
            "Tapusin sa isang maikling praktikal na susunod na hakbang na maaaring gawin ng may-ari "
            "(walang site visit o pagtawag sa installer)."
        )
        word_limit = "Panatilihing 220–280 salita ang kabuuang sagot."
    else:
        persona = (
            "You are a trustworthy, friendly solar energy advisor explaining results "
            "to an ordinary Filipino homeowner. Speak warmly and simply. "
            "Use easy-to-understand language. This is only a calculator tool — do not mention "
            "scheduling visits, installers, proposals, or any company services."
        )
        structure = (
            "Structure your response with these clear sections using simple text and blank lines "
            "(do not use markdown like ###):\n\n"
            "Home Impact: What this solar system means practically for their home...\n\n"
            "Financial Investment: Why this is a good investment...\n\n"
            "Environmental Benefit: The environmental significance...\n\n"
            "End with one simple, practical next step the homeowner can take."
        )
        word_limit = "Keep the total response between 220 and 280 words."

    # ── Final prompt ───────────────────────────────────────────────────────────
    return f"""{persona}

Here are the homeowner's calculation results:

LOCATION & SYSTEM
- Location: {zone_name}
- Recommended system size: {kwp} kWp (~{panels} solar panels, {quality} quality)
- Bill coverage: {coverage}% of monthly electricity needs
- Monthly consumption: {monthly_kwh} kWh at ₱{rate}/kWh
{f"- {roof_note}" if roof_note else ""}

FINANCIAL RESULTS
- Total installation cost: {total_cost}
- Estimated monthly savings (Year 1): {monthly_sav}
- New estimated monthly electricity bill: {new_bill_str}
- Payback period: {payback} years
- 25-year net profit: {net_profit}
- Total lifetime savings: {lifetime_sav}
- Return on investment: {roi}%
- Energy self-consumption: {self_consume}% (rest exported via net metering if grid-tied)

ENVIRONMENTAL IMPACT (over 25 years)
- CO₂ avoided per year: {co2_yr} kg
- Total CO₂ avoided: {co2_total} tonnes
- Equivalent to planting {trees} trees
- Offsets {car_km} km of car travel
- Could power {homes} Filipino homes for a year

{structure}

Language requirement: reply entirely in {"Filipino" if language == "filipino" else "English"}.
{"Do not use English except for unavoidable technical terms." if language == "filipino" else "Do not use Filipino, Tagalog, or Taglish."}

{word_limit}

CRITICAL RULES — FOLLOW EXACTLY:
- Use clear section headings (like "Para sa Inyong Bahay", "Bilang Investment", "Para sa Kapaligiran").
- Write in short, easy-to-read paragraphs under each heading.
- Never cut off mid-sentence. Always finish every sentence and every section completely.
- Do not suggest contacting any installer, scheduling a visit, or getting a proposal.
- Keep the tone helpful and encouraging but neutral — this is only an educational calculator.
- Use double line breaks between sections so the text is easy to read.
"""