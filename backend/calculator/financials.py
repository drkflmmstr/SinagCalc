"""
calculator/financials.py
────────────────────────
Cost breakdown, year-by-year cash flow, ROI, and payback period.

Key change from v3: electricity_rate_php is now an explicit parameter
rather than being looked up from a config bracket. The user-supplied
rate (from their distributor) is passed in from the route layer.

Zero framework dependency — pure Python, fully unit-testable.
"""

from config import (
    BILL_BRACKETS, QUALITY_TIERS, COST_ALLOCATION,
    SYSTEM_LIFETIME_YEARS, ANNUAL_RATE_ESCALATION,
    PANEL_DEGRADATION_RATE, NET_METERING_CREDIT_PHP,
    SYSTEM_EFFICIENCY,
)


def calculate_financials(
    system:               dict,
    monthly_bill:         str,
    quality_tier:         str,
    electricity_rate_php: float,
) -> dict:
    """
    Full financial picture for a solar system.

    Args:
        system:               Output of calculator.system.size_system()
        monthly_bill:         Bill bracket key (for monthly kWh lookup)
        quality_tier:         Quality tier key (for cost/Wp)
        electricity_rate_php: User-supplied rate from their distributor (PHP/kWh)
    """
    system_kwp   = system["recommended_kwp"]
    psh          = system["peak_sun_hours"]
    monthly_kwh  = BILL_BRACKETS[monthly_bill]["monthly_kwh"]
    cost_per_wp  = QUALITY_TIERS[quality_tier]["cost_per_wp"]

    cost          = _cost_breakdown(system_kwp, cost_per_wp)
    annual_gen_y0 = _annual_generation(system_kwp, psh)
    cash_flow     = _project_cash_flows(
        annual_gen_y0, monthly_kwh, electricity_rate_php, cost["total_php"]
    )
    new_bill = _new_monthly_bill(annual_gen_y0, monthly_kwh, electricity_rate_php)

    return {
        **cost,
        "annual_gen_kwh":       round(annual_gen_y0),
        "payback_years":        cash_flow["payback_years"],
        "lifetime_savings_php": cash_flow["lifetime_savings_php"],
        "net_profit_php":       cash_flow["net_profit_php"],
        "roi_pct":              cash_flow["roi_pct"],
        "monthly_savings_y1":   cash_flow["monthly_savings_y1"],
        "self_consume_pct":     cash_flow["self_consume_pct"],
        "new_monthly_bill_est": new_bill,
    }


# ── Private helpers ────────────────────────────────────────────────────────────

def _cost_breakdown(system_kwp: float, cost_per_wp: float) -> dict:
    total = system_kwp * 1000 * cost_per_wp
    return {
        "total_php":    round(total),
        "cost_per_wp":  cost_per_wp,
        "panels_php":   round(total * COST_ALLOCATION["panels"]),
        "inverter_php": round(total * COST_ALLOCATION["inverter"]),
        "mounting_php": round(total * COST_ALLOCATION["mounting"]),
        "wiring_php":   round(total * COST_ALLOCATION["wiring"]),
        "labor_php":    round(total * COST_ALLOCATION["labor"]),
    }


def _annual_generation(system_kwp: float, psh: float) -> float:
    return system_kwp * psh * 365 * SYSTEM_EFFICIENCY


def _project_cash_flows(
    annual_gen_y0: float,
    monthly_kwh:   float,
    base_rate:     float,
    total_cost:    float,
) -> dict:
    annual_consumption = monthly_kwh * 12
    sr = min(1.0, annual_consumption / annual_gen_y0) if annual_gen_y0 > 0 else 1.0

    cumulative = 0.0
    total_sav  = 0.0
    payback    = None

    for year in range(1, SYSTEM_LIFETIME_YEARS + 1):
        gen  = annual_gen_y0 * ((1 - PANEL_DEGRADATION_RATE) ** year)
        rate = base_rate * ((1 + ANNUAL_RATE_ESCALATION) ** year)
        sav  = gen * sr * rate + gen * (1 - sr) * NET_METERING_CREDIT_PHP

        cumulative += sav
        total_sav  += sav

        if payback is None and cumulative >= total_cost:
            prev    = cumulative - sav
            payback = round((year - 1) + (total_cost - prev) / sav, 1)

    # Year-1 monthly savings
    gen_y1  = annual_gen_y0 * (1 - PANEL_DEGRADATION_RATE)
    rate_y1 = base_rate * (1 + ANNUAL_RATE_ESCALATION)
    sav_y1  = gen_y1 * sr * rate_y1 + gen_y1 * (1 - sr) * NET_METERING_CREDIT_PHP

    return {
        "payback_years":        payback if payback else SYSTEM_LIFETIME_YEARS,
        "lifetime_savings_php": round(total_sav),
        "net_profit_php":       round(total_sav - total_cost),
        "roi_pct":              round((total_sav - total_cost) / total_cost * 100, 1),
        "monthly_savings_y1":   round(sav_y1 / 12),
        "self_consume_pct":     round(sr * 100),
    }


def _new_monthly_bill(annual_gen: float, monthly_kwh: float, rate: float) -> int:
    residual = max(0.0, monthly_kwh - annual_gen / 12)
    return round(residual * rate)
