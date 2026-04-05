from calculator.financials import _new_monthly_bill, calculate_financials
from calculator.system import size_system
from config import GRID_TIED_FIXED_FLOOR_PHP, HYBRID_FIXED_FLOOR_PHP


def test_hybrid_financials_add_battery_and_raise_self_consumption():
    system = size_system(zone="ncr", roof_area="medium", monthly_bill="2000_to_3500")

    grid = calculate_financials(system, "2000_to_3500", "standard", 13.82, "grid_tied")
    hybrid = calculate_financials(system, "2000_to_3500", "standard", 13.82, "hybrid")

    assert grid["battery_kwh"] == 0.0
    assert grid["battery_php"] == 0
    assert hybrid["battery_kwh"] == round(system["recommended_kwp"] * 2, 1)
    assert hybrid["battery_php"] > 0
    assert hybrid["total_php"] > grid["total_php"]
    assert hybrid["self_consume_pct"] > grid["self_consume_pct"]


def test_hybrid_bill_estimate_is_never_higher_than_grid_tied_for_same_system():
    system = size_system(zone="ncr", roof_area="medium", monthly_bill="3500_to_6000")

    grid = calculate_financials(system, "3500_to_6000", "standard", 13.82, "grid_tied")
    hybrid = calculate_financials(system, "3500_to_6000", "standard", 13.82, "hybrid")

    assert hybrid["new_monthly_bill_est"] <= grid["new_monthly_bill_est"]
    assert hybrid["bill_reduction_pct"] >= grid["bill_reduction_pct"]


def test_grid_tied_bill_floor_is_respected():
    bill = _new_monthly_bill(
        annual_gen_y0=100_000,
        monthly_kwh=80,
        rate=13.82,
        original_bill=1_000,
        system_type="grid_tied",
    )

    assert bill == max(round(1_000 * 0.30), GRID_TIED_FIXED_FLOOR_PHP)


def test_hybrid_bill_floor_is_respected():
    bill = _new_monthly_bill(
        annual_gen_y0=100_000,
        monthly_kwh=80,
        rate=13.82,
        original_bill=1_000,
        system_type="hybrid",
    )

    assert bill == HYBRID_FIXED_FLOOR_PHP
