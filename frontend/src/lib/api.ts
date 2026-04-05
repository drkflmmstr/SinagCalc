// lib/api.ts
// Typed fetch wrapper for the SolarSense PH backend.
// The API base URL is configured via NEXT_PUBLIC_API_URL in .env.

import type { Options, CalculationRequest, CalculationResponse, ExplainRequest } from "./types";

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

  /**
   * Stream an AI explanation of a calculation result.
   *
   * Returns a ReadableStream. The caller is responsible for reading
   * chunks and assembling the text. Each chunk is a JSON-encoded
   * string (the SSE data payload). The stream ends with "[DONE]".
   *
   * Usage:
   *   const stream = await api.streamExplain(req);
   *   const reader = stream.getReader();
   *   // read chunks in a loop...
   */
  async streamExplain(req: ExplainRequest): Promise<ReadableStream<string>> {
    const res = await fetch(`${API_BASE}/explain`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(req),
    });

    if (!res.ok || !res.body) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail ?? `API error ${res.status}`);
    }

    // Transform the raw byte stream into a stream of SSE data strings
    const decoder = new TextDecoder();
    return res.body.pipeThrough(
      new TransformStream<Uint8Array, string>({
        transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          // Each SSE line looks like: "data: <payload>

"
          const lines = text.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            controller.enqueue(line.slice(6)); // strip "data: " prefix
          }
        },
      })
    );
  },
};
