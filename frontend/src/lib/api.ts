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

    // Transform the raw byte stream into a stream of SSE data strings.
    // Network chunks do not necessarily align with SSE event boundaries,
    // so we buffer until we see a full blank-line-delimited event.
    const decoder = new TextDecoder();
    let buffer = "";

    return res.body.pipeThrough(
      new TransformStream<Uint8Array, string>({
        transform(chunk, controller) {
          buffer += decoder.decode(chunk, { stream: true });

          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() ?? "";

          for (const event of events) {
            const dataLines = event
              .split(/\r?\n/)
              .filter((line) => line.startsWith("data: "))
              .map((line) => line.slice(6));

            if (dataLines.length > 0) {
              controller.enqueue(dataLines.join("\n"));
            }
          }
        },
        flush(controller) {
          const event = buffer.trim();
          if (!event) return;

          const dataLines = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data: "))
            .map((line) => line.slice(6));

          if (dataLines.length > 0) {
            controller.enqueue(dataLines.join("\n"));
          }
        },
      })
    );
  },
};
