from calculator.system import _coverage, _required_kwp, size_system
from config import PANEL_WATTAGE, SYSTEM_EFFICIENCY


def test_required_kwp_uses_psh_and_efficiency():
    monthly_kwh = 280
    psh = 5.0

    result = _required_kwp(monthly_kwh, psh)

    assert result == monthly_kwh / (psh * 30 * SYSTEM_EFFICIENCY)


def test_coverage_caps_at_100():
    assert _coverage(system_kwp=5.0, required_kwp=4.0) == 100


def test_size_system_marks_roof_limited_when_roof_cap_is_below_need():
    result = size_system(zone="car", roof_area="small", monthly_bill="above_6000")

    assert result["roof_limited"] is True
    assert result["recommended_kwp"] == 2.0
    assert result["required_kwp"] > result["recommended_kwp"]
    assert result["coverage_pct"] < 100
    assert result["panel_count_est"] == 4


def test_size_system_returns_full_coverage_when_roof_is_sufficient():
    result = size_system(zone="ncr", roof_area="medium", monthly_bill="2000_to_3500")

    assert result["roof_limited"] is False
    assert result["coverage_pct"] == 100
    assert result["panel_wattage"] == PANEL_WATTAGE
    assert result["system_efficiency"] == SYSTEM_EFFICIENCY
    assert result["panel_count_est"] >= 1
