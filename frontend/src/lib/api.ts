// lib/api.ts
// Typed fetch wrapper for the SolarSense PH backend.
// The API base URL is configured via NEXT_PUBLIC_API_URL in .env.

import type { Options, CalculationRequest, CalculationResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  /** Fetch all input options (zones, distributors, etc.) */
  getOptions(): Promise<Options> {
    return apiFetch<Options>("/options");
  },

  /** Run a solar calculation */
  calculate(req: CalculationRequest): Promise<CalculationResponse> {
    return apiFetch<CalculationResponse>("/calculate", {
      method: "POST",
      body:   JSON.stringify(req),
    });
  },
};
