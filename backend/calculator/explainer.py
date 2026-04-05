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
    Build a rich, context-aware prompt for Gemini based on the
    full calculation result and the user's language preference.

    Args:
        result:   The full CalculationResponse as a dict.
        language: "english" or "filipino"

    Returns:
        A complete prompt string ready to send to Gemini.
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

    # ── Language-specific persona and instructions ─────────────────────────────
    if language == "filipino":
        persona = (
            "Ikaw ay isang mapagkakatiwalaang solar energy advisor na nagpapaliwanag "
            "sa isang ordinaryong Pilipinong may-ari ng bahay. "
            "Magsalita nang direkta, mainit, at simple. "
            "Gamitin ang Filipino (Tagalog-based) na wika sa buong sagot. "
            "Okay lang ang ilang English technical terms tulad ng 'kWp', 'solar panels', "
            "at 'net metering' kung walang natural na katumbas sa Filipino, "
            "pero ipaliwanag ang ibig sabihin nito. "
            "Huwag gumamit ng bullet points. Sumulat sa tatlong talata."
        )
        structure = (
            "Paragraph 1: Ano ang ibig sabihin ng solar system na ito para sa kanilang tahanan — "
            "gaano karaming panel, magkano ang matitipid bawat buwan, at ano ang mangyayari sa kanilang kuryente bill.\n"
            "Paragraph 2: Bakit ito magandang investment — ipaliwanag ang payback period at ROI sa paraang "
            "madaling maintindihan ng isang ordinaryong tao. Ikumpara sa ibang paraan ng pagtitipid.\n"
            "Paragraph 3: Ang kahalagahan nito para sa kalikasan — CO₂, puno, at komunidad.\n"
            "Tapusin ng isang praktikal na susunod na hakbang na dapat gawin ng may-ari ng bahay."
        )
        word_limit = "Panatilihing 200–260 salita ang kabuuang sagot."
    else:
        persona = (
            "You are a trustworthy, friendly solar energy advisor explaining results "
            "to an ordinary Filipino homeowner who is not technically sophisticated. "
            "Speak directly and warmly, as if you're sitting across from them. "
            "Use simple language. Avoid jargon. "
            "Respond only in English. Do not use Filipino, Tagalog, or Taglish. "
            "Always refer to amounts in Philippine Peso (₱). "
            "Do not use bullet points. Write in three paragraphs."
        )
        structure = (
            "Paragraph 1: What this solar system means practically for their home — "
            "how many panels, what happens to their electricity bill, and what monthly savings look like.\n"
            "Paragraph 2: Whether this is a good financial investment and why — explain the payback period "
            "and ROI in plain terms a non-financial person can understand. "
            "Compare it to something relatable like putting money in a bank.\n"
            "Paragraph 3: The environmental significance in human-scale, relatable terms.\n"
            "End with one clear, actionable next step the homeowner should take."
        )
        word_limit = "Keep the total response between 200 and 260 words."

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
- Energy self-consumption: {self_consume}% (rest exported via net metering)

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
"""
