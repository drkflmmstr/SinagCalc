"""
calculator/environment.py
─────────────────────────
Lifetime environmental impact of a solar installation.
Zero framework dependency — pure Python, fully unit-testable.
"""

from config import (
    CO2_KG_PER_KWH, TREE_CO2_KG_PER_YEAR,
    CAR_CO2_KG_PER_KM, AVG_HOUSEHOLD_KWH_YEAR,
    SYSTEM_LIFETIME_YEARS, PANEL_DEGRADATION_RATE,
)


def calculate_environmental_impact(annual_gen_kwh: float) -> dict:
    lifetime_gen  = _lifetime_gen(annual_gen_kwh)
    co2_kg        = lifetime_gen * CO2_KG_PER_KWH

    return {
        "lifetime_gen_kwh":   round(lifetime_gen),
        "co2_kg_per_year":    round(annual_gen_kwh * CO2_KG_PER_KWH),
        "co2_tonnes_avoided": round(co2_kg / 1000, 1),
        "trees_equivalent":   max(1, round(co2_kg / (TREE_CO2_KG_PER_YEAR * SYSTEM_LIFETIME_YEARS))),
        "car_km_equivalent":  round(co2_kg / CAR_CO2_KG_PER_KM),
        "households_powered": round(lifetime_gen / AVG_HOUSEHOLD_KWH_YEAR, 1),
    }


def _lifetime_gen(annual_gen_kwh: float) -> float:
    return sum(
        annual_gen_kwh * ((1 - PANEL_DEGRADATION_RATE) ** y)
        for y in range(1, SYSTEM_LIFETIME_YEARS + 1)
    )
