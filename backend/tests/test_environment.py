from calculator.environment import _lifetime_gen, calculate_environmental_impact
from config import PANEL_DEGRADATION_RATE, SYSTEM_LIFETIME_YEARS


def test_lifetime_generation_accounts_for_degradation():
    annual_gen_kwh = 1_000

    expected = sum(
        annual_gen_kwh * ((1 - PANEL_DEGRADATION_RATE) ** year)
        for year in range(1, SYSTEM_LIFETIME_YEARS + 1)
    )

    assert _lifetime_gen(annual_gen_kwh) == expected


def test_environmental_impact_returns_positive_equivalents():
    result = calculate_environmental_impact(annual_gen_kwh=3_402)

    assert result["lifetime_gen_kwh"] > result["co2_kg_per_year"]
    assert result["co2_tonnes_avoided"] > 0
    assert result["trees_equivalent"] >= 1
    assert result["car_km_equivalent"] > 0
    assert result["households_powered"] > 0
