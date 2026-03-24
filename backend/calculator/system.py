"""
calculator/system.py
────────────────────
Determines the appropriate solar system size given location,
roof space, and electricity consumption.

Zero framework dependency — pure Python, fully unit-testable.
"""

import math
from config import (
    CLIMATE_ZONES, BILL_BRACKETS, ROOF_AREA_BRACKETS,
    SYSTEM_EFFICIENCY, PANEL_WATTAGE,
)


def size_system(zone: str, roof_area: str, monthly_bill: str) -> dict:
    peak_sun_hours = CLIMATE_ZONES[zone]["peak_sun_hours"]
    monthly_kwh    = BILL_BRACKETS[monthly_bill]["monthly_kwh"]
    max_kwp        = ROOF_AREA_BRACKETS[roof_area]["max_kwp"]

    required_kwp = _required_kwp(monthly_kwh, peak_sun_hours)
    system_kwp   = min(required_kwp, max_kwp)

    return {
        "recommended_kwp":   round(system_kwp, 2),
        "required_kwp":      round(required_kwp, 2),
        "coverage_pct":      _coverage(system_kwp, required_kwp),
        "roof_limited":      system_kwp < required_kwp,
        "peak_sun_hours":    peak_sun_hours,
        "panel_count_est":   math.ceil(system_kwp * 1000 / PANEL_WATTAGE),
        "panel_wattage":     PANEL_WATTAGE,
        "system_efficiency": SYSTEM_EFFICIENCY,
    }


def _required_kwp(monthly_kwh: float, psh: float) -> float:
    """kWp = monthly_kWh / (PSH × 30 days × efficiency)"""
    return monthly_kwh / (psh * 30 * SYSTEM_EFFICIENCY)


def _coverage(system_kwp: float, required_kwp: float) -> int:
    if required_kwp <= 0:
        return 100
    return min(100, round((system_kwp / required_kwp) * 100))
