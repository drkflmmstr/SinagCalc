"""
config.py
─────────
Single source of truth for all Philippine-specific constants and
application settings.

Settings (port, CORS, env) are read from environment variables via
pydantic-settings. All solar domain constants are plain module-level
values — they change rarely and don't need to be env-configurable.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


# ── App settings (from environment) ───────────────────────────────────────────

class Settings(BaseSettings):
    app_env:         str = "development"
    allowed_origins: str = "http://localhost:3000"

    # Gemini API — get your key at https://aistudio.google.com
    # Leave as placeholder to disable the AI explainer gracefully.
    gemini_api_key: str = "YOUR_GEMINI_API_KEY_HERE"

    model_config = SettingsConfigDict(
        env_file=ROOT_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def origins_list(self) -> list[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a list."""
        return [o.strip() for o in self.allowed_origins.split(",")]

    def gemini_configured(self) -> bool:
        """True only when a real key has been set (not the placeholder)."""
        return bool(self.gemini_api_key) and self.gemini_api_key != "YOUR_GEMINI_API_KEY_HERE"


settings = Settings()


# ── Climate zones ──────────────────────────────────────────────────────────────
# Peak sun hours per day from NASA POWER irradiance data / DOE Philippines.

CLIMATE_ZONES: dict[str, dict] = {
    "ilocos": {
        "name":           "Ilocos / Batanes",
        "areas":          "Ilocos Norte & Sur, La Union, Cagayan, Batanes",
        "island":         "luzon",
        "peak_sun_hours": 5.6,
    },
    "central_luzon": {
        "name":           "Central & South Luzon",
        "areas":          "Pampanga, Tarlac, Bulacan, Cavite, Batangas, Laguna",
        "island":         "luzon",
        "peak_sun_hours": 5.1,
    },
    "ncr": {
        "name":           "Metro Manila (NCR)",
        "areas":          "All cities within NCR",
        "island":         "luzon",
        "peak_sun_hours": 5.0,
    },
    "car": {
        "name":           "Cordillera (CAR)",
        "areas":          "Baguio, Benguet, Ifugao, Mt. Province, Kalinga",
        "island":         "luzon",
        "peak_sun_hours": 4.5,
    },
    "bicol": {
        "name":           "Bicol / Eastern Visayas",
        "areas":          "Albay, Sorsogon, Camarines, Leyte, Samar",
        "island":         "luzon",
        "peak_sun_hours": 4.7,
    },
    "western_visayas": {
        "name":           "Western & Central Visayas",
        "areas":          "Cebu, Iloilo, Negros, Bohol, Aklan, Capiz",
        "island":         "visayas",
        "peak_sun_hours": 5.4,
    },
    "eastern_visayas": {
        "name":           "Eastern Visayas",
        "areas":          "Tacloban, Eastern Samar, Northern Samar",
        "island":         "visayas",
        "peak_sun_hours": 4.8,
    },
    "western_mindanao": {
        "name":           "Western Mindanao",
        "areas":          "Zamboanga, Lanao del Norte & Sur, Basilan, Sulu",
        "island":         "mindanao",
        "peak_sun_hours": 4.9,
    },
    "northern_mindanao": {
        "name":           "Northern & Central Mindanao",
        "areas":          "Cagayan de Oro, Iligan, Bukidnon, Misamis",
        "island":         "mindanao",
        "peak_sun_hours": 5.2,
    },
    "davao_soccsksargen": {
        "name":           "Davao / SOCCSKSARGEN",
        "areas":          "Davao City, General Santos, Cotabato, Sultan Kudarat",
        "island":         "mindanao",
        "peak_sun_hours": 5.5,
    },
}

ISLAND_GROUPS: dict[str, str] = {
    "luzon":    "Luzon",
    "visayas":  "Visayas",
    "mindanao": "Mindanao",
}


# ── Electricity distributors & default rates ───────────────────────────────────
# Default rates (PHP/kWh) per distributor, used as pre-filled values in the UI.
# Users can override these in the frontend — the chosen rate is sent with every
# calculation request so the backend stays stateless.

DISTRIBUTORS: dict[str, dict] = {
    "meralco": {
        "name":             "Meralco",
        "regions":          ["ncr", "central_luzon"],
        "default_rate_php": 13.82,
    },
    "veco": {
        "name":             "VECO (Visayan Electric)",
        "regions":          ["western_visayas"],
        "default_rate_php": 13.57,
    },
    "cebeco": {
        "name":             "CEBECO",
        "regions":          ["western_visayas"],
        "default_rate_php": 12.88,
    },
    "norsamelco": {
        "name":             "NORSAMELCO",
        "regions":          ["eastern_visayas"],
        "default_rate_php": 12.54,
    },
    "ileco": {
        "name":             "ILECO (Iloilo)",
        "regions":          ["western_visayas"],
        "default_rate_php": 13.23,
    },
    "davao_light": {
        "name":             "Davao Light & Power",
        "regions":          ["davao_soccsksargen"],
        "default_rate_php": 13.00,
    },
    "cotabato_light": {
        "name":             "Cotabato Light",
        "regions":          ["davao_soccsksargen"],
        "default_rate_php": 12.42,
    },
    "ceneco": {
        "name":             "CENECO (Negros Occidental)",
        "regions":          ["western_visayas"],
        "default_rate_php": 12.65,
    },
    "beneco": {
        "name":             "BENECO (Baguio / Benguet)",
        "regions":          ["car"],
        "default_rate_php": 14.38,
    },
    "pelco": {
        "name":             "PELCO (Pampanga)",
        "regions":          ["central_luzon"],
        "default_rate_php": 13.34,
    },
    "inec": {
        "name":             "INEC (Ilocos Norte)",
        "regions":          ["ilocos"],
        "default_rate_php": 12.08,
    },
    "other": {
        "name":             "Other / Unknown",
        "regions":          [],
        "default_rate_php": 13.23,  # national average fallback (2026)
    },
}

# Fallback rate used when distributor is unknown
DEFAULT_ELECTRICITY_RATE_PHP = 13.23  # 2026 national average

# Minimum and maximum rates the user is allowed to enter (validation bounds)
MIN_RATE_PHP = 5.0
MAX_RATE_PHP = 30.0


# ── Bill brackets ──────────────────────────────────────────────────────────────
# Monthly bill ranges → estimated monthly consumption (kWh).
# The rate_php_kwh here is the DEFAULT shown to the user before they
# select their actual distributor / customise the rate.

BILL_BRACKETS: dict[str, dict] = {
    "below_1000":   {"label": "Below ₱1,000",   "monthly_kwh": 80},
    "1000_to_2000": {"label": "₱1,000 – ₱2,000", "monthly_kwh": 160},
    "2000_to_3500": {"label": "₱2,000 – ₱3,500", "monthly_kwh": 280},
    "3500_to_6000": {"label": "₱3,500 – ₱6,000", "monthly_kwh": 480},
    "above_6000":   {"label": "Above ₱6,000",    "monthly_kwh": 700},
}


# ── Roof area ──────────────────────────────────────────────────────────────────

ROOF_AREA_BRACKETS: dict[str, dict] = {
    "small":  {"label": "Small (< 20 sqm)",     "max_kwp": 2.0},
    "medium": {"label": "Medium (20–50 sqm)",    "max_kwp": 5.0},
    "large":  {"label": "Large (50–80 sqm)",     "max_kwp": 8.0},
    "xlarge": {"label": "Very Large (> 80 sqm)", "max_kwp": 12.0},
}


# ── System quality tiers ───────────────────────────────────────────────────────

QUALITY_TIERS: dict[str, dict] = {
    "basic":    {"label": "Basic",    "description": "Entry-level brands, string inverter, ~10-yr warranty",          "cost_per_wp": 55},
    "standard": {"label": "Standard", "description": "Mid-range, most popular choice, ~15-yr warranty",               "cost_per_wp": 65},
    "premium":  {"label": "Premium",  "description": "Top-tier brands, microinverter / battery-ready, ~25-yr warranty","cost_per_wp": 85},
}

COST_ALLOCATION: dict[str, float] = {
    "panels":   0.50,
    "inverter": 0.20,
    "mounting": 0.10,
    "wiring":   0.08,
    "labor":    0.12,
}


# ── System performance ─────────────────────────────────────────────────────────

SYSTEM_EFFICIENCY      = 0.80
PANEL_DEGRADATION_RATE = 0.005
SYSTEM_LIFETIME_YEARS  = 25
PANEL_WATTAGE          = 550


# ── Battery & hybrid constants (2026) ─────────────────────────────────────────

# LFP (Lithium Iron Phosphate) battery storage — installed cost per kWh
BATTERY_COST_PER_KWH = 25_000          # PHP/kWh

# Multiplier applied to base system cost for hybrid inverter premium
HYBRID_MODIFIER      = 1.15            # +15% over grid-tied inverter cost

# ── Soft costs ─────────────────────────────────────────────────────────────────

# One-time permitting and net-metering application fees
PERMITTING_FEES = 15_000               # PHP, flat fee per installation

# ── Self-consumption ratios by system type ─────────────────────────────────────
# Grid-tied: solar only covers daytime usage (~40% of daily consumption)
# Hybrid:    battery stores surplus for night use (~90% covered)

GRID_TIED_SELF_CONSUME_RATIO = 0.40
HYBRID_SELF_CONSUME_RATIO    = 0.90

# ── Bill floor constants ───────────────────────────────────────────────────────
# Even with solar, utilities charge a minimum fixed fee.
# Grid-tied bill cannot go below 30% of original OR this fixed floor.
# Hybrid bill cannot go below this fixed floor.

GRID_TIED_BILL_FLOOR_RATIO = 0.30      # 30% of original bill minimum
GRID_TIED_FIXED_FLOOR_PHP  = 300       # PHP minimum (connection / metering fee)
HYBRID_FIXED_FLOOR_PHP     = 200       # PHP minimum for hybrid (lower — near off-grid)

# ── Maintenance ────────────────────────────────────────────────────────────────
# Annual O&M cost used in payback calculation
ANNUAL_MAINTENANCE_PHP = 3_000         # PHP/year (cleaning, inverter check)

# ── Financial assumptions ──────────────────────────────────────────────────────

ANNUAL_RATE_ESCALATION  = 0.04
NET_METERING_CREDIT_PHP = 7.86  # Current Generation Charge, ERC 2026


# ── Environmental factors ──────────────────────────────────────────────────────

CO2_KG_PER_KWH         = 0.709   # DOE Philippines Grid Emission Factor 2023
TREE_CO2_KG_PER_YEAR   = 22
CAR_CO2_KG_PER_KM      = 0.21
AVG_HOUSEHOLD_KWH_YEAR = 3_000
