"""
api/routes/options.py
─────────────────────
Serves all static configuration the frontend needs to build its UI:
climate zones, roof brackets, bill brackets, quality tiers, and the
distributor list with default rates.

The frontend calls GET /options once on load.
"""

from fastapi import APIRouter
from config import (
    CLIMATE_ZONES, ISLAND_GROUPS,
    BILL_BRACKETS, ROOF_AREA_BRACKETS, QUALITY_TIERS,
    DISTRIBUTORS, DEFAULT_ELECTRICITY_RATE_PHP,
    MIN_RATE_PHP, MAX_RATE_PHP,
)

router = APIRouter(tags=["Options"])


@router.get("/options", summary="All valid input options")
def get_options():
    """
    Returns everything the frontend needs to render its input form:
    - Climate zones grouped by island (for two-step region picker)
    - Roof area, bill bracket, and quality tier options
    - Distributor list with default rates (for the rate editor)
    - Rate validation bounds
    """
    # Group zones by island for the two-step UI
    zones_by_island: dict = {island: {} for island in ISLAND_GROUPS}
    for key, zone in CLIMATE_ZONES.items():
        zones_by_island[zone["island"]][key] = {
            "name":           zone["name"],
            "areas":          zone["areas"],
            "peak_sun_hours": zone["peak_sun_hours"],
        }

    return {
        "island_groups":   ISLAND_GROUPS,
        "zones_by_island": zones_by_island,
        "roof_areas": {
            k: v["label"] for k, v in ROOF_AREA_BRACKETS.items()
        },
        "monthly_bills": {
            k: v["label"] for k, v in BILL_BRACKETS.items()
        },
        "quality_tiers": {
            k: {"label": v["label"], "description": v["description"]}
            for k, v in QUALITY_TIERS.items()
        },
        "distributors": {
            k: {
                "name":             v["name"],
                "regions":          v["regions"],
                "default_rate_php": v["default_rate_php"],
            }
            for k, v in DISTRIBUTORS.items()
        },
        "rate_config": {
            "default_php": DEFAULT_ELECTRICITY_RATE_PHP,
            "min_php":     MIN_RATE_PHP,
            "max_php":     MAX_RATE_PHP,
        },
    }
