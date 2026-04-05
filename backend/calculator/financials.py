"""
calculator/financials.py
────────────────────────
Cost breakdown, year-by-year cash flow, ROI, and payback period.

Refactored for 2026 market realities and hybrid (battery) support.

Key changes:
  - system_type parameter: "grid_tied" or "hybrid"
  - Fixed self-consumption ratios per system type (40% GT / 90% hybrid)
  - Hybrid adds battery cost (2× kWp in kWh at BATTERY_COST_PER_KWH)
    plus HYBRID_MODIFIER on the inverter and PERMITTING_FEES for both types
  - Bill floor logic: GT cannot go below 30% of original or ₱300 fixed;
    hybrid floor is ₱200
  - Annual savings split: self-consumed at retail rate, exported at
    net-metering credit rate
  - Payback uses (total_cost / (annual_savings - annual_maintenance))
  - 25-year projection with 0.5% annual degradation

Zero framework dependency — pure Python, fully unit-testable.
"""

from typing import Literal

from config import (
    BILL_BRACKETS, QUALITY_TIERS, COST_ALLOCATION,
    SYSTEM_LIFETIME_YEARS, ANNUAL_RATE_ESCALATION,
    PANEL_DEGRADATION_RATE, NET_METERING_CREDIT_PHP,
    SYSTEM_EFFICIENCY,
    # Battery / hybrid
    BATTERY_COST_PER_KWH, HYBRID_MODIFIER, PERMITTING_FEES,
    # Self-consumption
    GRID_TIED_SELF_CONSUME_RATIO, HYBRID_SELF_CONSUME_RATIO,
    # Bill floors
    GRID_TIED_BILL_FLOOR_RATIO, GRID_TIED_FIXED_FLOOR_PHP, HYBRID_FIXED_FLOOR_PHP,
    # Maintenance
    ANNUAL_MAINTENANCE_PHP,
)

SystemType = Literal["grid_tied", "hybrid"]


def calculate_financials(
    system:               dict,
    monthly_bill:         str,
    quality_tier:         str,
    electricity_rate_php: float,
    system_type:          SystemType = "grid_tied",
) -> dict:
    """
    Full financial picture for a solar system.

    Args:
        system:               Output of calculator.system.size_system()
        monthly_bill:         Bill bracket key (for monthly kWh lookup)
        quality_tier:         Quality tier key (for cost/Wp)
        electricity_rate_php: User-supplied rate from their distributor (PHP/kWh)
        system_type:          "grid_tied" or "hybrid"

    Returns:
        Dict with cost breakdown, generation, savings, ROI, and bill impact.
    """
    system_kwp  = system["recommended_kwp"]
    psh         = system["peak_sun_hours"]
    monthly_kwh = BILL_BRACKETS[monthly_bill]["monthly_kwh"]
    cost_per_wp = QUALITY_TIERS[quality_tier]["cost_per_wp"]

    # ── Battery sizing (hybrid only) ───────────────────────────────────────────
    # Battery capacity = 2× the system size in kWp (e.g. 5 kWp → 10 kWh battery)
    battery_kwh = round(system_kwp * 2, 1) if system_type == "hybrid" else 0.0

    # ── Self-consumption ratio ─────────────────────────────────────────────────
    self_consume_ratio = (
        HYBRID_SELF_CONSUME_RATIO
        if system_type == "hybrid"
        else GRID_TIED_SELF_CONSUME_RATIO
    )

    # ── Cost breakdown ─────────────────────────────────────────────────────────
    cost = _cost_breakdown(system_kwp, cost_per_wp, battery_kwh, system_type)

    # ── Annual generation at year 0 ────────────────────────────────────────────
    annual_gen_y0 = _annual_generation(system_kwp, psh)

    # ── Cash flow projection ───────────────────────────────────────────────────
    cash_flow = _project_cash_flows(
        annual_gen_y0     = annual_gen_y0,
        self_consume_ratio= self_consume_ratio,
        base_rate         = electricity_rate_php,
        total_cost        = cost["total_php"],
    )

    # ── New monthly bill estimate ──────────────────────────────────────────────
    original_bill = round(monthly_kwh * electricity_rate_php)
    new_bill = _new_monthly_bill(
        annual_gen_y0      = annual_gen_y0,
        monthly_kwh        = monthly_kwh,
        rate               = electricity_rate_php,
        original_bill      = original_bill,
        system_type        = system_type,
    )

    return {
        # Cost breakdown
        **cost,

        # System type context
        "system_type":          system_type,
        "battery_kwh":          battery_kwh,
        "self_consume_pct":     round(self_consume_ratio * 100),

        # Generation
        "annual_gen_kwh":       round(annual_gen_y0),

        # Savings & returns
        "payback_years":        cash_flow["payback_years"],
        "lifetime_savings_php": cash_flow["lifetime_savings_php"],
        "net_profit_php":       cash_flow["net_profit_php"],
        "roi_pct":              cash_flow["roi_pct"],
        "monthly_savings_y1":   cash_flow["monthly_savings_y1"],
        "annual_savings_y1":    cash_flow["annual_savings_y1"],

        # Bill impact
        "original_monthly_bill": original_bill,
        "new_monthly_bill_est":  new_bill,
        "bill_reduction_pct":    round((1 - new_bill / original_bill) * 100) if original_bill > 0 else 0,
    }


# ── Cost breakdown ─────────────────────────────────────────────────────────────

def _cost_breakdown(
    system_kwp:  float,
    cost_per_wp: float,
    battery_kwh: float,
    system_type: SystemType,
) -> dict:
    """
    Itemised cost breakdown including:
      - Solar panels + mounting + wiring + labor (from COST_ALLOCATION)
      - Hybrid inverter premium (HYBRID_MODIFIER on inverter cost only)
      - Battery cost (hybrid only)
      - Permitting fees (both types)
    """
    # Base system cost before modifier
    base = system_kwp * 1000 * cost_per_wp

    panels_php   = round(base * COST_ALLOCATION["panels"])
    mounting_php = round(base * COST_ALLOCATION["mounting"])
    wiring_php   = round(base * COST_ALLOCATION["wiring"])
    labor_php    = round(base * COST_ALLOCATION["labor"])

    # Hybrid inverter costs more — apply modifier to inverter portion only
    inverter_base = base * COST_ALLOCATION["inverter"]
    inverter_php  = round(
        inverter_base * HYBRID_MODIFIER if system_type == "hybrid" else inverter_base
    )

    battery_php    = round(battery_kwh * BATTERY_COST_PER_KWH)
    permitting_php = PERMITTING_FEES

    total_php = (
        panels_php + inverter_php + mounting_php +
        wiring_php + labor_php + battery_php + permitting_php
    )

    return {
        "total_php":       total_php,
        "cost_per_wp":     cost_per_wp,
        "panels_php":      panels_php,
        "inverter_php":    inverter_php,
        "mounting_php":    mounting_php,
        "wiring_php":      wiring_php,
        "labor_php":       labor_php,
        "battery_php":     battery_php,
        "permitting_php":  permitting_php,
    }


# ── Annual generation ──────────────────────────────────────────────────────────

def _annual_generation(system_kwp: float, psh: float) -> float:
    """Year-0 annual output: kWp × PSH × 365 × system efficiency."""
    return system_kwp * psh * 365 * SYSTEM_EFFICIENCY


# ── 25-year cash flow projection ───────────────────────────────────────────────

def _project_cash_flows(
    annual_gen_y0:      float,
    self_consume_ratio: float,
    base_rate:          float,
    total_cost:         float,
) -> dict:
    """
    Year-by-year savings projection over SYSTEM_LIFETIME_YEARS with:
      - 4% annual electricity tariff escalation
      - 0.5% annual panel output degradation
      - Fixed self-consumption / export split
      - Annual maintenance cost deducted from savings each year
      - Payback interpolated to fractional year precision

    Annual savings formula per year:
        savings = (gen × self_consume_ratio × retail_rate)
                + (gen × (1 - self_consume_ratio) × net_metering_rate)
                - annual_maintenance
    """
    export_ratio = 1.0 - self_consume_ratio

    cumulative  = 0.0
    total_sav   = 0.0
    payback     = None

    for year in range(1, SYSTEM_LIFETIME_YEARS + 1):
        gen  = annual_gen_y0 * ((1 - PANEL_DEGRADATION_RATE) ** year)
        rate = base_rate * ((1 + ANNUAL_RATE_ESCALATION) ** year)

        # Savings split: retail rate on self-consumed, credit rate on exported
        gross_sav = (
            gen * self_consume_ratio * rate
            + gen * export_ratio * NET_METERING_CREDIT_PHP
        )
        net_sav = gross_sav - ANNUAL_MAINTENANCE_PHP

        cumulative += net_sav
        total_sav  += net_sav

        if payback is None and cumulative >= total_cost:
            prev    = cumulative - net_sav
            payback = round((year - 1) + (total_cost - prev) / net_sav, 1)

    # Year-1 monthly savings (net of maintenance)
    gen_y1   = annual_gen_y0 * (1 - PANEL_DEGRADATION_RATE)
    rate_y1  = base_rate * (1 + ANNUAL_RATE_ESCALATION)
    gross_y1 = (
        gen_y1 * self_consume_ratio * rate_y1
        + gen_y1 * export_ratio * NET_METERING_CREDIT_PHP
    )
    annual_sav_y1 = gross_y1 - ANNUAL_MAINTENANCE_PHP

    return {
        "payback_years":        payback if payback else SYSTEM_LIFETIME_YEARS,
        "lifetime_savings_php": round(total_sav),
        "net_profit_php":       round(total_sav - total_cost),
        "roi_pct":              round((total_sav - total_cost) / total_cost * 100, 1),
        "monthly_savings_y1":   round(annual_sav_y1 / 12),
        "annual_savings_y1":    round(annual_sav_y1),
    }


# ── New monthly bill estimate ──────────────────────────────────────────────────

def _new_monthly_bill(
    annual_gen_y0: float,
    monthly_kwh:   float,
    rate:          float,
    original_bill: int,
    system_type:   SystemType,
) -> int:
    """
    Estimate the new monthly bill after solar, with floor logic:

    Grid-tied:
      - Residual = monthly_kwh - solar self-consumed portion
      - Bill cannot go below 30% of original bill
      - Bill cannot go below ₱300 fixed connection fee

    Hybrid:
      - Battery covers most night usage; residual is very small
      - Bill cannot go below ₱200 fixed utility fee
    """
    monthly_gen     = annual_gen_y0 / 12

    if system_type == "hybrid":
        # With battery, 90% self-consumed — residual is only the 10% overflow export
        # and any consumption that exceeds solar+battery capacity
        residual_kwh = max(0.0, monthly_kwh - monthly_gen * HYBRID_SELF_CONSUME_RATIO)
        raw_bill     = round(residual_kwh * rate)
        return max(raw_bill, HYBRID_FIXED_FLOOR_PHP)

    else:  # grid_tied
        # Only 40% of generation offsets grid draw
        residual_kwh = max(0.0, monthly_kwh - monthly_gen * GRID_TIED_SELF_CONSUME_RATIO)
        raw_bill     = round(residual_kwh * rate)

        # Floor: 30% of original bill or ₱300, whichever is higher
        floor = max(
            round(original_bill * GRID_TIED_BILL_FLOOR_RATIO),
            GRID_TIED_FIXED_FLOOR_PHP,
        )
        return max(raw_bill, floor)
