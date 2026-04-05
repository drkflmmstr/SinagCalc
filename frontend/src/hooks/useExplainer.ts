"use client";
// hooks/useExplainer.ts
// Manages the full lifecycle of the AI explanation stream:
// language selection, stream reading, chunk assembly, and error state.
// ExplainerCard stays purely presentational.

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { CalculationResponse, ExplainLanguage } from "@/lib/types";

interface UseExplainerReturn {
  text:       string;           // assembled explanation so far
  language:   ExplainLanguage;
  streaming:  boolean;          // true while stream is in progress
  done:       boolean;          // true when stream has completed
  error:      string | null;
  setLanguage:(lang: ExplainLanguage) => void;
  explain:    (result: CalculationResponse) => Promise<void>;
  reset:      () => void;
}

export function useExplainer(): UseExplainerReturn {
  const [text,      setText]      = useState("");
  const [language,  setLanguage]  = useState<ExplainLanguage>("english");
  const [streaming, setStreaming] = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const explain = useCallback(async (result: CalculationResponse) => {
    setText("");
    setError(null);
    setDone(false);
    setStreaming(true);

    try {
      const stream = await api.streamExplain({ result, language });
      const reader = stream.getReader();

      while (true) {
        const { value, done: streamDone } = await reader.read();

        if (streamDone) break;
        if (!value) continue;

        const parts = value
          .split("\n")
          .map((part) => part.trim())
          .filter(Boolean);

        for (const part of parts) {
          if (part === "[DONE]") {
            setDone(true);
            return;
          }

          try {
            // Each payload is a JSON-encoded string.
            const chunk = JSON.parse(part) as string;
            setText((prev) => prev + chunk);
          } catch {
            // If a provider sends plain text instead of JSON, preserve it
            // rather than dropping the rest of the explanation.
            setText((prev) => prev + part);
          }
        }
      }
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not connect to the AI explainer."
      );
    } finally {
      setStreaming(false);
    }
  }, [language]);

  const reset = useCallback(() => {
    setText("");
    setError(null);
    setDone(false);
    setStreaming(false);
  }, []);

  return {
    text,
    language,
    streaming,
    done,
    error,
    setLanguage,
    explain,
    reset,
  };
}
