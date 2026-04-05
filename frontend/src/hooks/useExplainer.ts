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

        if (value === "[DONE]") {
          setDone(true);
          break;
        }

        try {
          // Each chunk is a JSON-encoded string
          const chunk = JSON.parse(value) as string;
          setText((prev) => prev + chunk);
        } catch {
          // Malformed chunk — skip silently
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
