// lib/types.ts
// TypeScript types that mirror the FastAPI Pydantic response models.
// Keep these in sync with backend/api/schemas.py.

// ── Options (from GET /options) ───────────────────────────────────────────────

export interface ZoneInfo {
  name:           string;
  areas:          string;
  peak_sun_hours: number;
}

export interface DistributorInfo {
  name:             string;
  regions:          string[];
  default_rate_php: number;
}

export interface QualityTierInfo {
  label:       string;
  description: string;
}

export interface RateConfig {
  default_php: number;
  min_php:     number;
  max_php:     number;
}

export interface Options {
  island_groups:   Record<string, string>;
  zones_by_island: Record<string, Record<string, ZoneInfo>>;
  roof_areas:      Record<string, string>;
  monthly_bills:   Record<string, string>;
  quality_tiers:   Record<string, QualityTierInfo>;
  distributors:    Record<string, DistributorInfo>;
  rate_config:     RateConfig;
}

// ── Calculation request ───────────────────────────────────────────────────────

export interface CalculationRequest {
  zone:                 string;
  roof_area:            string;
  monthly_bill:         string;
  quality_tier:         string;
  electricity_rate_php: number;
}

// ── Calculation response ──────────────────────────────────────────────────────

export interface InputEcho extends CalculationRequest {
  zone_name:   string;
  monthly_kwh: number;
}

export interface SystemResult {
  recommended_kwp:   number;
  required_kwp:      number;
  coverage_pct:      number;
  roof_limited:      boolean;
  peak_sun_hours:    number;
  panel_count_est:   number;
  panel_wattage:     number;
  system_efficiency: number;
}

export interface FinancialsResult {
  total_php:            number;
  cost_per_wp:          number;
  panels_php:           number;
  inverter_php:         number;
  mounting_php:         number;
  wiring_php:           number;
  labor_php:            number;
  annual_gen_kwh:       number;
  payback_years:        number;
  lifetime_savings_php: number;
  net_profit_php:       number;
  roi_pct:              number;
  monthly_savings_y1:   number;
  self_consume_pct:     number;
  new_monthly_bill_est: number;
}

export interface EnvironmentResult {
  lifetime_gen_kwh:   number;
  co2_kg_per_year:    number;
  co2_tonnes_avoided: number;
  trees_equivalent:   number;
  car_km_equivalent:  number;
  households_powered: number;
}

export interface CalculationResponse {
  inputs:         InputEcho;
  system:         SystemResult;
  financials:     FinancialsResult;
  environment:    EnvironmentResult;
  recommendation: string;
}

// ── UI form state ─────────────────────────────────────────────────────────────

export interface FormState {
  island:       string | null;
  zone:         string | null;
  roof_area:    string | null;
  monthly_bill: string | null;
  quality_tier: string | null;
}

// ── Explainer ─────────────────────────────────────────────────────────────────

export type ExplainLanguage = "english" | "filipino";

export interface ExplainRequest {
  result:   CalculationResponse;
  language: ExplainLanguage;
}
