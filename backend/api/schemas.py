"""
api/schemas.py
──────────────
Pydantic request and response models.

The key addition over v3: CalculationRequest now accepts
`electricity_rate_php` directly from the user. The frontend sends
whatever rate the user has set (pre-filled from the distributor default,
editable). The backend is fully stateless — no rate is stored server-side.
"""

from typing import Literal
from pydantic import BaseModel, Field

from config import (
    CLIMATE_ZONES, BILL_BRACKETS, ROOF_AREA_BRACKETS, QUALITY_TIERS,
    DEFAULT_ELECTRICITY_RATE_PHP, MIN_RATE_PHP, MAX_RATE_PHP,
)

# Literal types built from config keys — stay in sync automatically
ZoneKey        = Literal[tuple(CLIMATE_ZONES.keys())]
RoofAreaKey    = Literal[tuple(ROOF_AREA_BRACKETS.keys())]
MonthlyBillKey = Literal[tuple(BILL_BRACKETS.keys())]
QualityTierKey = Literal[tuple(QUALITY_TIERS.keys())]


# ── Request ────────────────────────────────────────────────────────────────────

class CalculationRequest(BaseModel):
    """
    Input for POST /calculate.

    electricity_rate_php is user-supplied — the frontend pre-fills it
    from the distributor default but the user can change it freely.
    This keeps the backend stateless while supporting any distributor.
    """
    zone: ZoneKey = Field(
        ...,
        description="Climate zone key — determines peak sun hours.",
        example="ncr",
    )
    roof_area: RoofAreaKey = Field(
        ...,
        description="Usable roof area range — caps max installable kWp.",
        example="medium",
    )
    monthly_bill: MonthlyBillKey = Field(
        ...,
        description="Monthly electricity bill bracket — estimates kWh consumption.",
        example="2000_to_3500",
    )
    quality_tier: QualityTierKey = Field(
        ...,
        description="System quality tier — determines installed cost per Wp.",
        example="standard",
    )
    electricity_rate_php: float = Field(
        default=DEFAULT_ELECTRICITY_RATE_PHP,
        ge=MIN_RATE_PHP,
        le=MAX_RATE_PHP,
        description=(
            f"Your distributor's electricity rate in PHP/kWh. "
            f"Allowed range: {MIN_RATE_PHP}–{MAX_RATE_PHP}. "
            f"Default: {DEFAULT_ELECTRICITY_RATE_PHP} (national average)."
        ),
        example=12.0,
    )

    system_type: Literal["grid_tied", "hybrid"] = Field(
        default="grid_tied",
        description=(
            "Grid-tied: exports surplus to the grid via net metering. "
            "Hybrid: adds a battery for night-time self-consumption."
        ),
        example="grid_tied",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "zone":                 "ncr",
                "roof_area":            "medium",
                "monthly_bill":         "2000_to_3500",
                "quality_tier":         "standard",
                "electricity_rate_php": 13.82,
                "system_type":          "grid_tied",
            }]
        }
    }


# ── Response models ────────────────────────────────────────────────────────────

class InputEcho(BaseModel):
    zone:                 str
    zone_name:            str
    roof_area:            str
    monthly_bill:         str
    quality_tier:         str
    monthly_kwh:          int
    electricity_rate_php: float
    system_type:          str


class SystemResult(BaseModel):
    recommended_kwp:   float
    required_kwp:      float
    coverage_pct:      int
    roof_limited:      bool
    peak_sun_hours:    float
    panel_count_est:   int
    panel_wattage:     int
    system_efficiency: float


class FinancialsResult(BaseModel):
    # Cost breakdown
    total_php:            int
    cost_per_wp:          float
    panels_php:           int
    inverter_php:         int
    mounting_php:         int
    wiring_php:           int
    labor_php:            int
    battery_php:          int       # 0 for grid-tied
    permitting_php:       int
    # System type context
    system_type:          str
    battery_kwh:          float     # 0.0 for grid-tied
    self_consume_pct:     int
    # Generation
    annual_gen_kwh:       int
    # Savings & returns
    payback_years:        float
    lifetime_savings_php: int
    net_profit_php:       int
    roi_pct:              float
    monthly_savings_y1:   int
    annual_savings_y1:    int
    # Bill impact
    original_monthly_bill: int
    new_monthly_bill_est:  int
    bill_reduction_pct:    int


class EnvironmentResult(BaseModel):
    lifetime_gen_kwh:   int
    co2_kg_per_year:    int
    co2_tonnes_avoided: float
    trees_equivalent:   int
    car_km_equivalent:  int
    households_powered: float


class CalculationResponse(BaseModel):
    inputs:         InputEcho
    system:         SystemResult
    financials:     FinancialsResult
    environment:    EnvironmentResult
    recommendation: str


# ── Explainer models ───────────────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    """
    Input for POST /explain.

    Carries the full calculation result plus the user's language preference.
    The backend uses this to build a context-rich prompt for Gemini.
    """
    result:   CalculationResponse = Field(
        ...,
        description="The full result from POST /calculate.",
    )
    language: Literal["english", "filipino"] = Field(
        default="english",
        description="Language for the AI explanation. 'filipino' uses Tagalog-based Filipino.",
        example="english",
    )
